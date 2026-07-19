"use client";

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', borderRight: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            ServiceSync Admin
          </Link>
        </div>
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/dashboard" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: 'var(--surface-hover)' }}>
            📊 Resumen
          </Link>
          <Link href="/dashboard/tasks" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}>
            📋 Tareas
          </Link>
          <Link href="/dashboard/workers" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}>
            👷 Trabajadores
          </Link>
          <Link href="/dashboard/residents" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}>
            🏡 Residentes
          </Link>
          <Link href="/dashboard/settings" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none' }}>
            ⚙️ Configuración
          </Link>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{session?.user?.name || 'Administrador'}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{session?.user?.name ? session.user.name.charAt(0) : 'A'}</div>
          </div>
        </header>
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
