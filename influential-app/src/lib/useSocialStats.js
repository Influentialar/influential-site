// src/lib/useSocialStats.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useSocialStats(profileId) {
  const [stats, setStats] = useState({ instagram: null, tiktok: null })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!profileId) { setLoading(false); return }

    const { data, error } = await supabase
      .from('social_connections')
      .select('platform, username, media_count, avg_likes, avg_comments, followers_count, engagement_rate, raw_stats')
      .eq('profile_id', profileId)

    if (!error && data) {
      const map = {}
      data.forEach(c => { map[c.platform] = c })
      setStats(map)
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetchStats() }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}
