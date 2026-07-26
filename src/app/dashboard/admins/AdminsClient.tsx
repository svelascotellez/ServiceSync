"use client";

import { useState } from 'react';
import { AddUserModal } from '@/components/AddUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { useRouter } from 'next/navigation';

export default function AdminsClient({ admins }: { admins: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
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

  const filteredAdmins = admins
    .filter(admin => {
      if (roleFilter !== 'all' && admin.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = admin.name?.toLowerCase().includes(q);
        const emailMatch = admin.email?.toLowerCase().includes(q);
        const phoneMatch = admin.phone?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let res = 0;
      if (sortColumn === 'name') {
        res = (a.name || '').localeCompare(b.name || '');
      } else if (sortColumn === 'email') {
        res = (a.email || '').localeCompare(b.email || '');
      } else if (sortColumn === 'role') {
        res = (a.role || '').localeCompare(b.role || '');
      } else if (sortColumn === 'phone') {
        res = (a.phone || '').localeCompare(b.phone || '');
      } else if (sortColumn === 'createdAt') {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        res = tA - tB;
      }
      return sortOrder === 'asc' ? res : -res;
    });

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar a este administrador? Esta acción no se puede deshacer.')) return;
    
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Directorio de Administradores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Administra a los usuarios con permisos de administración total.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Añadir Administrador</button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔍</span>
          <input 
            type="text"
            className="input-field"
            placeholder="Buscar administrador por nombre, correo o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          />
        </div>
        {(searchQuery || roleFilter !== 'all' || sortColumn !== 'name' || sortOrder !== 'asc') && (
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('all');
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
            📊 Tabla Tipo Excel • Mostrando {filteredAdmins.length} de {admins.length} administradores
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
                  <span style={{ fontWeight: 700 }}>Usuario {sortColumn === 'name' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('role')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Rol {sortColumn === 'role' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('email')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Correo Electrónico {sortColumn === 'email' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('phone')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Teléfono {sortColumn === 'phone' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>Fecha Registro {sortColumn === 'createdAt' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>🔻</span>
                </div>
              </th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map(admin => (
              <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem', overflow: 'hidden' }}>
                      {admin.photoUrl ? (
                        <img src={admin.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        admin.name ? admin.name.charAt(0) : 'A'
                      )}
                    </div>
                    {admin.name}
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge badge-completed">
                    Administrador
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{admin.email}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{admin.phone || 'N/A'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => setEditingAdmin(admin)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(admin.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron administradores con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal 
        role="admin" 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => router.refresh()} 
      />

      <EditUserModal 
        role="admin"
        isOpen={!!editingAdmin}
        initialData={editingAdmin}
        onClose={() => setEditingAdmin(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
