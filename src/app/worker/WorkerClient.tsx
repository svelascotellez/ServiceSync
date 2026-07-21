"use client";

import { useState, useEffect } from 'react';
import exifr from 'exifr';
import Link from 'next/link';

export default function WorkerClient({ tasks }: { tasks: any[] }) {
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');

  useEffect(() => {
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        if (data.attendance) {
          setAttendance(data.attendance);
        }
        setLoading(false);
      });
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, action: 'checkIn' | 'checkOut') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading(true);
    
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

      // 3. Upload Photo
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error("Error al subir la imagen");
      const photoUrl = uploadData.url;

      // 4. Register Attendance
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          photoUrl,
          photoLat: lat,
          photoLng: lng,
          photoTime: time.toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance);
      } else {
        alert(data.error);
      }
    } catch (err: any) {
       alert(err.message || 'Error desconocido');
    } finally {
      setActionLoading(false);
    }
  };

  // tasks is passed as a prop

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;

  const isCheckedIn = attendance && !attendance.checkOutTime;
  const isCheckedOut = attendance && attendance.checkOutTime;

  // Let's make the date dynamic in Spanish instead of hardcoded
  const todayDateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const capitalizedDateStr = todayDateStr.charAt(0).toUpperCase() + todayDateStr.slice(1);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Resumen de Hoy</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{capitalizedDateStr}</p>
      </div>

      {/* Attendance Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', backgroundColor: isCheckedIn ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Asistencia Diaria</h2>
        
        {isCheckedOut ? (
          <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            ✅ Has completado tu turno por hoy.
          </div>
        ) : (
          <label 
            className={`btn ${isCheckedIn ? 'btn-warning' : 'btn-primary'}`} 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.125rem', 
              backgroundColor: isCheckedIn ? 'var(--warning)' : 'var(--primary)', 
              color: isCheckedIn ? '#000' : '#fff',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              opacity: actionLoading ? 0.7 : 1
            }}
          >
            {actionLoading ? 'Procesando...' : (isCheckedIn ? '📸 Selfie de Salida' : '📸 Selfie de Entrada')}
            <input 
              type="file" 
              accept="image/*" 
              capture="user"
              style={{ display: 'none' }} 
              disabled={actionLoading}
              onChange={(e) => handlePhotoUpload(e, isCheckedIn ? 'checkOut' : 'checkIn')} 
            />
          </label>
        )}
        
        {attendance && (
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Hora de entrada: {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {attendance.checkOutTime && ` • Hora de salida: ${new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mis Tareas ({tasks.length})</h2>
        <div style={{ display: 'flex', backgroundColor: 'var(--background)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Lista</button>
          <button onClick={() => setViewMode('calendar')} className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Calendario</button>
          <button onClick={() => setViewMode('kanban')} className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Tablero</button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map(task => (
            <Link href={`/worker/tasks/${task.id}`} key={task.id} style={{ textDecoration: 'none' }}>
              <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', borderLeft: task.status === 'completed' || task.status === 'approved' ? '4px solid var(--success)' : (task.status === 'in-progress' ? '4px solid var(--primary)' : '4px solid var(--warning)') }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${task.status === 'completed' || task.status === 'approved' ? 'var(--success)' : 'var(--text-secondary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: task.status === 'completed' || task.status === 'approved' ? 'var(--success)' : 'transparent', color: 'white', fontSize: '0.75rem', flexShrink: 0, marginTop: '0.25rem' }}>
                  {(task.status === 'completed' || task.status === 'approved') && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '1rem', textDecoration: task.status === 'completed' || task.status === 'approved' ? 'line-through' : 'none', color: task.status === 'completed' || task.status === 'approved' ? 'var(--text-secondary)' : 'var(--text)' }}>
                    {task.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>📍 {task.location}</span>
                    {task.status === 'in-progress' && <span style={{color: 'var(--primary)', fontWeight: 500}}>En progreso</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {tasks.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No tienes tareas asignadas.</div>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {Object.entries(
            tasks.reduce((acc, task) => {
              const d = task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Sin fecha programada';
              if (!acc[d]) acc[d] = [];
              acc[d].push(task);
              return acc;
            }, {} as Record<string, any[]>)
          ).map(([date, dayTasks]) => (
            <div key={date} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', textTransform: 'capitalize' }}>
                {date}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(dayTasks as any[]).map(task => (
                  <Link href={`/worker/tasks/${task.id}`} key={task.id} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                        <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textDecoration: task.status === 'completed' || task.status === 'approved' ? 'line-through' : 'none', color: task.status === 'completed' || task.status === 'approved' ? 'var(--text-secondary)' : 'var(--text)' }}>
                          {task.title}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {task.location}</span>
                      </div>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: task.status === 'approved' ? 'var(--success)' : task.status === 'completed' ? '#3B82F6' : task.status === 'in-progress' ? 'var(--warning)' : 'var(--error)' }} title={task.status}></span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No tienes tareas asignadas.</div>
          )}
        </div>
      )}
      {viewMode === 'kanban' && (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {[
            { id: 'pending', title: 'Pendientes' },
            { id: 'in-progress', title: 'En Progreso' },
            { id: 'completed', title: 'Por Revisar' },
            { id: 'approved', title: 'Aprobadas' },
          ].map(col => (
            <div key={col.id} className="glass-panel" style={{ padding: '1.5rem', minHeight: '500px', backgroundColor: 'var(--surface)', flex: '0 0 320px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                {col.title} <span className="badge badge-pending">{tasks.filter(t => t.status === col.id).length}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.filter(t => t.status === col.id).map(task => (
                  <Link href={`/worker/tasks/${task.id}`} key={task.id} style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: 'var(--background)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{task.title}</strong>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: task.priority === 'Alta' ? 'var(--error)' : 'var(--text-secondary)' }}>{task.priority}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        📍 {task.location}
                      </div>
                    </div>
                  </Link>
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>Vacío</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
