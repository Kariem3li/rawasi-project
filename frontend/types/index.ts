// frontend/types/index.ts

// تعريف بيانات السلايدر
export interface Slider {
    id: number;
    image: string;
    title?: string;
    subtitle?: string;
    link?: string;
    is_active?: boolean;
}

// تعريف بيانات العقار (نحتاجه في أماكن كتير)
export interface Listing {
    id: number;
    title: string;
    slug: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    location: string;
    image?: string;
    images?: { id: number; image: string }[];
    thumbnail?: string;
    type?: string;
    status?: string;
    description?: string;
    created_at?: string;
    agent?: any;
    features?: any[];
    governorate?: any;
    city?: any;
    major_zone?: any;
}