// src/lib/useSocialConnections.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useSocialConnections(userId) {
  const [connections, setConnections] = useState({})
  const [loading, setLoading]         = useState(true)
  const [syncing, setSyncing]         = useState(false)

  const fetchConnections = useCallback(async () => {
    if (!userId) { setLoading(false); return }

    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('profile_id', userId)

    if (!error && data) {
      const map = {}
      data.forEach(c => { map[c.platform] = c })
      setConnections(map)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchConnections() }, [fetchConnections])

  // Exchange OAuth code for token via Netlify function
  const connectPlatform = async (platform, code) => {
    const endpoint = platform === 'instagram'
      ? '/.netlify/functions/instagram-callback'
      : '/.netlify/functions/tiktok-callback'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId }),
    })
    const data = await res.json()

    if (data.success) {
      await fetchConnections()
    }
    return data
  }

  // Disconnect a platform
  const disconnectPlatform = async (platform) => {
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('profile_id', userId)
      .eq('platform', platform)

    if (!error) {
      setConnections(prev => {
        const next = { ...prev }
        delete next[platform]
        return next
      })
    }
    return { error }
  }

  // Sync/refresh stats
  const syncStats = async (platform) => {
    setSyncing(true)
    try {
      const res = await fetch('/.netlify/functions/sync-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, platform }),
      })
      const data = await res.json()
      if (data.success) await fetchConnections()
      return data
    } finally {
      setSyncing(false)
    }
  }

  return { connections, loading, syncing, connectPlatform, disconnectPlatform, syncStats, refetch: fetchConnections }
}
