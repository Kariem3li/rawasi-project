"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  MapPin, BedDouble, Bath, Ruler, CheckCircle2, Phone, MessageCircle, 
  ArrowLeft, ChevronRight, ChevronLeft, Map, Layout, Video, Share2, ShieldCheck, Image as ImageIcon,
  Zap, Wind, Waves, ArrowUpFromLine // أيقونات إضافية
} from "lucide-react";
import Link from "next/link";
import { API_URL, getFullImageUrl } from "@/lib/config";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Touch States for Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/listings/${id}/`);
        if (res.ok) {
            const data = await res.json();
            setListing(data);
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    if(id) fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-600 gap-3 bg-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse font-bold text-sm">جاري تحميل التفاصيل...</p>
    </div>
  );

  if (!listing) return <div className="min-h-screen flex items-center justify-center">عفواً، هذا العقار غير متاح.</div>;

  const allImages = listing.images ? listing.images.map((img: any) => img.image) : [];
  if (listing.thumbnail) allImages.unshift(listing.thumbnail);
  const uniqueImages = [...new Set(allImages)];

  const nextImage = () => setActiveImageIndex((prev) => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setActiveImageIndex((prev) => (prev === 0 ? uniqueImages.length - 1 : prev - 1));

  // Swipe Handlers
  const onTouchStart = (e: any) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); }
  const onTouchMove = (e: any) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      if (distance > 50) nextImage();
      if (distance < -50) prevImage();
  };
  
  // 🎨 دالة اختيار الأيقونة المناسبة
  const getIconForFeature = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("غرف")) return <BedDouble className="w-5 h-5 mx-auto text-slate-600 mb-1" />;
      if (n.includes("حمام")) return <Bath className="w-5 h-5 mx-auto text-slate-600 mb-1" />;
      if (n.includes("مساحة")) return <Ruler className="w-5 h-5 mx-auto text-amber-500 mb-1" />;
      if (n.includes("دور") || n.includes("طابق")) return <Layout className="w-5 h-5 mx-auto text-slate-600 mb-1" />;
      if (n.includes("تشطيب")) return <CheckCircle2 className="w-5 h-5 mx-auto text-green-600 mb-1" />;
      if (n.includes("اسانسير") || n.includes("مصعد")) return <ArrowUpFromLine className="w-5 h-5 mx-auto text-blue-600 mb-1" />;
      if (n.includes("كهرباء") || n.includes("عداد")) return <Zap className="w-5 h-5 mx-auto text-yellow-500 mb-1" />;
      if (n.includes("غاز")) return <Wind className="w-5 h-5 mx-auto text-blue-400 mb-1" />;
      if (n.includes("مياه")) return <Waves className="w-5 h-5 mx-auto text-blue-500 mb-1" />;
      return <ShieldCheck className="w-5 h-5 mx-auto text-brand-secondary mb-1" />;
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-28 font-sans">
      
      {/* 1. معرض الصور */}
      <div 
        className="relative h-[45vh] bg-slate-900 group"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
         {/* Header Actions */}
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent" dir="ltr">
             <Link href="/" className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition">
                <ArrowLeft className="w-6 h-6" />
             </Link>
             
             <button className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition">
                <Share2 className="w-5 h-5" />
             </button>
         </div>

         {uniqueImages.length > 0 ? (
             <img 
               src={getFullImageUrl(uniqueImages[activeImageIndex] as string) || ""}
               className="w-full h-full object-cover transition-opacity duration-300" 
               alt="Listing"
             />
         ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col">
                 <ImageIcon className="w-12 h-12 mb-2 opacity-50"/>
                 <span>لا توجد صور</span>
             </div>
         )}

         {uniqueImages.length > 1 && (
             <>
               <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition shadow-lg z-10"><ChevronLeft className="w-6 h-6"/></button>
               <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition shadow-lg z-10"><ChevronRight className="w-6 h-6"/></button>
               
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full z-20" dir="ltr">
                  {uniqueImages.map((_: any, idx: number) => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'bg-amber-500 w-6' : 'bg-white/50 w-1.5'}`}></div>
                  ))}
               </div>
             </>
         )}
      </div>

      {/* 2. التفاصيل */}
      <div className="px-5 py-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-10 shadow-[-10px_-10px_30px_rgba(0,0,0,0.05)] min-h-[60vh]">
         
         {/* العنوان والسعر */}
         <div className="mb-6 border-b border-gray-100 pb-6">
             <div className="flex justify-between items-start mb-3">
                 <span className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white ${listing.offer_type === 'Sale' ? 'bg-slate-900' : 'bg-orange-600'}`}>
                    {listing.offer_type === 'Sale' ? 'للبيع' : 'للإيجار'}
                 </span>
                 {listing.is_finance_eligible && (
                     <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg flex items-center gap-1">
                         <ShieldCheck className="w-3 h-3"/> تمويل عقاري
                     </span>
                 )}
             </div>
             
             <h1 className="text-2xl font-black text-slate-900 mb-2 leading-snug">{listing.title}</h1>
             
             <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                 <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                 <span className="line-clamp-1">
                    {listing.governorate_name}، {listing.city_name}، {listing.major_zone_name} 
                    {listing.subdivision_name ? `، ${listing.subdivision_name}` : ''}
                 </span>
             </div>

             <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                 {Number(listing.price).toLocaleString()} <span className="text-sm font-bold text-gray-400">ج.م</span>
             </div>
         </div>

         {/* 🔥🔥🔥 شريط المزايا الموحد (الكل جنب بعضه) 🔥🔥🔥 */}
         <div className="flex flex-wrap gap-2.5 mb-8">
             {/* 1. المساحة (ثابتة) */}
             <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100 min-w-[85px] flex-1">
                 {getIconForFeature("مساحة")}
                 <p className="text-[10px] text-gray-400 font-bold">المساحة</p>
                 <p className="font-black text-slate-800 text-sm" dir="ltr">{listing.area_sqm} م²</p>
             </div>

             {/* 2. الغرف (لو موجودة) */}
             {listing.bedrooms > 0 && (
                 <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100 min-w-[85px] flex-1">
                     {getIconForFeature("غرف")}
                     <p className="text-[10px] text-gray-400 font-bold">غرف</p>
                     <p className="font-black text-slate-800 text-sm">{listing.bedrooms}</p>
                 </div>
             )}

             {/* 3. الحمامات (لو موجودة) */}
             {listing.bathrooms > 0 && (
                 <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100 min-w-[85px] flex-1">
                     {getIconForFeature("حمام")}
                     <p className="text-[10px] text-gray-400 font-bold">حمام</p>
                     <p className="font-black text-slate-800 text-sm">{listing.bathrooms}</p>
                 </div>
             )}

             {/* 4. الدور (لو موجود) */}
             {listing.floor_number !== null && (
                 <div className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100 min-w-[85px] flex-1">
                     {getIconForFeature("دور")}
                     <p className="text-[10px] text-gray-400 font-bold">الدور</p>
                     <p className="font-black text-slate-800 text-sm">{listing.floor_number}</p>
                 </div>
             )}

             {/* 5. المزايا الديناميكية (أسانسير، غاز، إلخ) بتترص هنا جنبهم */}
             {listing.dynamic_features && listing.dynamic_features.map((feat: any, idx: number) => (
                 <div key={idx} className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100 min-w-[85px] flex-1">
                     {getIconForFeature(feat.feature_name)}
                     <p className="text-[10px] text-gray-400 font-bold line-clamp-1">{feat.feature_name}</p>
                     <p className="font-black text-slate-800 text-sm line-clamp-1">
                        {feat.value === "نعم" || feat.value === "True" ? "متاح ✅" : feat.value}
                     </p>
                 </div>
             ))}
         </div>

         <div className="space-y-10">
             <div>
                 <h3 className="font-bold text-lg mb-3 text-slate-900">تفاصيل العقار</h3>
                 <p className="text-gray-600 text-sm leading-loose whitespace-pre-line">{listing.description}</p>
             </div>

             {listing.video && (
                 <div>
                     <h3 className="font-bold text-lg mb-3 text-slate-900 flex items-center gap-2"><Video className="w-5 h-5 text-red-500" /> فيديو توضيحي</h3>
                     <div className="rounded-2xl overflow-hidden shadow-lg bg-black aspect-video">
                         <video controls className="w-full h-full"><source src={getFullImageUrl(listing.video) as string} type="video/mp4" />المتصفح لا يدعم الفيديو.</video>
                     </div>
                 </div>
             )}

             {listing.latitude && listing.longitude && (
                 <div>
                     <h3 className="font-bold text-lg mb-3 text-slate-900 flex items-center gap-2"><Map className="w-5 h-5 text-blue-600" /> الموقع على الخريطة</h3>
                     <div className="h-56 w-full rounded-2xl overflow-hidden shadow-md border border-gray-200 relative group">
                         <iframe 
                           width="100%" 
                           height="100%" 
                           src={`http://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`} 
                           className="border-0 grayscale group-hover:grayscale-0 transition duration-500"
                         ></iframe>
                         <a href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`} target="_blank" className="absolute bottom-3 left-3 bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-slate-50"><MapPin className="w-3 h-3 text-red-500"/> فتح في Google Maps</a>
                     </div>
                 </div>
             )}

             {listing.zone_map_image && (
                 <div className="mt-8 pt-8 border-t border-gray-100">
                     <h3 className="font-bold text-lg mb-3 text-slate-900 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-purple-600" /> المخطط الهندسي / الكروكي
                     </h3>
                     <div className="rounded-2xl overflow-hidden shadow-lg bg-slate-100 border-4 border-white relative group cursor-zoom-in">
                         <img 
                           src={listing.zone_map_image} 
                           className="w-full h-auto object-contain" 
                           alt="Master Plan" 
                         />
                     </div>
                     <p className="text-[10px] text-gray-400 mt-2 text-center">مخطط توضيحي للمنطقة</p>
                 </div>
             )}
         </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
          <div className="flex gap-3 max-w-3xl mx-auto">
              <a href={`tel:${listing.owner_phone}`} className="flex-1 bg-slate-900 text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base hover:bg-slate-800 transition shadow-lg"><Phone className="w-5 h-5" /> اتصال</a>
              <a href={`https://wa.me/2${listing.owner_phone}`} target="_blank" className="flex-1 bg-[#25D366] text-white h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base hover:bg-[#1ebc57] transition shadow-lg"><MessageCircle className="w-5 h-5" /> واتساب</a>
          </div>
      </div>

    </main>
  );
}