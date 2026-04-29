import React from 'react';
import PlanCard from '../../components/PlanCard/PlanCard';
import styles from './PlansPage.module.css';

export default function PlansPage() {
  return (
    <>
      <main className={styles.main}>
        <h2 className={styles.heading}>Nuestros Planes</h2>
        <p className={styles.subheading}>
          Elegí el plan que mejor se adapte a tu marca. Todos incluyen acceso a influencers y creadores UGC.
        </p>
        <div className={styles.grid}>
          <PlanCard
            title="Gratuito"
            subtitle="Para explorar"
            price="0"
            features={[
              'Búsqueda básica de influencers y UGC',
              'Hasta 5 contactos por mes',
              'Perfil de marca básico',
              'Filtros estándar',
              'Soporte por email',
            ]}
          />
          <PlanCard
            title="Pro"
            subtitle="Recomendado"
            price="25.000"
            recommended
            features={[
              'Búsqueda avanzada con todos los filtros',
              'Contactos ilimitados',
              'Chat integrado con influencers y UGC',
              'Métricas y estadísticas de perfiles',
              'Gestión de hasta 10 campañas activas',
              'Sistema de pagos integrado',
              'Soporte prioritario',
            ]}
          />
          <PlanCard
            title="Enterprise"
            subtitle="Para equipos grandes"
            price="40.000"
            features={[
              'Todo lo de Pro incluido',
              'Campañas ilimitadas',
              'Match inteligente con IA',
              'Dashboard de ROI avanzado',
              'Múltiples usuarios por cuenta',
              'API de integración',
              'Account manager dedicado',
              'Reportes personalizados',
            ]}
          />
        </div>
        <p className={styles.commission}>
          Los influencers y creadores UGC pagan solo un <strong>5% de comisión</strong> por contratos cerrados — la más baja del mercado.
        </p>
      </main>
    </>
  );
}
