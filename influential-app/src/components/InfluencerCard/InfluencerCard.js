import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './InfluencerCard.module.css'

import heartEmpty from '../../assets/icon-heart.svg'
import heartFilled from '../../assets/purple.svg'
import { ReactComponent as InstaIcon } from '../../assets/instagram.svg'
import { ReactComponent as TikTokIcon } from '../../assets/tiktok.svg'

export default function InfluencerCard({
  id,
  photo,
  handle,
  location,
  rating,
  description,
  instagram,
  tiktok,
  categories = [],
  onContact,
}) {
  const [isFav, setIsFav] = useState(false)

  const toggleFav = e => {
    e.preventDefault()
    e.stopPropagation()
    setIsFav(f => !f)
  }

  // genera estrellas…
  const stars = Array(5).fill(0).map((_, i) => (
    <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
      ★
    </span>
  ))

  return (
    <Link to={`/influencers/${id}`} className={styles.linkWrapper}>
      <div className={styles.card}>
        <div className={styles.photoWrapper}>
          <img src={photo} alt={handle} className={styles.photo} />
          <button className={styles.heartBtn} onClick={toggleFav}>
            <img
              src={isFav ? heartFilled : heartEmpty}
              alt={isFav ? 'Favorito' : 'No favorito'}
            />
          </button>
        </div>

        <h4 className={styles.handle}>@{handle}</h4>
        <p className={styles.location}>{location}</p>
        <div className={styles.ratingRow}>{stars}</div>
        <p className={styles.description}>{description}</p>
        <hr className={styles.divider} />

        <div className={styles.socialRow}>
          <div className={styles.socialItem}>
            <InstaIcon className={styles.socialIcon} />
            <span>{instagram}</span>
          </div>
          <div className={styles.socialItem}>
            <TikTokIcon className={styles.socialIcon} />
            <span>{tiktok}</span>
          </div>
        </div>

        <div className={styles.tagsRow}>
          {categories.map((cat, i) => (
            <span key={i} className={styles.tag}>
              {cat}
            </span>
          ))}
        </div>

        <button className={styles.contactBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onContact && onContact(); }}>Contactar</button>
      </div>
    </Link>
  )
}
