/**
 * NOTE: Remote Config fallback module.
 * Firebase Remote Config is disabled in this build to avoid native dependency issues.
 * All URLs fall back to environment variables or hardcoded production endpoints.
 */
const FALLBACK_API_URL = 'https://eazyride-api.onrender.com/api';
const FALLBACK_SOCKET_URL = 'https://eazyride-api.onrender.com';

let _apiBase = null;
let _socketUrl = null;

export async function initRemoteConfig() {
  _apiBase = process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;
  _socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || FALLBACK_SOCKET_URL;
}

export function getApiBase() {
  return _apiBase || process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;
}

export function getSocketUrl() {
  return _socketUrl || process.env.EXPO_PUBLIC_SOCKET_URL || FALLBACK_SOCKET_URL;
}
