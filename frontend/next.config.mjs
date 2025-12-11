/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kariem.pythonanywhere.com', // 👈 لازم رابط الباك إند بتاعك يكون هنا
        pathname: '**',
      },
      {
        protocol: 'http', // ضيفنا ده احتياطي لو الرابط رجع http
        hostname: 'kariem.pythonanywhere.com',
        pathname: '**',
      },
      // لو بتستخدم صور خارجية تانية ضيفها هنا
    ],
    unoptimized: true, // 👈 جرب تفعل الخيار ده مؤقتاً، بيحل مشاكل كتير في Vercel
  },
};

export default nextConfig;