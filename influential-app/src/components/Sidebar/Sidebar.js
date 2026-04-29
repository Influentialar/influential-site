// src/components/Sidebar/Sidebar.js
import React from 'react'
import styles from './Sidebar.module.css'

import { ReactComponent as SearchIcon } from '../../assets/icon-search.svg'
import { ReactComponent as FilterIcon } from '../../assets/icon-filter.svg'

export default function Sidebar({
  selectedCategories,
  onCategoryChange,
  followersRange,
  onFollowersChange,
  engagement,
  onEngagementChange,
  minRating,
  onRatingChange,
  searchTerm = '',
  onSearchChange,
}) {
  const allCategories = [
    'Lifestyle',
    'Belleza',
    'Deportes',
    'Blogger',
    'Música',
    'Gamer',
    '+ (Buscar)'
  ]

  const formatFollowers = (val) => {
    if (val >= 1000) return Math.round(val / 1000) + 'k'
    return val
  }

  return (
    <aside className={styles.sidebar}>

      {/* Búsqueda */}
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nombre, handle o bio..."
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      {/* Título */}
      <div className={styles.titleBar}>
        <h3 className={styles.title}>Filtros</h3>
        <FilterIcon className={styles.filterIcon} />
      </div>

      {/* Plataforma */}
      <div className={styles.group}>
        <h4 className={styles.sectionTitle}>Plataforma</h4>
        <div className={styles.checkboxGroup}>
          <label><input type="checkbox" /> Instagram</label>
          <label><input type="checkbox" /> TikTok</label>
        </div>
      </div>

      {/* Ubicación */}
      <div className={styles.group}>
        <h4 className={styles.sectionTitle}>Ubicación</h4>
        <div className={styles.locationWrapper}>
          <input
            type="text"
            placeholder="Palermo, Buenos Aires, Argentina"
            className={styles.locationInput}
          />
          <SearchIcon className={styles.locationIcon} />
        </div>
      </div>

      {/* Tipo de cuenta */}
      <div className={styles.group}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Tipo de cuenta</h4>
          <button
            className={styles.resetBtn}
            onClick={() => onCategoryChange(null)}
          >
            Resetear
          </button>
        </div>
        <div className={styles.checkboxGroupVertical}>
          {allCategories.map(label => (
            <label key={label} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(label)}
                onChange={() => onCategoryChange(label)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Seguidores - dual range */}
      <div className={styles.group}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>Seguidores</span>
          <span className={styles.rangeValue}>
            {formatFollowers(followersRange[0])}–{formatFollowers(followersRange[1])}
          </span>
        </div>
        <div className={styles.rangeSub}>Cantidad</div>
        <div className={styles.dualRange}>
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={followersRange[0]}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val <= followersRange[1]) onFollowersChange([val, followersRange[1]])
            }}
            className={styles.rangeInput}
          />
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={followersRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val >= followersRange[0]) onFollowersChange([followersRange[0], val])
            }}
            className={styles.rangeInput}
          />
        </div>
      </div>

      {/* Valoraciones - estrellas clickeables */}
      <div className={styles.group}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>Valoraciones</span>
          <span className={styles.rangeValue}>{minRating}+ / 5</span>
        </div>
        <div className={styles.starsWrapper}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= minRating ? styles.starFilled : styles.starEmpty}
              onClick={() => onRatingChange(star === minRating ? 0 : star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Engagement */}
      <div className={styles.group}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>Engagement</span>
          <span className={styles.rangeValue}>{engagement}%+</span>
        </div>
        <div className={styles.rangeSub}>Porcentaje mínimo</div>
        <input
          type="range"
          min={0}
          max={15}
          step={0.5}
          value={engagement}
          onChange={(e) => onEngagementChange(Number(e.target.value))}
          className={styles.rangeInputSingle}
        />
      </div>

    </aside>
  )
}
