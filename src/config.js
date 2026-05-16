/**
 * NOTE: This file is the single source of truth for all role-specific branding and metadata.
 * By centralizing this information, we ensure consistency across the app and make it
 * easy to update a role's theme or icons in one place. Using professional vector icon
 * names from Feather is a significant improvement over platform-dependent emojis.
 */

export const ROLE_COLORS = {
  RIDER: '#FFD700',
  DRIVER: '#2196F3',
  STORE_OWNER: '#FF9800',
  SERVICE_PROVIDER: '#9C27B0',
};

export const ROLE_ICONS = {
  RIDER: 'navigation',
  DRIVER: 'truck',
  STORE_OWNER: 'shopping-bag',
  SERVICE_PROVIDER: 'tool',
};

export const ROLE_LABELS = {
  RIDER: 'Rider',
  DRIVER: 'Driver',
  STORE_OWNER: 'Store Owner',
  SERVICE_PROVIDER: 'Provider',
};

export const ROLE_CONFIG = {
  RIDER: { color: ROLE_COLORS.RIDER, label: ROLE_LABELS.RIDER, icon: ROLE_ICONS.RIDER },
  DRIVER: { color: ROLE_COLORS.DRIVER, label: ROLE_LABELS.DRIVER, icon: ROLE_ICONS.DRIVER },
  STORE_OWNER: { color: ROLE_COLORS.STORE_OWNER, label: ROLE_LABELS.STORE_OWNER, icon: ROLE_ICONS.STORE_OWNER },
  SERVICE_PROVIDER: { color: ROLE_COLORS.SERVICE_PROVIDER, label: ROLE_LABELS.SERVICE_PROVIDER, icon: ROLE_ICONS.SERVICE_PROVIDER },
};

// Socket & routing URLs (from .env or defaults)
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://eazyride-api.onrender.com';
export const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
