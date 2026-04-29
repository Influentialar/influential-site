// src/lib/useGallery.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useGallery(profileId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!profileId) { setLoading(false); return }

    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true })

    if (!error && data) {
      setItems(data)
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetchItems() }, [fetchItems])

  return {
    items,
    loading,
    refetch: fetchItems,
  }
}
