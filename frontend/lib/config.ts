// frontend/lib/config.ts

// 👇👇 غيّر هذا السطر فقط عند الرفع على سيرفر حقيقي 👇👇
// للموبايل: ضع IP جهاز الكمبيوتر (مثل 192.168.1.8)
// للكمبيوتر فقط: يكفي localhost
export const SERVER_IP = "192.168.1.8"; // ⚠️ تأكد من هذا الرقم من الـ CMD بكتابة ipconfig
export const API_PORT = "8000";

const PROTOCOL = "http"; // اجعلها https عند الرفع

export const BASE_URL = `${PROTOCOL}://${SERVER_IP}:${API_PORT}`;
export const API_URL = `${BASE_URL}/api`;

export const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    // التأكد من عدم وجود دبل slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
};