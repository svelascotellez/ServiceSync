"use client";

import { useState } from 'react';
import { ExcelUpload } from '@/components/ExcelUpload';
import { AddUserModal } from '@/components/AddUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { ExcelColumnHeader } from '@/components/ExcelColumnHeader';
import { ExportExcelButton } from '@/components/ExportExcelButton';
import { useRouter } from 'next/navigation';

export default function WorkersClient({ workers }: { workers: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
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

  // Extract unique worker types for Excel header filter
  const uniqueWorkerTypes = Array.from(new Set(workers.map(w => w.workerType || 'General'))).filter(Boolean);

  const filteredWorkers = workers
    .filter(worker => {
      const type = worker.workerType || 'General';
      if (typeFilter !== 'all' && type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = worker.name?.toLowerCase().includes(q);
        const emailMatch = worker.email?.toLowerCase().includes(q);
        const phoneMatch = worker.phone?.toLowerCase().includes(q);
        const typeMatch = type.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch && !typeMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let res = 0;
      if (sortColumn === 'name') {
        res = (a.name || '').localeCompare(b.name || '');
      } else if (sortColumn === 'type') {
        res = (a.workerType || 'General').localeCompare(b.workerType || 'General');
      } else if (sortColumn === 'email') {
        res = (a.email || '').localeCompare(b.email || '');
      } else if (sortColumn === 'phone') {
        res = (a.phone || '').localeCompare(b.phone || '');
      }
      return sortOrder === 'asc' ? res : -res;
    });

  const workerExportData = filteredWorkers.map(w => ({
    'Nombre': w.name,
    'Tipo de Servicio': w.workerType || 'General',
    'Correo Electrónico': w.email,
    'Teléfono': w.phone || 'N/A'
  }));

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Directorio de Trabajadores</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Administra tu personal de servicio.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <ExcelUpload role="worker" onSuccess={() => router.refresh()} />
          <ExportExcelButton data={workerExportData} filename="Reporte_Trabajadores_ServiceSync" sheetName="Trabajadores" buttonText="📊 Exportar Excel" />
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Añadir Trabajador</button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔍</span>
          <input 
            type="text"
            className="input-field"
            placeholder="Buscar trabajador por nombre, tipo, correo o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tipo:</span>
          <select 
            className="input-field" 
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos los Tipos</option>
            {uniqueWorkerTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {(searchQuery || typeFilter !== 'all' || sortColumn !== 'name' || sortOrder !== 'asc') && (
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
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
            📊 Tabla Tipo Excel • Mostrando {filteredWorkers.length} de {workers.length} trabajadores
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            💡 Haz clic en los encabezados para ordenar o usa el botón 🔻 para filtrar por tipo.
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--surface-hover)', userSelect: 'none' }}>
              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Trabajador"
                  columnKey="name"
                  uniqueValues={Array.from(new Set(workers.map(w => w.name))).filter(Boolean)}
                  selectedValues={[]}
                  onFilterChange={() => {}}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>

              {/* Tipo Column Header with Excel Filter Popup */}
              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Tipo"
                  columnKey="type"
                  uniqueValues={uniqueWorkerTypes}
                  selectedValues={typeFilter === 'all' ? [] : [typeFilter]}
                  onFilterChange={(sel) => setTypeFilter(sel.length === 1 ? sel[0] : 'all')}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>

              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Correo Electrónico"
                  columnKey="email"
                  uniqueValues={Array.from(new Set(workers.map(w => w.email))).filter(Boolean)}
                  selectedValues={[]}
                  onFilterChange={() => {}}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>

              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Teléfono"
                  columnKey="phone"
                  uniqueValues={Array.from(new Set(workers.map(w => w.phone || 'N/A'))).filter(Boolean)}
                  selectedValues={[]}
                  onFilterChange={() => {}}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>

              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.map(worker => (
              <tr key={worker.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
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
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    {worker.workerType || 'General'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{worker.email}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{worker.phone || 'N/A'}</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => setEditingWorker(worker)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Editar</button>
                  <button onClick={() => handleDelete(worker.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {filteredWorkers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron trabajadores con los filtros aplicados.
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
