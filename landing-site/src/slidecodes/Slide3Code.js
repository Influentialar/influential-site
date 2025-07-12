import React from "react"
import styles from '../LandingPage.module.css'
import slide3code from '../slide3code.png'

export default function Slide3Code(){
    return (
        <section className={styles.slidecodeSection}>
            <div className={styles.slidecode}>
              <div>
                <h4 className={styles.introSlide}>Para Influencers</h4>
                <h2 className={styles.formTitle}>Tu comunidad vale más de lo que pensás</h2>
                <p className={styles.slideText}>Monetizá tu audiencia colaborando con marcas que te representan.
                   Sin intermediarios, sin comisiones escondidas.</p>
              </div>
              <img
                src={slide3code}
                alt="Slide para marcas"
                className={styles.slideImage}
              />
            </div>
        </section>
    );
}