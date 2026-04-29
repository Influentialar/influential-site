// src/pages/Creators/CreatorsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCreators from '../../components/SidebarCreators/SidebarCreators';
import CreatorCard from '../../components/CreatorCard/CreatorCard';
import styles from './CreatorsPage.module.css';
import { useCreators } from '../../lib/useCreators';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

export default function CreatorsPage() {
  const { creators, loading } = useCreators();
  const { session } = useAuth();
  const { getOrCreateConversation } = useMessages(session?.user?.id);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [deliveryRange, setDeliveryRange] = useState([1, 14]);
  const [minRating, setMinRating] = useState(0);
  const [minProjects, setMinProjects] = useState(0);

  const handleSpecialtyChange = (label) => {
    if (label === null) setSelectedSpecialties([]);
    else setSelectedSpecialties(prev => prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]);
  };

  const handleContact = async (creatorId) => {
    if (!session?.user?.id) return;
    const convId = await getOrCreateConversation(creatorId);
    if (convId) navigate(`/messages/${convId}`);
  };

  const filteredData = creators.filter(item => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = (item.name || '').toLowerCase().includes(q) ||
        (item.handle || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.specialties || []).some(s => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedSpecialties.length > 0) {
      if (!(item.specialties || []).some(s => selectedSpecialties.includes(s))) return false;
    }
    if (item.priceMax < priceRange[0] || item.priceMin > priceRange[1]) return false;
    if (item.deliveryMax < deliveryRange[0] || item.deliveryMin > deliveryRange[1]) return false;
    if (item.rating < minRating) return false;
    if (item.completedProjects < minProjects) return false;
    return true;
  });

  return (
    <div className={styles.main}>
      <SidebarCreators
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSpecialties={selectedSpecialties}
        onSpecialtyChange={handleSpecialtyChange}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        deliveryRange={deliveryRange}
        onDeliveryChange={setDeliveryRange}
        minRating={minRating}
        onRatingChange={setMinRating}
        minProjects={minProjects}
        onProjectsChange={setMinProjects}
      />
      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredData.length === 0 ? (
          <p className={styles.noResults}>
            {searchTerm || selectedSpecialties.length > 0 ? 'No se encontraron resultados con esos filtros.' : 'Todavía no hay creadores registrados. ¡Sé el primero!'}
          </p>
        ) : (
          filteredData.map(item => (
            <CreatorCard key={item.id} {...item} onContact={() => handleContact(item.id)} />
          ))
        )}
      </div>
    </div>
  );
}
