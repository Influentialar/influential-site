// src/lib/useBrands.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useBrands() {
  const [brands, setBrands]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, profile_categories ( category )')
        .eq('role', 'marca')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const mapped = data.map(p => ({
          id:          p.id,
          logo:        p.photo_url || '',
          handle:      p.handle || p.name || '',
          name:        p.name || '',
          location:    p.location || '',
          description: p.bio || '',
          instagram:   p.instagram || '',
          tiktok:      p.tiktok || '',
          categories:  (p.profile_categories || []).map(c => c.category),
        }))
        setBrands(mapped)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { brands, loading }
}
