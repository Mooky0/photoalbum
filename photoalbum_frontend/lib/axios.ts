import axios from 'axios';

// Az interfésznek PONTOSAN követnie kell a JSON kulcsokat
export interface Photo {
    id: number;
    name: string;
    image: string;
    uploaded_at: string;
    owner_name: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Interceptor a tokenhez (marad a régi)
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const getPhotos = async (ordering: string): Promise<Photo[]> => {
    try {
        const response = await api.get<PaginatedResponse<Photo>>('photos/', {
            params: { ordering }, // Django DRF az 'ordering' kulcsot várja
        });

        console.log("Sikerült a lekérés, eredmények száma:", response.data.count);

        // A válaszod alapján a .results tartalmazza a listát
        if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        } 
        
        return [];
    } catch (error) {
        console.error("API hiba a getPhotos-ban:", error);
        return [];
    }
};

export default api;