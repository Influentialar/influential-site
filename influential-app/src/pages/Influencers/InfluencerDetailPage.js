// src/pages/Influencers/InfluencerDetailPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';
import { ReactComponent as InstaIcon } from '../../assets/ig-white.svg';
import { ReactComponent as TikTokIcon } from '../../assets/tk-white.svg';
import { ReactComponent as ArrowLeft } from '../../assets/icon-arrow-left.svg';
import { ReactComponent as CommunicationIcon } from '../../assets/icon-chat.svg';
import { ReactComponent as ClockIcon } from '../../assets/icon-clock.svg';
import { ReactComponent as HandshakeIcon } from '../../assets/icon-handshake.svg';
import { ReactComponent as PlaneIcon } from '../../assets/icon-plane.svg';
import { useProfileById } from '../../lib/useProfile';
import { useReviews } from '../../lib/useReviews';
import { useCollaborations } from '../../lib/useCollaborations';
import { useGallery } from '../../lib/useGallery';
import { useSocialStats } from '../../lib/useSocialStats';
import styles from './InfluencerDetailPage.module.css';
import SkeletonDetailPage from '../../components/Skeleton/SkeletonDetailPage';

const tabs = ['Calificaciones', 'Colaboraciones', 'Galería', 'Estadísticas'];

const bannerOptions = [
  'linear-gradient(135deg, #ffaa4f 0%, #efb679 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
];

