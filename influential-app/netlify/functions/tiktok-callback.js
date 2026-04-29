// netlify/functions/tiktok-callback.js
// Exchanges TikTok auth code for access token and fetches user stats

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lbcgqkoyhhiywfwjvqth.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

exports.handler = async (event) => {
  const { code, userId } = JSON.parse(event.body || '{}')

  if (!code || !userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing code or userId' }) }
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
      }),
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      return { statusCode: 400, body: JSON.stringify({ error: tokenData.error_description || tokenData.error }) }
    }

    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in || 86400
    const openId = tokenData.open_id

    // 2. Fetch user info with stats
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    const userData = await userRes.json()
    const user = userData.data?.user || {}

    // 3. Calculate engagement rate estimate
    const followers = user.follower_count || 0
    const likes = user.likes_count || 0
    const videos = user.video_count || 1
    const avgLikesPerVideo = Math.round(likes / videos)
    const engagementRate = followers > 0
      ? parseFloat(((avgLikesPerVideo / followers) * 100).toFixed(2))
      : 0

    // 4. Store in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        profile_id: userId,
        platform: 'tiktok',
        platform_user_id: openId,
        username: user.display_name,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        followers_count: followers,
        following_count: user.following_count || 0,
        media_count: user.video_count || 0,
        engagement_rate: engagementRate,
        avg_likes: avgLikesPerVideo,
        avg_views: 0,
        raw_stats: user,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id,platform' })

    if (dbError) {
      return { statusCode: 500, body: JSON.stringify({ error: dbError.message }) }
    }

    // 5. Update profile with TikTok stats
    await supabase
      .from('profiles')
      .update({
        tiktok: `@${user.display_name}`,
        followers_num: followers,
        engagement_num: engagementRate,
      })
      .eq('id', userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        username: user.display_name,
        followers: followers,
        engagement: engagementRate,
        videos: user.video_count,
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
