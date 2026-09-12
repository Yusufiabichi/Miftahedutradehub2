const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = (): boolean => {
  return Boolean(getAccessToken());
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const ensureValidSession = async (): Promise<boolean> => {
  if (!isAuthenticated()) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      logout();
      return false;
    }

    const data = await response.json();
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};