export default function InfluencerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getOrCreateConversation } = useMessages(session?.user?.id);
  const { profile: user, loading } = useProfileById(id);
  const { reviews, avgRating, avgCommunication, avgPunctuality, avgCommitment, avgInitiative, distribution, count: reviewCount } = useReviews(id);
  const { collaborations } = useCollaborations(id);
  const { items: galleryItems } = useGallery(id);
  const { stats: socialStats } = useSocialStats(id);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleContact = async () => {
    if (!session?.user?.id) return;
    const convId = await getOrCreateConversation(id);
    if (convId) navigate(`/messages/${convId}`);
  };

  if (loading) return <SkeletonDetailPage />;
  if (!user) return <p style={{textAlign:'center',marginTop:'3rem'}}>Influencer no encontrado</p>;

  const { photo, handle, location, description, instagram, tiktok } = user;
  const displayRating = reviewCount > 0 ? avgRating : user.rating || 0;

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(displayRating) ? styles.starFilled : styles.starEmpty}>★</span>
  ));

  const igStats = socialStats.instagram;
  const tkStats = socialStats.tiktok;

  const metrics = [
    { label: 'Comunicación', value: avgCommunication, Icon: CommunicationIcon },
    { label: 'Puntualidad',   value: avgPunctuality, Icon: ClockIcon },
    { label: 'Compromiso',    value: avgCommitment, Icon: HandshakeIcon },
    { label: 'Iniciativa',    value: avgInitiative, Icon: PlaneIcon }
  ];

  const visibleCollabs = collaborations.filter(c => c.status !== 'cancelled');

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.banner} style={{ background: bannerOptions[user.bannerIdx || 0] }}>
        <div className={styles.searchBar}>
          <div className={styles.backSearchWrapper}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <ArrowLeft />
            </button>
            <input type="text" placeholder="Buscar influencers..." className={styles.searchInput} />
          </div>
        </div>
        <nav className={`${styles.tabNav} ${styles.tabNavDesktop}`}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={tab === activeTab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.pageContainer}>
          <aside className={styles.leftPanel}>
            <div className={styles.photoFrame}>
              <img src={photo} alt={handle} />
            </div>
            <div className={styles.profileDetails}>
              <div className={styles.stars}>{stars}</div>
              {reviewCount > 0 && <small style={{color:'#999',fontSize:'0.8rem'}}>({reviewCount} reseñas)</small>}
              <h2 className={styles.username}>@{handle}</h2>
              <p className={styles.userLocation}>📍 {location}</p>
              <p className={styles.bio}>{description}</p>
              <div className={styles.socialMetrics}>
                <InstaIcon /><span>{instagram}</span>
                <TikTokIcon /><span>{tiktok}</span>
              </div>
              <button className={styles.contactButton} onClick={handleContact}>
                Contactar
              </button>
            </div>
          </aside>

          <nav className={`${styles.tabNav} ${styles.tabNavMobile}`}>
            {tabs.map(tab => (
              <button
                key={tab}
                className={tab === activeTab ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <section className={styles.rightPanel}>
            <div className={styles.tabContent}>
              {/* --- CALIFICACIONES --- */}
              {activeTab === 'Calificaciones' && (
                <>
                  {reviewCount === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Sin calificaciones aún</p>
                      <p style={{fontSize:'0.9rem'}}>Las marcas que trabajen con este influencer podrán dejar su reseña.</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.ratingsRow}>
                        <div className={styles.chartBlock}>
                          <div className={styles.metricTitle}>Calificación general</div>
                          <div className={styles.metricChart}>
                            {distribution.map(d => (
                              <div key={d.stars} className={styles.metricLine}>
                                <span className={styles.lineNumber}>{d.stars}</span>
                                <div className={styles.lineBar} style={{width: `${d.pct}%`}} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {metrics.map(({ label, value, Icon }) => (
                          <React.Fragment key={label}>
                            <div className={styles.metricDivider} />
                            <div className={styles.metricBlock}>
                              <div className={styles.metricTitle}>{label}</div>
                              <div className={styles.metricValue}>{value}</div>
                              <Icon className={styles.metricIcon} />
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      <hr className={styles.sectionDivider} />
                      <div className={styles.collabGrid}>
                        {reviews.map((r) => (
                          <div key={r.id} className={styles.collabCard}>
                            <img src={r.reviewer?.photo_url || ''} alt={r.reviewer?.name} className={styles.collabLogo} />
                            <div className={styles.collabInfo}>
                              <strong>{r.reviewer?.name || 'Usuario'}</strong>
                              <small>@{r.reviewer?.handle || ''}</small>
                              <div className={styles.collabRating}>
                                {Array.from({length: 5}, (_, i) => (
                                  <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                            </div>
                            <p className={styles.collabText}>{r.comment || 'Sin comentario'}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* --- COLABORACIONES --- */}
              {activeTab === 'Colaboraciones' && (
                <>
                  {visibleCollabs.length === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Sin colaboraciones aún</p>
                      <p style={{fontSize:'0.9rem'}}>Las colaboraciones dentro de la app aparecerán acá.</p>
                    </div>
                  ) : (
                    <div className={styles.collabGrid}>
                      {visibleCollabs.map((c) => {
                        const brandHandle = (c.brand?.handle || '').replace(/^@/, '')
                        const statusLabel = { pending: '⏳ Pendiente', active: '🔄 En curso', completed: '✅ Completada' }[c.status] || c.status
                        return (
                          <div key={c.id} className={styles.collabCard}>
                            {c.campaign_image && (
                              <img src={c.campaign_image} alt="Campaña" className={styles.collabCampaignImg} />
                            )}
                            <div className={styles.collabHeader}>
                              <img src={c.brand?.photo_url || ''} alt={c.brand?.name} className={styles.collabLogo} />
                              <div className={styles.collabInfo}>
                                <strong>{c.brand?.name}</strong>
                                <small>@{brandHandle}</small>
                              </div>
                            </div>
                            <div className={styles.collabMeta}>
                              <span className={styles.collabType}>{c.type}</span>
                              <span className={styles.collabStatus}>{statusLabel}</span>
                            </div>
                            {c.campaign_caption && (
                              <p className={styles.collabText}>{c.campaign_caption}</p>
                            )}
                            {!c.campaign_caption && c.description && (
                              <p className={styles.collabText}>{c.description}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* --- GALERÍA --- */}
              {activeTab === 'Galería' && (
                <>
                  {galleryItems.length === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Galería vacía</p>
                      <p style={{fontSize:'0.9rem'}}>Este influencer aún no agregó fotos o videos a su portfolio.</p>
                    </div>
                  ) : (
                    <div className={styles.galleryGrid}>
                      {galleryItems.map((item) => (
                        <div key={item.id} className={styles.galleryCard}>
                          {item.media_type === 'video' ? (
                            <video src={item.media_url} className={styles.galleryImg} controls />
                          ) : (
                            <img src={item.media_url} alt={item.caption || 'Galería'} className={styles.galleryImg} />
                          )}
                          {item.caption && <p style={{fontSize:'0.85rem',color:'#666',marginTop:'0.5rem'}}>{item.caption}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* --- ESTADÍSTICAS (from Instagram/TikTok API) --- */}
              {activeTab === 'Estadísticas' && (
                <div className={styles.statsContainer}>
                  {!igStats && !tkStats ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Sin estadísticas disponibles</p>
                      <p style={{fontSize:'0.9rem'}}>Este influencer aún no conectó sus redes sociales.</p>
                    </div>
                  ) : (
                    <>
                      {igStats && (
                        <div className={styles.platformSection}>
                          <div className={styles.platformHeader}>
                            <InstaIcon className={styles.platformLogo} />
                            <div>
                              <h3 className={styles.platformName}>Instagram</h3>
                              <span className={styles.platformUser}>@{igStats.username}</span>
                            </div>
                          </div>
                          <div className={styles.statsCards}>
                            <div className={styles.statCardPrimary}>
                              <span className={styles.statNumber}>{(igStats.followers_count || 0).toLocaleString()}</span>
                              <span className={styles.statLabel}>Seguidores</span>
                            </div>
                            <div className={styles.statCardPrimary}>
                              <span className={styles.statNumber}>{igStats.engagement_rate && igStats.engagement_rate !== '0.00' ? `${igStats.engagement_rate}%` : '–'}</span>
                              <span className={styles.statLabel}>Engagement</span>
                            </div>
                            <div className={styles.statCardSecondary}>
                              <span className={styles.statNumber}>{(igStats.avg_likes || 0).toLocaleString()}</span>
                              <span className={styles.statLabel}>Avg Likes</span>
                            </div>
                            <div className={styles.statCardSecondary}>
                              <span className={styles.statNumber}>{(igStats.avg_comments || 0).toLocaleString()}</span>
                              <span className={styles.statLabel}>Avg Comentarios</span>
                            </div>
                            <div className={styles.statCardSecondary}>
                              <span className={styles.statNumber}>{(igStats.media_count || 0).toLocaleString()}</span>
                              <span className={styles.statLabel}>Publicaciones</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {tkStats && (
                        <div className={styles.platformSection}>
                          <div className={styles.platformHeader}>
                            <TikTokIcon className={styles.platformLogo} />
                            <div>
                              <h3 className={styles.platformName}>TikTok</h3>
                              <span className={styles.platformUser}>@{tkStats.username}</span>
                            </div>
                          </div>
                          <div className={styles.statsCards}>
                            <div className={styles.statCardPrimary}>
                              <span className={styles.statNumber}>{(tkStats.followers_count || 0).toLocaleString()}</span>
                              <span className={styles.statLabel}>Seguidores</span>
                            </div>
                            <div className={styles.statCardPrimary}>
                              <span className={styles.statNumber}>{tkStats.engagement_rate ? `${tkStats.engagement_rate}%` : '–'}</span>
                              <span className={styles.statLabel}>Engagement</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
