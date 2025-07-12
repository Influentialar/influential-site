import React from "react"
import styles from '../LandingPage.module.css'
import slide1code from '../slide1code.png'

export default function Slide1Code() {
  return (
    // Slide 1
    <section className={styles.slidecodeSection}>
      <div className={styles.slidecode}>
        <div>
          <h4 className={styles.introSlide}>Para Marcas</h4>
          <h2 className={styles.formTitle}>Aliate con creadores, sin estrés</h2>
          <p className={styles.slideText}>Creamos la infraestructura para que tu marca colabore con creadores sin perder tiempo.
            Encontrá, coordiná y medí resultados desde una sola plataforma.</p>
        </div>
        <img
          src={slide1code}
          alt="Slide para marcas"
          className={styles.slideImage}
        />
      </div>
    </section>
  );
}