"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Mobile-friendly Top Navigation */}
      <header style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>ServiceSync</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session?.user?.name || 'Cargando...'}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{(session?.user as any)?.role === 'worker' ? 'Trabajador' : (session?.user as any)?.role}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', textDecoration: 'none', color: 'white', border: 'none', cursor: 'pointer' }} title="Cerrar Sesión">
            🚪
          </button>
        </div>
      </header>

      {/* Main Content Area optimized for mobile */}
      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0 }}>
        <Link href="/worker" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: pathname === '/worker' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Tareas</span>
        </Link>
        <Link href="/worker/attendance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: pathname === '/worker/attendance' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📅</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Asistencia</span>
        </Link>
        <Link href="/worker/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: pathname === '/worker/profile' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>👤</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
