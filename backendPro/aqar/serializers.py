from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import *
import json
from aqar_core.models import Slider 

User = get_user_model()

# --- السيريالايزر الفرعية ---
class FeatureSerializer(serializers.ModelSerializer):
    class Meta: model = Feature; fields = ['id', 'name', 'input_type']

class ListingFeatureSerializer(serializers.ModelSerializer):
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    # 👇 الحقل الجديد: عشان يبعت شكل الأيقونة للفرونت
    feature_icon = serializers.CharField(source='feature.icon', read_only=True)
    
    class Meta: 
        model = ListingFeature
        fields = ['id', 'feature', 'feature_name', 'feature_icon', 'value']

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = '__all__'

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta: model = ListingImage; fields = ['id', 'image']

class CategorySerializer(serializers.ModelSerializer):
    allowed_features = FeatureSerializer(many=True, read_only=True)
    class Meta: model = Category; fields = ['id', 'name', 'allowed_features']

# --- سيريالايزر الجغرافيا ---
class GovernorateSerializer(serializers.ModelSerializer):
    class Meta: model = Governorate; fields = '__all__'
class CitySerializer(serializers.ModelSerializer):
    class Meta: model = City; fields = '__all__'
class MajorZoneSerializer(serializers.ModelSerializer):
    class Meta: model = MajorZone; fields = '__all__'
class SubdivisionSerializer(serializers.ModelSerializer):
    class Meta: model = Subdivision; fields = '__all__'

# --- Register Serializer ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'phone_number', 'interests')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data) 
        user.set_password(password)
        user.save()
        return user

# --- ListingSerializer الرئيسي ---
class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    dynamic_features = ListingFeatureSerializer(source='features_values', many=True, read_only=True)  
    
    governorate_name = serializers.CharField(source='governorate.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    major_zone_name = serializers.CharField(source='major_zone.name', read_only=True, allow_null=True)
    subdivision_name = serializers.CharField(source='subdivision.name', read_only=True, allow_null=True)
    is_favorite = serializers.SerializerMethodField()
    zone_map_image = serializers.SerializerMethodField()

    features_data = serializers.CharField(write_only=True, required=False)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta: 
        model = Listing
        fields = '__all__'

    def get_zone_map_image(self, obj):
        image_obj = None
        if obj.custom_map_image:
            image_obj = obj.custom_map_image
        elif obj.major_zone:
            zone_map = obj.major_zone.maps.first()
            if zone_map:
                image_obj = zone_map.map_file

        if not image_obj: return None

        try:
            request = self.context.get('request')
            if request: return request.build_absolute_uri(image_obj.url)
        except: pass
        
        return image_obj.url

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        features_json = validated_data.pop('features_data', None)
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        listing = Listing.objects.create(**validated_data)
        
        request = self.context.get('request')
        if uploaded_images:
             for image in uploaded_images:
                ListingImage.objects.create(listing=listing, image=image)
                if not listing.thumbnail:
                    listing.thumbnail = image
                    listing.save()

        if features_json:
            self._save_features(listing, features_json)

        return listing
    
    def update(self, instance, validated_data):
        features_json = validated_data.pop('features_data', None)
        uploaded_images = validated_data.pop('uploaded_images', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if uploaded_images:
             for image in uploaded_images:
                ListingImage.objects.create(listing=instance, image=image)

        if features_json:
            self._save_features(instance, features_json)

        return instance

    def _save_features(self, listing, features_json):
        try:
            features_dict = json.loads(features_json)
            for feature_id, value in features_dict.items():
                if value: 
                    try:
                        feature_obj = Feature.objects.get(id=int(feature_id))
                        ListingFeature.objects.update_or_create(
                            listing=listing,
                            feature=feature_obj,
                            defaults={'value': str(value)}
                        )
                    except Feature.DoesNotExist:
                        pass
        except Exception as e:
            print(f"Error saving features: {e}")

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'whatsapp_link', 'interests']
        read_only_fields = ['username', 'id']

class SliderSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Slider
        fields = ['id', 'title', 'subtitle', 'image_url', 'target_link', 'button_text', 'open_in_new_tab']

    def get_image_url(self, obj):
        if not obj.image: return None
        try:
            request = self.context.get('request')
            if request: return request.build_absolute_uri(obj.image.url)
        except: pass
        return obj.image.url