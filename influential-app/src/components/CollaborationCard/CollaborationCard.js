import React from 'react';
import styles from './CollaborationCard.module.css';

/**
 * Componente para cada tarjeta de colaboración (imagen + caption)
 * Guarda este archivo en: src/components/CollaborationCard/CollaborationCard.js
 */
export default function CollaborationCard({ image, caption }) {
  return (
    <div className={styles.card}>
      <img src={image} alt={caption} className={styles.image} />
      <div className={styles.caption}>{caption}</div>
    </div>
  );
}