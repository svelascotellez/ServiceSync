"use client";

import { useState } from 'react';
import exifr from 'exifr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TaskDetailClient({ task }: { task: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'complete') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      // 1. Extract EXIF GPS and Time
      let lat: number | null = null;
      let lng: number | null = null;
      let time: Date | null = null;

      try {
        const exifData = await exifr.parse(file, { pick: ['latitude', 'longitude', 'DateTimeOriginal'] });
        if (exifData) {
          lat = exifData.latitude || null;
          lng = exifData.longitude || null;
          time = exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal) : new Date();
        }
      } catch (err) {
        console.log("No EXIF data found");
      }

      if (!time) time = new Date();

      // 2. Fallback to HTML5 Geolocation API if EXIF lacks GPS
      if (lat === null || lng === null) {
        if ('geolocation' in navigator) {
           const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
           }).catch(() => null);
           if (pos) {
             lat = pos.coords.latitude;
             lng = pos.coords.longitude;
           }
        }
      }

      // If still no location, we just send null (as requested by user)

      // 3. Upload Photo
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error("Error al subir la imagen");

      const photoUrl = uploadData.url;

      // 4. Update Task via API
      const endpoint = type === 'start' ? `/api/tasks/${task.id}/start` : `/api/tasks/${task.id}/complete`;
      
      const payload = type === 'start' ? {
        startPhotoUrl: photoUrl,
        startPhotoTime: time.toISOString(),
        startPhotoLat: lat,
        startPhotoLng: lng
      } : {
        endPhotoUrl: photoUrl,
        endPhotoTime: time.toISOString(),
        endPhotoLat: lat,
        endPhotoLng: lng
      };

      const taskRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!taskRes.ok) throw new Error("Error al actualizar la tarea");

      // Reload to see new state
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const isPending = task.status === 'pending';
  const isInProgress = task.status === 'in-progress';
  const isCompleted = task.status === 'completed';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/worker" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '1.25rem' }}>
          ←
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Detalles de la Tarea</h1>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>{task.title}</h2>
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '9999px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : (isInProgress ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
            color: isCompleted ? 'var(--success)' : (isInProgress ? 'var(--primary)' : 'var(--warning)')
          }}>
            {isCompleted ? 'Completada' : (isInProgress ? 'En Progreso' : 'Pendiente')}
          </span>
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <p><strong>Ubicación:</strong> {task.location}</p>
          <p><strong>Prioridad:</strong> {task.priority}</p>
          <p><strong>Descripción:</strong> {task.description || 'Sin descripción adicional.'}</p>
        </div>
      </div>

      {isPending && (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Iniciar Tarea</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Para comenzar, debes subir una foto del lugar de trabajo.</p>
          
          <label className="btn btn-primary" style={{ display: 'block', width: '100%', padding: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Procesando...' : '📸 Tomar Foto e Iniciar'}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              style={{ display: 'none' }} 
              disabled={loading}
              onChange={(e) => handlePhotoUpload(e, 'start')} 
            />
          </label>
        </div>
      )}

      {isInProgress && (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Terminar Tarea</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Sube una foto de evidencia para dar por terminada la tarea.</p>
          
          <label className="btn btn-success" style={{ display: 'block', width: '100%', padding: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, backgroundColor: 'var(--success)', color: 'white' }}>
            {loading ? 'Procesando...' : '✅ Subir Evidencia y Terminar'}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              style={{ display: 'none' }} 
              disabled={loading}
              onChange={(e) => handlePhotoUpload(e, 'complete')} 
            />
          </label>
        </div>
      )}

      {(task.startPhotoUrl || task.endPhotoUrl) && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Evidencias</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {task.startPhotoUrl && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Foto Inicial</p>
                <img src={task.startPhotoUrl} alt="Inicio" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {task.startPhotoTime && <div>⏰ {new Date(task.startPhotoTime).toLocaleString()}</div>}
                  {task.startPhotoLat && <div>📍 {task.startPhotoLat.toFixed(6)}, {task.startPhotoLng?.toFixed(6)}</div>}
                </div>
              </div>
            )}
            {task.endPhotoUrl && (
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Foto Final</p>
                <img src={task.endPhotoUrl} alt="Fin" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {task.endPhotoTime && <div>⏰ {new Date(task.endPhotoTime).toLocaleString()}</div>}
                  {task.endPhotoLat && <div>📍 {task.endPhotoLat.toFixed(6)}, {task.endPhotoLng?.toFixed(6)}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
