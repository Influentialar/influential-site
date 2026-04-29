// src/components/SidebarBrands/SidebarBrands.js
import React from 'react'
import styles from './SidebarBrands.module.css'
import { ReactComponent as SearchIcon } from '../../assets/icon-search.svg'
import { ReactComponent as FilterIcon } from '../../assets/icon-filter.svg'

export default function SidebarBrands({
  searchTerm = '',
  onSearchChange,
  selectedCategories,
  onCategoryChange,
}) {
  const allTypes = [
    'Autos',
    'Belleza',
    'De lujo',
    'Tecnología',
    'Salud',
    'Gastronomía',
    '+ (Buscar)',
  ];

  return (
    <aside className={styles.sidebar}>

      {/* — Grupo: búsqueda — */}
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar marcas..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      {/* — Grupo: título + icono filtro — */}
      <div className={styles.titleBar}>
        <h3 className={styles.title}>Filtros</h3>
        <FilterIcon className={styles.filterIcon} />
      </div>

      {/* — Grupo: Tipo de marca — */}
      <div className={styles.group}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Tipo de marca</h4>
          <button
            className={styles.resetBtn}
            onClick={() => onCategoryChange(null)}
          >
            Resetear
          </button>
        </div>
        <div className={styles.checkboxGroupVertical}>
          {allTypes.map(label => (
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

      {/* — Grupo: Venta de — */}
      <div className={styles.group}>
        <h4 className={styles.sectionTitle}>Venta de</h4>
        <div className={styles.checkboxGroupHorizontal}>
          {['Producto', 'Servicio'].map(label => (
            <label key={label} className={styles.checkboxLabel}>
              <input type="checkbox" /> {label}
            </label>
          ))}
        </div>
      </div>

      {/* — Grupo: Tamaño — */}
      <div className={styles.group}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Tamaño</h4>
          <button className={styles.resetBtn} onClick={() => {/* opcional limpiar rangos */}}>
            Resetear
          </button>
        </div>
        <div className={styles.checkboxGroupVertical}>
          {[
            'Micro-empresa',
            'Empresa pequeña',
            'Empresa mediana',
            'Empresa grande',
            'Internacional'
          ].map(label => (
            <label key={label} className={styles.checkboxLabel}>
              <input type="checkbox" /> {label}
            </label>
          ))}
        </div>
      </div>

      {/* — Grupo: Permitir recomendaciones — */}
      <div className={styles.group}>
        <h4 className={styles.sectionTitle}>Permitir recomendaciones</h4>
        <div className={styles.checkboxGroupHorizontal}>
          {['Sí', 'No'].map(label => (
            <label key={label} className={styles.checkboxLabel}>
              <input type="checkbox" /> {label}
            </label>
          ))}
        </div>
      </div>

    </aside>
  )
}
