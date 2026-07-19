"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditWorkerTypeModal } from '@/components/EditWorkerTypeModal';

interface WorkerType {
  id: string;
  name: string;
}

export default function SettingsClient({ initialWorkerTypes }: { initialWorkerTypes: WorkerType[] }) {
  const [workerTypes, setWorkerTypes] = useState<WorkerType[]>(initialWorkerTypes);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingType, setEditingType] = useState<any>(null);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/worker-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setWorkerTypes([...workerTypes, data.workerType].sort((a, b) => a.name.localeCompare(b.name)));
        setNewName('');
        router.refresh();
      } else {
        setError(data.error || 'Error al añadir el tipo');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este tipo?')) return;
    
    try {
      const res = await fetch(`/api/worker-types/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setWorkerTypes(workerTypes.filter(wt => wt.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el tipo');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configuración</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Administra los catálogos del sistema.</p>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Catálogo de Tipos de Trabajador</h2>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Nuevo tipo (ej. Plomero)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !newName.trim()}>
            {loading ? 'Añadiendo...' : 'Añadir'}
          </button>
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Nombre</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {workerTypes.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay tipos de trabajador definidos.
                </td>
              </tr>
            ) : (
              workerTypes.map((wt) => (
                <tr key={wt.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{wt.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => setEditingType(wt)} className="btn btn-outline" style={{ marginRight: '0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(wt.id)} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditWorkerTypeModal
        isOpen={!!editingType}
        onClose={() => setEditingType(null)}
        onSuccess={() => router.refresh()}
        initialData={editingType}
      />
    </div>
  );
}
