import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
});

// Le jeton d'accès vit uniquement en mémoire (jamais en localStorage → protégé du XSS).
// Le refresh token est dans un cookie httpOnly géré par le navigateur.
let accessToken = null;
let onSessionExpired = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};
export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Mutualise les rafraîchissements concurrents en une seule requête
let refreshPromise = null;
export function refreshSession() {
  refreshPromise ??= axios
    .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        setAccessToken(null);
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Une erreur est survenue') {
  if (error?.response?.data?.error?.message) return error.response.data.error.message;
  if (error?.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre';
  if (error?.message === 'Network Error') return 'Impossible de joindre le serveur';
  return fallback;
}

export function getFieldErrors(error) {
  const details = error?.response?.data?.error?.details;
  if (!Array.isArray(details)) return {};
  return Object.fromEntries(details.map((d) => [d.field, d.message]));
}
