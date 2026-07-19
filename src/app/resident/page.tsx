"use client";

import { useState } from 'react';

export default function ResidentDashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Limpiar el vestíbulo principal', worker: 'Maria G.', status: 'completed', rating: 0, rated: false },
    { id: 2, title: 'Desinfectar elevadores', worker: 'Maria G.', status: 'pending', rating: 0, rated: false },
    { id: 3, title: 'Corte de césped', worker: 'Carlos S.', status: 'completed', rating: 5, rated: true },
  ]);

  const handleRate = (taskId: number, rating: number) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, rating, rated: true } : t));
    // Here we would normally make a POST request to /api/tasks/${taskId}/rate
    alert(`¡Gracias por calificar esta tarea con ${rating} estrellas!`);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Actividad de la Comunidad</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Mira lo que está sucediendo a tu alrededor.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map(task => (
          <div key={task.id} className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1rem', color: task.status === 'completed' ? 'var(--text)' : 'var(--text-secondary)' }}>
                  {task.title}
                </h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Por: {task.worker} • Estado: {task.status === 'completed' ? '✅ Hecho' : '⏳ En Progreso'}
                </div>
              </div>
            </div>
            
            {task.status === 'completed' && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {task.rated ? 'Tu Calificación:' : 'Califica este trabajo:'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      onClick={() => !task.rated && handleRate(task.id, star)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '1.5rem', 
                        cursor: task.rated ? 'default' : 'pointer',
                        color: star <= task.rating ? '#F59E0B' : 'var(--text-secondary)',
                        opacity: star <= task.rating || !task.rated ? 1 : 0.3
                      }}
                      disabled={task.rated}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
