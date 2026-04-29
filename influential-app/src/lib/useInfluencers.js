// src/lib/useInfluencers.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useInfluencers() {
  const [influencers, setInfluencers] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, profile_categories ( category )')
        .eq('role', 'influencer')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const mapped = data.map(p => ({
          id:            p.id,
          photo:         p.photo_url || '',
          handle:        p.handle || '',
          name:          p.name || '',
          location:      p.location || '',
          rating:        parseFloat(p.rating) || 0,
          description:   p.bio || '',
          instagram:     p.instagram || '',
          tiktok:        p.tiktok || '',
          followersNum:  p.followers_num || 0,
          engagementNum: parseFloat(p.engagement_num) || 0,
          categories:    (p.profile_categories || []).map(c => c.category),
        }))
        setInfluencers(mapped)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { influencers, loading }
}
