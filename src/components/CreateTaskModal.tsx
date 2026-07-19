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
    dueDate: new Date().toISOString().split('T')[0],
    recurrence: 'once',
    recurringDays: [] as number[],
    isUnlimited: true,
    recurringEndDate: '',
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
      const payload = {
        ...formData,
        recurringDays: JSON.stringify(formData.recurringDays),
        recurringEndDate: formData.recurrence === 'recurring' && !formData.isUnlimited ? formData.recurringEndDate : null,
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear tarea');
      }

      setFormData({ 
        title: '', description: '', location: '', assignedToId: '', priority: 'Media',
        dueDate: new Date().toISOString().split('T')[0], recurrence: 'once', recurringDays: [], isUnlimited: true, recurringEndDate: ''
      });
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

          <div className="input-group">
            <label className="input-label">Fecha Programada (Inicio)</label>
            <input required type="date" className="input-field" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
          </div>

          <div className="input-group">
            <label className="input-label">Frecuencia</label>
            <select className="input-field" value={formData.recurrence} onChange={(e) => setFormData({...formData, recurrence: e.target.value})}>
              <option value="once">Única (Se realiza una sola vez)</option>
              <option value="recurring">Periódica (Se repite varios días)</option>
            </select>
          </div>

          {formData.recurrence === 'recurring' && (
            <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label" style={{ marginBottom: '0.5rem' }}>Días de la semana</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { val: 1, label: 'L' }, { val: 2, label: 'M' }, { val: 3, label: 'X' },
                    { val: 4, label: 'J' }, { val: 5, label: 'V' }, { val: 6, label: 'S' }, { val: 0, label: 'D' }
                  ].map(day => (
                    <label key={day.val} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', borderRadius: '0.25rem', backgroundColor: formData.recurringDays.includes(day.val) ? 'var(--primary)' : 'transparent', color: formData.recurringDays.includes(day.val) ? 'white' : 'inherit' }}>
                      <input 
                        type="checkbox" 
                        style={{ display: 'none' }}
                        checked={formData.recurringDays.includes(day.val)}
                        onChange={(e) => {
                          if (e.target.checked) setFormData({ ...formData, recurringDays: [...formData.recurringDays, day.val] });
                          else setFormData({ ...formData, recurringDays: formData.recurringDays.filter(d => d !== day.val) });
                        }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">¿Hasta cuándo se repite?</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="isUnlimited" checked={formData.isUnlimited} onChange={() => setFormData({...formData, isUnlimited: true})} />
                    Ilimitada (Próximos 6 meses)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="isUnlimited" checked={!formData.isUnlimited} onChange={() => setFormData({...formData, isUnlimited: false})} />
                    Fecha específica
                  </label>
                </div>
              </div>

              {!formData.isUnlimited && (
                <div className="input-group">
                  <label className="input-label">Fecha de fin</label>
                  <input required type="date" min={formData.dueDate} className="input-field" value={formData.recurringEndDate} onChange={(e) => setFormData({...formData, recurringEndDate: e.target.value})} />
                </div>
              )}
            </div>
          )}

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
