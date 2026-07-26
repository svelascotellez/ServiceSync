"use client";

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', borderRight: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <Link href="/supervisor" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            ServiceSync Supervisor
          </Link>
        </div>
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link 
            href="/supervisor" 
            className="btn btn-outline" 
            style={{ 
              justifyContent: 'flex-start', 
              border: 'none', 
              backgroundColor: pathname === '/supervisor' ? 'var(--surface-hover)' : 'transparent',
              fontWeight: pathname === '/supervisor' ? 600 : 400
            }}
          >
            📊 Resumen
          </Link>
          <Link 
            href="/supervisor/tasks" 
            className="btn btn-outline" 
            style={{ 
              justifyContent: 'flex-start', 
              border: 'none',
              backgroundColor: pathname === '/supervisor/tasks' ? 'var(--surface-hover)' : 'transparent',
              fontWeight: pathname === '/supervisor/tasks' ? 600 : 400
            }}
          >
            📋 Tareas
          </Link>
          <Link 
            href="/supervisor/workers" 
            className="btn btn-outline" 
            style={{ 
              justifyContent: 'flex-start', 
              border: 'none',
              backgroundColor: pathname === '/supervisor/workers' ? 'var(--surface-hover)' : 'transparent',
              fontWeight: pathname === '/supervisor/workers' ? 600 : 400
            }}
          >
            👷 Trabajadores
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
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session?.user?.name || 'Supervisor'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Supervisor de Campo</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {session?.user?.name ? session.user.name.charAt(0) : 'S'}
            </div>
          </div>
        </header>
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
