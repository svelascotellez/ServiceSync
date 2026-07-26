"use client";

import { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/supervisor', label: '📊 Resumen' },
    { href: '/supervisor/tasks', label: '📋 Tareas' },
    { href: '/supervisor/attendance', label: '⏱️ Asistencias' },
    { href: '/supervisor/workers', label: '👷 Trabajadores' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)', position: 'relative' }}>
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar-nav ${isMobileMenuOpen ? 'open' : ''}`}
        style={{ 
          width: '250px', 
          borderRight: '1px solid var(--border)', 
          backgroundColor: 'var(--surface)', 
          display: 'flex', 
          flexDirection: 'column',
          zIndex: 100,
          transition: 'transform 0.3s ease'
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/supervisor" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            ServiceSync Supervisor
          </Link>
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'none' }}
          >
            ✕
          </button>
        </div>

        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-outline" 
                style={{ 
                  justifyContent: 'flex-start', 
                  border: 'none', 
                  backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? 'var(--gold)' : 'var(--text-primary)'
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', borderColor: 'var(--error)', color: 'var(--error)' }}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Mobile Hamburger Menu Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ display: 'none', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}
          >
            ☰ <span style={{ fontSize: '0.9rem' }}>Menú</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session?.user?.name || 'Supervisor'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>Supervisor de Campo</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {session?.user?.name ? session.user.name.charAt(0) : 'S'}
            </div>
          </div>
        </header>

        <div className="main-content-padding" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
