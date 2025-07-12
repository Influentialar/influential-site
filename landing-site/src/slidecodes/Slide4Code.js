import React from "react"
import styles from '../LandingPage.module.css'
import slide4code from '../slide4code.png'

export default function Slide4Code() {
    return (
        <section className={styles.slidecodeSection}>
            <div className={styles.slidecode}>
              <div>
                <h4 className={styles.introSlide}>Para Influencers</h4>
                <h2 className={styles.formTitle}>Sin caos, sin mails</h2>
                <p className={styles.slideText}>Organizá tus campañas, propuestas y pagos en un solo lugar. 
                  Influential te simplifica el trabajo sin sacarte el mando..</p>
              </div>
              <img
                src={slide4code}
                alt="Slide para marcas"
                className={styles.slideImage}
              />
            </div>
        </section>
    );
}