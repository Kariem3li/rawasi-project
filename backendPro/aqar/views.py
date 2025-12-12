from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *
from .filters import ListingFilter
# تأكد إن ملف permissions.py موجود، لو مش موجود استخدم permissions.IsAuthenticatedOrReadOnly
from .permissions import IsOwnerOrReadOnly 
from aqar_core.models import Slider

# --- ViewSets الثوابت (الجغرافيا والتصنيف) ---
class GovernorateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Governorate.objects.all()
    serializer_class = GovernorateSerializer
    pagination_class = None

class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['governorate']

class MajorZoneViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MajorZone.objects.all()
    serializer_class = MajorZoneSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city']

class SubdivisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subdivision.objects.all()
    serializer_class = SubdivisionSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['major_zone']

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None

    @action(detail=True, methods=['get'])
    def features(self, request, pk=None):
        category = self.get_object()
        features = category.allowed_features.all()
        serializer = FeatureSerializer(features, many=True)
        return Response(serializer.data)

# --- Listing ViewSet (المحرك الرئيسي) ---
class ListingViewSet(viewsets.ModelViewSet):
    # ✅ جلب كل البيانات دفعة واحدة للأداء
    queryset = Listing.objects.select_related(
        'governorate', 'city', 'major_zone', 'subdivision', 'category', 'agent'
    ).prefetch_related(
        'images', 'features_values__feature'
    ).order_by('-created_at')
    
    serializer_class = ListingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ListingFilter
    search_fields = ['title', 'description', 'reference_code', 'city__name', 'major_zone__name', 'building_number']
    ordering_fields = ['price', 'created_at', 'area_sqm']
    
    # ✅ السماح بالقراءة للجميع، والتعديل للمالك فقط
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        # فلترة المزايا الديناميكية (مثل: أسانسير، غاز)
        for key, value in self.request.query_params.items():
            if key.startswith('feat_') and value:
                try:
                    feature_id = int(key.split('_')[1])
                    queryset = queryset.filter(
                        features_values__feature_id=feature_id,
                        features_values__value=value
                    )
                except (ValueError, IndexError):
                    pass
        return queryset.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_authenticated:
            full_name = f"{user.first_name} {user.last_name}".strip() or user.username
            # الأدمن ينشر مباشرة، المستخدم العادي "قيد المراجعة"
            status = 'Available' if user.is_staff else 'Pending'
            serializer.save(agent=user, owner_name=full_name, owner_phone=user.phone_number, status=status)
        else:
            serializer.save(status='Pending')

    def perform_update(self, serializer):
        instance = serializer.instance
        
        # حذف الصور المحددة
        deleted_image_ids = self.request.data.getlist('deleted_image_ids') 
        if deleted_image_ids:
            for img in ListingImage.objects.filter(id__in=deleted_image_ids, listing=instance):
                img.image.delete()
                img.delete()
        
        # حذف الفيديو
        if self.request.data.get('clear_video') == 'true':
            if instance.video:
                instance.video.delete()
                instance.video = None
        
        # إعادة الحالة لقيد المراجعة عند التعديل (إلا للأدمن)
        new_status = instance.status if self.request.user.is_staff else 'Pending'
        serializer.save(status=new_status)

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        if request.user.is_anonymous:
            return Response({"error": "يجب تسجيل الدخول"}, status=401)
        
        my_properties = self.queryset.filter(agent=request.user)
        serializer = self.get_serializer(my_properties, many=True)
        return Response(serializer.data)

# --- Favorite ViewSet ---
class FavoriteViewSet(viewsets.GenericViewSet):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        favorites = Favorite.objects.filter(user=request.user).order_by('-created_at')
        listing_ids = favorites.values_list('listing_id', flat=True)
        listings = Listing.objects.filter(id__in=listing_ids)
        serializer = ListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        listing_id = request.data.get('listing_id')
        if not listing_id: return Response({"detail": "Missing ID"}, status=400)
        
        listing = get_object_or_404(Listing, pk=listing_id)
        fav, created = Favorite.objects.get_or_create(user=request.user, listing=listing)
        
        if not created:
            fav.delete()
            return Response({"detail": "Removed", "is_favorite": False})
        return Response({"detail": "Added", "is_favorite": True})

# --- Slider ViewSet (الإعلانات الرئيسية) ---
class SliderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Slider.objects.filter(is_active=True).order_by('display_order', '-created_at')
    serializer_class = SliderSerializer 
    pagination_class = None
    permission_classes = [permissions.AllowAny] # ✅ أي زائر يقدر يشوف السلايدر