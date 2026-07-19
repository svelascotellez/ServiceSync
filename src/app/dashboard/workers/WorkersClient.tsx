"use client";

import { useState } from 'react';
import { ExcelUpload } from '@/components/ExcelUpload';
import { AddUserModal } from '@/components/AddUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { useRouter } from 'next/navigation';

export default function WorkersClient({ workers }: { workers: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este trabajador? Esta acción no se puede deshacer.')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Directorio de Trabajadores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Administra tu personal de servicio.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExcelUpload role="worker" onSuccess={() => router.refresh()} />
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Añadir Trabajador</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Trabajador</th>
              <th style={{ padding: '1rem' }}>Tipo</th>
              <th style={{ padding: '1rem' }}>Correo Electrónico</th>
              <th style={{ padding: '1rem' }}>Teléfono</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(worker => (
              <tr key={worker.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', overflow: 'hidden' }}>
                      {worker.photoUrl ? (
                        <img src={worker.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        worker.name.charAt(0)
                      )}
                    </div>
                    {worker.name}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{worker.workerType || 'General'}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{worker.email}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{worker.phone || 'N/A'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => setEditingWorker(worker)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(worker.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay trabajadores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal 
        role="worker" 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => router.refresh()} 
      />

      <EditUserModal 
        role="worker"
        isOpen={!!editingWorker}
        initialData={editingWorker}
        onClose={() => setEditingWorker(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
