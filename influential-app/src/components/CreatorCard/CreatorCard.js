// src/components/CreatorCard/CreatorCard.js
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './CreatorCard.module.css'

import heartEmpty from '../../assets/icon-heart.svg'
import heartFilled from '../../assets/purple.svg'

export default function CreatorCard({
  id,
  photo,
  handle,
  location,
  rating,
  description,
  contentTypes = [],
  specialties = [],
  priceRange,
  completedProjects,
  onContact,
}) {
  const [isFav, setIsFav] = useState(false)

  const toggleFav = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsFav(f => !f)
  }

  const stars = Array(5).fill(0).map((_, i) => (
    <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
      ★
    </span>
  ))

  return (
    <Link to={`/creadores/${id}`} className={styles.linkWrapper}>
      <div className={styles.card}>
        <div className={styles.photoWrapper}>
          <img src={photo} alt={handle} className={styles.photo} />
          <button className={styles.heartBtn} onClick={toggleFav}>
            <img
              src={isFav ? heartFilled : heartEmpty}
              alt={isFav ? 'Favorito' : 'No favorito'}
            />
          </button>
          <span className={styles.ugcBadge}>UGC</span>
        </div>

        <h4 className={styles.handle}>@{handle}</h4>
        <p className={styles.location}>{location}</p>
        <div className={styles.ratingRow}>{stars}</div>
        <p className={styles.description}>{description}</p>

        <hr className={styles.divider} />

        {/* Tipos de contenido */}
        <div className={styles.contentTypesRow}>
          {contentTypes.map((type, i) => (
            <span key={i} className={styles.contentType}>{type}</span>
          ))}
        </div>

        {/* Precio y proyectos */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Precio por pieza</span>
            <span className={styles.metaValue}>{priceRange}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Proyectos</span>
            <span className={styles.metaValue}>{completedProjects}</span>
          </div>
        </div>

        {/* Tags de especialidad */}
        <div className={styles.tagsRow}>
          {specialties.map((s, i) => (
            <span key={i} className={styles.tag}>{s}</span>
          ))}
        </div>

        <button className={styles.portfolioBtn}>Ver portfolio</button>
        <button className={styles.contactBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onContact && onContact(); }}>Contactar</button>
      </div>
    </Link>
  )
}
