// src/pages/Login/LoginPage.js
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import styles from './LoginPage.module.css'

import logoImg      from '../../assets/logo.svg'
import illustration from '../../assets/login-illustration.svg'
import eyeIcon      from '../../assets/icon-eye.svg'

export default function LoginPage() {
  const { logIn } = useAuth()
  const navigate   = useNavigate()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)

  const togglePassword = () => setShowPassword(v => !v)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await logIn(email, password)

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos'
        : authError.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className={styles.container}>
      {/* IZQUIERDA: ilustración */}
      <div className={styles.left}>
        <img
          src={illustration}
          alt="Bienvenido a Influential"
          className={styles.illustration}
        />
      </div>

      {/* DERECHA: formulario */}
      <div className={styles.right}>
        <div className={styles.card}>
          <img src={logoImg} alt="Influential" className={styles.logo} />

          <h1 className={styles.title}>Bienvenido de nuevo!</h1>
          <p className={styles.subtitle}>Por favor ingresa tus datos</p>

          {error && <p className={styles.error}>{error}</p>}

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Contraseña */}
            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={togglePassword}
                >
                  <img src={eyeIcon} alt="Mostrar contraseña" />
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className={styles.options}>
              <label className={styles.remember}>
                <input type="checkbox" /> Recordarme
              </label>
              <Link to="/forgot" className={styles.forgot}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Iniciar sesión */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Link a registro */}
          <p className={styles.signUpText}>
            ¿No tienes cuenta? <Link to="/signup">Registrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
