// src/components/NavBar/NavBar.js
import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import styles from './NavBar.module.css'

import logo             from '../../assets/logo.svg'
import chatIcon         from '../../assets/chat.svg'
import brandLogo        from '../../assets/brand-volvo.svg'
import influencerPhoto  from '../../assets/influencer1.svg'

const LINKS = [
  { to: '/landing',     label: 'Sobre Influential' },
  { to: '/marcas',      label: 'Marcas' },
  { to: '/influencers', label: 'Influencers' },
  { to: '/creadores',   label: 'Creadores UGC' },
  { to: '/planes',      label: 'Planes' },
]

export default function NavBar({ userRole }) {
  const { profile, logOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const photoSrc = profile?.photo_url
    ? profile.photo_url
    : userRole === 'marca' ? brandLogo : influencerPhoto

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar}>
        <img src={logo} alt="Influential" className={styles.logo} />

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
        {LINKS.map(({ to, label }) => {
          const disabled =
            (to === '/influencers' && userRole === 'influencer') ||
            (to === '/creadores'   && userRole === 'influencer') ||
            (to === '/marcas'      && userRole === 'marca')

          if (disabled) {
            return (
              <span key={to} className={styles.linkDisabled}>
                {label}
              </span>
            )
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? styles.linkActive : styles.link
              }
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          )
        })}
      </nav>

      <div className={`${styles.right} ${menuOpen ? styles.rightOpen : ''}`}>
        <Link to="/messages" className={styles.chatBtn} onClick={closeMenu}>
          <img src={chatIcon} alt="Chat" />
        </Link>

        <Link to="/mi-perfil" className={styles.profileLink} onClick={closeMenu}>
          <img
            src={photoSrc}
            alt="Mi perfil"
            className={styles.profileAvatar}
          />
        </Link>

        <button onClick={() => { closeMenu(); logOut() }} className={styles.logoutBtn}>
          Salir
        </button>
      </div>
    </header>
  )
}
