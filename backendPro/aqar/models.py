from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from smart_selects.db_fields import ChainedForeignKey
from aqar_core.models import BaseModel
import random, string

User = get_user_model()

def generate_ref(): return 'REF-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# --- 1. الجغرافيا المرنة ---
class Governorate(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="المحافظة")
    def __str__(self): return self.name

class City(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="المدينة")
    governorate = models.ForeignKey(Governorate, on_delete=models.CASCADE)
    zone_label = models.CharField(max_length=50, default='حي', verbose_name="تسمية المنطقة الكبرى")
    subdivision_label = models.CharField(max_length=50, default='مجاورة', verbose_name="تسمية المنطقة الصغرى")
    def __str__(self): return self.name

class MajorZone(models.Model):
    name = models.CharField(max_length=150)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    def __str__(self): return f"{self.name}"

class Subdivision(models.Model):
    name = models.CharField(max_length=150)
    major_zone = models.ForeignKey(MajorZone, on_delete=models.CASCADE)
    def __str__(self): return self.name

# --- 2. التصنيف الديناميكي ---
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="نوع العقار (شقة/أرض)")
    slug = models.SlugField(unique=True, allow_unicode=True)
    def __str__(self): return self.name

class Feature(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='allowed_features')
    name = models.CharField(max_length=100, verbose_name="الخاصية (مثل: رخصة حفر)")
    INPUT_TYPES = [('number', 'رقم'), ('bool', 'نعم/لا'), ('text', 'نص')]
    input_type = models.CharField(max_length=10, choices=INPUT_TYPES, default='bool')

    # 👇👇👇 قائمة الأيقونات الجديدة (شاملة) 👇👇👇
    ICON_CHOICES = [
        ('CheckCircle2', '✔ علامة صح (افتراضي)'),
        ('ArrowUpFromLine', '🛗 أسانسير / مصعد'),
        ('Zap', '⚡ كهرباء / عداد'),
        ('Wind', '💨 غاز طبيعي'),
        ('Waves', '💧 مياه / سباحة'),
        ('Trees', '🌳 حديقة / لاندسكيب'),
        ('Car', '🚗 جراج / موقف'),
        ('Wifi', '📶 واي فاي / إنترنت'),
        ('ShieldCheck', '🛡 أمن وحراسة'),
        ('Snowflake', '❄ تكييف'),
        ('Tv', '📺 تلفزيون / دش'),
        ('Paintbucket', '🎨 تشطيب / ديكور'),
        ('Dumbbell', '💪 جيم / رياضة'),
        ('Utensils', '🍽 مطبخ'),
        ('BedDouble', '🛏 غرفة نوم'),
        ('Bath', '🛁 حمام'),
    ]
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, default='CheckCircle2', verbose_name="شكل الأيقونة")

    def __str__(self): return f"{self.name} ({self.category.name})"

# --- 3. العقار ---
class Listing(BaseModel):
    reference_code = models.CharField(max_length=20, default=generate_ref, unique=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, allow_unicode=True)
    price = models.DecimalField(max_digits=15, decimal_places=2, db_index=True)
    area_sqm = models.IntegerField(db_index=True)
    description = models.TextField()
    custom_map_image = models.ImageField(upload_to='listings_maps/', null=True, blank=True, verbose_name="صورة مخطط خاصة")
    
    bedrooms = models.IntegerField(null=True, blank=True, verbose_name="غرف النوم")
    bathrooms = models.IntegerField(null=True, blank=True, verbose_name="الحمامات")
    floor_number = models.IntegerField(null=True, blank=True, verbose_name="رقم الدور")
    
    building_number = models.CharField(max_length=50, null=True, blank=True, verbose_name="رقم العمارة")
    apartment_number = models.CharField(max_length=50, null=True, blank=True, verbose_name="رقم الشقة")
    project_name = models.CharField(max_length=100, null=True, blank=True, verbose_name="اسم المشروع/الكمبوند")

    governorate = models.ForeignKey(Governorate, on_delete=models.CASCADE)
    city = ChainedForeignKey(City, chained_field="governorate", chained_model_field="governorate", show_all=False, auto_choose=True)
    major_zone = ChainedForeignKey(MajorZone, chained_field="city", chained_model_field="city", show_all=False, auto_choose=True)
    subdivision = ChainedForeignKey(Subdivision, chained_field="major_zone", chained_model_field="major_zone", show_all=False, null=True, blank=True)
    
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name="خط العرض")
    longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name="خط الطول")

    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_listings')
    
    offer_type = models.CharField(max_length=10, choices=[('Sale', 'بيع'), ('Rent', 'إيجار')], default='Sale', db_index=True)
    
    STATUS_CHOICES = [('Pending', 'قيد المراجعة'), ('Available', 'متاح'), ('Sold', 'تم البيع')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)    
    is_finance_eligible = models.BooleanField(default=False, verbose_name="قابل للتمويل العقاري")

    thumbnail = models.ImageField(upload_to='listings_thumbnails/', null=True, blank=True)
    video = models.FileField(upload_to='listings_videos/', null=True, blank=True, verbose_name="فيديو العقار")
    id_card_image = models.ImageField(upload_to='secure_docs/', null=True, blank=True, verbose_name="صورة البطاقة")
    contract_image = models.ImageField(upload_to='secure_docs/', null=True, blank=True, verbose_name="صورة العقد")
    owner_name = models.CharField(max_length=100, null=True, blank=True)
    owner_phone = models.CharField(max_length=20, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug: self.slug = slugify(self.title, allow_unicode=True) + f"-{self.reference_code}"
        super().save(*args, **kwargs)

    def get_contact_info(self):
        if self.agent and self.agent.phone_number:
            return {'phone': self.agent.phone_number, 'whatsapp': self.agent.whatsapp_link}
        return {'phone': '01000000000', 'whatsapp': 'https://wa.me/201000000000'}

# --- 4. الجداول الفرعية ---
class ListingFeature(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='features_values')
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listings_photos/')
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.listing.thumbnail:
            self.listing.thumbnail = self.image
            self.listing.save()

class ListingDocument(BaseModel):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    document_file = models.FileField(upload_to='secure_docs/')
    document_type = models.CharField(max_length=50)

class ZoneMap(models.Model):
    major_zone = models.ForeignKey(MajorZone, on_delete=models.CASCADE, related_name='maps')
    map_file = models.FileField(upload_to='master_plans/')
    description = models.CharField(max_length=255)

class Interaction(BaseModel):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='interactions')
    interaction_type = models.CharField(max_length=10)

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites', verbose_name="المستخدم")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='favorites', verbose_name="العقار")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "مفضل"
        verbose_name_plural = "المفضلة"
        unique_together = ('user', 'listing')

    def __str__(self):
        return f"{self.user.username} أعجب بـ {self.listing.title[:20]}"