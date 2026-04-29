// src/components/Skeleton/SkeletonCard.js
import React from 'react';
import s from './Skeleton.module.css';

export default function SkeletonCard() {
  return (
    <div className={s.card}>
      <div className={s.photoArea}>
        <div className={`${s.photoFill} ${s.shimmer}`} />
      </div>
      <div className={s.body}>
        <div className={`${s.line} ${s.lineMedium} ${s.shimmer}`} />
        <div className={`${s.line} ${s.lineShort} ${s.shimmer}`} />
        <div className={s.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${s.star} ${s.shimmer}`} />
          ))}
        </div>
        <div className={`${s.line} ${s.lineLong} ${s.shimmer}`} />
        <div className={`${s.line} ${s.lineFull} ${s.shimmer}`} />
        <div className={`${s.line} ${s.lineMedium} ${s.shimmer}`} />
        <div className={s.socialRow}>
          <div className={s.socialItem}>
            <div className={`${s.icon} ${s.shimmer}`} />
            <div className={`${s.line} ${s.shimmer}`} style={{ width: 60 }} />
          </div>
          <div className={s.socialItem}>
            <div className={`${s.icon} ${s.shimmer}`} />
            <div className={`${s.line} ${s.shimmer}`} style={{ width: 60 }} />
          </div>
        </div>
        <div className={`${s.btn} ${s.shimmer}`} />
      </div>
    </div>
  );
}
