"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      {/* Top Riviera Bar */}
      <div style={{ backgroundColor: '#05131F', padding: '0.5rem 1.5rem', color: '#C5A059', fontSize: '0.8rem', letterSpacing: '0.1em', textAlign: 'center', textTransform: 'uppercase', borderBottom: '1px solid rgba(197, 160, 89, 0.2)' }}>
        ⚓ PUERTO AVENTURAS MÉXICO • GESTIÓN DE SERVICIOS Y MANTENIMIENTO RESIDENCIAL
      </div>

      {/* Navigation */}
      <nav style={{ padding: '1.25rem 2rem', backgroundColor: '#081C2C', borderBottom: '1px solid var(--border-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #C5A059 0%, #B48F48 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#081C2C', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)' }}>
            PA
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Cinzel', serif", letterSpacing: '0.04em' }}>
              ServiceSync
            </div>
            <div style={{ fontSize: '0.7rem', color: '#C5A059', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '-2px' }}>
              Puerto Aventuras Marina & Resort
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
            Iniciar Sesión
          </Link>
          <Link href="/login" className="btn btn-gold">
            Acceso Directo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center', background: 'radial-gradient(circle at 50% 20%, rgba(11, 60, 93, 0.08) 0%, transparent 70%)' }}>
        <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
          <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', backgroundColor: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: '999px', color: '#8C6826', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            🌊 Complejo Residencial & Marina de Lujo
          </div>
          
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2, color: 'var(--primary)', fontFamily: "'Cinzel', serif" }}>
            Excelencia en <span style={{ color: 'var(--gold)' }}>Gestión Residencial</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '3.5rem', maxWidth: '680px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            Plataforma centralizada para la administración de personal de mantimiento, supervisores de campo, áreas de marina y servicios a residentes en Puerto Aventuras.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/dashboard" className="glass-panel-gold" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', cursor: 'pointer' }} 
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.2rem', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(11, 60, 93, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--primary)' }}>👨‍💼</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>Administradores</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Supervisión general, personal, métricas y directorio administrativo.</p>
            </Link>

            <Link href="/supervisor" className="glass-panel-gold" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', cursor: 'pointer' }} 
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.2rem', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(197, 160, 89, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--gold)' }}>👔</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>Supervisores</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Coordinación de personal en campo, asignación e inspección de tareas.</p>
            </Link>

            <Link href="/worker" className="glass-panel-gold" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.2rem', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(0, 140, 165, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--secondary)' }}>👷</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>Trabajadores</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Consola diaria de tareas, registro de asistencia, selfies y fotos de avance.</p>
            </Link>

            <Link href="/resident" className="glass-panel-gold" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textDecoration: 'none', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.2rem', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(40, 167, 69, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--success)' }}>🏡</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>Residentes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Seguimiento a servicios del complejo residencial y solicitudes de atención.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '1.5rem', backgroundColor: '#05131F', color: '#90A4B8', textAlign: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(197, 160, 89, 0.2)' }}>
        © {new Date().getFullYear()} Puerto Aventuras México • ServiceSync Management System
      </footer>
    </main>
  );
}
