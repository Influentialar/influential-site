// src/pages/Creators/CreatorDetailPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useMessages } from '../../lib/useMessages';
import { ReactComponent as ArrowLeft } from '../../assets/icon-arrow-left.svg';
import { ReactComponent as CommunicationIcon } from '../../assets/icon-chat.svg';
import { ReactComponent as ClockIcon } from '../../assets/icon-clock.svg';
import { ReactComponent as HandshakeIcon } from '../../assets/icon-handshake.svg';
import { ReactComponent as PlaneIcon } from '../../assets/icon-plane.svg';
import { useProfileById } from '../../lib/useProfile';
import { useReviews } from '../../lib/useReviews';
import { useCollaborations } from '../../lib/useCollaborations';
import { useGallery } from '../../lib/useGallery';
import styles from './CreatorDetailPage.module.css';
import SkeletonDetailPage from '../../components/Skeleton/SkeletonDetailPage';

const tabs = ['Portfolio', 'Calificaciones', 'Servicios', 'Estadísticas'];

const bannerGradient = 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #c4b5fd 100%)';

export default function CreatorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { getOrCreateConversation } = useMessages(session?.user?.id);
  const { profile: user, loading } = useProfileById(id);
  const { reviews, avgRating, avgCommunication, avgPunctuality, avgQuality, avgCreativity, distribution, count: reviewCount } = useReviews(id);
  const { collaborations, completedCount } = useCollaborations(id);
  const { items: galleryItems } = useGallery(id);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleContact = async () => {
    if (!session?.user?.id) return;
    const convId = await getOrCreateConversation(id);
    if (convId) navigate(`/messages/${convId}`);
  };

  if (loading) return <SkeletonDetailPage />;
  if (!user) return <p style={{textAlign:'center',marginTop:'3rem'}}>Creador no encontrado</p>;

  const {
    photo = '',
    handle = '',
    name = '',
    location = '',
    rating = 0,
    description = '',
    categories: specialties = [],
    priceMin = 0,
    priceMax = 0,
    deliveryMin = 1,
    deliveryMax = 7,
  } = user;

  const displayRating = reviewCount > 0 ? avgRating : rating;
  const priceRange = priceMin && priceMax ? `$${priceMin.toLocaleString()} – $${priceMax.toLocaleString()}` : 'A consultar';
  const turnaround = `${deliveryMin}-${deliveryMax} días`;

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(displayRating) ? styles.starFilled : styles.starEmpty}>★</span>
  ));

  const metrics = [
    { label: 'Comunicación', value: avgCommunication, Icon: CommunicationIcon },
    { label: 'Puntualidad', value: avgPunctuality, Icon: ClockIcon },
    { label: 'Calidad', value: avgQuality, Icon: HandshakeIcon },
    { label: 'Creatividad', value: avgCreativity, Icon: PlaneIcon },
  ];

  const completedCollabs = collaborations.filter(c => c.status === 'completed');

  // Compute content type breakdown from real collaborations
  const typeBreakdown = {};
  completedCollabs.forEach(c => {
    typeBreakdown[c.type] = (typeBreakdown[c.type] || 0) + 1;
  });
  const breakdownEntries = Object.entries(typeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      pct: completedCollabs.length > 0 ? Math.round((count / completedCollabs.length) * 100) : 0,
    }));

  // Satisfaction from reviews
  const satisfactionRate = reviewCount > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviewCount) * 100)
    : 0;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.banner} style={{ background: bannerGradient }}>
        <div className={styles.searchBar}>
          <div className={styles.backSearchWrapper}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <ArrowLeft />
            </button>
            <input type="text" placeholder="Buscar creadores UGC..." className={styles.searchInput} />
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
              <span className={styles.ugcBadge}>Creador UGC</span>
              <div className={styles.stars}>{stars}</div>
              {reviewCount > 0 && <small style={{color:'#999',fontSize:'0.8rem'}}>({reviewCount} reseñas)</small>}
              <h2 className={styles.username}>{name}</h2>
              <p className={styles.userHandle}>@{handle}</p>
              <p className={styles.userLocation}>📍 {location}</p>
              <p className={styles.bio}>{description}</p>

              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>{completedCount}</span>
                  <span className={styles.quickStatLabel}>Proyectos</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickStatValue}>{turnaround}</span>
                  <span className={styles.quickStatLabel}>Entrega</span>
                </div>
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
              {/* --- PORTFOLIO --- */}
              {activeTab === 'Portfolio' && (
                <>
                  {galleryItems.length === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Portfolio vacío</p>
                      <p style={{fontSize:'0.9rem'}}>Este creador aún no subió trabajos a su portfolio.</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.portfolioHeader}>
                        <h3>Trabajos realizados</h3>
                      </div>
                      <div className={styles.portfolioGrid}>
                        {galleryItems.map((item) => (
                          <div key={item.id} className={styles.portfolioCard}>
                            {item.media_type === 'video' ? (
                              <video src={item.media_url} className={styles.portfolioImg} controls />
                            ) : (
                              <img src={item.media_url} alt={item.caption || 'Portfolio'} className={styles.portfolioImg} />
                            )}
                            {item.caption && (
                              <div className={styles.portfolioOverlay}>
                                <span className={styles.portfolioBrand}>{item.caption}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* --- CALIFICACIONES --- */}
              {activeTab === 'Calificaciones' && (
                <>
                  {reviewCount === 0 ? (
                    <div style={{textAlign:'center',padding:'3rem',color:'#999'}}>
                      <p style={{fontSize:'1.2rem',marginBottom:'0.5rem'}}>Sin calificaciones aún</p>
                      <p style={{fontSize:'0.9rem'}}>Las marcas que trabajen con este creador podrán dejar su reseña.</p>
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

              {/* --- SERVICIOS --- */}
              {activeTab === 'Servicios' && (
                <div className={styles.servicesContainer}>
                  <h3 className={styles.servicesTitle}>Servicios disponibles</h3>
                  <div className={styles.servicesGrid}>
                    {[
                      { type: 'Video UGC', desc: 'Video de producto estilo orgánico para redes sociales', price: priceRange, time: turnaround },
                      { type: 'Reel / TikTok', desc: 'Contenido vertical corto optimizado para Reels o TikTok', price: priceRange, time: turnaround },
                      { type: 'Foto de producto', desc: 'Sesión fotográfica estilo UGC para catálogo o redes', price: priceRange, time: turnaround },
                      { type: 'Unboxing', desc: 'Video de unboxing auténtico mostrando primera impresión', price: priceRange, time: turnaround },
                    ].map((service, i) => (
                      <div key={i} className={styles.serviceCard}>
                        <h4 className={styles.serviceType}>{service.type}</h4>
                        <p className={styles.serviceDesc}>{service.desc}</p>
                        <div className={styles.serviceMeta}>
                          <span className={styles.servicePrice}>{service.price}</span>
                          <span className={styles.serviceTime}>⏱ {service.time}</span>
                        </div>
                        <button className={styles.serviceBtn} onClick={handleContact}>Solicitar</button>
                      </div>
                    ))}
                    <div className={`${styles.serviceCard} ${styles.serviceCardCustom}`}>
                      <h4 className={styles.serviceType}>Personalizado</h4>
                      <p className={styles.serviceDesc}>
                        ¿Tenés una idea específica? Contale al creador qué necesitás y armen juntos el proyecto ideal.
                      </p>
                      <div className={styles.serviceMeta}>
                        <span className={styles.servicePrice}>A convenir</span>
                        <span className={styles.serviceTime}>⏱ A definir</span>
                      </div>
                      <button className={styles.serviceBtnCustom} onClick={handleContact}>
                        💬 Hablemos
                      </button>
                    </div>
                  </div>

                  <h3 className={styles.servicesTitle} style={{ marginTop: '2rem' }}>Especialidades</h3>
                  <div className={styles.specialtiesList}>
                    {specialties.map((s, i) => (
                      <span key={i} className={styles.specialtyChip}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* --- ESTADÍSTICAS --- */}
              {activeTab === 'Estadísticas' && (
                <div className={styles.statsContainer}>
                  <div className={styles.statsOverview}>
                    <div className={styles.statCard}>
                      <strong>{completedCount}</strong>
                      <span>Proyectos completados</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>{displayRating > 0 ? `${displayRating}/5` : '–'}</strong>
                      <span>Calificación promedio</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>{turnaround}</strong>
                      <span>Tiempo promedio de entrega</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>{reviewCount > 0 ? `${satisfactionRate}%` : '–'}</strong>
                      <span>Tasa de satisfacción</span>
                    </div>
                  </div>
                  {breakdownEntries.length > 0 && (
                    <div className={styles.statsBreakdown}>
                      <h4>Tipos de contenido más solicitados</h4>
                      <div className={styles.breakdownBars}>
                        {breakdownEntries.map((item, i) => (
                          <div key={i} className={styles.breakdownRow}>
                            <span className={styles.breakdownLabel}>{item.label}</span>
                            <div className={styles.breakdownTrack}>
                              <div className={styles.breakdownFill} style={{ width: item.pct + '%' }} />
                            </div>
                            <span className={styles.breakdownPct}>{item.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
