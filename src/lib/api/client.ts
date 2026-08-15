import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to extract readable error message from Axios / FastAPI response errors
export function extractApiError(err: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!err) return fallbackMessage;

  const detail = err.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    // Pydantic validation errors format: [{ loc: [...], msg: "...", type: "..." }]
    const messages = detail.map((item) => {
      if (typeof item === 'string') return item;
      const field = Array.isArray(item.loc) ? item.loc.filter((l: any) => l !== 'body').join('.') : '';
      return field ? `${field}: ${item.msg}` : item.msg || JSON.stringify(item);
    });
    return messages.join(' | ');
  }

  if (err.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }

  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return fallbackMessage;
}

// Attach authorization token via interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // If running in browser, fetch the token stored in httpOnly cookie via Next API route
    if (typeof window !== 'undefined') {
      try {
        const sessionRes = await fetch('/api/auth/token');
        const data = await sessionRes.json();
        if (data?.token) {
          config.headers.Authorization = `Bearer ${data.token}`;
        }
      } catch (err) {
        console.error('Failed to attach auth token', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear cookie and redirect to login on 401
      await fetch('/api/auth/session', { method: 'DELETE' });
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
