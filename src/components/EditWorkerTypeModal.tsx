"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface EditWorkerTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: any; // { id, name, schedule (JSON string) }
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DEFAULT_SCHEDULE = DAYS.map((d, i) => ({
  day: i,
  active: i !== 0 && i !== 6, // Mon-Fri active by default
  start: '08:00',
  end: '17:00'
}));

export function EditWorkerTypeModal({ isOpen, onClose, onSuccess, initialData }: EditWorkerTypeModalProps) {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<any[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen && initialData) {
      setName(initialData.name || '');
      if (initialData.schedule) {
        try {
          const parsed = JSON.parse(initialData.schedule);
          if (Array.isArray(parsed) && parsed.length === 7) {
            setSchedule(parsed);
          } else {
            setSchedule(DEFAULT_SCHEDULE);
          }
        } catch {
          setSchedule(DEFAULT_SCHEDULE);
        }
      } else {
        setSchedule(DEFAULT_SCHEDULE);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/worker-types/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          schedule: JSON.stringify(schedule) 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (index: number, field: string, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '600px', backgroundColor: 'var(--surface)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          Configurar Horario ({name})
        </h2>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Nombre del Tipo</label>
            <input required type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1rem' }}>Horario Laboral</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {schedule.map((dayConfig, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', backgroundColor: dayConfig.active ? 'rgba(59,130,246,0.05)' : 'transparent', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '120px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={dayConfig.active} onChange={(e) => handleDayChange(i, 'active', e.target.checked)} />
                  <span style={{ fontWeight: dayConfig.active ? 600 : 400, color: dayConfig.active ? 'var(--text)' : 'var(--text-secondary)' }}>
                    {DAYS[i]}
                  </span>
                </label>

                {dayConfig.active ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                    <input type="time" className="input-field" style={{ padding: '0.25rem 0.5rem', flex: 1 }} value={dayConfig.start} onChange={(e) => handleDayChange(i, 'start', e.target.value)} required={dayConfig.active} />
                    <span>a</span>
                    <input type="time" className="input-field" style={{ padding: '0.25rem 0.5rem', flex: 1 }} value={dayConfig.end} onChange={(e) => handleDayChange(i, 'end', e.target.value)} required={dayConfig.active} />
                  </div>
                ) : (
                  <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                    Día de descanso
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
