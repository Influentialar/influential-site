import React from "react"
import styles from '../LandingPage.module.css'
import slide2code from '../slide2code.png'

export default function Slide2Code() {
    return (
        <section className={styles.slidecodeSection}>
            <div className={styles.slidecode}>
              <div>
                <h4 className={styles.introSlide}>Para Marcas</h4>
                <h2 className={styles.formTitle}>Campañas con impacto real, no likes vacíos</h2>
                <p className={styles.slideText}>Influential conecta tu marca con micro y 
                  macro influencers alineados a tus valores. Segmentación precisa, resultados visibles.</p>
              </div>
              <img
                src={slide2code}
                alt="Slide para marcas"
                className={styles.slideImage}
              />
            </div>
        </section>
    );
}