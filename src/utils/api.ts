const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/+$/, '');

const isLocalhostUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  configuredApiBaseUrl,
);

export const API_BASE_URL = import.meta.env.PROD && isLocalhostUrl ? '' : configuredApiBaseUrl;
