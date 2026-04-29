// src/lib/useCollaborations.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useCollaborations(profileId) {
  const [collaborations, setCollaborations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCollaborations = useCallback(async () => {
    if (!profileId) { setLoading(false); return }

    // Fetch collaborations where this profile is either the brand or the talent
    const { data, error } = await supabase
      .from('collaborations')
      .select('*, brand:brand_id(name, handle, photo_url), talent:talent_id(name, handle, photo_url)')
      .or(`brand_id.eq.${profileId},talent_id.eq.${profileId}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCollaborations(data)
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetchCollaborations() }, [fetchCollaborations])

  const completedCount = collaborations.filter(c => c.status === 'completed').length

  return {
    collaborations,
    loading,
    completedCount,
    refetch: fetchCollaborations,
  }
}
