// src/pages/Landing/LandingPage.js
import React, { useRef, useState, useEffect } from 'react'
import emailjs from 'emailjs-com'

import styles from './LandingPage.module.css'
import heroImage from './hero-landing.svg';
import procesoImg from './topics.svg';
import logoImg from './logo.svg';

import Slide1Code from './slidecodes/Slide1Code';
import Slide2Code from './slidecodes/Slide2Code';
import Slide3Code from './slidecodes/Slide3Code';
import Slide4Code from './slidecodes/Slide4Code';

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sent, setSent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const formRef = useRef();
  const preregistroref = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card4Ref = useRef(null);

  const slides = [<Slide1Code />, <Slide2Code />, <Slide3Code />, <Slide4Code />];

  useEffect(() => {
    const stackSection = document.querySelector(`.${styles.stackSection}`);
    const stackCardWraps = document.querySelectorAll(`.${styles.stackCardWrap}`);
    let lastScrollTop = 0;
    let isScrolling = false;

    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      const scrollPosition = window.scrollY;
      const scrollDirection = scrollPosition > lastScrollTop ? 'down' : 'up';
      lastScrollTop = scrollPosition;

      const cardPositions = Array.from(stackCardWraps).map(wrap => {
        const rect = wrap.getBoundingClientRect();
        return {
          top: rect.top,
          element: wrap,
          visible: rect.top >= -50 && rect.top <= window.innerHeight
        };
      });

      const visibleCards = cardPositions.filter(card => card.visible);
      const mainCard = visibleCards.reduce((prev, current) =>
        (prev.top > current.top && prev.top < window.innerHeight / 2) ? prev : current,
        visibleCards[0] || { element: null }
      );

      cardPositions.forEach(card => {
        card.element.classList.remove(styles.shrink);
        if (card.element !== mainCard.element && card.visible) {
          card.element.classList.add(styles.shrink);
        }
      });

      setTimeout(() => {
        isScrolling = false;
      }, 50);
    };

    const handleWheel = (e) => {
      const isInStackSection = stackSection && stackSection.contains(e.target);
      if (isInStackSection) {
        const scrollSpeed = 1.4;
        window.scrollBy({
          top: e.deltaY * scrollSpeed,
          behavior: 'auto'
        });
        e.preventDefault();
        handleScroll();
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleWheel, { passive: false });
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handlePreregistro = e => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_4wh2iiy',
        'template_gjp2oaz',
        formRef.current,
        'e_T6izB7IUm9iUnER'
      )
      .then(
        res => {
          console.log('EmailJS success', res.status, res.text);
          setSent(true);
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 2000);
        },
        err => {
          console.error('EmailJS error', err);
          alert('Ocurrió un error al enviar. Revisa consola.');
        }
      );
  };

  const irAPreregistro = () => {
    preregistroref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <img src={logoImg} alt="Influential" className={styles.logo} />
        <div>
          <button className={styles.buttonRegister} onClick={irAPreregistro}>Registrarse</button>
          <button className={styles.buttonStartSession}>Iniciar sesión</button>
        </div>
      </nav>

      <section className={styles.heroSection}>
        <img src={heroImage} alt="Hero completo con texto e influencer" className={styles.fullHeroImage} />
      </section>

      <section className={styles.connectSection}>
        <h2 className={styles.title}>Hacemos que conectar sea simple.</h2>
        <p className={styles.subtitle}>
          Nos encargamos de <span className={styles.highlight}>reducir el ruido</span> y <span className={styles.highlight}>acelerar lo importante</span>: que las marcas encuentren al influencer ideal, y que vos puedas aplicar sin vueltas.
        </p>
      </section>

      <section className={styles.stackSection}>
        <div className={styles.stackCardsDesktop}>
          {[card1Ref, card2Ref, card3Ref, card4Ref].map((ref, i) => (
            <div key={i} className={`${styles.stackCardWrap} ${styles[`_${i + 1}`]}`}>
              <div ref={ref} className={styles.stackCard}>{slides[i]}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.procesoSection}>
        <img src={procesoImg} alt="Proceso - cómo funciona Influential" className={styles.procesoImage} />
      </section>

      <section className={styles.preregistroSection} ref={preregistroref}>
        <form ref={formRef} onSubmit={handlePreregistro} className={styles.form}>
          <h2 className={styles.formTitle}>Pre registrate</h2>
          <p className={styles.formSubtitle}>
            Sumate ahora al pre-registro y recibí acceso anticipado. <br /><strong>Solo te toma 2 minutos.</strong>
          </p>

          <label className={styles.label}>Email de contacto</label>
          <input name="to_email" type="to_email" required className={styles.input} />

          <label className={styles.label}>Soy:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioItem}><input type="radio" name="tipo" value="Influencer" defaultChecked /><span>Influencer</span></label>
            <label className={styles.radioItem}><input type="radio" name="tipo" value="Marca" /><span>Marca</span></label>
          </div>

          <label className={styles.label}>Nombre y apellido/Marca</label>
          <input name="nombre" type="text" required className={styles.input} />

          <label className={styles.label}>@usuario de Instagram o TikTok</label>
          <input name="usuario" type="plat" required className={styles.input} />

          <label className={styles.label}>¿Cuántos seguidores tenés actualmente?</label>
          <div className={styles.followers}>
            {['<5k', '5–10k', '10–50k', '50–100k', '+100k'].map((label, i) => (
              <label key={i}><input type="radio" name="seguidores" value={label} required /><span>{label}</span></label>
            ))}
          </div>

          <label className={styles.label}>¿Por qué te interesa sumarte a Influential?</label>
          <input name="interes" type="interes" required className={styles.input} />

          <button type="submit" className={styles.submitButton} disabled={sent}>
            {sent ? '¡Gracias por registrarte!' : 'Enviar'}
          </button>
        </form>
      </section>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <svg className={styles.checkIcon} viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none" stroke="#4CAF50" strokeWidth="2" />
              <path fill="none" stroke="#4CAF50" strokeWidth="4" d="M14 27l7 7 17-17" />
            </svg>
            <h3>¡Registro exitoso!</h3>
            <p>Gracias por sumarte a Influential. Te contactaremos pronto.</p>
          </div>
        </div>
      )}
    </div>
  );
}
