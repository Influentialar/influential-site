// src/components/ChatWindow/ChatWindow.js
import React, { useState, useRef, useEffect } from 'react'
import { ReactComponent as SendIcon } from '../../assets/icon-send.svg'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'
import styles from './ChatWindow.module.css'

export default function ChatWindow({ chat, onSendMessage, onDealUpdate }) {
  const [inputText, setInputText] = useState('')
  const [showDealModal, setShowDealModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [dealForm, setDealForm] = useState({ type: 'Colaboración', description: '' })
  const [reviewForm, setReviewForm] = useState({ rating: 5, communication: 5, punctuality: 5, commitment: 5, initiative: 5, quality: 5, creativity: 5, comment: '' })
  const [campaignForm, setCampaignForm] = useState({ caption: '' })
  const [campaignFile, setCampaignFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const messagesEndRef = useRef(null)
  const { profile } = useAuth()
  const myRole = profile?.role

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages])

  const handleSend = () => {
    if (!inputText.trim()) return
    onSendMessage(inputText.trim())
    setInputText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleProposeDeal = async () => {
    if (!chat || !profile) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('collaborations')
      .insert({
        brand_id: profile.id,
        talent_id: chat.participantId,
        type: dealForm.type,
        description: dealForm.description,
        status: 'pending',
        conversation_id: chat.id,
      })
      .select('id')
      .single()

    if (!error && data) {
      await onSendMessage(`📋 Propuesta de colaboración: ${dealForm.type}\n${dealForm.description || 'Sin descripción adicional'}`)
      setShowDealModal(false)
      setDealForm({ type: 'Colaboración', description: '' })
      if (onDealUpdate) onDealUpdate()
    }
    setSubmitting(false)
  }

  const handleDealAction = async (dealId, action) => {
    setSubmitting(true)
    const updates = {}
    if (action === 'accept') {
      updates.status = 'active'
      await onSendMessage('✅ Colaboración aceptada. ¡Manos a la obra!')
    } else if (action === 'reject') {
      updates.status = 'cancelled'
      await onSendMessage('❌ Colaboración rechazada.')
    } else if (action === 'complete') {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
      await onSendMessage('🎉 Colaboración completada. ¡Gracias por trabajar juntos!')
    }

    await supabase.from('collaborations').update(updates).eq('id', dealId)
    if (onDealUpdate) onDealUpdate()
    setSubmitting(false)
  }

  const handleSubmitReview = async (dealId) => {
    if (!profile || !chat) return
    setSubmitting(true)

    await supabase.from('reviews').insert({
      reviewer_id: profile.id,
      reviewed_id: chat.participantId,
      rating: reviewForm.rating,
      communication: reviewForm.communication,
      punctuality: reviewForm.punctuality,
      commitment: reviewForm.commitment,
      initiative: reviewForm.initiative,
      quality: reviewForm.quality,
      creativity: reviewForm.creativity,
      comment: reviewForm.comment,
    })

    // Update profile average rating
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', chat.participantId)
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      await supabase.from('profiles').update({ rating: Math.round(avg * 10) / 10 }).eq('id', chat.participantId)
    }

    await onSendMessage(`⭐ Dejé una reseña: ${reviewForm.rating}/5 — "${reviewForm.comment || 'Sin comentario'}"`)
    setShowReviewModal(false)
    setReviewForm({ rating: 5, communication: 5, punctuality: 5, commitment: 5, initiative: 5, quality: 5, creativity: 5, comment: '' })
    setSubmitting(false)
  }

  const handlePublishCampaign = async (dealId) => {
    if (!campaignFile) return
    setSubmitting(true)

    const ext = campaignFile.name.split('.').pop()
    const path = `campaigns/${dealId}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, campaignFile, { upsert: true })

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const imageUrl = urlData.publicUrl

      await supabase.from('collaborations').update({
        campaign_image: imageUrl,
        campaign_caption: campaignForm.caption,
      }).eq('id', dealId)

      await onSendMessage(`📸 Campaña publicada: ${campaignForm.caption}`)
    }

    setShowCampaignModal(false)
    setCampaignForm({ caption: '' })
    setCampaignFile(null)
    if (onDealUpdate) onDealUpdate()
    setSubmitting(false)
  }

  if (!chat) {
    return (
      <main className={styles.chatWindow}>
        <div className={styles.emptyState}>
          <p>Seleccioná una conversación para empezar</p>
        </div>
      </main>
    )
  }

  const deals = chat.deals || []
  const activeDeal = deals.find(d => d.status === 'active')
  const pendingDeal = deals.find(d => d.status === 'pending')
  const completedDeals = deals.filter(d => d.status === 'completed')
  const canPropose = myRole === 'marca'
  const canAccept = myRole !== 'marca' && pendingDeal
  const canComplete = activeDeal
  const hasUnreviewedDeal = completedDeals.some(d => !d.hasReview)
  const hasUnpublishedDeal = completedDeals.some(d => !d.campaign_image)

  // Debug: log deals to verify they're loaded
  console.log('[ChatWindow] deals:', deals, 'myRole:', myRole, 'pendingDeal:', pendingDeal)

  return (
    <main className={styles.chatWindow}>
      {/* Header */}
      <header className={styles.chatHeader}>
        <div className={styles.userInfo}>
          <img src={chat.avatar} alt={chat.name} />
          <div className={styles.userDetails}>
            <h2>{chat.name}</h2>
            <span className={styles.lastSeen}>{chat.lastSeen}</span>
          </div>
          {chat.type === 'ugc' && <span className={styles.ugcTag}>UGC</span>}
        </div>
        <div className={styles.headerActions}>
          {canPropose && !pendingDeal && !activeDeal && (
            <button className={styles.dealBtn} onClick={() => setShowDealModal(true)}>
              🤝 Proponer colaboración
            </button>
          )}
          {canAccept && (
            <div className={styles.dealActions}>
              <span className={styles.dealPending}>Propuesta pendiente</span>
              <button className={styles.acceptBtn} onClick={() => handleDealAction(pendingDeal.id, 'accept')} disabled={submitting}>
                Aceptar
              </button>
              <button className={styles.rejectBtn} onClick={() => handleDealAction(pendingDeal.id, 'reject')} disabled={submitting}>
                Rechazar
              </button>
            </div>
          )}
          {canComplete && (
            <button className={styles.completeBtn} onClick={() => handleDealAction(activeDeal.id, 'complete')} disabled={submitting}>
              ✅ Marcar como completada
            </button>
          )}
          {hasUnreviewedDeal && (
            <button className={styles.reviewBtn} onClick={() => setShowReviewModal(true)}>
              ⭐ Dejar reseña
            </button>
          )}
          {hasUnpublishedDeal && (
            <button className={styles.campaignBtn} onClick={() => setShowCampaignModal(true)}>
              📸 Publicar campaña
            </button>
          )}
        </div>
      </header>

      {/* Deal status banner */}
      {pendingDeal && myRole === 'marca' && (
        <div className={styles.dealBanner}>
          <span>📋 Propuesta enviada: <strong>{pendingDeal.type}</strong> — esperando respuesta</span>
        </div>
      )}
      {canAccept && (
        <div className={styles.dealBannerAction}>
          <span>📋 <strong>{pendingDeal.type}</strong> — {pendingDeal.description || 'Sin descripción'}</span>
          <div className={styles.bannerBtns}>
            <button className={styles.acceptBtn} onClick={() => handleDealAction(pendingDeal.id, 'accept')} disabled={submitting}>
              ✅ Aceptar
            </button>
            <button className={styles.rejectBtn} onClick={() => handleDealAction(pendingDeal.id, 'reject')} disabled={submitting}>
              Rechazar
            </button>
          </div>
        </div>
      )}
      {activeDeal && (
        <div className={styles.dealBanner}>
          <span>🔄 Colaboración en curso: <strong>{activeDeal.type}</strong></span>
        </div>
      )}

      {/* Mensajes */}
      <div className={styles.messagesList}>
        {chat.messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No hay mensajes todavía. ¡Enviá el primero!</p>
          </div>
        ) : (
          chat.messages.map(m => (
            <div
              key={m.id}
              className={`${styles.messageBubble} ${
                m.from === 'me' ? styles.meBubble : styles.themBubble
              }`}
            >
              <p>{m.text}</p>
              <span className={styles.time}>{m.time}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className={styles.inputBar}>
        <input
          type="text"
          placeholder="Escribí un mensaje..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend} className={styles.sendBtn} disabled={!inputText.trim()}>
          <SendIcon />
        </button>
      </footer>

      {/* === MODALS === */}

      {/* Propose deal modal */}
      {showDealModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDealModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Proponer colaboración</h3>
            <label className={styles.modalLabel}>Tipo de colaboración</label>
            <select className={styles.modalInput} value={dealForm.type} onChange={e => setDealForm(p => ({...p, type: e.target.value}))}>
              <option>Colaboración</option>
              <option>Canje</option>
              <option>Video UGC</option>
              <option>Reel / TikTok</option>
              <option>Foto de producto</option>
              <option>Review</option>
              <option>Unboxing</option>
              <option>Otro</option>
            </select>
            <label className={styles.modalLabel}>Descripción (opcional)</label>
            <textarea className={styles.modalTextarea} value={dealForm.description} onChange={e => setDealForm(p => ({...p, description: e.target.value}))} placeholder="Detallá la propuesta..." rows={3} />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowDealModal(false)}>Cancelar</button>
              <button className={styles.modalSubmit} onClick={handleProposeDeal} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar propuesta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {showReviewModal && (
        <div className={styles.modalOverlay} onClick={() => setShowReviewModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Dejar reseña</h3>
            <label className={styles.modalLabel}>Calificación general</label>
            <div className={styles.starPicker}>
              {[1,2,3,4,5].map(n => (
                <span key={n} className={n <= reviewForm.rating ? styles.starPickerActive : styles.starPickerInactive} onClick={() => setReviewForm(p => ({...p, rating: n}))}>★</span>
              ))}
            </div>
            {[
              { key: 'communication', label: 'Comunicación' },
              { key: 'punctuality', label: 'Puntualidad' },
              { key: 'commitment', label: 'Compromiso' },
              { key: 'initiative', label: 'Iniciativa' },
              { key: 'quality', label: 'Calidad' },
              { key: 'creativity', label: 'Creatividad' },
            ].map(({ key, label }) => (
              <div key={key} className={styles.ratingRow}>
                <span className={styles.ratingLabel}>{label}</span>
                <div className={styles.starPicker}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className={n <= reviewForm[key] ? styles.starPickerActive : styles.starPickerInactive} onClick={() => setReviewForm(p => ({...p, [key]: n}))}>★</span>
                  ))}
                </div>
              </div>
            ))}
            <label className={styles.modalLabel}>Comentario</label>
            <textarea className={styles.modalTextarea} value={reviewForm.comment} onChange={e => setReviewForm(p => ({...p, comment: e.target.value}))} placeholder="Contá tu experiencia..." rows={3} />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowReviewModal(false)}>Cancelar</button>
              <button className={styles.modalSubmit} onClick={() => handleSubmitReview(completedDeals.find(d => !d.hasReview)?.id)} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar reseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign publish modal */}
      {showCampaignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCampaignModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Publicar campaña</h3>
            <label className={styles.modalLabel}>Foto de la campaña</label>
            <input type="file" accept="image/*" className={styles.modalInput} onChange={e => setCampaignFile(e.target.files?.[0])} />
            {campaignFile && <p style={{fontSize:'0.85rem',color:'#666',margin:'0.5rem 0'}}>📎 {campaignFile.name}</p>}
            <label className={styles.modalLabel}>Descripción de la campaña</label>
            <textarea className={styles.modalTextarea} value={campaignForm.caption} onChange={e => setCampaignForm(p => ({...p, caption: e.target.value}))} placeholder="Contá cómo fue la campaña..." rows={3} />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowCampaignModal(false)}>Cancelar</button>
              <button className={styles.modalSubmit} onClick={() => handlePublishCampaign(completedDeals.find(d => !d.campaign_image)?.id)} disabled={submitting || !campaignFile}>
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
