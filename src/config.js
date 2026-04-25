const isProduction = import.meta.env.PROD;
export const API_URL = import.meta.env.VITE_API_BASE_URL || (isProduction ? '/api' : 'http://localhost:5050/api');
export const BASE_URL = API_URL === '/api' ? '' : API_URL.replace('/api', '');

export default API_URL;
