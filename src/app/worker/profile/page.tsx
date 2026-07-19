"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload to local folder
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // 2. Update user profile
      const photoRes = await fetch('/api/users/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: uploadData.url }),
      });
      if (!photoRes.ok) throw new Error('Error saving photo url');

      // 3. Update session
      await update({ photoUrl: uploadData.url });
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const photoUrl = (session?.user as any)?.photoUrl;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mi Perfil</h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', border: '4px solid var(--surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            session?.user?.name ? session.user.name.charAt(0) : 'W'
          )}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{session?.user?.name || 'Cargando...'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{session?.user?.email}</p>
        
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
          {uploading ? 'Subiendo...' : '📷 Cambiar Foto'}
        </button>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Estadísticas Personales</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>24</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tareas Realizadas</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>100%</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>A Tiempo</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>4.8</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Calif. Promedio</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>5</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Días Consecutivos</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Información Personal</h3>
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Teléfono</span>
            <span style={{ fontWeight: 500 }}>555-0101</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Departamento</span>
            <span style={{ fontWeight: 500 }}>{(session?.user as any)?.role === 'worker' ? 'Personal de Servicio' : (session?.user as any)?.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fecha de Ingreso</span>
            <span style={{ fontWeight: 500 }}>Oct 2023</span>
          </div>
        </div>
      </div>
    </div>
  );
}
