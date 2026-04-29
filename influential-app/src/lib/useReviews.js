// src/lib/useReviews.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useReviews(profileId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    if (!profileId) { setLoading(false); return }

    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:reviewer_id(name, handle, photo_url, role)')
      .eq('reviewed_id', profileId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReviews(data)
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Compute averages
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0
  const avgCommunication = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.communication) || 0), 0) / reviews.length).toFixed(1)
    : '–'
  const avgPunctuality = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.punctuality) || 0), 0) / reviews.length).toFixed(1)
    : '–'
  const avgCommitment = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.commitment) || 0), 0) / reviews.length).toFixed(1)
    : '–'
  const avgInitiative = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.initiative) || 0), 0) / reviews.length).toFixed(1)
    : '–'
  const avgQuality = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.quality) || 0), 0) / reviews.length).toFixed(1)
    : '–'
  const avgCreativity = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (parseFloat(r.creativity) || 0), 0) / reviews.length).toFixed(1)
    : '–'

  // Rating distribution (for bar chart)
  const distribution = [5, 4, 3, 2, 1].map(n => ({
    stars: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100)
      : 0
  }))

  return {
    reviews,
    loading,
    avgRating: parseFloat(avgRating),
    avgCommunication,
    avgPunctuality,
    avgCommitment,
    avgInitiative,
    avgQuality,
    avgCreativity,
    distribution,
    count: reviews.length,
    refetch: fetchReviews,
  }
}
