// src/components/SidebarCreators/SidebarCreators.js
import React from 'react'
import styles from './SidebarCreators.module.css'

import { ReactComponent as SearchIcon } from '../../assets/icon-search.svg'
import { ReactComponent as FilterIcon } from '../../assets/icon-filter.svg'

export default function SidebarCreators({
  searchTerm = '',
  onSearchChange,
  selectedSpecialties,
  onSpecialtyChange,
  priceRange,
  onPriceChange,
  deliveryRange,
  onDeliveryChange,
  minRating,
  onRatingChange,
  minProjects,
  onProjectsChange,
}) {
  const allSpecialties = [
    'Producto',
    'Lifestyle',
    'Gastronomía',
    'Belleza',
    'Tech',
    'Deportes',
    'Moda',
    '+ (Buscar)',
  ]

  const allContentTypes = [
    'Video',
    'Foto',
    'Reel',
    'Story',
    'Unboxing',
    'Review',
  ]

  const formatPrice = (val) => {
    if (val >= 1000) return '$' + Math.round(val / 1000) + 'k'
    return '$' + val
  }

  return (
    <aside className={styles.sidebar}>
      {/* Búsqueda */}
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar creadores UGC..."
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      {/* Título */}
      <div className={styles.titleBar}>
        <h3 className={styles.title}>Filtros</h3>
        <FilterIcon className={styles.filterIcon} />
      </div>

      {/* Tipo de contenido */}
      <div className={styles.group}>
        <h4 className={styles.sectionTitle}>Tipo de contenido</h4>
        <div className={styles.checkboxGroup}>
          {allContentTypes.map(type => (
            <label key={type} className={styles.checkboxLabel}>
              <input type="checkbox" />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Especialidad */}
      <div className={styles.group}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Especialidad</h4>
          <button
            className={styles.resetBtn}
            onClick={() => onSpecialtyChange(null)}
          >
            Resetear
          </button>
        </div>
        <div className={styles.checkboxGroupVertical}>
          {allSpecialties.map(label => (
            <label key={label} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedSpecialties.includes(label)}
                onChange={() => onSpecialtyChange(label)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div className={styles.group}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>Precio por pieza</span>
          <span className={styles.rangeValue}>
            {formatPrice(priceRange[0])}–{formatPrice(priceRange[1])}
          </span>
        </div>
        <div className={styles.rangeSub}>Rango en ARS</div>
        <div className={styles.dualRange}>
          <input
            type="range"
            min={0}
            max={150000}
            step={5000}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val <= priceRange[1]) onPriceChange([val, priceRange[1]])
            }}
            className={styles.rangeInput}
          />
          <input
            type="range"
            min={0}
            max={150000}
            step={5000}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val >= priceRange[0]) onPriceChange([priceRange[0], val])
            }}
            className={styles.rangeInput}
          />
        </div>
      </div>

      {/* Tiempo de entrega */}
      <div className={styles.group}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>Tiempo de entrega</span>
          <span className={styles.rangeValue}>
            {deliveryRange[0]}–{deliveryRange[1]} días
          </span>
        </div>
        <div className={styles.rangeSub}>Días hábiles</div>
        <div className={styles.dualRange}>
          <input
            type="range"
            min={1}
            max={14}
            step={1}
            value={deliveryRange[0]}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val <= deliveryRange[1]) onDeliveryChange([val, deliveryRange[1]])
            }}
            className={styles.rangeInput}
          />
          <input
            type="range"
            min={1}
            max={14}
            step={1}
            value={deliveryRange[1]}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val >= deliveryRange[0]) onDeliveryChange([deliveryRange[0], val])
            }}
            className={styles.rangeInput}
          />
        </div>
      </div>

      {/* Valoraciones */}
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

      {/* Proyectos completados */}
      <div className={styles.group}>
        <div className={styles.rangeHeader}>
          <span className={styles.sectionTitle}>Proyectos completados</span>
          <span className={styles.rangeValue}>+{minProjects}</span>
        </div>
        <div className={styles.rangeSub}>Cantidad mínima</div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={minProjects}
          onChange={(e) => onProjectsChange(Number(e.target.value))}
          className={styles.rangeInputSingle}
        />
      </div>
    </aside>
  )
}
