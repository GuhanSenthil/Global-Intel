import axios from 'axios';

const API_URL = 'http://localhost:8000'; // FastAPI backend

const api = axios.create({
  baseURL: API_URL,
});

export const login = (username, password) => api.post('/login', { username, password });
export const signup = (username, password) => api.post('/signup', { username, password });
export const getGlobeData = () => api.get('/api/globe-data');
export const getCountryDetails = (isoCode) => api.get(`/api/country/${isoCode}`);

export default api;
