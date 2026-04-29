// src/pages/SignUp/SignUpPage.js
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import styles from './SignUpPage.module.css'

import logoImg      from '../../assets/logo.svg'
import illustration from '../../assets/login-illustration.svg'
import eyeIcon      from '../../assets/icon-eye.svg'

const ROLES = [
  { value: 'marca',       label: 'Marca',         desc: 'Buscás influencers y creadores para tu marca' },
  { value: 'influencer',  label: 'Influencer',     desc: 'Creás contenido en redes y colaborás con marcas' },
  { value: 'creator',     label: 'Creador UGC',    desc: 'Producís contenido original para marcas' },
]

export default function SignUpPage() {
  const { signUp } = useAuth()

  const [step,         setStep]         = useState(1) // 1 = role, 2 = form
  const [role,         setRole]         = useState('')
  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPass,  setConfirmPass]  = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)

  const togglePassword = () => setShowPassword(v => !v)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPass) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { error: authError } = await signUp(email, password, name, role)

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.left}>
          <img src={illustration} alt="Influential" className={styles.illustration} />
        </div>
        <div className={styles.right}>
          <div className={styles.card}>
            <img src={logoImg} alt="Influential" className={styles.logo} />
            <h1 className={styles.title}>Revisa tu email</h1>
            <p className={styles.subtitle}>
              Te enviamos un link de confirmación a <strong>{email}</strong>.
              Hacé click en el link para activar tu cuenta.
            </p>
            <Link to="/login" className={styles.backLink}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src={illustration} alt="Influential" className={styles.illustration} />
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <img src={logoImg} alt="Influential" className={styles.logo} />

          {step === 1 ? (
            <>
              <h1 className={styles.title}>¿Qué tipo de cuenta querés?</h1>
              <p className={styles.subtitle}>Elegí tu rol en la plataforma</p>

              <div className={styles.roleGrid}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    className={`${styles.roleCard} ${role === r.value ? styles.roleCardActive : ''}`}
                    onClick={() => setRole(r.value)}
                  >
                    <span className={styles.roleLabel}>{r.label}</span>
                    <span className={styles.roleDesc}>{r.desc}</span>
                  </button>
                ))}
              </div>

              <button
                className={styles.submitBtn}
                disabled={!role}
                onClick={() => setStep(2)}
              >
                Continuar
              </button>

              <p className={styles.signInText}>
                ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Crea tu cuenta</h1>
              <p className={styles.subtitle}>
                Registrate como <strong>{ROLES.find(r => r.value === role)?.label}</strong>
                {' '}<button className={styles.changeRole} onClick={() => setStep(1)}>cambiar</button>
              </p>

              {error && <p className={styles.error}>{error}</p>}

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label htmlFor="name">{role === 'marca' ? 'Nombre de la marca' : 'Nombre completo'}</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={role === 'marca' ? 'Ej: Nike Argentina' : 'Ej: Juan Pérez'}
                    required
                  />
                </div>

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

                <div className={styles.field}>
                  <label htmlFor="password">Contraseña</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button type="button" className={styles.eyeBtn} onClick={togglePassword}>
                      <img src={eyeIcon} alt="Mostrar" />
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="confirmPass">Confirmar contraseña</label>
                  <input
                    id="confirmPass"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repetí tu contraseña"
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Registrarme'}
                </button>
              </form>

              <p className={styles.signInText}>
                ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
