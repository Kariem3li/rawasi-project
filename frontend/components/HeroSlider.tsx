'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import axios from 'axios';
import { Slider } from '@/types';
import { API_URL, getFullImageUrl } from '@/lib/config'; 

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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
        setSliders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  if (!loading && (!sliders || sliders.length === 0)) return null;

  return (
    <div className="relative w-full py-8 bg-gray-50 dir-rtl"> 
      <Swiper
        modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        loop={sliders.length > 2} 
        slidesPerView={'auto'} // تغيير للعرض التلقائي عشان الشكل يظبط
        breakpoints={{
          320: { slidesPerView: 1.1, spaceBetween: 20 },
          640: { slidesPerView: 1.5, spaceBetween: 30 },
          1024: { slidesPerView: 2.2, spaceBetween: 40 }, // تكبير العرض في الشاشات الكبيرة
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 2.5,
          slideShadows: false, // إلغاء الظل الافتراضي عشان ميبوظش التصميم
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        className="w-full h-[350px] md:h-[500px] !pb-12" // مساحة للنقاط تحت
      >
        {sliders.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl bg-white group transition-all duration-300">
            {/* جعل السلايد بالكامل رابط قابل للضغط */}
            <Link 
                href={slide.target_link ? slide.target_link : '#'} 
                target={slide.open_in_new_tab ? '_blank' : '_self'}
                className="block w-full h-full relative"
            >
                {/* الصورة الخلفية */}
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={getFullImageUrl(slide.image)}
                    alt={slide.title || "عرض مميز"}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-110" // تأثير الزوم عند الوقوف
                  />
                  {/* طبقة التعتيم عشان النص يظهر بوضوح */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>

                {/* المحتوى النصي */}
                <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 pb-12 z-20">
                    {slide.subtitle && (
                      <span className="inline-block py-1.5 px-4 mb-3 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-xs md:text-sm font-bold shadow-lg border border-amber-400/30">
                        {slide.subtitle}
                      </span>
                    )}
                    
                    <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-lg max-w-3xl leading-snug group-hover:text-amber-400 transition-colors">
                      {slide.title}
                    </h2>

                    {/* سهم صغير يظهر عند الهوفر كدليل بصري */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-white flex items-center gap-2 text-sm font-bold">
                        <span>عرض التفاصيل</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;