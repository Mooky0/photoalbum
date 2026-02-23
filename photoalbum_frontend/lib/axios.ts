import axios from 'axios';

// Az interfésznek PONTOSAN követnie kell a JSON kulcsokat
export interface Photo {
    id: number;          // Az API-ban: 1 (szám)
    name: string;        // Az API-ban: "Teszt Kep"
    image: string;       // Az API-ban: "http://..."
    uploaded_at: string; // Az API-ban: "2026-02-18 18:44" (snake_case!)
    owner_name: string;  // Az API-ban: "tothg" (snake_case!)
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
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