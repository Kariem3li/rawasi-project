'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import axios from 'axios';
import { Slider } from '@/types'; // تأكد إننا هنعدل ملف الأنواع في الخطوة الجاية
import { API_URL, getFullImageUrl } from '@/lib/config'; 

// استيراد ستايلات السوايبر
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const HeroSlider = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await axios.get(`${API_URL}/sliders/`);
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setSliders(data);
      } catch (error) {
        console.error("Slider Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  if (!loading && (!sliders || sliders.length === 0)) return null;

  return (
    // section: حاوية خارجية بتعمل مسافة من فوق ومن الجناب (شكل الكارت العائم)
    <section className="w-full px-4 pt-4 md:px-8 md:pt-6 bg-gray-50 dir-rtl pb-6">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect={'fade'} // تأثير الاختفاء (أشيك من الحركة الجانبية في الهيرو)
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={1000} // سرعة النقلة هادية
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ 
            clickable: true,
            // تنسيق نقاط التنقل لتكون شيك
            bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-2 !h-2 !opacity-100 transition-all duration-300',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-amber-500 !w-6 !rounded-full'
        }}
        // ارتفاع السلايدر وشكله الدائري
        className="w-full h-[200px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl relative group"
      >
        {sliders.map((slide) => {
            // حل مشكلة الصورة: نستخدم image_url لو جاي من الباك إند الجديد، أو image القديم
            // @ts-ignore
            const imgSrc = slide.image_url || slide.image;

            return (
              <SwiperSlide key={slide.id} className="relative w-full h-full bg-slate-900">
                {/* الرابط يغطي السلايد بالكامل */}
                <Link 
                    href={slide.target_link || '#'} 
                    target={slide.open_in_new_tab ? '_blank' : '_self'}
                    className="block w-full h-full relative"
                >
                    {/* 1. الصورة الخلفية */}
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src={getFullImageUrl(imgSrc)}
                        alt={slide.title || "عرض عقاري"}
                        fill
                        priority
                        className="object-cover transition-transform duration-[2000ms] hover:scale-105" // زوم بطيء جداً وشيك
                      />
                      {/* طبقة تعتيم متدرجة احترافية */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                    </div>

                    {/* 2. المحتوى النصي */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-20 max-w-3xl">
                        
                        {/* العنوان الفرعي (التاج) */}
                        {slide.subtitle && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit animate-fade-in-up">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-300 text-xs md:text-sm font-bold tracking-wide">
                              {slide.subtitle}
                            </span>
                          </div>
                        )}
                        
                        {/* العنوان الرئيسي */}
                        <h2 className="text-2xl md:text-5xl font-black text-white leading-tight mb-6 drop-shadow-lg">
                          {slide.title}
                        </h2>

                        {/* زرار وهمي (Call to Action) */}
                        <div className="flex items-center gap-3 group/btn">
                            <span className="text-white font-bold text-sm md:text-lg border-b-2 border-amber-500 pb-1 group-hover/btn:text-amber-400 transition-colors">
                                {slide.button_text || "اكتشف التفاصيل"}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-amber-500 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Link>
              </SwiperSlide>
            );
        })}
      </Swiper>
    </section>
  );
};

export default HeroSlider;