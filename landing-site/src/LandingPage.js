
// src/pages/Landing/LandingPage.js
import React, { useRef, useState, useEffect } from 'react'
import emailjs from 'emailjs-com'

import styles from './LandingPage.module.css'
import heroImage from './hero-landing.svg';
import procesoImg from './topics.svg'; // O la ruta que uses
import logoImg from './logo.svg';

import Slide1Code from './slidecodes/Slide1Code';
import Slide2Code from './slidecodes/Slide2Code';
import Slide3Code from './slidecodes/Slide3Code';
import Slide4Code from './slidecodes/Slide4Code';






export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [<Slide1Code />,
    <Slide2Code />,
    <Slide3Code />,
    <Slide4Code />]; // extendé e
    const formRef = useRef()
    const [sent, setSent] = useState(false)

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // cambia cada 5s
  
      return () => clearInterval(interval);
    }, [slides.length]);
  
    const handlePreregistro = e => {
      e.preventDefault()
  
      emailjs
        .sendForm(
          'service_4wh2iiy',    // <— tu Service ID
          'template_gjp2oaz',   // <— tu Template ID
          formRef.current,      // <— referencia al <form>
          'e_T6izB7IUm9iUnER'        // <— tu User ID (public key)
        )
        .then(
          res => {
            console.log('EmailJS success', res.status, res.text)
            setSent(true)
          },
          err => {
            console.error('EmailJS error', err)
            alert('Ocurrió un error al enviar. Revisa consola.')
          }
        )
    }

    const preregistroref = useRef(null);
    const irAPreregistro = () => {
      preregistroref.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
      <div className={styles.container}>
        <nav className={styles.navbar}>
                  <img
           src={logoImg}
           alt="Influential"
           className={styles.logo}
         />
          <div>
            <button className={styles.buttonRegister} onClick={irAPreregistro} >Registrarse</button> {/* antes buttonDisabled */}
            <button className={styles.buttonStartSession} >Iniciar sesión</button> {/* antes buttonDisabled */}
          </div>
        </nav>
  
        <section className={styles.heroSection}>
        <img
            src={heroImage}
            alt="Hero completo con texto e influencer"
            className={styles.fullHeroImage}
          />
        </section>

        <section className={styles.connectSection}>
        <h2 className={styles.title}>Hacemos que conectar sea simple.</h2>
        <p className={styles.subtitle}>
          Nos encargamos de <span className={styles.highlight}>reducir el ruido</span> y <span className={styles.highlight}>acelerar lo importante</span>: que las marcas encuentren al influencer ideal, y que vos puedas aplicar sin vueltas. Todo en un mismo lugar: fácil y seguro.
        </p>
      </section>

<section className={styles.carouselSection}>
    <div className={styles.carouselContainer}>
      {slides.map((slide, index) => (
      <div
        key={index}
        className={`${styles.carouselImage} ${currentSlide === index ? styles.active : ''}`}
      >
        {slide}
      </div>
    ))}
  </div>
</section>

      <section className={styles.procesoSection}>
        <img
          src={procesoImg}
          alt="Proceso - cómo funciona Influential"
          className={styles.procesoImage}
        />
      </section>

      <section className={styles.preregistroSection} ref={preregistroref}>
    <form ref={formRef} onSubmit={handlePreregistro} className={styles.form}>
      <h2 className={styles.formTitle}>Pre registrate</h2>
      <p className={styles.formSubtitle}>
        Sumate ahora al pre-registro y recibí acceso anticipado, oportunidades reales de colaboración y un lugar en el próximo gran cambio del marketing digital. <br />
        <strong>Solo te toma 2 minutos.</strong>
      </p>

      {/* Email */}
      <label className={styles.label}>Email de contacto</label>
      <input name="to_email" type="to_email" required className={styles.input} />

      {/* Tipo de usuario */}
      <label className={styles.label}>Soy:</label>
      <div className={styles.radioGroup}>
        <label className={styles.radioItem}>
          <input type="radio" name="tipo" value="Influencer" defaultChecked />
          <span>Influencer</span>
        </label>
        <label className={styles.radioItem}>
          <input type="radio" name="tipo" value="Marca" />
          <span>Marca</span>
        </label>
      </div>

      {/* Nombre */}
      <label className={styles.label}>Nombre y apellido/Marca</label>
      <input name="nombre" type="text" required className={styles.input} />

      {/* Usuario IG/TikTok */}
      <label className={styles.label}>@usuario de Instagram o TikTok</label>
      <input name="usuario" type="plat" required className={styles.input} />

      {/* Seguidores */}
      <label className={styles.label}>¿Cuántos seguidores tenés actualmente?</label>
      <div className={styles.followers}>
        {['<5k', '5–10k', '10–50k', '50–100k', '+100k'].map((label, i) => (
          <label key={i}>
            <input type="radio" name="seguidores" value={label} required />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* Interés */}
      <label className={styles.label}>¿Por qué te interesa sumarte a Influential?</label>
      <input name="interes" type="interes" required className={styles.input} />

      {/* Submit */}
      <button type="submit" className={styles.submitButton} disabled={sent}>
        {sent ? '¡Gracias por registrarte!' : 'Enviar'}
      </button>
    </form>
</section>
      </div>

      
    );
  }