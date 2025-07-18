import styles from '../LandingPage.module.css';
import React from 'react';
import step1 from '../step1.png';
import step2 from '../step2.png';
import step3 from '../step3.png';
import step4 from '../step4.png';

export default function SelectionCode() {
    return (
        <div className={styles.selectionContainer}>
            <div className={styles.processInformation}>
                <h2>Proceso</h2>
                <p>En Influential simplificamos el proceso para que puedas enfocarte en lo importante. Desde encontrar el match ideal hasta cobrar por tu trabajo, todo fluye en pocos pasos.</p>

                <button className={styles.processButton}>Encontrá tu match</button>
            </div>

            <div className={styles.stepsContainer}>
                <div className={styles.step}>
                    <img src={step1}></img>
                    <h2>Creá tu perfil</h2>
                    <p>Armá tu perfil como marca o influencer. Mostrá lo que hacés o lo que buscás.</p>
                </div>

                <div className={styles.step}>
                    <img src={step2}></img>
                    <h2>Explorá y filtrá</h2>
                    <p>Buscá campañas activas o creadores por nicho, ubicación, seguidores y más.</p>
                </div>

                <div className={styles.step}>
                    <img src={step3}></img>
                    <h2>Conectá y coordiná</h2>
                    <p>Contactá directamente, sin intermediarios. Chateá, pasá briefs y arreglá los detalles.</p>
                </div>

                <div className={styles.step}>
                    <img src={step4}></img>
                    <h2>Gestioná y cobrá</h2>
                    <p>Llevá el seguimiento, manejá tus colaboraciones y hacé pagos seguros desde la app.</p>
                </div>
            </div>
        </div>
    );
}