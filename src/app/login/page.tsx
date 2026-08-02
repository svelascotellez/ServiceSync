"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/[...nextauth]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setError(data.error || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      const role = data.user?.role;
      const targetPath = role === 'supervisor' ? '/supervisor'
                       : role === 'worker' ? '/worker'
                       : role === 'resident' ? '/resident'
                       : '/dashboard';

      window.location.href = targetPath;
    } catch (err) {
      setError('Error al conectar con el servidor');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'radial-gradient(circle at 50% 30%, #0B3C5D 0%, #081C2C 100%)' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px', backgroundColor: '#FFFFFF', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', borderTop: '5px solid #C5A059' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #C5A059 0%, #B48F48 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#081C2C', fontWeight: 800, fontSize: '1.4rem', margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(197, 160, 89, 0.4)' }}>
            PA
          </div>
          <Link href="/" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B3C5D', textDecoration: 'none', fontFamily: "'Cinzel', serif", letterSpacing: '0.04em' }}>
            ServiceSync
          </Link>
          <div style={{ fontSize: '0.75rem', color: '#C5A059', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 700 }}>
            Puerto Aventuras Resort & Marina
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.25rem', color: '#0B192C' }}>
            Iniciar Sesión
          </h1>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(229, 62, 62, 0.1)', color: 'var(--error)', border: '1px solid rgba(229, 62, 62, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(e); }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Correo Electrónico</label>
            <input 
              id="email"
              type="email" 
              className="input-field" 
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" htmlFor="password">Contraseña</label>
              <a href="#" style={{ fontSize: '0.8rem', color: '#008CA5', fontWeight: 600 }}>¿Olvidaste tu contraseña?</a>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                style={{ paddingRight: '2.5rem', width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem',
                }}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleLogin}
            className="btn btn-gold" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar a ServiceSync'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E9F0', fontSize: '0.85rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0B3C5D' }}>Cuentas de Prueba (Contraseña: password123):</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
            <li>• Admin: <code>admin@servicesync.com</code></li>
            <li>• Supervisor: <code>supervisor@servicesync.com</code></li>
            <li>• Trabajador: <code>worker@servicesync.com</code></li>
            <li>• Residente: <code>resident@servicesync.com</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
