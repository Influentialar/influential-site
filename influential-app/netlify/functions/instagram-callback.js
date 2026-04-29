// netlify/functions/instagram-callback.js
// Exchanges Instagram auth code for access token and fetches user stats

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lbcgqkoyhhiywfwjvqth.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

exports.handler = async (event) => {
  const { code, userId } = JSON.parse(event.body || '{}')

  if (!code || !userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing code or userId' }) }
  }

  try {
    // 1. Exchange code for short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code,
      }),
    })
    const tokenData = await tokenRes.json()

    if (tokenData.error_message) {
      return { statusCode: 400, body: JSON.stringify({ error: tokenData.error_message }) }
    }

    const shortToken = tokenData.access_token
    const igUserId = tokenData.user_id

    // 2. Exchange for long-lived token (60 days)
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${shortToken}`
    )
    const longTokenData = await longTokenRes.json()
    const accessToken = longTokenData.access_token || shortToken
    const expiresIn = longTokenData.expires_in || 3600

    // 3. Fetch user profile and media stats
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count&access_token=${accessToken}`
    )
    const profile = await profileRes.json()

    // 4. Fetch recent media for engagement calculation
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,like_count,comments_count,timestamp&limit=25&access_token=${accessToken}`
    )
    const mediaData = await mediaRes.json()
    const media = mediaData.data || []

    let avgLikes = 0, avgComments = 0
    if (media.length > 0) {
      const totalLikes = media.reduce((sum, m) => sum + (m.like_count || 0), 0)
      const totalComments = media.reduce((sum, m) => sum + (m.comments_count || 0), 0)
      avgLikes = Math.round(totalLikes / media.length)
      avgComments = Math.round(totalComments / media.length)
    }

    // 5. Store in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        profile_id: userId,
        platform: 'instagram',
        platform_user_id: String(igUserId),
        username: profile.username,
        access_token: accessToken,
        token_expires_at: tokenExpiresAt,
        followers_count: profile.followers_count || 0,
        media_count: profile.media_count || 0,
        engagement_rate: profile.followers_count > 0
          ? ((avgLikes + avgComments) / profile.followers_count * 100).toFixed(2)
          : '0.00',
        avg_likes: avgLikes,
        avg_comments: avgComments,
        raw_stats: { profile, recentMedia: media.length },
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id,platform' })

    if (dbError) {
      return { statusCode: 500, body: JSON.stringify({ error: dbError.message }) }
    }

    // 6. Update profile with Instagram handle
    await supabase
      .from('profiles')
      .update({ instagram: `@${profile.username}` })
      .eq('id', userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        username: profile.username,
        mediaCount: profile.media_count,
        avgLikes,
        avgComments,
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
