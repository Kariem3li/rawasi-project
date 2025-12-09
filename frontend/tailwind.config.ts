import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ تم توحيد الأسماء لتطابق الكود (brand-primary, brand-accent)
        brand: {
          primary: '#0f172a',   // كحلي غامق (Slate-900)
          secondary: '#64748b', // رمادي مزرق
          accent: '#d97706',    // ذهبي/برتقالي (Amber-600)
          light: '#f8fafc',     // خلفية فاتحة
          goldLight: '#fbbf24', // ذهبي فاتح للنصوص
        }
      },
      fontFamily: {
        sans: ['Cairo', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;