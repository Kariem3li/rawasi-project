"use client";
import { 
    Heart, MapPin, Phone, MessageCircle, BadgeCheck, Ruler, CheckCircle2, 
    BedDouble, Bath, Layout, PaintBucket, Dumbbell, Utensils, Zap, Wind, Waves, Trees, Car, Wifi, Snowflake, Tv, ArrowUpFromLine, ShieldCheck
} from "lucide-react";
import FavoriteButton from './FavoriteButton'; 
import Link from "next/link"; // أضفت Link للانتقال لصفحة التفاصيل

// 🛠️ خريطة الأيقونات الموحدة (نفس اللي في صفحة التفاصيل)
const iconMap: any = {
    Ruler: Ruler,
    BedDouble: BedDouble,
    Bath: Bath,
    Layout: Layout,
    CheckCircle2: CheckCircle2,
    ArrowUpFromLine: ArrowUpFromLine,
    Zap: Zap,
    Wind: Wind,
    Waves: Waves,
    Trees: Trees,
    Car: Car,
    Wifi: Wifi,
    ShieldCheck: ShieldCheck,
    Snowflake: Snowflake,
    Tv: Tv,
    Paintbucket: PaintBucket, 
    Dumbbell: Dumbbell,
    Utensils: Utensils,
};

// دالة مساعدة لرسم الأيقونة بناءً على اسمها
const renderIcon = (iconName: string) => {
    // الأيقونات الأساسية لها أسماء مختلفة في الداتابيز
    let key = iconName;
    if (iconName === 'BedDouble' || iconName === 'Bath' || iconName === 'Layout') {
        // إذا كان جاي من المزايا الثابتة، الأيقونة هي اسمها مباشرة
        key = iconName; 
    } else if (iconName.toLowerCase().includes("مساحة")) {
        // إذا كان مساحة، نستخدم أيقونة المسطرة
        key = 'Ruler';
    } else if (iconName.includes('Paintbucket')) {
        // اسم الداتابيز Paintbucket (صغيرة)، نستخدم الأيقونة الصح PaintBucket (كبيرة)
        key = 'Paintbucket'; 
    }
    
    const IconComp = iconMap[key] || CheckCircle2; // نرجع CheckCircle2 كأيقونة افتراضية
    return <IconComp className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
};


interface ListingProps {
    id: number;
    title: string;
    price: string;
    address: string;
    image: string;
    offerType: "بيع" | "إيجار";
    isFinanceEligible: boolean;
    isSold: boolean;
    // 🎯 تم تغيير نوع features لاستقبال البيانات الديناميكية كاملة
    features: { label: string; value: string; icon?: string; feature_icon?: string }[]; 
    is_favorite: boolean;
    // 🎯 إضافة البيانات الثابتة لو كانت موجودة (لأهميتها في الكارت)
    bedrooms?: number;
    bathrooms?: number;
    area_sqm?: number;
    floor_number?: number;
}

export default function ListingCard({ 
    id, title, price, address, image, offerType, isFinanceEligible, isSold, features, is_favorite,
    bedrooms, bathrooms, area_sqm, floor_number 
}: ListingProps) {
    
    // 🎯 تجهيز المزايا لعرضها في الكارت (أهم 4 فقط)
    // نجمع المزايا الثابتة (لأنها الأهم في الكارت) ثم نتبعها بالديناميكية
    const staticFeatures: { label: string; value: string | number; icon: string }[] = [];
    
    if (area_sqm) staticFeatures.push({ label: 'المساحة', value: `${area_sqm} م²`, icon: 'Ruler' });
    if (bedrooms) staticFeatures.push({ label: 'غرف نوم', value: bedrooms, icon: 'BedDouble' });
    if (bathrooms) staticFeatures.push({ label: 'حمامات', value: bathrooms, icon: 'Bath' });
    if (floor_number !== null && floor_number !== undefined) staticFeatures.push({ label: 'الدور', value: floor_number, icon: 'Layout' });

    // تجميع الثابتة مع أول 4 من الديناميكية
    const dynamicFeatures: { label: string; value: string | number; icon: string }[] = 
        features.map(feat => ({ 
            label: feat.label, 
            value: feat.value, 
            icon: feat.icon || feat.feature_icon || 'CheckCircle2' // نستخدم feature_icon لو موجود
        }));

    const allFeatures = [...staticFeatures, ...dynamicFeatures];
    const featuresToShow = allFeatures.slice(0, 4); 

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative group hover:shadow-xl transition duration-300">
            
            {/* طبقة "تم البيع" */}
            {isSold && (
                <div className="absolute inset-0 z-20 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-red-600 text-white px-8 py-2 rounded-full font-bold text-lg shadow-2xl transform -rotate-12 border-4 border-white">
                        🚫 تم البيع
                    </div>
                </div>
            )}

            {/* صورة العقار والروابط */}
            <Link href={`/listings/${id}`} className="h-56 bg-gray-200 relative overflow-hidden block"> 
                <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={title} />
                
                {/* بادج الحالة */}
                <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg text-white ${
                    offerType === 'بيع' 
                    ? 'bg-slate-900' 
                    : 'bg-orange-600' 
                }`}>
                    {offerType}
                </span>

                {/* زر المفضلة الديناميكي */}
                <div className="absolute top-4 left-4 z-10">
                    <FavoriteButton 
                        listingId={id} 
                        isInitialFavorite={is_favorite} 
                    />
                </div>

                {/* بادج التمويل */}
                {isFinanceEligible && (
                    <span className="absolute bottom-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> تمويل عقاري
                    </span>
                )}
            </Link>

            {/* التفاصيل */}
            <div className="p-5 flex-1 flex flex-col">
                {/* السعر */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-slate-900 whitespace-nowrap">{Number(price).toLocaleString()} <span className="text-xs font-normal text-gray-400">ج.م</span></h3>
                </div>
                
                {/* العنوان */}
                <Link href={`/listings/${id}`} className="text-base font-bold text-gray-800 line-clamp-1 mb-1 hover:text-amber-600 transition">{title}</Link>
                <div className="flex items-start text-gray-500 text-xs mb-4 min-h-[2.5em]">
                    <MapPin className="w-3 h-3 ml-1 mt-0.5 shrink-0" /> 
                    <span className="line-clamp-2">{address}</span>
                </div>
                
                {/* 🚀 شريط المزايا الديناميكي المصحح (الجديد) 🚀 */}
                <div className="flex flex-wrap gap-2 mb-5 border-t border-b border-gray-50 py-3 mt-auto">
                    {featuresToShow.map((feat, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border border-gray-100">
                            {/* استخدام الدالة الجديدة لرسم الأيقونة */}
                            {renderIcon(feat.icon)} 
                            
                            {/* عرض القيمة أو اسم الميزة لو كانت القيمة 'نعم' */}
                            <span className="truncate">
                                {feat.value === "نعم" || feat.value === "True" ? feat.label : feat.value}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* أزرار التواصل */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        disabled={isSold} 
                        className="group/btn flex items-center justify-center gap-2 bg-white text-[#25D366] border border-[#25D366] py-3 rounded-xl font-bold text-sm hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MessageCircle className="w-4 h-4 transition-colors group-hover/btn:text-white" /> 
                        واتساب
                    </button>

                    <button 
                        disabled={isSold} 
                        className="group/btn flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-600 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Phone className="w-4 h-4 transition-colors group-hover/btn:text-white" /> 
                        اتصال
                    </button>
                </div>
            </div>
        </div>
    );
}