"use client";

import { useState } from 'react';
import { ExcelUpload } from '@/components/ExcelUpload';
import { AddUserModal } from '@/components/AddUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { useRouter } from 'next/navigation';

export default function ResidentsClient({ residents }: { residents: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort State
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const router = useRouter();

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const filteredResidents = residents
    .filter(resident => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = resident.name?.toLowerCase().includes(q);
        const apartmentMatch = resident.apartment?.toLowerCase().includes(q);
        const emailMatch = resident.email?.toLowerCase().includes(q);
        if (!nameMatch && !apartmentMatch && !emailMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let res = 0;
      if (sortColumn === 'name') {
        res = (a.name || '').localeCompare(b.name || '');
      } else if (sortColumn === 'apartment') {
        res = (a.apartment || 'N/A').localeCompare(b.apartment || 'N/A');
      } else if (sortColumn === 'email') {
        res = (a.email || '').localeCompare(b.email || '');
      }
      return sortOrder === 'asc' ? res : -res;
    });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Directorio de Residentes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Administra a los residentes de la comunidad y sus solicitudes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExcelUpload role="resident" onSuccess={() => router.refresh()} />
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Añadir Residente</button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔍</span>
          <input 
            type="text"
            className="input-field"
            placeholder="Buscar residente por nombre, unidad/apartamento o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          />
        </div>
        {(searchQuery || sortColumn !== 'name' || sortOrder !== 'asc') && (
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSearchQuery('');
              setSortColumn('name');
              setSortOrder('asc');
            }}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'var(--error)' }}
          >
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
            📊 Tabla Tipo Excel • Mostrando {filteredResidents.length} de {residents.length} residentes
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            💡 Haz clic en los encabezados para ordenar la tabla.
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--surface-hover)', userSelect: 'none' }}>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Nombre del Residente {sortColumn === 'name' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>

              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('apartment')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Unidad / Apartamento {sortColumn === 'apartment' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>

              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Correo Electrónico {sortColumn === 'email' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>

              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.map(resident => (
              <tr key={resident.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{resident.name}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    {resident.apartment || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{resident.email}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => setEditingResident(resident)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(resident.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {filteredResidents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron residentes con los filtros aplicados.
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
