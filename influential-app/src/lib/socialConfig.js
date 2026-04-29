// src/lib/socialConfig.js
// Social media API configuration
// Replace these with your actual app credentials from Meta and TikTok developer portals

const SITE_URL = window.location.origin

export const INSTAGRAM_CONFIG = {
  clientId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID || '',
  redirectUri: `${SITE_URL}/auth/instagram/callback`,
  scope: 'instagram_business_basic',
  authUrl: 'https://api.instagram.com/oauth/authorize',
  tokenUrl: 'https://api.instagram.com/oauth/access_token',
  graphUrl: 'https://graph.instagram.com',
}

export const TIKTOK_CONFIG = {
  clientKey: process.env.REACT_APP_TIKTOK_CLIENT_KEY || '',
  redirectUri: `${SITE_URL}/auth/tiktok/callback`,
  scope: 'user.info.basic,user.info.stats',
  authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
  tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
  apiUrl: 'https://open.tiktokapis.com/v2',
}

// Generate Instagram OAuth URL
export function getInstagramAuthUrl() {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_CONFIG.clientId,
    redirect_uri: INSTAGRAM_CONFIG.redirectUri,
    scope: INSTAGRAM_CONFIG.scope,
    response_type: 'code',
    state: 'instagram',
  })
  return `${INSTAGRAM_CONFIG.authUrl}?${params.toString()}`
}

// Generate TikTok OAuth URL
export function getTikTokAuthUrl() {
  const csrfState = Math.random().toString(36).substring(2)
  sessionStorage.setItem('tiktok_csrf', csrfState)
  const params = new URLSearchParams({
    client_key: TIKTOK_CONFIG.clientKey,
    redirect_uri: TIKTOK_CONFIG.redirectUri,
    scope: TIKTOK_CONFIG.scope,
    response_type: 'code',
    state: csrfState,
  })
  return `${TIKTOK_CONFIG.authUrl}?${params.toString()}`
}
