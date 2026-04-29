// src/pages/AuthCallback/SocialCallback.js
// Handles OAuth redirects from Instagram and TikTok
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { useSocialConnections } from '../../lib/useSocialConnections'

export default function SocialCallback({ platform }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const userId = session?.user?.id
  const { connectPlatform } = useSocialConnections(userId)
  const [status, setStatus] = useState('Conectando...')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus(`Error: ${searchParams.get('error_description') || error}`)
      setTimeout(() => navigate('/mi-perfil'), 3000)
      return
    }

    if (!code || !userId) {
      setStatus('No se recibió código de autorización')
      setTimeout(() => navigate('/mi-perfil'), 3000)
      return
    }

    async function exchange() {
      setStatus(`Conectando tu cuenta de ${platform === 'instagram' ? 'Instagram' : 'TikTok'}...`)
      const result = await connectPlatform(platform, code)

      if (result.success) {
        setStatus(`Conectado como ${result.username}`)
        setTimeout(() => navigate('/mi-perfil'), 1500)
      } else {
        setStatus(`Error: ${result.error || 'No se pudo conectar'}`)
        setTimeout(() => navigate('/mi-perfil'), 3000)
      }
    }

    exchange()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: '1rem',
      fontFamily: 'inherit', color: '#333',
    }}>
      <div style={{
        width: 48, height: 48, border: '4px solid #e0e0e0',
        borderTopColor: '#6339e0', borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ fontSize: '1.1rem' }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
