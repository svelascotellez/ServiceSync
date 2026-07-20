"use client";

import { useState } from 'react';
import { TaskComments } from '@/components/TaskComments';
import { createPortal } from 'react-dom';

export default function ResidentClient({ tasks: initialTasks }: { tasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleRate = async (taskId: string, rating: number) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, rating } : t));
    
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const modalContent = selectedTask && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '600px', backgroundColor: 'var(--surface)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Detalles de la Tarea</h2>
          <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedTask.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{selectedTask.description}</p>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>📍 <strong>Ubicación:</strong> {selectedTask.location}</div>
            <div>👤 <strong>Trabajador:</strong> {selectedTask.assignedTo?.name || 'No asignado'}</div>
            <div>
              <strong>Estado:</strong>{' '}
              <span className={`badge ${selectedTask.status === 'completed' ? 'badge-completed' : selectedTask.status === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                {selectedTask.status === 'completed' ? 'Por Revisar' : selectedTask.status === 'approved' ? 'Aprobada' : selectedTask.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        {(selectedTask.status === 'completed' || selectedTask.status === 'approved') && (
          <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              {selectedTask.rating ? 'Tu Calificación:' : 'Califica este trabajo:'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star}
                  onClick={() => !selectedTask.rating && handleRate(selectedTask.id, star)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.5rem', 
                    cursor: selectedTask.rating ? 'default' : 'pointer',
                    color: star <= (selectedTask.rating || 0) ? '#F59E0B' : 'var(--text-secondary)',
                    opacity: star <= (selectedTask.rating || 0) || !selectedTask.rating ? 1 : 0.3
                  }}
                  disabled={!!selectedTask.rating}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        <TaskComments taskId={selectedTask.id} />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Actividad de la Comunidad</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Mira lo que está sucediendo a tu alrededor y deja comentarios.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map(task => (
          <div key={task.id} onClick={() => setSelectedTask(task)} className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '1.1rem', color: task.status === 'completed' || task.status === 'approved' ? 'var(--text)' : 'var(--text-secondary)' }}>
                {task.title}
              </h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                📍 {task.location} • 👤 {task.assignedTo?.name || 'Sin Asignar'}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span className={`badge ${task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                {task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
              </span>
              {task.rating && (
                <div style={{ color: '#F59E0B', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {'★'.repeat(task.rating)}
                </div>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay tareas recientes en la comunidad.</div>
        )}
      </div>

      {selectedTask && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </div>
  );
}
