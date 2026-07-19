"use client";

import { useState } from 'react';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { useRouter } from 'next/navigation';

export default function TasksClient({ tasks, workers }: { tasks: any[], workers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'timeline' | 'table'>('kanban');
  const router = useRouter();

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
              {tasks.map(task => (
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
                    <span className={`badge ${task.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                      {task.status === 'completed' ? 'Completada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem' }}>Editar</button>
                    <button onClick={() => handleDelete(task.id, !!task.recurringGroupId)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay tareas creadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            { id: 'pending', title: 'Pendientes' },
            { id: 'in-progress', title: 'En Progreso' },
            { id: 'completed', title: 'Completadas' },
          ].map(col => (
            <div key={col.id} className="glass-panel" style={{ padding: '1.5rem', minHeight: '500px', backgroundColor: 'var(--surface)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                {col.title} <span className="badge badge-pending">{tasks.filter(t => t.status === col.id).length}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.filter(t => t.status === col.id).map(task => (
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', flex: 1 }}>Abrir</button>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>Vacío</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{task.title} {task.recurringGroupId && <span className="badge badge-pending" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>Periódica</span>}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>📍 {task.location} • 👤 {task.assignedTo?.name || 'Sin Asignar'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                 <span className={`badge ${task.status === 'completed' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                    {task.status === 'completed' ? 'Completada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                 </span>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 1rem', fontSize: '0.875rem' }}>Editar</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {Object.entries(
            tasks.reduce((acc, task) => {
              const d = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Sin fecha';
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
                  <div key={task.id} onClick={() => setEditingTask(task)} style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                      <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.assignedTo?.name || 'Sin Asignar'}</span>
                    </div>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: task.status === 'completed' ? 'var(--success)' : task.status === 'in-progress' ? 'var(--warning)' : 'var(--error)' }} title={task.status}></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
