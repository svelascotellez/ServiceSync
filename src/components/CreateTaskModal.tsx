"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Worker {
  id: string;
  name: string;
  workerType?: string | null;
}

interface CreateTaskModalProps {
  workers: Worker[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTaskModal({ workers, isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    assignedToId: '',
    priority: 'Media',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear tarea');
      }

      setFormData({ title: '', description: '', location: '', assignedToId: '', priority: 'Media' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '500px', backgroundColor: 'var(--surface)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Crear Nueva Tarea</h2>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Título de la Tarea</label>
            <input required type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Descripción</label>
            <textarea className="input-field" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Ubicación</label>
            <input required type="text" className="input-field" placeholder="Ej. Edificio A, Piso 1" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">Asignar a Trabajador</label>
            <select required className="input-field" value={formData.assignedToId} onChange={(e) => setFormData({...formData, assignedToId: e.target.value})}>
              <option value="">Selecciona un trabajador...</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.workerType || 'General'})</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Prioridad</label>
            <select className="input-field" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
