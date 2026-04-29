// src/pages/Brands/BrandsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarBrands from '../../components/SidebarBrands/SidebarBrands';
import BrandCard from '../../components/BrandCard/BrandCard';
import styles from './BrandsPage.module.css';
import { useBrands } from '../../lib/useBrands';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

import defaultLogo from '../../assets/brand-volvo.svg';

export default function BrandsPage() {
  const { brands, loading } = useBrands();
  const { session } = useAuth();
  const { getOrCreateConversation } = useMessages(session?.user?.id);
  const navigate = useNavigate();
  const rawBrands = brands.map(b => ({ ...b, logo: b.logo || defaultLogo }));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleTypeChange = (type) => {
    if (type === null) setSelectedTypes([]);
    else setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleContact = async (brandId) => {
    if (!session?.user?.id) return;
    const convId = await getOrCreateConversation(brandId);
    if (convId) navigate(`/messages/${convId}`);
  };

  const filteredBrands = rawBrands.filter(brand => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = (brand.name || '').toLowerCase().includes(q) ||
        (brand.handle || '').toLowerCase().includes(q) ||
        (brand.description || '').toLowerCase().includes(q) ||
        (brand.location || '').toLowerCase().includes(q) ||
        (brand.categories || []).some(c => c.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedTypes.length > 0) {
      return (brand.categories || []).some(cat => selectedTypes.includes(cat));
    }
    return true;
  });

  return (
    <div className={styles.main}>
      <SidebarBrands
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategories={selectedTypes}
        onCategoryChange={handleTypeChange}
      />
      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredBrands.length === 0 ? (
          <p className={styles.noResults}>
            {searchTerm || selectedTypes.length > 0 ? 'No se encontraron resultados con esos filtros.' : 'Todavía no hay marcas registradas. ¡Sé la primera!'}
          </p>
        ) : (
          filteredBrands.map(b => (
            <BrandCard key={b.id} {...b} onContact={() => handleContact(b.id)} />
          ))
        )}
      </div>
    </div>
  );
}
