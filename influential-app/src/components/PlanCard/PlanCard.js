import React from 'react';
import styles from './PlanCard.module.css';

export default function PlanCard({
  title,
  subtitle,
  price,
  recommended = false,
  features = []
}) {
  return (
    <div
      className={`${styles.card} ${recommended ? styles.recommended : ''}`}
    >
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.priceBadge}>${price}/mes</div>
      </div>

      <hr className={styles.divider} />

      <ul className={styles.featuresList}>
        {features.map((feat, i) => (
          <li key={i} className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            {feat}
          </li>
        ))}
      </ul>

      <button className={styles.button}>
        {recommended ? 'Comenzar Pro' : 'Seleccionar'}
      </button>
    </div>
  );
}
