"use client";

import { useState } from 'react';
import { AddUserModal } from '@/components/AddUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { useRouter } from 'next/navigation';

export default function SupervisorsClient({ supervisors }: { supervisors: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<any>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este supervisor? Esta acción no se puede deshacer.')) return;
    
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Directorio de Supervisores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Administra el personal con permisos de supervisión de campo y asignación de tareas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-gold" onClick={() => setIsAddModalOpen(true)}>+ Añadir Supervisor</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Supervisor</th>
              <th style={{ padding: '1rem' }}>Rol</th>
              <th style={{ padding: '1rem' }}>Correo Electrónico</th>
              <th style={{ padding: '1rem' }}>Teléfono</th>
              <th style={{ padding: '1rem' }}>Fecha Registro</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map(sup => (
              <tr key={sup.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--gold)', color: '#081C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', overflow: 'hidden' }}>
                      {sup.photoUrl ? (
                        <img src={sup.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        sup.name ? sup.name.charAt(0) : 'S'
                      )}
                    </div>
                    {sup.name}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-gold">
                    Supervisor
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{sup.email}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{sup.phone || 'N/A'}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(sup.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => setEditingSupervisor(sup)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(sup.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {supervisors.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay supervisores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal 
        role="supervisor" 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => router.refresh()} 
      />

      <EditUserModal 
        role="supervisor"
        isOpen={!!editingSupervisor}
        initialData={editingSupervisor}
        onClose={() => setEditingSupervisor(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
