import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';

type FieldErrors = { email?: string; password?: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBERED_EMAIL_KEY = 'remembered_email';
const REQUEST_TIMEOUT_MS = 15_000;

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email address is required.';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
  return undefined;
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  return undefined;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  // Restore remembered email + focus the right field on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
      passwordRef.current?.focus();
    } else {
      emailRef.current?.focus();
    }
  }, []);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (error) setError('');
  };

  const handlePasswordKeyEvent = (e: KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    const values = { email: email.trim(), password };
    const errors: FieldErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };
    setFieldErrors(errors);

    // Focus the first invalid field so keyboard users aren't stranded
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });

      // The server may return a non-JSON body on 5xx — don't let that throw a
      // confusing "Unexpected token" error at the user.
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Incorrect email or password. Please try again.');
        }
        if (response.status === 429) {
          throw new Error('Too many attempts. Please wait a moment and try again.');
        }
        throw new Error(data?.message || 'Login failed. Please try again.');
      }

      if (!data?.token) {
        throw new Error('Unexpected server response. Please try again.');
      }

      localStorage.setItem('access_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user ?? null));

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('The request timed out. Check your connection and try again.');
      } else if (err instanceof TypeError) {
        setError('Unable to reach the server. Check your connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      }
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const inputBase =
    'w-full pl-11 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-user-line text-3xl text-white" aria-hidden="true"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <i
                className="ri-error-warning-line text-red-600 text-xl mt-0.5"
                aria-hidden="true"
              ></i>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i
                    className={`ri-mail-line ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`}
                    aria-hidden="true"
                  ></i>
                </div>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  onBlur={() =>
                    setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
                  }
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={`${inputBase} pr-4 ${
                    fieldErrors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
                  }`}
                  placeholder="admin@example.com"
                />
              </div>
              {fieldErrors.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i
                    className={`ri-lock-line ${fieldErrors.password ? 'text-red-400' : 'text-gray-400'}`}
                    aria-hidden="true"
                  ></i>
                </div>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  onBlur={() => {
                    setCapsLockOn(false);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: validatePassword(password),
                    }));
                  }}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password
                      ? 'password-error'
                      : capsLockOn
                        ? 'capslock-hint'
                        : undefined
                  }
                  className={`${inputBase} pl-11 pr-12 ${
                    fieldErrors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-transparent'
                      : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((v) => !v);
                    passwordRef.current?.focus();
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:text-teal-600 cursor-pointer"
                >
                  <i
                    className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>

              {fieldErrors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {fieldErrors.password}
                </p>
              )}

              {capsLockOn && !fieldErrors.password && (
                <p
                  id="capslock-hint"
                  role="status"
                  className="mt-2 text-xs text-amber-600 flex items-center gap-1"
                >
                  <i className="ri-alert-line" aria-hidden="true"></i>
                  Caps Lock is on
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={loading}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-teal-600 cursor-pointer disabled:cursor-not-allowed"
                />
                Remember my email
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                    aria-hidden="true"
                  ></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <i className="ri-login-box-line" aria-hidden="true"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium focus:outline-none focus-visible:underline"
            >
              <i className="ri-arrow-left-line mr-1" aria-hidden="true"></i>
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}