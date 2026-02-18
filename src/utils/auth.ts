const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Token expiry check - tokens expire after 1 hour
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

// Prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('supabase_access_token');
  
  if (!token) {
    return false;
  }
  
  // If token exists, consider user authenticated
  // Don't aggressively check expiry on every call
  return true;
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('supabase_access_token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('supabase_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = async () => {
  const token = getAccessToken();
  
  if (token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  localStorage.removeItem('supabase_access_token');
  localStorage.removeItem('supabase_refresh_token');
  localStorage.removeItem('supabase_user');
  localStorage.removeItem('token_expiry_time');
  
  // Clear refresh state
  isRefreshing = false;
  refreshPromise = null;
  
  // Stop auto-refresh
  stopSessionRefresh();
};

export const refreshSession = async (): Promise<boolean> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem('supabase_refresh_token');
  
  if (!refreshToken) {
    return false;
  }

  // Set refreshing flag and create promise
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Session refresh failed:', data);
        return false;
      }

      // Store new tokens and expiry time
      localStorage.setItem('supabase_access_token', data.access_token);
      localStorage.setItem('supabase_refresh_token', data.refresh_token);
      localStorage.setItem('supabase_user', JSON.stringify(data.user));
      
      // Use the actual expires_in from Supabase response (usually 3600 seconds)
      const expiresIn = data.expires_in || 3600;
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('token_expiry_time', expiryTime.toString());

      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    } finally {
      // Reset refreshing state
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Ensure valid session before making API calls
export const ensureValidSession = async (): Promise<boolean> => {
  const token = localStorage.getItem('supabase_access_token');
  
  // If no token at all, session is invalid
  if (!token) {
    return false;
  }
  
  const expiryTime = localStorage.getItem('token_expiry_time');
  
  // If no expiry time, assume token is valid
  if (!expiryTime) {
    return true;
  }
  
  const now = Date.now();
  const expiry = parseInt(expiryTime);
  
  // Only refresh if token is very close to expiry (within 5 minutes)
  if (now >= expiry - TOKEN_EXPIRY_BUFFER) {
    const refreshed = await refreshSession();
    return refreshed;
  }
  
  // Token is still valid
  return true;
};

// Auto-refresh session periodically
let refreshInterval: NodeJS.Timeout | null = null;

export const startSessionRefresh = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Check and refresh every 15 minutes
  refreshInterval = setInterval(async () => {
    const expiryTime = localStorage.getItem('token_expiry_time');
    if (!expiryTime) return;
    
    const now = Date.now();
    const expiry = parseInt(expiryTime);
    
    // Refresh if token expires in less than 15 minutes
    if (now >= expiry - (15 * 60 * 1000)) {
      await refreshSession();
    }
  }, 15 * 60 * 1000); // Check every 15 minutes
};

export const stopSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
