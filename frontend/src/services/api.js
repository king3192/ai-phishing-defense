import axios from 'axios';

// Detect API base URL from env or fallback to local Vite proxy
const rawBase = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = rawBase ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/$/, '')}/api/v1`) : '/api/v1';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for sleeping free tiers
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event dispatcher for server wake status
let isServerWaking = false;
const setServerWaking = (status) => {
  if (isServerWaking !== status) {
    isServerWaking = status;
    window.dispatchEvent(new CustomEvent('phishguard-server-wake', { detail: { waking: status } }));
  }
};

// Interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('phishguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Retry interceptor for cold starts / sleeping servers (502, 503, 504, or network timeout)
API.interceptors.response.use(
  (response) => {
    setServerWaking(false);
    return response;
  },
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const isSleepError = !error.response || [502, 503, 504, 520, 521, 522, 524].includes(error.response?.status);

    if (isSleepError && config.__retryCount < 3) {
      config.__retryCount += 1;
      setServerWaking(true);
      // Backoff delay: 3s, 6s, 10s
      const delay = config.__retryCount === 1 ? 3000 : config.__retryCount === 2 ? 6000 : 10000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return API(config);
    }

    setServerWaking(false);
    return Promise.reject(error);
  }
);

export default API;
