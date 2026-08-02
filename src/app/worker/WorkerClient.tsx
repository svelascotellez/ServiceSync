"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCancunDate, formatCancunTime, getCancunTodayKey, formatCancunCalendarDayLabel } from '@/lib/dateUtils';

export default function WorkerClient({ tasks = [] }: { tasks?: any[] }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // ALL HOOKS DECLARED AT TOP LEVEL IN UNVARYING ORDER
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('kanban');

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  const [capitalizedDateStr, setCapitalizedDateStr] = useState<string>('');

  useEffect(() => {
    fetch('/api/attendance')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.attendance) {
          setAttendance(data.attendance);
        }
      })
      .catch(err => {
        console.error('Error loading attendance:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('es-MX', { timeZone: 'America/Cancun', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    setCapitalizedDateStr(todayStr.charAt(0).toUpperCase() + todayStr.slice(1));
  }, []);

  const priorityWeight: Record<string, number> = { 'Alta': 3, 'Media': 2, 'Baja': 1 };

  const filteredTasks = safeTasks
    .filter(task => {
      if (!task) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(q);
        const locMatch = task.location?.toLowerCase().includes(q);
        if (!titleMatch && !locMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        const timeA = a?.dueDate ? new Date(a.dueDate).getTime() : 0;
        const timeB = b?.dueDate ? new Date(b.dueDate).getTime() : 0;
        return timeA - timeB;
      } else if (sortBy === 'priority') {
        return (priorityWeight[b?.priority] || 0) - (priorityWeight[a?.priority] || 0);
      } else {
        const titleA = a?.title || '';
        const titleB = b?.title || '';
        return titleA.localeCompare(titleB);
      }
    });

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
        const exifrModule = await import('exifr');
        const exifr = exifrModule.default || exifrModule;
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;

  const isCheckedIn = attendance && !attendance.checkOutTime;
  const isCheckedOut = attendance && attendance.checkOutTime;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mi Panel (Dashboard)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{capitalizedDateStr}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Asignadas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{safeTasks.length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pendientes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{safeTasks.filter(t => t && (t.status === 'pending' || t.status === 'in-progress')).length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Terminadas / Aprobadas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{safeTasks.filter(t => t && (t.status === 'completed' || t.status === 'approved')).length}</p>
        </div>
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
              onChange={(e) => handlePhotoUpload(e, isCheckedIn ? 'checkOut' : 'checkIn')}
              disabled={actionLoading}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Task Filters & Sort Controls */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Top Bar: Search + View Switcher */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar tarea o ubicación..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--background)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'kanban' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                📌 Kanban
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                📋 Lista
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'calendar' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                📅 Calendario
              </button>
            </div>
          </div>

          {/* Bottom Bar: Filters & Sort Dropdowns */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estado:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="in-progress">En Progreso</option>
                <option value="completed">Completadas</option>
                <option value="approved">Aprobadas</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Prioridad:</span>
              <select 
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              >
                <option value="all">Todas las Prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ordenar por:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              >
                <option value="dueDate">Fecha Vencimiento</option>
                <option value="priority">Prioridad</option>
                <option value="title">Nombre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Mis Tareas Asignadas</h2>
          {filteredTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No se encontraron tareas con los filtros seleccionados.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${task.priority === 'Alta' ? 'var(--error)' : task.priority === 'Media' ? 'var(--warning)' : 'var(--info)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>{task.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>📍 {task.location || 'Sin ubicación'}</p>
                  </div>
                  <span className={`badge ${task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : task.status === 'in-progress' ? 'badge-warning' : 'badge-pending'}`}>
                    {task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                  </span>
                </div>

                {task.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                    {task.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    📅 Vence: {formatCancunDate(task.dueDate)}
                  </div>
                  <Link href={`/worker/tasks/${task.id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Ver Detalles ➔
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Tablero Kanban</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Column 1: Pendientes */}
            <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--warning)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warning)' }}>📋 Pendientes</h3>
                <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
                  {filteredTasks.filter(t => t.status === 'pending').length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredTasks.filter(t => t.status === 'pending').map(task => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* Column 2: En Progreso */}
            <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>🚀 En Progreso</h3>
                <span className="badge" style={{ backgroundColor: 'rgba(14, 165, 233, 0.2)', color: 'var(--primary)' }}>
                  {filteredTasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredTasks.filter(t => t.status === 'in-progress').map(task => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* Column 3: Completadas / Aprobadas */}
            <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--success)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>✅ Realizadas</h3>
                <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                  {filteredTasks.filter(t => t.status === 'completed' || t.status === 'approved').length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredTasks.filter(t => t.status === 'completed' || t.status === 'approved').map(task => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <CalendarView tasks={filteredTasks} />
      )}
    </div>
  );
}

function KanbanCard({ task }: { task: any }) {
  return (
    <div 
      style={{
        padding: '1rem',
        borderRadius: '8px',
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</h4>
        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: task.priority === 'Alta' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: task.priority === 'Alta' ? 'var(--error)' : 'var(--warning)', fontWeight: 700 }}>
          {task.priority || 'Normal'}
        </span>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>📍 {task.location || 'Sin ubicación'}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)', fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>📅 {formatCancunDate(task.dueDate)}</span>
        <Link href={`/worker/tasks/${task.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Ver ➔
        </Link>
      </div>
    </div>
  );
}

function CalendarView({ tasks }: { tasks: any[] }) {
  // Calendar day calculation using Cancún timezone
  const todayKey = getCancunTodayKey();
  
  // Generate days array for current month dynamically
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 7 + i);
    const dateKey = getCancunTodayKey(d);
    return {
      date: d,
      dateKey,
      isToday: dateKey === todayKey,
      tasks: tasks.filter(t => t.dueDate && getCancunTodayKey(new Date(t.dueDate)) === dateKey)
    };
  });

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Calendario de Tareas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {daysInMonth.map((day, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1rem', borderLeft: day.isToday ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: day.isToday ? 'var(--primary)' : 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {formatCancunCalendarDayLabel(day.date, day.isToday)}
            </div>

            {day.tasks.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin tareas programadas</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {day.tasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{task.title}</span>
                    <Link href={`/worker/tasks/${task.id}`} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      Ver Detalles ➔
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
