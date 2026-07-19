"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Mobile-friendly Top Navigation */}
      <header style={{ padding: '1rem', backgroundColor: 'var(--secondary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>ServiceSync</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session?.user?.name || 'Cargando...'}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{(session?.user as any)?.role === 'resident' ? 'Residente' : (session?.user as any)?.role}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', textDecoration: 'none', color: 'white', border: 'none', cursor: 'pointer' }} title="Cerrar Sesión">
            🚪
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0 }}>
        <Link href="/resident" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--secondary)', textDecoration: 'none', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>👀</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Resumen</span>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', gap: '0.25rem', opacity: 0.5 }}>
          <span style={{ fontSize: '1.25rem' }}>📝</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Solicitudes</span>
        </div>
      </nav>
    </div>
  );
}
