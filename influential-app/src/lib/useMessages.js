// src/lib/useMessages.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useMessages(userId) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading]             = useState(true)

  // Fetch all conversations for this user
  const fetchConversations = useCallback(async () => {
    if (!userId) { setLoading(false); return }

    const { data: convos, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages ( id, sender_id, text, created_at )
      `)
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (!error && convos) {
      // For each conversation, fetch the other participant's profile
      const enriched = await Promise.all(convos.map(async (conv) => {
        const otherId = conv.participant_a === userId ? conv.participant_b : conv.participant_a
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, photo_url, role')
          .eq('id', otherId)
          .single()

        // Fetch deals linked to this conversation
        const { data: deals } = await supabase
          .from('collaborations')
          .select('id, type, status, description, campaign_image, campaign_caption, completed_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })

        // Check which completed deals have reviews
        const enrichedDeals = await Promise.all((deals || []).map(async (deal) => {
          if (deal.status === 'completed') {
            const { count } = await supabase
              .from('reviews')
              .select('id', { count: 'exact', head: true })
              .eq('reviewed_id', otherId)
              .eq('reviewer_id', userId)
            deal.hasReview = (count || 0) > 0
          }
          return deal
        }))

        return {
          id: conv.id,
          participantId: otherId,
          name: profile?.name || 'Usuario',
          avatar: profile?.photo_url || '',
          type: profile?.role || 'influencer',
          deals: enrichedDeals,
          messages: (conv.messages || [])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map(m => ({
              id: m.id,
              from: m.sender_id === userId ? 'me' : 'them',
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            })),
        }
      }))

      setConversations(enriched)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Real-time subscription for new messages
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new
          setConversations(prev => prev.map(conv => {
            if (conv.id === newMsg.conversation_id) {
              return {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id: newMsg.id,
                    from: newMsg.sender_id === userId ? 'me' : 'them',
                    text: newMsg.text,
                    time: new Date(newMsg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                  },
                ],
              }
            }
            return conv
          }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // Send a message
  const sendMessage = async (conversationId, text) => {
    if (!userId || !text.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        text: text.trim(),
      })

    return { error }
  }

  // Create or get a conversation with another user
  const getOrCreateConversation = async (otherUserId) => {
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_a.eq.${userId},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${userId})`)
      .single()

    if (existing) return existing.id

    // Create new
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_a: userId,
        participant_b: otherUserId,
      })
      .select('id')
      .single()

    if (!error && newConv) {
      await fetchConversations()
      return newConv.id
    }
    return null
  }

  return { conversations, loading, sendMessage, getOrCreateConversation, refetch: fetchConversations }
}
