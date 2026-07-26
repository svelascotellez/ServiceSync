"use client";

import { useState } from 'react';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { useRouter } from 'next/navigation';

export default function TasksClient({ tasks, workers }: { tasks: any[], workers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'timeline' | 'table'>('kanban');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');
  const router = useRouter();

  const filteredTasks = tasks.filter(task => {
    if (selectedWorkerId === 'all') return true;
    if (selectedWorkerId === 'unassigned') return !task.assignedTo;
    return task.assignedTo?.id === selectedWorkerId;
  });

  const handleDelete = async (id: string, isRecurring: boolean) => {
    let url = `/api/tasks/${id}`;
    if (isRecurring) {
      const deleteSeries = confirm('Esta es una tarea periódica. ¿Deseas eliminar también TODAS las tareas futuras pendientes de esta serie?\n\n- OK: Eliminar serie futura\n- Cancelar: Eliminar solo esta tarea');
      if (deleteSeries) {
        url += '?deleteSeries=true';
      }
    } else {
      if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    }

    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la tarea');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Gestión de Tareas</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Supervisa y asigna tareas al personal.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Worker Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select 
              className="input-field" 
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', minWidth: '200px' }}
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
            >
              <option value="all">👷 Todos los Trabajadores</option>
              <option value="unassigned">❓ Sin Asignar</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  👤 {w.name} ({w.workerType || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', backgroundColor: 'var(--background)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <button onClick={() => setViewMode('kanban')} className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Tablero</button>
            <button onClick={() => setViewMode('calendar')} className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Calendario</button>
            <button onClick={() => setViewMode('timeline')} className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Tarjetas</button>
            <button onClick={() => setViewMode('table')} className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Lista</button>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Crear Tarea</button>
        </div>
      </div>

      {viewMode === 'table' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Fecha</th>
                <th style={{ padding: '1rem' }}>Título</th>
                <th style={{ padding: '1rem' }}>Ubicación</th>
                <th style={{ padding: '1rem' }}>Trabajador Asignado</th>
                <th style={{ padding: '1rem' }}>Prioridad</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {task.title}
                    {task.recurringGroupId && <span className="badge badge-pending" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Periódica</span>}
                    {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.description}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>{task.location}</td>
                  <td style={{ padding: '1rem' }}>{task.assignedTo ? task.assignedTo.name : 'Sin Asignar'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: task.priority === 'Alta' ? 'var(--error)' : task.priority === 'Media' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                      {task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem' }}>Editar</button>
                    <button onClick={() => handleDelete(task.id, !!task.recurringGroupId)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay tareas para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                {col.title} <span className="badge badge-pending">{filteredTasks.filter(t => t.status === col.id).length}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} style={{ backgroundColor: 'var(--background)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{task.title}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: task.priority === 'Alta' ? 'var(--error)' : 'var(--text-secondary)' }}>{task.priority}</span>
                    </div>
                    {task.recurringGroupId && <span className="badge badge-pending" style={{ fontSize: '0.65rem', marginBottom: '0.5rem', display: 'inline-block' }}>Periódica</span>}
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      👤 {task.assignedTo ? task.assignedTo.name : 'Sin Asignar'}
                    </div>
                    {(task.startPhotoUrl || task.endPhotoUrl) && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {task.startPhotoUrl && <img src={task.startPhotoUrl} alt="Inicio" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid var(--border)' }} title="Foto de Inicio" />}
                        {task.endPhotoUrl && <img src={task.endPhotoUrl} alt="Fin" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid var(--border)' }} title="Foto Final" />}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', flex: 1 }}>Abrir</button>
                    </div>
                  </div>
                ))}
                {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>Vacío</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {filteredTasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{task.title} {task.recurringGroupId && <span className="badge badge-pending" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>Periódica</span>}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>📍 {task.location} • 👤 {task.assignedTo?.name || 'Sin Asignar'}</div>
                {(task.startPhotoUrl || task.endPhotoUrl) && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    {task.startPhotoUrl && <img src={task.startPhotoUrl} alt="Inicio" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} title="Foto de Inicio" />}
                    {task.endPhotoUrl && <img src={task.endPhotoUrl} alt="Fin" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} title="Foto Final" />}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                 <span className={`badge ${task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                    {task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                 </span>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 1rem', fontSize: '0.875rem' }}>Editar</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (() => {
        const todayKey = new Date().toISOString().split('T')[0];
        const groups: Record<string, { dateObj: Date; isToday: boolean; label: string; tasks: any[] }> = {};

        // Always ensure Today's card exists
        const todayDate = new Date();
        const todayLabel = `HOY • ${todayDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}`;
        groups[todayKey] = {
          dateObj: todayDate,
          isToday: true,
          label: todayLabel,
          tasks: []
        };

        filteredTasks.forEach(task => {
          if (!task.dueDate) {
            const key = 'sin-fecha';
            if (!groups[key]) {
              groups[key] = { dateObj: new Date(0), isToday: false, label: 'Sin fecha programada', tasks: [] };
            }
            groups[key].tasks.push(task);
          } else {
            const d = new Date(task.dueDate);
            const key = d.toISOString().split('T')[0];
            const isToday = key === todayKey;
            if (!groups[key]) {
              const label = isToday
                ? `HOY • ${d.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}`
                : d.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
              groups[key] = { dateObj: d, isToday, label, tasks: [] };
            }
            groups[key].tasks.push(task);
          }
        });

        const sortedGroups = Object.values(groups).sort((a, b) => {
          if (a.isToday) return -1;
          if (b.isToday) return 1;
          if (a.dateObj.getTime() === 0) return 1;
          if (b.dateObj.getTime() === 0) return -1;
          return a.dateObj.getTime() - b.dateObj.getTime();
        });

        return (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {sortedGroups.map(group => (
              <div 
                key={group.label} 
                className="glass-panel" 
                style={{ 
                  padding: '1.5rem', 
                  border: group.isToday ? '2px solid var(--gold)' : '1px solid var(--border)',
                  backgroundColor: group.isToday ? 'var(--gold-light)' : 'var(--surface)',
                  boxShadow: group.isToday ? '0 8px 20px rgba(197, 160, 89, 0.25)' : 'var(--shadow-md)',
                  position: 'relative'
                }}
              >
                {group.isToday && (
                  <div style={{ position: 'absolute', top: '-12px', right: '16px', backgroundColor: 'var(--gold)', color: '#081C2C', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    ★ Día Actual
                  </div>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: group.isToday ? '#8C6826' : 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{group.label}</span>
                  <span className="badge badge-gold">{group.tasks.length} {group.tasks.length === 1 ? 'tarea' : 'tareas'}</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {group.tasks.map(task => (
                    <div key={task.id} onClick={() => setEditingTask(task)} style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                        <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>👤 {task.assignedTo?.name || 'Sin Asignar'}</span>
                      </div>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: task.status === 'approved' ? 'var(--success)' : task.status === 'completed' ? '#3B82F6' : task.status === 'in-progress' ? 'var(--warning)' : 'var(--error)' }} title={task.status}></span>
                    </div>
                  ))}
                  {group.tasks.length === 0 && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                      Sin tareas programadas para este día
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <CreateTaskModal 
        workers={workers}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          router.refresh();
        }} 
      />

      <EditTaskModal
        workers={workers}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSuccess={() => {
          router.refresh();
        }}
        initialData={editingTask}
      />
    </div>
  );
}
