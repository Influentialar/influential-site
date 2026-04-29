// src/lib/useCreators.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, profile_categories ( category )')
        .eq('role', 'creator')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const mapped = data.map(p => ({
          id:                p.id,
          photo:             p.photo_url || '',
          handle:            p.handle || '',
          name:              p.name || '',
          location:          p.location || '',
          rating:            parseFloat(p.rating) || 0,
          description:       p.bio || '',
          priceMin:          p.price_min || 0,
          priceMax:          p.price_max || 0,
          priceRange:        p.price_min && p.price_max ? `$${p.price_min.toLocaleString()} – $${p.price_max.toLocaleString()}` : 'A consultar',
          deliveryMin:       p.delivery_min || 1,
          deliveryMax:       p.delivery_max || 7,
          turnaround:        `${p.delivery_min || 1}-${p.delivery_max || 7} días`,
          completedProjects: p.completed_projects || 0,
          specialties:       (p.profile_categories || []).map(c => c.category),
          contentTypes:      [],
        }))
        setCreators(mapped)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { creators, loading }
}
