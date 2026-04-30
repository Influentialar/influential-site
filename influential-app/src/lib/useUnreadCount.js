// src/lib/useUnreadCount.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const STORAGE_KEY = 'messages_last_checked'

export function markMessagesAsRead() {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString())
}

export function useUnreadCount(userId) {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!userId) return

    const check = async () => {
      const lastChecked = localStorage.getItem(STORAGE_KEY) || '1970-01-01T00:00:00Z'

      const { data } = await supabase
        .from('messages')
        .select('id')
        .neq('sender_id', userId)
        .gt('created_at', lastChecked)
        .limit(1)

      setHasUnread(!!(data && data.length > 0))
    }

    check()

    // Real-time: cuando llega un mensaje nuevo de otra persona
    const channel = supabase
      .channel('unread-badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id !== userId) {
            setHasUnread(true)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  return hasUnread
}
