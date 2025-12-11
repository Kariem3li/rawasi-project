from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from aqar_core.views import ProjectViewSet, CustomPageView

router = DefaultRouter()

# تسجيل الراوترز الأساسية
router.register(r'listings', ListingViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'governorates', GovernorateViewSet)
router.register(r'cities', CityViewSet)
router.register(r'zones', MajorZoneViewSet)
router.register(r'subdivisions', SubdivisionViewSet)
router.register(r'favorites', FavoriteViewSet)

# تسجيل المشاريع (من aqar_core)
router.register(r'projects', ProjectViewSet, basename='projects')

# ✅ تسجيل السلايدر الجديد (عن طريق الراوتر فقط)
router.register(r'sliders', SliderViewSet)

urlpatterns = [
    # رابط الصفحات الخاصة (زي: اتصل بنا، من نحن)
    path('pages/<slug:slug>/', CustomPageView.as_view(), name='custom-page-detail'),

    # ❌ تم حذف سطر sliders القديم عشان ميعملش تعارض مع الراوتر فوق
    
    # تضمين كل روابط الراوتر
    path('', include(router.urls)),
]