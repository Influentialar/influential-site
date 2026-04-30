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

    // Si nunca se seteó, inicializar a ahora para no marcar historial como no leído
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    }

    const check = async () => {
      const lastChecked = localStorage.getItem(STORAGE_KEY)

      // Solo conversaciones donde participa este usuario
      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)

      const convIds = (convos || []).map(c => c.id)
      if (convIds.length === 0) { setHasUnread(false); return }

      const { data } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', convIds)
        .neq('sender_id', userId)
        .gt('created_at', lastChecked)
        .limit(1)

      setHasUnread(!!(data && data.length > 0))
    }

    check()

    const channel = supabase
      .channel('unread-badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          if (payload.new.sender_id !== userId) {
            // Verificar que sea una conversación del usuario
            const { data: conv } = await supabase
              .from('conversations')
              .select('id')
              .eq('id', payload.new.conversation_id)
              .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
              .single()
            if (conv) setHasUnread(true)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  return hasUnread
}
