// src/pages/MyProfile/MyProfilePage.js
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'
import { useSocialConnections } from '../../lib/useSocialConnections'
import { useGallery } from '../../lib/useGallery'
import { getInstagramAuthUrl, getTikTokAuthUrl, INSTAGRAM_CONFIG, TIKTOK_CONFIG } from '../../lib/socialConfig'
import styles from './MyProfilePage.module.css'

import brandLogo from '../../assets/brand-volvo.svg'
import influencerPhoto from '../../assets/influencer1.svg'

const bannerOptions = [
  'linear-gradient(135deg, #ffaa4f 0%, #efb679 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(135deg, #ed4e4e 0%, #f08a5d 100%)',
]

const ROLE_LABELS = { marca: 'Marca', influencer: 'Influencer', creator: 'Creador UGC' }

export default function MyProfilePage() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const role = profile?.role || 'influencer'
  const { connections, syncing, disconnectPlatform, syncStats } = useSocialConnections(profile?.id)
  const { items: galleryItems, refetch: refetchGallery } = useGallery(profile?.id)

  const igConnected = !!connections.instagram
  const tkConnected = !!connections.tiktok


  const [bannerIdx,  setBannerIdx]  = useState(profile?.banner_idx || 0)
  const [name,       setName]       = useState(profile?.name || '')
  const [handle,     setHandle]     = useState(profile?.handle || '')
  const [location,   setLocation]   = useState(profile?.location || '')
  const [bio,        setBio]        = useState(profile?.bio || '')
  const [photoUrl,   setPhotoUrl]   = useState(profile?.photo_url || '')
  const [instagram,  setInstagram]  = useState(profile?.instagram || '')
  const [tiktok,     setTiktok]     = useState(profile?.tiktok || '')

  // Influencer fields
  const [followersNum,  setFollowersNum]  = useState(profile?.followers_num || 0)
  const [engagementNum, setEngagementNum] = useState(profile?.engagement_num || 0)

  // Creator fields
  const [priceMin,          setPriceMin]          = useState(profile?.price_min || 0)
  const [priceMax,          setPriceMax]          = useState(profile?.price_max || 0)
  const [deliveryMin,       setDeliveryMin]       = useState(profile?.delivery_min || 1)
  const [deliveryMax,       setDeliveryMax]       = useState(profile?.delivery_max || 7)
  const [completedProjects, setCompletedProjects] = useState(profile?.completed_projects || 0)

  const [categories, setCategories] = useState(profile?.categories || [])
  const [galleryUploading, setGalleryUploading] = useState(false)
  const galleryRef = useRef(null)

  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg,       setMsg]       = useState('')

  const defaultImg = role === 'marca' ? brandLogo : influencerPhoto
  const profileImg = photoUrl || defaultImg

  // Profile completion
  const completionFields = [
    { label: 'Foto de perfil', done: !!photoUrl },
    { label: 'Handle',         done: !!handle },
    { label: 'Nombre',         done: !!name },
    { label: 'Ubicación',      done: !!location },
    { label: 'Bio',            done: !!bio },
    { label: 'Categorías',     done: categories.length > 0 },
    { label: role === 'marca' ? 'Instagram o TikTok' : 'Instagram o TikTok', done: !!instagram || !!tiktok },
  ]
  const completionPct = Math.round((completionFields.filter(f => f.done).length / completionFields.length) * 100)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (error) {
      setMsg('Error al subir la foto')
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)
    const newUrl = urlData.publicUrl + '?t=' + Date.now()
    setPhotoUrl(newUrl)
    setUploading(false)
  }

  const ALL_CATEGORIES = role === 'marca'
    ? ['Autos', 'Belleza', 'De lujo', 'Tecnología', 'Salud', 'Gastronomía', 'Moda', 'Deportes']
    : role === 'creator'
    ? ['Producto', 'Lifestyle', 'Gastronomía', 'Belleza', 'Tech', 'Deportes', 'Moda']
    : ['Lifestyle', 'Belleza', 'Deportes', 'Blogger', 'Música', 'Gamer', 'Moda', 'Tech']

  const toggleCategory = (cat) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setGalleryUploading(true)
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const ts = Date.now()
      const path = `${profile.id}/gallery/${ts}.${ext}`
      const { error: upErr } = await supabase.storage.from('gallery').upload(path, file)
      if (upErr) continue
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
      const mediaType = file.type.startsWith('video') ? 'video' : 'image'
      await supabase.from('gallery_items').insert({
        profile_id: profile.id,
        media_url: urlData.publicUrl,
        media_type: mediaType,
        sort_order: galleryItems.length + 1,
      })
    }
    setGalleryUploading(false)
    refetchGallery()
  }

  const handleGalleryDelete = async (itemId, mediaUrl) => {
    await supabase.from('gallery_items').delete().eq('id', itemId)
    // Try to delete from storage too
    const match = mediaUrl?.match(/gallery\/(.+)$/)
    if (match) await supabase.storage.from('gallery').remove([match[1]])
    refetchGallery()
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')

    const updates = {
      name,
      handle,
      location,
      bio,
      banner_idx: bannerIdx,
      photo_url: photoUrl,
      instagram,
      tiktok,
      categories,
    }

    // Role-specific fields
    if (role === 'influencer') {
      updates.followers_num  = parseInt(followersNum) || 0
      updates.engagement_num = parseFloat(engagementNum) || 0
    }
    if (role === 'creator') {
      updates.price_min          = parseInt(priceMin) || 0
      updates.price_max          = parseInt(priceMax) || 0
      updates.delivery_min       = parseInt(deliveryMin) || 1
      updates.delivery_max       = parseInt(deliveryMax) || 7
      updates.completed_projects = parseInt(completedProjects) || 0
    }

    const { error } = await updateProfile(updates)
    if (error) {
      setMsg('Error al guardar: ' + (error.message || error))
    } else {
      setMsg('Cambios guardados correctamente')
    }
    setSaving(false)
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.banner} style={{ background: bannerOptions[bannerIdx] }}>
        <div className={styles.bannerOverlay}>
          <h2 className={styles.bannerTitle}>Mi Perfil</h2>
          <p className={styles.bannerSub}>{ROLE_LABELS[role]} — Editá tu información</p>
        </div>
        <div className={styles.bannerPicker}>
          <span className={styles.bannerPickerLabel}>Banner:</span>
          {bannerOptions.map((bg, i) => (
            <button
              key={i}
              className={`${styles.bannerSwatch} ${i === bannerIdx ? styles.bannerSwatchActive : ''}`}
              style={{ background: bg }}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </div>

      <div className={styles.content}>

        {/* ── Onboarding steps (visible solo si el perfil está incompleto) ── */}
        {completionPct < 100 && (
          <div className={styles.onboardingCard}>
            {completionPct === 0 && (
              <div className={styles.welcomeRow}>
                <span className={styles.welcomeEmoji}>👋</span>
                <div>
                  <p className={styles.welcomeTitle}>¡Bienvenido a Influential!</p>
                  <p className={styles.welcomeSub}>Completá tu perfil para aparecer en el marketplace y conectar con {role === 'marca' ? 'influencers y creadores' : 'marcas'}.</p>
                </div>
              </div>
            )}

            <div className={styles.completionHeader}>
              <span className={styles.completionPctBig}>{completionPct}%</span>
              <div className={styles.completionBarWrap}>
                <div className={styles.completionBarBg}>
                  <div
                    className={styles.completionBarFill}
                    style={{ width: `${completionPct}%`, background: completionPct < 40 ? '#ef4444' : completionPct < 75 ? '#f59e0b' : '#10b981' }}
                  />
                </div>
                <p className={styles.completionBarLabel}>
                  {completionPct < 40 ? 'Perfil muy incompleto — no aparecés en búsquedas' :
                   completionPct < 75 ? 'Perfil en progreso — completá el resto para destacar' :
                   '¡Casi listo! Terminá los últimos detalles'}
                </p>
              </div>
            </div>

            <div className={styles.checklistGrid}>
              {completionFields.map((field) => (
                <div key={field.label} className={`${styles.checkItem} ${field.done ? styles.checkItemDone : styles.checkItemMissing}`}>
                  <span className={styles.checkIcon}>{field.done ? '✓' : '!'}</span>
                  <span className={styles.checkLabel}>{field.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {completionPct === 100 && (
          <div className={styles.completeDone}>
            <span>🎉</span>
            <p>¡Perfil completo! Estás apareciendo en el marketplace.</p>
          </div>
        )}
        <div className={styles.photoSection}>
          <div className={styles.photoWrapper}>
            <img src={profileImg} alt="Foto de perfil" className={styles.profilePhoto} />
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            <button className={styles.changePhotoBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Cambiar foto'}
            </button>
          </div>
        </div>

        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Información personal</h3>

          {msg && (
            <p className={msg.includes('Error') ? styles.errorMsg : styles.successMsg}>{msg}</p>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>{role === 'marca' ? 'Nombre de la marca' : 'Nombre'}</label>
            <input type="text" className={styles.input} value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Handle</label>
            <input type="text" className={styles.input} value={handle} onChange={e => setHandle(e.target.value)} placeholder="@tuhandle" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ubicación</label>
            <input type="text" className={styles.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="Buenos Aires, Arg" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bio</label>
            <textarea className={styles.textarea} value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Contá sobre vos o tu marca..." />
          </div>

          {/* Social connections */}
          <h3 className={styles.formTitle} style={{ marginTop: '1.5rem' }}>Redes sociales</h3>

          <div className={styles.socialCards}>
            {/* Instagram */}
            <div className={`${styles.socialCard} ${igConnected ? styles.socialCardConnected : ''}`}>
              <div className={styles.socialCardHeader}>
                <span className={styles.socialIcon}>📷</span>
                <span className={styles.socialName}>Instagram</span>
              </div>
              {igConnected ? (
                <div className={styles.socialCardBody}>
                  <span className={styles.socialUser}>{connections.instagram.username}</span>
                  <div className={styles.socialStats}>
                    <span>Posts: {connections.instagram.media_count}</span>
                    <span>Avg likes: {connections.instagram.avg_likes}</span>
                  </div>
                  <div className={styles.socialActions}>
                    <button className={styles.syncBtn} onClick={() => syncStats('instagram')} disabled={syncing}>
                      {syncing ? 'Sincronizando...' : 'Actualizar stats'}
                    </button>
                    <button className={styles.disconnectBtn} onClick={() => disconnectPlatform('instagram')}>
                      Desconectar
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.socialCardBody}>
                  {INSTAGRAM_CONFIG.clientId ? (
                    <a href={getInstagramAuthUrl()} className={styles.connectBtn}>
                      Conectar Instagram
                    </a>
                  ) : (
                    <>
                      <input type="text" className={styles.input} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@tu_usuario" />
                      <span className={styles.socialHint}>Conexión automática disponible próximamente</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* TikTok */}
            <div className={`${styles.socialCard} ${tkConnected ? styles.socialCardConnected : ''}`}>
              <div className={styles.socialCardHeader}>
                <span className={styles.socialIcon}>🎵</span>
                <span className={styles.socialName}>TikTok</span>
              </div>
              {tkConnected ? (
                <div className={styles.socialCardBody}>
                  <span className={styles.socialUser}>{connections.tiktok.username}</span>
                  <div className={styles.socialStats}>
                    <span>Seguidores: {connections.tiktok.followers_count?.toLocaleString()}</span>
                    <span>Engagement: {connections.tiktok.engagement_rate}%</span>
                  </div>
                  <div className={styles.socialActions}>
                    <button className={styles.syncBtn} onClick={() => syncStats('tiktok')} disabled={syncing}>
                      {syncing ? 'Sincronizando...' : 'Actualizar stats'}
                    </button>
                    <button className={styles.disconnectBtn} onClick={() => disconnectPlatform('tiktok')}>
                      Desconectar
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.socialCardBody}>
                  {TIKTOK_CONFIG.clientKey ? (
                    <a href={getTikTokAuthUrl()} className={styles.connectBtn}>
                      Conectar TikTok
                    </a>
                  ) : (
                    <>
                      <input type="text" className={styles.input} value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@tu_usuario" />
                      <span className={styles.socialHint}>Conexión automática disponible próximamente</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Influencer-specific fields (manual if not connected) */}
          {role === 'influencer' && !igConnected && !tkConnected && (
            <>
              <h3 className={styles.formTitle} style={{ marginTop: '1.5rem' }}>Datos de influencer (manual)</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Seguidores</label>
                  <input type="number" className={styles.input} value={followersNum} onChange={e => setFollowersNum(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Engagement %</label>
                  <input type="number" step="0.1" className={styles.input} value={engagementNum} onChange={e => setEngagementNum(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Creator-specific fields */}
          {role === 'creator' && (
            <>
              <h3 className={styles.formTitle} style={{ marginTop: '1.5rem' }}>Datos de creador UGC</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Precio mín (ARS)</label>
                  <input type="number" className={styles.input} value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Precio máx (ARS)</label>
                  <input type="number" className={styles.input} value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Entrega mín (días)</label>
                  <input type="number" className={styles.input} value={deliveryMin} onChange={e => setDeliveryMin(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Entrega máx (días)</label>
                  <input type="number" className={styles.input} value={deliveryMax} onChange={e => setDeliveryMax(e.target.value)} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Proyectos completados</label>
                <input type="number" className={styles.input} value={completedProjects} onChange={e => setCompletedProjects(e.target.value)} />
              </div>
            </>
          )}

          {/* Categories */}
          <h3 className={styles.formTitle} style={{ marginTop: '1.5rem' }}>Categorías</h3>
          <div className={styles.categoryGrid}>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryChip} ${categories.includes(cat) ? styles.categoryChipActive : ''}`}
                onClick={() => toggleCategory(cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery / Portfolio */}
          {(role === 'influencer' || role === 'creator') && (
            <>
              <h3 className={styles.formTitle} style={{ marginTop: '1.5rem' }}>Portfolio / Galería</h3>
              <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>
                Subí fotos o videos que muestren tu trabajo. Aparecen en tu perfil público.
              </p>
              <div className={styles.galleryGrid}>
                {galleryItems.map(item => (
                  <div key={item.id} className={styles.galleryItem}>
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} className={styles.galleryThumb} />
                    ) : (
                      <img src={item.media_url} alt="" className={styles.galleryThumb} />
                    )}
                    <button className={styles.galleryDeleteBtn} onClick={() => handleGalleryDelete(item.id, item.media_url)}>×</button>
                  </div>
                ))}
                <button
                  className={styles.galleryAddBtn}
                  onClick={() => galleryRef.current?.click()}
                  disabled={galleryUploading}
                >
                  {galleryUploading ? '...' : '+'}
                </button>
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleGalleryUpload}
                />
              </div>
            </>
          )}

          <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
            <label className={styles.label}>Email</label>
            <input type="email" className={styles.input} value={profile?.email || ''} disabled />
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
