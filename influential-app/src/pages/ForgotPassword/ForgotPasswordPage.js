// src/pages/ForgotPassword/ForgotPasswordPage.js
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import styles from './ForgotPasswordPage.module.css'
import logoImg from '../../assets/logo.svg'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src={logoImg} alt="Influential" className={styles.logo} />
        <h1 className={styles.title}>Recuperar contraseña</h1>

        {sent ? (
          <div className={styles.successBox}>
            <p>Te enviamos un email a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.</p>
            <Link to="/login" className={styles.backLink}>Volver al login</Link>
          </div>
        ) : (
          <>
            <p className={styles.subtitle}>Ingresá tu email y te enviaremos un link para restablecer tu contraseña.</p>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
            <Link to="/login" className={styles.backLink}>Volver al login</Link>
          </>
        )}
      </div>
    </div>
  )
}
