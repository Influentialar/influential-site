// src/pages/Brands/BrandDetailPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileById } from '../../lib/useProfile';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';
import { useReviews } from '../../lib/useReviews';
import { useCollaborations } from '../../lib/useCollaborations';
import { ReactComponent as ArrowLeft } from '../../assets/flecha.svg';
import { ReactComponent as HeartIcon } from '../../assets/icon-heart.svg';
import styles from './BrandDetailPage.module.css';
import SkeletonDetailPage from '../../components/Skeleton/SkeletonDetailPage';
import defaultLogo from '../../assets/brand-volvo.svg';

const TABS = ['Colaboraciones', 'Reseñas'];

export default function BrandDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getOrCreateConversation } = useMessages(session?.user?.id);
  const { profile: brand, loading } = useProfileById(id);
  const { reviews, avgRating, count: reviewCount } = useReviews(id);
  const { collaborations } = useCollaborations(id);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const handleContact = async () => {
    if (!session?.user?.id) return;
    const convId = await getOrCreateConversation(id);
    if (convId) navigate(`/messages/${convId}`);
  };

  if (loading) return <SkeletonDetailPage />;
  if (!brand) return <p className={styles.notFound}>Marca no encontrada</p>;

  const logo = brand.photo || defaultLogo;
  const completedCollabs = collaborations.filter(c => c.status === 'completed');

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.banner}>
        <div className={styles.searchBar}>
          <div className={styles.backSearchWrapper}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <ArrowLeft />
            </button>
            <input type="text" className={styles.searchInput} placeholder="Buscar marcas..." />
          </div>
        </div>
        <nav className={`${styles.tabNav} ${styles.tabNavDesktop}`}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? styles.tabActive : styles.tab}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.pageContainer}>
          <aside className={styles.leftPanel}>
            <div className={styles.logoFrame}>
              <img src={logo} alt={brand.name} className={styles.logoImg} />
              <button className={styles.favBtn}>
                <HeartIcon />
              </button>
            </div>
            <div className={styles.profileDetails}>
              <h2 className={styles.handle}>@{brand.handle || brand.name?.toLowerCase()}</h2>
              <p className={styles.loc}>📍 {brand.location}</p>
              <p className={styles.bio}>{brand.description}</p>
              {reviewCount > 0 && (
                <p style={{color:'#f59e0b',fontWeight:600,fontSize:'0.95rem'}}>
                  {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))} ({reviewCount})
                </p>
              )}
              <button className={styles.contactBtn} onClick={handleContact}>
                Contactar
              </button>
            </div>
          </aside>

          <nav className={`${styles.tabNav} ${styles.tabNavMobile}`}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? styles.tabActive : styles.tab}
              >
                {tab}
              </button>
            ))}
          </nav>

          <section className={styles.rightPanel}>
            <div className={styles.tabContent}>
              {/* --- COLABORACIONES --- */}
              {activeTab === 'Colaboraciones' && (
                <>
                  {completedCollabs.length === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Sin colaboraciones aún</p>
                      <p style={{fontSize:'0.9rem'}}>Las colaboraciones completadas con influencers y creadores aparecerán acá.</p>
                    </div>
                  ) : (
                    <div className={styles.collabGrid}>
                      {completedCollabs.map((c) => (
                        <div key={c.id} className={styles.collabCard}>
                          <img src={c.talent?.photo_url || ''} alt={c.talent?.name} className={styles.collabImg} />
                          <div className={styles.collabCaption}>
                            <strong>{c.talent?.name}</strong> — @{c.talent?.handle}
                            <br/>
                            <small>{c.type}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* --- RESEÑAS --- */}
              {activeTab === 'Reseñas' && (
                <>
                  {reviewCount === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Sin reseñas aún</p>
                      <p style={{fontSize:'0.9rem'}}>Los influencers y creadores que trabajen con esta marca podrán dejar su reseña.</p>
                    </div>
                  ) : (
                    <div className={styles.testimonialsGrid}>
                      {reviews.map((r) => (
                        <div key={r.id} className={styles.testimonialCard}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                            {r.reviewer?.photo_url && (
                              <img src={r.reviewer.photo_url} alt="" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}} />
                            )}
                            <div>
                              <strong>{r.reviewer?.name || 'Usuario'}</strong>
                              <br/>
                              <small style={{color:'#999'}}>@{r.reviewer?.handle || ''}</small>
                            </div>
                            <span style={{marginLeft:'auto',color:'#f59e0b'}}>
                              {Array.from({length: 5}, (_, i) => i < r.rating ? '★' : '☆').join('')}
                            </span>
                          </div>
                          <p className={styles.testimonialText}>{r.comment || 'Sin comentario'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
