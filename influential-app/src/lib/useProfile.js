// src/lib/useProfile.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useProfileById(id) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }

    async function fetch() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, profile_categories ( category )')
        .eq('id', id)
        .single()

      if (!error && data) {
        setProfile({
          id:                data.id,
          photo:             data.photo_url || '',
          handle:            data.handle || '',
          name:              data.name || '',
          location:          data.location || '',
          rating:            parseFloat(data.rating) || 0,
          description:       data.bio || '',
          instagram:         data.instagram || '',
          tiktok:            data.tiktok || '',
          followersNum:      data.followers_num || 0,
          engagementNum:     parseFloat(data.engagement_num) || 0,
          priceMin:          data.price_min || 0,
          priceMax:          data.price_max || 0,
          deliveryMin:       data.delivery_min || 1,
          deliveryMax:       data.delivery_max || 7,
          completedProjects: data.completed_projects || 0,
          categories:        (data.profile_categories || []).map(c => c.category),
          role:              data.role,
          email:             data.email,
          bannerIdx:         data.banner_idx || 0,
        })
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  return { profile, loading }
}
