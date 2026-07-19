"use client";

import { useState } from 'react';
import { ExcelUpload } from '@/components/ExcelUpload';
import { AddUserModal } from '@/components/AddUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { useRouter } from 'next/navigation';

export default function ResidentsClient({ residents }: { residents: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este residente? Esta acción no se puede deshacer.')) return;
    
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Directorio de Residentes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Administra a los residentes de la comunidad y sus solicitudes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExcelUpload role="resident" onSuccess={() => router.refresh()} />
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Añadir Residente</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Nombre del Residente</th>
              <th style={{ padding: '1rem' }}>Unidad / Apartamento</th>
              <th style={{ padding: '1rem' }}>Correo Electrónico</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {residents.map(resident => (
              <tr key={resident.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{resident.name}</td>
                <td style={{ padding: '1rem' }}>{resident.apartment || 'N/A'}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{resident.email}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => setEditingResident(resident)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(resident.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {residents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay residentes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal 
        role="resident" 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => router.refresh()} 
      />

      <EditUserModal 
        role="resident"
        isOpen={!!editingResident}
        initialData={editingResident}
        onClose={() => setEditingResident(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
