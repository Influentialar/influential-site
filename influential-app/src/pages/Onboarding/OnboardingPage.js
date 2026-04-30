// src/pages/Onboarding/OnboardingPage.js
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'
import styles from './OnboardingPage.module.css'

import logoImg        from '../../assets/logo.svg'
import igIcon         from '../../assets/instagram.svg'
import tkIcon         from '../../assets/tiktok.svg'
import brandLogo      from '../../assets/brand-volvo.svg'
import influencerPhoto from '../../assets/influencer1.svg'

const TOTAL_STEPS = 4

const CATEGORIES = {
  marca:      ['Autos', 'Belleza', 'De lujo', 'Tecnología', 'Salud', 'Gastronomía', 'Moda', 'Deportes'],
  influencer: ['Lifestyle', 'Belleza', 'Deportes', 'Blogger', 'Música', 'Gamer', 'Moda', 'Tech'],
  creator:    ['Producto', 'Lifestyle', 'Gastronomía', 'Belleza', 'Tech', 'Deportes', 'Moda'],
}

const ROLE_WELCOME = {
  marca: {
    emoji: '🏷️',
    title: '¡Bienvenido a Influential!',
    sub:   'Conectá con los mejores influencers y creadores de contenido para tu marca.',
    cta:   'Como marca, vas a poder explorar perfiles, contactar creadores y gestionar colaboraciones.',
  },
  influencer: {
    emoji: '⭐',
    title: '¡Bienvenido, influencer!',
    sub:   'Conectá con marcas que buscan exactamente lo que vos ofrecés.',
    cta:   'Completá tu perfil para aparecer en las búsquedas y recibir propuestas de colaboración.',
  },
  creator: {
    emoji: '🎬',
    title: '¡Bienvenido, creador UGC!',
    sub:   'Mostrá tu trabajo y conectá con marcas que necesitan contenido original.',
    cta:   'Completá tu perfil para aparecer en las búsquedas y recibir propuestas de colaboración.',
  },
}

const STEP_LABELS = ['Foto', 'Tu perfil', 'Categorías', 'Redes']

