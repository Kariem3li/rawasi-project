from django.contrib import admin
from django.utils.html import format_html
from .models import *
from aqar_core.models import Notification
from aqar_core.fcm_manager import send_push_notification

# ✅ 1. جدول المزايا (عشان يظهرلك الأسانسير والغاز جوه العقار)
class ListingFeatureInline(admin.TabularInline):
    model = ListingFeature
    extra = 1 # بيسيبلك خانة فاضية جاهزة للإضافة

# 2. جدول الصور
class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0
    readonly_fields = ['image_preview']
    def image_preview(self, obj):
        return format_html('<img src="{}" style="width: 100px; height: auto;" />', obj.image.url) if obj.image else ""

class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'status_badge', 'price', 'client_type_view', 'owner_whatsapp', 'created_at')
    list_filter = ('status', 'offer_type', 'category', 'governorate')
    search_fields = ('title', 'owner_phone', 'owner_name', 'building_number') # ضفت البحث برقم العمارة
    
    # ✅ هنا ربطنا المزايا بصفحة العقار
    inlines = [ListingFeatureInline, ListingImageInline]
    
    actions = ['approve_listings', 'reject_listings']

    # ✅ تنظيم الحقول وعرض الحقول الجديدة
    fieldsets = (
        ('المراجعة', {'fields': ('status', 'is_finance_eligible')}),
        ('المالك', {'fields': ('agent', 'owner_name', 'owner_phone', 'owner_whatsapp_btn')}),
        ('التفاصيل الأساسية', {'fields': ('title', 'category', 'price', 'area_sqm', 'description')}),
        ('تفاصيل الموقع والوحدة', {
            'fields': (
                'governorate', 'city', 'major_zone', 'subdivision',
                'project_name',      # جديد
                'building_number',   # جديد
                'floor_number',
                'apartment_number',  # جديد
                'bedrooms', 'bathrooms'
            )
        }),
        ('الوثائق (قابل للتعديل)', {
            # ✅ فتحنا التعديل (شلناهم من readonly)
            'fields': ('id_card_image', 'contract_image', 'video', 'custom_map_image')
        }),
    )
    
    # شلنا id_card_image من هنا عشان تقدر تعدلهم
    readonly_fields = ['owner_whatsapp_btn']

    def status_badge(self, obj):
        colors = {'Pending': 'orange', 'Available': 'green', 'Sold': 'red'}
        return format_html(f'<span style="color:white; background:{colors.get(obj.status, "gray")}; padding:3px 8px; border-radius:5px;">{obj.get_status_display()}</span>')

    def client_type_view(self, obj):
        return obj.agent.get_client_type_display() if obj.agent else "-"

    def owner_whatsapp(self, obj):
        if obj.owner_phone:
            phone = obj.owner_phone
            if phone.startswith('01'): phone = '2' + phone
            return format_html(f'<a href="https://wa.me/{phone}" target="_blank" style="color:green; font-weight:bold;">💬 واتساب</a>')
        return "-"

    def owner_whatsapp_btn(self, obj): return self.owner_whatsapp(obj)

    def approve_listings(self, request, queryset):
        queryset.update(status='Available')
        count = 0
        for listing in queryset:
            if listing.agent:
                Notification.objects.create(
                    user=listing.agent,
                    title="مبروك! 🥳",
                    message=f"تم نشر إعلانك '{listing.title}' بنجاح.",
                    notification_type='Listing'
                )
                send_push_notification(
                    listing.agent, 
                    "تم نشر إعلانك! 🏠", 
                    f"وافق الأدمن على عقارك: {listing.title}. اضغط للمعاينة.",
                    link=f"/listings/{listing.id}"
                )
                count += 1
        self.message_user(request, f"تم نشر {count} إعلان وإرسال تنبيهات لأصحابها.")
    approve_listings.short_description = "✅ قبول ونشر (مع إشعار)"

    def reject_listings(self, request, queryset):
        queryset.update(status='Pending')
        self.message_user(request, "تم تعليق الإعلانات.")
    reject_listings.short_description = "⛔ تعليق / رفض"


# تسجيل الموديلات
admin.site.register(Listing, ListingAdmin)
admin.site.register(Governorate)
admin.site.register(City)
admin.site.register(MajorZone)
admin.site.register(Subdivision)
admin.site.register(Category)
admin.site.register(Feature)