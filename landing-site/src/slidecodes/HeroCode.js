import React from 'react';
import styles from '../LandingPage.module.css';
import fotoMujer from '../fotoMujer.jpg';

export default function HeroCode() {
    return (
        <section className={styles.heroCodeSection}>
            <div className={styles.heroTittle}>
                {/* Arcos superiores con mayor altura */}
                
                <svg className={styles.heroArcTop} viewBox="0 0 827 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 0 C150 400 677 400 827 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <svg className={styles.heroArcTop2} viewBox="0 0 608 450" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 0 C200 290 408 290 608 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                
                <svg className={styles.heroArcTop3} viewBox="0 0 433 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 0 C120 150 313 150 433 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <h1>La mejor manera de conectar tu marca con influencers</h1>
                <button className={styles.heroButton}>Encontrá tu match</button>

                {/* Arcos inferiores - sin cambios */}
                <svg className={styles.heroArcBottom1} viewBox="0 0 827 380" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 380 C150 -30 677 -30 827 380" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                
                <svg className={styles.heroArcBottom2} viewBox="0 0 608 245" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 245 C150 -20 458 -20 608 245" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                
                <svg className={styles.heroArcBottom3} viewBox="0 0 433 160" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 160 C120 -15 313 -15 433 160" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                
                <svg className={styles.heroArcBottom4} viewBox="0 0 207 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 60 C60 -20 147 -20 207 60" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </div>

            <div className={styles.influencerProfile}>
    <img src={fotoMujer} className={styles.fotoMujer} />
    
    <div className={styles.userHeader}>
        <p className={styles.userName}>@tuusuario</p>
        <div className={styles.starRating}>
            <span className={styles.star}>★</span>
            <span className={styles.star}>★</span>
            <span className={styles.star}>★</span>
            <span className={styles.star}>★</span>
            <span className={styles.star}>★</span>
        </div>
    </div>
    
    <p className={styles.userLocation}>Buenos aires, Arg</p>
    
    <p className={styles.userDescription}>Contá brevemente quién sos, qué contenido hacés y qué tipo de marcas te interesan.
    Mostrá tu estilo y lo que te hace diferente.</p>
    
    <div className={styles.profileFooter}>
        <div className={styles.socialContainers}>
            <div className={styles.instagramContainer}>
                <svg className={styles.instagramIcon} viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" 
                        fill="black" />
                </svg>
                <span className={styles.followerCount}>22K</span>
            </div>
            
            <div className={styles.tiktokContainer}>
                <svg
  className={styles.tiktokIcon}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  preserveAspectRatio="xMidYMid meet"
>
  <g>
    <path
      d="M208.2,87.9c-22.4,0-40.6-18.2-40.6-40.6V32.2h-34.1v120.7c0,15.1-12.2,27.3-27.3,27.3s-27.3-12.2-27.3-27.3
      s12.2-27.3,27.3-27.3c3.6,0,7,0.7,10.1,1.9V88.7c-3.3-0.4-6.6-0.7-10.1-0.7c-37.9,0-68.7,30.8-68.7,68.7s30.8,68.7,68.7,68.7
      s68.7-30.8,68.7-68.7v-48.2c10.4,6.3,22.7,10,35.8,10V87.9z"
      fill="#000000"
    />
  </g>
</svg>

                <span className={styles.followerCount}>22K</span>
            </div>
        </div>
        
        <div className={styles.atributos}>
            <p className={styles.atributo1}>Autos</p>
            <p className={styles.atributo2}>Lifestyle</p>
            <p className={styles.atributo3}>Deportes</p>
        </div>
    </div>
    
    <button className={styles.contactButton}>
        Contactar
    </button>
</div>
        </section>

    );
}