export default function OnboardingPage() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const role = profile?.role || 'influencer'

  const [step, setStep] = useState(1)

  // Step 1 — photo
  const [photoUrl,   setPhotoUrl]   = useState(profile?.photo_url || '')
  const [uploading,  setUploading]  = useState(false)

  // Step 2 — basic info
  const [handle,   setHandle]   = useState(profile?.handle   || '')
  const [name,     setName]     = useState(profile?.name     || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [bio,      setBio]      = useState(profile?.bio      || '')

  // Step 3 — categories + role metrics
  const [categories,    setCategories]    = useState(profile?.categories    || [])
  const [followersNum,  setFollowersNum]  = useState(profile?.followers_num  || '')
  const [engagementNum, setEngagementNum] = useState(profile?.engagement_num || '')
  const [priceMin,      setPriceMin]      = useState(profile?.price_min      || '')
  const [priceMax,      setPriceMax]      = useState(profile?.price_max      || '')

  // Step 4 — social
  const [instagram, setInstagram] = useState(profile?.instagram || '')
  const [tiktok,    setTiktok]    = useState(profile?.tiktok    || '')

  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const defaultImg = role === 'marca' ? brandLogo : influencerPhoto
  const profileImg = photoUrl || defaultImg
  const welcome    = ROLE_WELCOME[role]
  const cats       = CATEGORIES[role]

  // ── Helpers ──────────────────────────────────────────────────────────────

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      setPhotoUrl(urlData.publicUrl + '?t=' + Date.now())
    }
    setUploading(false)
  }

  const toggleCategory = (cat) =>
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )

  const goBack = () => { setError(''); setStep(s => s - 1) }

  const handleNext = async () => {
    setError('')

    if (step === 2 && !handle.trim()) {
      setError('El handle es obligatorio para que otros te encuentren')
      return
    }

    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
      return
    }

    // Step 4 — finish
    if (!instagram.trim() && !tiktok.trim()) {
      setError('Necesitás agregar al menos Instagram o TikTok para aparecer en el marketplace')
      return
    }

    setSaving(true)
    const updates = {
      name,
      handle: handle.startsWith('@') ? handle.slice(1) : handle,
      location,
      bio,
      photo_url: photoUrl,
      instagram: instagram.startsWith('@') ? instagram : instagram ? '@' + instagram : '',
      tiktok:    tiktok.startsWith('@')    ? tiktok    : tiktok    ? '@' + tiktok    : '',
      categories,
    }

    if (role === 'influencer') {
      updates.followers_num  = parseInt(followersNum)  || 0
      updates.engagement_num = parseFloat(engagementNum) || 0
    }
    if (role === 'creator') {
      updates.price_min = parseInt(priceMin) || 0
      updates.price_max = parseInt(priceMax) || 0
    }

    const { error: saveErr } = await updateProfile(updates)
    if (saveErr) {
      setError('Error al guardar: ' + (saveErr.message || saveErr))
      setSaving(false)
      return
    }

    navigate(role === 'marca' ? '/influencers' : '/marcas')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <img src={logoImg} alt="Influential" className={styles.logo} />
      </div>

      {/* Step indicator */}
      <div className={styles.stepRow}>
        {STEP_LABELS.map((label, i) => {
          const idx   = i + 1
          const done  = step > idx
          const active = step === idx
          return (
            <React.Fragment key={i}>
              <div className={styles.stepItem}>
                <div className={`${styles.stepDot} ${done ? styles.done : active ? styles.active : ''}`}>
                  {done ? '✓' : idx}
                </div>
                <span className={`${styles.stepLabel} ${active ? styles.stepLabelActive : ''}`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Card */}
      <div className={styles.card}>
        {error && <div className={styles.error}>{error}</div>}

        {/* ── Step 1: Bienvenida + foto ── */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.welcomeEmoji}>{welcome.emoji}</div>
            <h1 className={styles.title}>{welcome.title}</h1>
            <p className={styles.subtitle}>{welcome.sub}</p>
            <p className={styles.cta}>{welcome.cta}</p>

            <div className={styles.photoArea}>
              <button
                className={styles.photoCircle}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                type="button"
              >
                <img src={profileImg} alt="Foto" className={styles.photoImg} />
                <div className={styles.photoOverlay}>
                  <span>{uploading ? '⏳' : '📷'}</span>
                  <span className={styles.photoOverlayText}>
                    {uploading ? 'Subiendo...' : 'Cambiar foto'}
                  </span>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <p className={styles.photoHint}>
                Subí una foto de perfil <span className={styles.optional}>(opcional, podés hacerlo después)</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Información básica ── */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>Tu información</h1>
            <p className={styles.subtitle}>Estos datos van a aparecer en tu perfil público.</p>

            <div className={styles.field}>
              <label>
                Handle <span className={styles.required}>*</span>
              </label>
              <div className={styles.handleInput}>
                <span className={styles.handleAt}>@</span>
                <input
                  type="text"
                  value={handle.startsWith('@') ? handle.slice(1) : handle}
                  onChange={e => setHandle(e.target.value.replace('@', ''))}
                  placeholder="tuhandle"
                />
              </div>
              <span className={styles.fieldHint}>Tu identificador único en la plataforma</span>
            </div>

            <div className={styles.field}>
              <label>{role === 'marca' ? 'Nombre de la marca' : 'Nombre completo'}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={role === 'marca' ? 'Ej: Nike Argentina' : 'Ej: Juan Pérez'}
              />
            </div>

            <div className={styles.field}>
              <label>Ubicación</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Buenos Aires, Argentina"
              />
            </div>

            <div className={styles.field}>
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder={role === 'marca' ? 'Contá sobre tu marca...' : 'Contá sobre vos...'}
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Categorías ── */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>
              {role === 'marca' ? 'Industria de tu marca' : 'Tus categorías de contenido'}
            </h1>
            <p className={styles.subtitle}>
              Seleccioná las categorías que mejor te representan. Podés elegir varias.
            </p>

            <div className={styles.chipGrid}>
              {cats.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.chip} ${categories.includes(cat) ? styles.chipActive : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {role === 'influencer' && (
              <div className={styles.metricsBox}>
                <h3 className={styles.metricsTitle}>Tus métricas <span className={styles.optional}>(opcional)</span></h3>
                <p className={styles.metricsHint}>Podés completarlas ahora o conectar tus redes después para que se sincronicen automáticamente.</p>
                <div className={styles.metricsRow}>
                  <div className={styles.field}>
                    <label>Seguidores totales</label>
                    <input
                      type="number"
                      value={followersNum}
                      onChange={e => setFollowersNum(e.target.value)}
                      placeholder="Ej: 50000"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Engagement %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={engagementNum}
                      onChange={e => setEngagementNum(e.target.value)}
                      placeholder="Ej: 3.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'creator' && (
              <div className={styles.metricsBox}>
                <h3 className={styles.metricsTitle}>Tus tarifas <span className={styles.optional}>(opcional)</span></h3>
                <p className={styles.metricsHint}>Definí un rango de precio para que las marcas sepan cuánto cobras por proyecto.</p>
                <div className={styles.metricsRow}>
                  <div className={styles.field}>
                    <label>Precio mín (ARS)</label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={e => setPriceMin(e.target.value)}
                      placeholder="Ej: 15000"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Precio máx (ARS)</label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={e => setPriceMax(e.target.value)}
                      placeholder="Ej: 50000"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Redes sociales ── */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>Tus redes sociales</h1>
            <p className={styles.subtitle}>
              Necesitás al menos una red social para aparecer en el marketplace.
            </p>

            <div className={styles.socialField}>
              <div className={styles.socialIconBox}>
                <img src={igIcon} alt="Instagram" className={styles.socialIconImg} />
              </div>
              <div className={`${styles.field} ${styles.socialInput}`}>
                <label>Instagram</label>
                <div className={styles.handleInput}>
                  <span className={styles.handleAt}>@</span>
                  <input
                    type="text"
                    value={instagram.startsWith('@') ? instagram.slice(1) : instagram}
                    onChange={e => setInstagram(e.target.value.replace('@', ''))}
                    placeholder="tu_usuario"
                  />
                </div>
              </div>
            </div>

            <div className={styles.socialDivider}>o</div>

            <div className={styles.socialField}>
              <div className={styles.socialIconBox}>
                <img src={tkIcon} alt="TikTok" className={styles.socialIconImg} />
              </div>
              <div className={`${styles.field} ${styles.socialInput}`}>
                <label>TikTok</label>
                <div className={styles.handleInput}>
                  <span className={styles.handleAt}>@</span>
                  <input
                    type="text"
                    value={tiktok.startsWith('@') ? tiktok.slice(1) : tiktok}
                    onChange={e => setTiktok(e.target.value.replace('@', ''))}
                    placeholder="tu_usuario"
                  />
                </div>
              </div>
            </div>

            <p className={styles.socialNote}>
              Una vez adentro podés conectar tus redes con OAuth para sincronizar tus métricas automáticamente.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className={styles.actions}>
          {step > 1 && (
            <button className={styles.backBtn} onClick={goBack} type="button">
              ← Atrás
            </button>
          )}
          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={saving || uploading}
            type="button"
          >
            {step === TOTAL_STEPS
              ? (saving ? 'Guardando...' : '¡Listo, empezar!')
              : 'Continuar →'}
          </button>
        </div>

        {step === 1 && (
          <button className={styles.skipBtn} onClick={() => setStep(2)} type="button">
            Omitir foto por ahora
          </button>
        )}
      </div>

      <p className={styles.footer}>Paso {step} de {TOTAL_STEPS}</p>
    </div>
  )
}
