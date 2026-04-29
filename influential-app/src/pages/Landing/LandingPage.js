// src/pages/Landing/LandingPage.js
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import emailjs from 'emailjs-com'
import styles from './LandingPage.module.css'

// Assets
import logo      from '../../assets/logo.svg'
import heroPhoto from '../../assets/influencer1.svg'
import icon2     from '../../assets/icon-filter.svg'
import icon3     from '../../assets/icon-share.svg'

export default function LandingPage() {
  const formRef = useRef()
  const [sent, setSent] = useState(false)

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

  return (
    <main className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <img src={logo} alt="Influential" className={styles.logo} />
        <nav className={styles.nav}>
          <Link to="/signup"   className={styles.link}>Registrarse</Link>
          <Link to="/login"    className={styles.btnLogin}>Iniciar sesión</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            La mejor manera de conectar
            <br/> tu marca con influencers
          </h1>
          <button className={styles.ctaPrimary}>Encontrá tu match</button>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.cardExample}>
            <img src={heroPhoto} alt="@Santoslopez" className={styles.cardPhoto} />
            <div className={styles.cardInfo}>
              <h3>@Santoslopez</h3>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.cardDesc}>
                Corta descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </p>
              <hr/>
              <div className={styles.socialStats}>
                <span className={styles.socialIcon}>📸 22K</span>
                <span className={styles.socialIcon}>🎵 22K</span>
              </div>
              <div className={styles.tags}>
                <span>Autos</span><span>Lifestyle</span><span>Deportes</span>
              </div>
              <button className={styles.btnSecondary}>Contactar</button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className={styles.why}>
        <h2>Hacemos que conectar sea simple.</h2>
        <p>
          Nos encargamos de <strong>reducir el ruido</strong> y <strong>acelerar lo importante</strong>: 
          que las marcas encuentren al influencer ideal, y que vos puedas aplicar sin vueltas. 
          Todo en un mismo lugar: fácil y seguro.
        </p>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.featureBlock}>
          <div className={styles.featureContent}>
            <small className={styles.featureLabel}>Para Marcas</small>
            <h3 className={styles.featureTitle}>Aliate con creadores, sin estrés</h3>
            <p>
              Creamos la infraestructura para que tu marca colabore con creadores 
              sin perder tiempo. Encontrá, coordiná y medí resultados desde una sola plataforma.
            </p>
          </div>
          <img src={heroPhoto} alt="" className={styles.featureImg}/>
        </div>
      </section>

      {/* PROCESS */}
      <section className={styles.process}>
        <div className={styles.processMain}>
          <h3>Proceso</h3>
          <p>
            En Influential simplificamos el proceso para que puedas enfocarte 
            en lo importante. Desde encontrar el match ideal hasta cobrar por tu trabajo, 
            todo fluye en pocos pasos.
          </p>
          <button className={styles.ctaPrimary}>Encontrá tu match</button>
        </div>
        <div className={styles.stepsGrid}>
          {[icon2,icon3].map((icon,i) => {
            const titles = ['Creá tu perfil','Explorá y filtrá','Conectá y coordiná','Gestioná y cobrá']
            const texts  = [
              'Armá tu perfil como marca o influencer.',
              'Buscá campañas activas o creadores por nicho.',
              'Chateá, pasá briefs y arreglá los detalles.',
              'Llevá el seguimiento y hacé pagos seguros.'
            ]
            return (
              <div key={i} className={styles.stepCard}>
                <img src={icon} alt="" className={styles.stepIcon}/>
                <h4>{titles[i]}</h4>
                <p>{texts[i]}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PRE-REGISTRO */}
      <section className={styles.prereg}>
        <h3>Pre registrate</h3>
        <p>
          Sumate ahora al pre-registro y recibí acceso anticipado, oportunidades reales 
          de colaboración y un lugar en el próximo gran cambio del marketing digital. 
          Solo te toma 2 minutos.
        </p>

        {!sent ? (
          <form
            ref={formRef}
            className={styles.preregForm}
            onSubmit={handlePreregistro}
          >
            <fieldset>
              <legend>Soy:</legend>
              <label><input type="radio" name="role" value="Influencer" defaultChecked/> Influencer</label>
              <label><input type="radio" name="role" value="Marca"/> Marca</label>
            </fieldset>

            <label>
              Nombre y apellido / Marca
              <input name="user_name" type="text" required/>
            </label>

            <label>
              @usuario de Instagram o TikTok
              <input name="user_handle" type="text" required/>
            </label>

            <label>
              Tu email
              <input name="to_email" type="email" required/>
            </label>

            <button type="submit" className={styles.ctaPrimary}>Enviar</button>
          </form>
        ) : (
          <p className={styles.thanksMessage}>
            ¡Gracias! Revisá tu correo para la confirmación 😊
          </p>
        )}
      </section>

      {/* PLANES */}
      <section className={styles.plans}>
        <h2>Nuestros Planes</h2>
        <div className={styles.plansGrid}>
          {[
            { title: 'Freemium', price: '$0/mes',       subtitle: 'Básico' },
            { title: 'Pro',      price: '$25.000/mes', subtitle: 'Recomendado' },
            { title: 'Premium',  price: '$40.000/mes', subtitle: '+Funciones' }
          ].map((p,i) => (
            <div key={i} className={styles.planCard}>
              <h3>{p.title}</h3>
              <span className={styles.planPrice}>{p.price}</span>
              <small>{p.subtitle}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
