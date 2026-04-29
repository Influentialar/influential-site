// src/pages/Influencers/InfluencersPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import InfluencerCard from '../../components/InfluencerCard/InfluencerCard';
import styles from './InfluencersPage.module.css';
import { useInfluencers } from '../../lib/useInfluencers';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';
import SkeletonCard from '../../components/Skeleton/SkeletonCard';

export default function InfluencersPage() {
  const { influencers, loading } = useInfluencers();
  const { session } = useAuth();
  const { getOrCreateConversation } = useMessages(session?.user?.id);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [followersRange, setFollowersRange] = useState([0, 100000]);
  const [engagement, setEngagement] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const handleCategoryChange = (label) => {
    if (label === null) setSelectedCategories([]);
    else setSelectedCategories(prev => prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]);
  };

  const handleContact = async (influencerId) => {
    if (!session?.user?.id) return;
    const convId = await getOrCreateConversation(influencerId);
    if (convId) navigate(`/messages/${convId}`);
  };

  const filteredData = influencers.filter(item => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = (item.name || '').toLowerCase().includes(q) ||
        (item.handle || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.categories || []).some(c => c.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedCategories.length > 0) {
      const cats = item.categories || [];
      if (!cats.some(cat => selectedCategories.includes(cat))) return false;
    }
    if (item.followersNum < followersRange[0] || item.followersNum > followersRange[1]) return false;
    if (item.engagementNum < engagement) return false;
    if (item.rating < minRating) return false;
    return true;
  });

  return (
    <div className={styles.main}>
      <Sidebar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        followersRange={followersRange}
        onFollowersChange={setFollowersRange}
        engagement={engagement}
        onEngagementChange={setEngagement}
        minRating={minRating}
        onRatingChange={setMinRating}
      />
      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredData.length === 0 ? (
          <p className={styles.noResults}>
            {searchTerm || selectedCategories.length > 0 ? 'No se encontraron resultados con esos filtros.' : 'Todavía no hay influencers registrados. ¡Sé el primero!'}
          </p>
        ) : (
          filteredData.map(item => (
            <InfluencerCard key={item.id} {...item} onContact={() => handleContact(item.id)} />
          ))
        )}
      </div>
    </div>
  );
}
