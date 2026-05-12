import { API_URL, TENANT_ID, getHeaders, getToken } from '../services/api';

export { API_URL, TENANT_ID, getHeaders, getToken };

export const fetchWithTenant = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...getHeaders(!isFormData),
        ...(options.headers as Record<string, string> || {})
    };

    // Remove Content-Type for FormData (browser sets it automatically with boundary)
    if (isFormData) {
        delete headers['Content-Type'];
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    return fetch(url, {
        ...options,
        headers
    });
};
