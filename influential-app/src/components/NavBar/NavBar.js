// src/components/NavBar/NavBar.js
import React, { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const photoSrc = profile?.photo_url
    ? profile.photo_url
    : userRole === 'marca' ? brandLogo : influencerPhoto

  const closeMenu = () => setMenuOpen(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <button
            className={styles.profileBtn}
            onClick={() => { closeMenu(); setDropdownOpen(prev => !prev) }}
          >
            <img src={photoSrc} alt="Mi perfil" className={styles.profileAvatar} />
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <img src={photoSrc} alt="" className={styles.dropdownAvatar} />
                <div>
                  <p className={styles.dropdownName}>{profile?.name || 'Mi cuenta'}</p>
                  <p className={styles.dropdownHandle}>{profile?.handle ? `@${profile.handle}` : profile?.email}</p>
                </div>
              </div>
              <hr className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); navigate('/mi-perfil') }}>
                <span>👤</span> Mi perfil
              </button>
              <hr className={styles.dropdownDivider} />
              <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => { setDropdownOpen(false); logOut() }}>
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
