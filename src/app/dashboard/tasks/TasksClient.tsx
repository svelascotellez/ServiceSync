"use client";

import { useState } from 'react';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useRouter } from 'next/navigation';

export default function TasksClient({ tasks, workers }: { tasks: any[], workers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Gestión de Tareas</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Supervisa y asigna tareas al personal.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Crear Tarea</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Título</th>
              <th style={{ padding: '1rem' }}>Ubicación</th>
              <th style={{ padding: '1rem' }}>Trabajador Asignado</th>
              <th style={{ padding: '1rem' }}>Prioridad</th>
              <th style={{ padding: '1rem' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  {task.title}
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
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay tareas creadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateTaskModal 
        workers={workers}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          router.refresh();
        }} 
      />
    </div>
  );
}
