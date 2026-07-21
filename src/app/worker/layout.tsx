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

  const NavMenu = () => (
    <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <Link href="/worker" style={{ color: pathname === '/worker' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: pathname === '/worker' ? 700 : 500, fontSize: '1rem' }}>
        Tareas
      </Link>
      <Link href="/worker/attendance" style={{ color: pathname === '/worker/attendance' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: pathname === '/worker/attendance' ? 700 : 500, fontSize: '1rem' }}>
        Asistencia
      </Link>
      <Link href="/worker/profile" style={{ color: pathname === '/worker/profile' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: pathname === '/worker/profile' ? 700 : 500, fontSize: '1rem' }}>
        Perfil
      </Link>
    </nav>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <header style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>ServiceSync</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session?.user?.name || 'Cargando...'}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{(session?.user as any)?.role === 'worker' ? 'Trabajador' : (session?.user as any)?.role}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', textDecoration: 'none', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }} title="Cerrar Sesión">
            Salir
          </button>
        </div>
      </header>

      {/* Menú Superior */}
      <NavMenu />

      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        {children}
      </main>

      {/* Menú Inferior Fijo */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
        <NavMenu />
      </div>
    </div>
  );
}
