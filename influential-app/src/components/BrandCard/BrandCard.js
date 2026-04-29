import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BrandCard.module.css';

import heartEmpty from '../../assets/icon-heart.svg';
import heartFilled from '../../assets/purple.svg'; // tu SVG violeta
import { ReactComponent as InstaIcon } from '../../assets/instagram.svg';
import { ReactComponent as TikTokIcon } from '../../assets/tiktok.svg';

export default function BrandCard({
  id,
  logo,
  name,
  handle,
  location,
  description,
  instagram,
  tiktok,
  categories = [],
  onContact,
}) {
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);

  const toggleFav = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(f => !f);
  };

  const goDetail = () => navigate(`/brands/${id}`);

  return (
    <div onClick={goDetail} className={styles.linkWrapper}>
      <div className={styles.card}>
        {/* LOGO */}
        <div className={styles.logoWrapper}>
          <img src={logo} alt={handle} className={styles.logoImg} />
          <button className={styles.heartBtn} onClick={toggleFav}>
            <img
              src={isFav ? heartFilled : heartEmpty}
              alt={isFav ? 'Favorito' : 'No favorito'}
            />
          </button>
        </div>

        {/* TEXTO */}
        {name && <h3 className={styles.name}>{name}</h3>}
        <h4 className={styles.handle}>@{handle.replace(/^@/, '').toLowerCase()}</h4>
        {location && <p className={styles.location}>📍 {location}</p>}
        {description && <p className={styles.description}>{description}</p>}
        <hr className={styles.divider} />

        {/* STATS */}
        <div className={styles.statsRow}>
          <div className={styles.statsItem}>
            <InstaIcon className={styles.statsIcon} />
            <span>{instagram}</span>
          </div>
          <div className={styles.statsItem}>
            <TikTokIcon className={styles.statsIcon} />
            <span>{tiktok}</span>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className={styles.tagsRow}>
          {categories.map((cat, i) => (
            <span key={i} className={styles.tag}>
              {cat}
            </span>
          ))}
        </div>

        {/* BUTTON */}
        <button
          className={styles.applyBtn}
          onClick={e => {
            e.stopPropagation();
            onContact ? onContact() : navigate('/messages');
          }}
        >
          Contactar
        </button>
      </div>
    </div>
  );
}
