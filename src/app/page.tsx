"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>ServiceSync</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" className="btn btn-outline">Iniciar Sesión</Link>
          <Link href="/login" className="btn btn-primary">Acceso Administrador</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Optimiza tus <span style={{ color: 'var(--primary)' }}>Servicios Residenciales</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            La plataforma integral para administrar personal de limpieza, jardineros, guardias de seguridad y solicitudes de mantenimiento.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="glass-panel" style={{ padding: '2rem', flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }} 
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2rem' }}>👨‍💼</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Administradores</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gestiona el personal, asigna tareas y revisa reportes.</p>
            </Link>
            
            <Link href="/worker" className="glass-panel" style={{ padding: '2rem', flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2rem' }}>👷</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Trabajadores</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Visualiza las tareas asignadas y reporta progreso desde cualquier lugar.</p>
            </Link>

            <Link href="/resident" className="glass-panel" style={{ padding: '2rem', flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2rem' }}>🏡</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Residentes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Da seguimiento al mantenimiento y envía solicitudes de servicio.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
