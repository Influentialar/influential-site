// netlify/functions/sync-stats.js
// Re-fetches stats from connected social platforms

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lbcgqkoyhhiywfwjvqth.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function syncInstagram(connection) {
  const { access_token } = connection

  const profileRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username,media_count,followers_count&access_token=${access_token}`
  )
  const profile = await profileRes.json()
  if (profile.error) return { error: profile.error.message }

  const mediaRes = await fetch(
    `https://graph.instagram.com/me/media?fields=id,like_count,comments_count&limit=25&access_token=${access_token}`
  )
  const mediaData = await mediaRes.json()
  const media = mediaData.data || []

  let avgLikes = 0, avgComments = 0
  if (media.length > 0) {
    avgLikes = Math.round(media.reduce((s, m) => s + (m.like_count || 0), 0) / media.length)
    avgComments = Math.round(media.reduce((s, m) => s + (m.comments_count || 0), 0) / media.length)
  }

  const followersCount = profile.followers_count || 0
  const engagementRate = followersCount > 0
    ? ((avgLikes + avgComments) / followersCount * 100).toFixed(2)
    : '0.00'

  return {
    username: profile.username,
    followers_count: followersCount,
    media_count: profile.media_count || 0,
    engagement_rate: engagementRate,
    avg_likes: avgLikes,
    avg_comments: avgComments,
  }
}

async function syncTikTok(connection) {
  const { access_token } = connection

  const userRes = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,following_count,likes_count,video_count',
    { headers: { 'Authorization': `Bearer ${access_token}` } }
  )
  const userData = await userRes.json()
  const user = userData.data?.user || {}

  const followers = user.follower_count || 0
  const videos = user.video_count || 1
  const avgLikes = Math.round((user.likes_count || 0) / videos)
  const engagement = followers > 0 ? parseFloat(((avgLikes / followers) * 100).toFixed(2)) : 0

  return {
    username: user.display_name,
    followers_count: followers,
    following_count: user.following_count || 0,
    media_count: user.video_count || 0,
    engagement_rate: engagement,
    avg_likes: avgLikes,
  }
}

exports.handler = async (event) => {
  const { userId, platform } = JSON.parse(event.body || '{}')

  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing userId' }) }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get connections for this user
    let query = supabase.from('social_connections').select('*').eq('profile_id', userId)
    if (platform) query = query.eq('platform', platform)
    const { data: connections, error } = await query

    if (error || !connections?.length) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No connections found' }) }
    }

    const results = {}

    for (const conn of connections) {
      let stats
      if (conn.platform === 'instagram') {
        stats = await syncInstagram(conn)
      } else if (conn.platform === 'tiktok') {
        stats = await syncTikTok(conn)
      }

      if (stats && !stats.error) {
        await supabase
          .from('social_connections')
          .update({ ...stats, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', conn.id)

        results[conn.platform] = stats
      }
    }

    // Update profile with latest aggregate stats
    const igConn = connections.find(c => c.platform === 'instagram')
    const tkConn = connections.find(c => c.platform === 'tiktok')

    const profileUpdate = {}
    if (results.instagram) {
      profileUpdate.instagram = `@${results.instagram.username}`
    }
    if (results.tiktok) {
      profileUpdate.tiktok = `@${results.tiktok.username}`
      profileUpdate.followers_num = results.tiktok.followers_count
      profileUpdate.engagement_num = results.tiktok.engagement_rate
    }

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from('profiles').update(profileUpdate).eq('id', userId)
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, results }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
