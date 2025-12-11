// frontend/lib/config.ts

// 👇 رابط الباك إند بتاعك على PythonAnywhere (بدون https وبدون / في الآخر)
export const SERVER_IP = "kariem.pythonanywhere.com"; 

// 👇 سيبها فاضية لأن السيرفر الحقيقي مش محتاج بورت
export const API_PORT = ""; 

// 👇 لازم يكون https عشان Vercel يقبله
const PROTOCOL = "https"; 

export const BASE_URL = `${PROTOCOL}://${SERVER_IP}`;
export const API_URL = `${BASE_URL}/api`;

export const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.png";
    
    // 1. لو الرابط كامل، تأكد إنه https
    if (path.startsWith("http")) {
        return path.replace("http://", "https://");
    }

    // 2. لو الرابط نسبي، ركبه على الدومين
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`; 
};