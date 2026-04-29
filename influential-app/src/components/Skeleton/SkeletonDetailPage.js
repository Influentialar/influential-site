// src/components/Skeleton/SkeletonDetailPage.js
import React from 'react';
import s from './Skeleton.module.css';

export default function SkeletonDetailPage() {
  return (
    <div className={s.detailWrapper}>
      <div className={s.detailBanner} />
      <div className={s.detailContent}>
        <aside className={s.detailLeft}>
          <div className={s.detailPhoto}>
            <div className={`${s.photoFill} ${s.shimmer}`} />
          </div>
          {[80, 50, 100, 100, 60].map((w, i) => (
            <div key={i} className={`${s.line} ${s.shimmer}`} style={{ width: `${w}%` }} />
          ))}
          <div className={`${s.btn} ${s.shimmer}`} />
        </aside>

        <section className={s.detailRight}>
          <div className={s.tabsRow}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`${s.tabChip} ${s.shimmer}`} />
            ))}
          </div>
          <div className={s.blockRow}>
            {[100, 90, 75, 90, 60].map((w, i) => (
              <div key={i} className={`${s.line} ${s.shimmer}`} style={{ width: `${w}%`, height: 16 }} />
            ))}
          </div>
          <div className={s.blockRow}>
            {[85, 95, 70].map((w, i) => (
              <div key={i} className={`${s.line} ${s.shimmer}`} style={{ width: `${w}%`, height: 14 }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
