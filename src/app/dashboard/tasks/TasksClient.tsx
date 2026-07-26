"use client";

import { useState } from 'react';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { ExcelColumnHeader } from '@/components/ExcelColumnHeader';
import { useRouter } from 'next/navigation';

export default function TasksClient({ tasks, workers }: { tasks: any[], workers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'timeline' | 'table'>('kanban');
  
  // Filter States
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sort States
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const router = useRouter();

  const priorityWeight: Record<string, number> = { 'Alta': 3, 'Media': 2, 'Baja': 1 };

  const filteredTasks = tasks
    .filter(task => {
      // Worker filter
      if (selectedWorkerId === 'unassigned') {
        if (task.assignedTo) return false;
      } else if (selectedWorkerId !== 'all' && task.assignedTo?.id !== selectedWorkerId) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(q);
        const locMatch = task.location?.toLowerCase().includes(q);
        const workerMatch = task.assignedTo?.name?.toLowerCase().includes(q);
        if (!titleMatch && !locMatch && !workerMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let result = 0;
      if (sortBy === 'dueDate') {
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        result = timeA - timeB;
      } else if (sortBy === 'priority') {
        const wA = priorityWeight[a.priority] || 0;
        const wB = priorityWeight[b.priority] || 0;
        result = wB - wA;
      } else if (sortBy === 'title') {
        result = a.title.localeCompare(b.title);
      } else if (sortBy === 'createdAt') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        result = timeB - timeA;
      }

      return sortOrder === 'asc' ? result : -result;
    });

  const handleDelete = async (id: string, isRecurring: boolean) => {
    let url = `/api/tasks/${id}`;
    if (isRecurring) {
      const deleteSeries = confirm('Esta es una tarea periódica. ¿Deseas eliminar también TODAS las tareas futuras pendientes de esta serie?\n\n- OK: Eliminar serie futura\n- Cancelar: Eliminar solo esta tarea');
      if (deleteSeries) {
        url += '?deleteSeries=true';
      }
    } else {
      if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    }

    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la tarea');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Gestión de Tareas</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Supervisa, filtra y asigna tareas al personal.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--surface)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <button onClick={() => setViewMode('kanban')} className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Tablero</button>
            <button onClick={() => setViewMode('calendar')} className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Calendario</button>
            <button onClick={() => setViewMode('timeline')} className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Tarjetas</button>
            <button onClick={() => setViewMode('table')} className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`} style={{ border: 'none', padding: '0.5rem 1rem' }}>Lista</button>
          </div>
          <button className="btn btn-gold" onClick={() => setIsModalOpen(true)}>+ Crear Tarea</button>
        </div>
      </div>

      {/* Filter and Sorting Control Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🔍</span>
          <input 
            type="text"
            className="input-field"
            placeholder="Buscar por título, ubicación o trabajador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          />
        </div>

        {/* Worker Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Trabajador:</span>
          <select 
            className="input-field" 
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="unassigned">Sin Asignar</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Estado:</span>
          <select 
            className="input-field" 
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Progreso</option>
            <option value="completed">Por Revisar</option>
            <option value="approved">Aprobadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Prioridad:</span>
          <select 
            className="input-field" 
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ordenar por:</span>
          <select 
            className="input-field" 
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="dueDate">Fecha Límite</option>
            <option value="priority">Prioridad</option>
            <option value="title">Título</option>
            <option value="createdAt">Creación</option>
          </select>
          <button 
            className="btn btn-outline" 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}
            title="Cambiar dirección de orden"
          >
            {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
          </button>
        </div>

        {/* Reset Filters button */}
        {(selectedWorkerId !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery || sortBy !== 'dueDate' || sortOrder !== 'asc') && (
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSelectedWorkerId('all');
              setStatusFilter('all');
              setPriorityFilter('all');
              setSearchQuery('');
              setSortBy('dueDate');
              setSortOrder('asc');
            }}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'var(--error)' }}
          >
            ✕ Limpiar Filtros
          </button>
        )}
      </div>

      {viewMode === 'table' && (() => {
        const isColumnFiltered = (colKey: string) => {
          if (colKey === 'dueDate') return !!searchQuery || (sortBy === 'dueDate');
          if (colKey === 'worker') return selectedWorkerId !== 'all';
          if (colKey === 'status') return statusFilter !== 'all';
          if (colKey === 'priority') return priorityFilter !== 'all';
          return false;
        };

        const handleHeaderClick = (colKey: 'dueDate' | 'priority' | 'title' | 'createdAt') => {
          if (sortBy === colKey) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(colKey);
            setSortOrder('asc');
          }
        };

        return (
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                📊 Tabla Tipo Excel • Mostrando {filteredTasks.length} de {tasks.length} tareas
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                💡 Haz clic en los encabezados para ordenar o usa el botón 🔻 para filtrar por columna.
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--surface-hover)', userSelect: 'none' }}>
                  {/* Fecha Column */}
                  <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleHeaderClick('dueDate')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700 }}>Fecha {sortBy === 'dueDate' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                    </div>
                  </th>

                  {/* Título Column */}
                  <th style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} onClick={() => handleHeaderClick('title')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700 }}>Título {sortBy === 'title' ? (sortOrder === 'asc' ? '⬆️' : '⬇️') : ''}</span>
                    </div>
                  </th>

                  {/* Ubicación Column */}
                  <th style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 700 }}>Ubicación</span>
                  </th>

                  {/* Trabajador Asignado Column Header with Excel Filter Popup */}
                  <th style={{ padding: '0.85rem 1rem' }}>
                    <ExcelColumnHeader 
                      title="Trabajador"
                      columnKey="assignedTo"
                      uniqueValues={['unassigned', ...workers.map(w => w.id)]}
                      selectedValues={selectedWorkerId === 'all' ? [] : [selectedWorkerId]}
                      onFilterChange={(sel) => setSelectedWorkerId(sel.length === 1 ? sel[0] : 'all')}
                      currentSort={null}
                      onSortChange={() => {}}
                      displayFormatter={(id) => id === 'unassigned' ? 'Sin Asignar' : workers.find(w => w.id === id)?.name || id}
                    />
                  </th>

                  {/* Prioridad Column Header with Excel Filter Popup */}
                  <th style={{ padding: '0.85rem 1rem' }}>
                    <ExcelColumnHeader 
                      title="Prioridad"
                      columnKey="priority"
                      uniqueValues={['Alta', 'Media', 'Baja']}
                      selectedValues={priorityFilter === 'all' ? [] : [priorityFilter]}
                      onFilterChange={(sel) => setPriorityFilter(sel.length === 1 ? sel[0] : 'all')}
                      currentSort={{ column: sortBy, order: sortOrder }}
                      onSortChange={(col, order) => { setSortBy(col as any); setSortOrder(order); }}
                    />
                  </th>

                  {/* Estado Column Header with Excel Filter Popup */}
                  <th style={{ padding: '0.85rem 1rem' }}>
                    <ExcelColumnHeader 
                      title="Estado"
                      columnKey="status"
                      uniqueValues={['pending', 'in-progress', 'completed', 'approved', 'cancelled']}
                      selectedValues={statusFilter === 'all' ? [] : [statusFilter]}
                      onFilterChange={(sel) => setStatusFilter(sel.length === 1 ? sel[0] : 'all')}
                      currentSort={null}
                      onSortChange={() => {}}
                      displayFormatter={(s) => s === 'cancelled' ? 'Cancelada' : s === 'completed' ? 'Por Revisar' : s === 'approved' ? 'Aprobada' : s === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                    />
                  </th>

                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {task.title}
                      {task.recurringGroupId && <span className="badge badge-pending" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Periódica</span>}
                      {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{task.description}</div>}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{task.location}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{task.assignedTo ? task.assignedTo.name : 'Sin Asignar'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ 
                        fontWeight: 700,
                        color: task.priority === 'Alta' ? 'var(--error)' : task.priority === 'Media' ? 'var(--warning)' : 'var(--success)'
                      }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${task.status === 'cancelled' ? 'badge-cancelled' : task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                        {task.status === 'cancelled' ? 'Cancelada' : task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Editar</button>
                      <button onClick={() => handleDelete(task.id, !!task.recurringGroupId)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No se encontraron tareas con los filtros de columna aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })()}

      {viewMode === 'kanban' && (
        <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {[
            { id: 'pending', title: 'Pendientes' },
            { id: 'in-progress', title: 'En Progreso' },
            { id: 'completed', title: 'Por Revisar' },
            { id: 'approved', title: 'Aprobadas' },
            { id: 'cancelled', title: 'Canceladas' },
          ].map(col => (
            <div key={col.id} className="glass-panel" style={{ padding: '1.5rem', minHeight: '500px', backgroundColor: 'var(--surface)', flex: '0 0 320px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                {col.title} <span className="badge badge-pending">{filteredTasks.filter(t => t.status === col.id).length}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} style={{ backgroundColor: 'var(--background)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{task.title}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: task.priority === 'Alta' ? 'var(--error)' : 'var(--text-secondary)' }}>{task.priority}</span>
                    </div>
                    {task.recurringGroupId && <span className="badge badge-pending" style={{ fontSize: '0.65rem', marginBottom: '0.5rem', display: 'inline-block' }}>Periódica</span>}
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      👤 {task.assignedTo ? task.assignedTo.name : 'Sin Asignar'}
                    </div>
                    {(task.startPhotoUrl || task.endPhotoUrl) && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {task.startPhotoUrl && <img src={task.startPhotoUrl} alt="Inicio" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid var(--border)' }} title="Foto de Inicio" />}
                        {task.endPhotoUrl && <img src={task.endPhotoUrl} alt="Fin" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid var(--border)' }} title="Foto Final" />}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', flex: 1 }}>Abrir</button>
                    </div>
                  </div>
                ))}
                {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>Vacío</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {filteredTasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{task.title} {task.recurringGroupId && <span className="badge badge-pending" style={{ fontSize: '0.65rem', marginLeft: '0.5rem' }}>Periódica</span>}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>📍 {task.location} • 👤 {task.assignedTo?.name || 'Sin Asignar'}</div>
                {(task.startPhotoUrl || task.endPhotoUrl) && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    {task.startPhotoUrl && <img src={task.startPhotoUrl} alt="Inicio" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} title="Foto de Inicio" />}
                    {task.endPhotoUrl && <img src={task.endPhotoUrl} alt="Fin" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} title="Foto Final" />}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                 <span className={`badge ${task.status === 'cancelled' ? 'badge-cancelled' : task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                    {task.status === 'cancelled' ? 'Cancelada' : task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                 </span>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <button onClick={() => setEditingTask(task)} className="btn btn-outline" style={{ padding: '0.25rem 1rem', fontSize: '0.875rem' }}>Editar</button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (() => {
        const todayKey = new Date().toISOString().split('T')[0];
        const groups: Record<string, { dateObj: Date; isToday: boolean; label: string; tasks: any[] }> = {};

        // Always ensure Today's card exists
        const todayDate = new Date();
        const todayLabel = `HOY • ${todayDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}`;
        groups[todayKey] = {
          dateObj: todayDate,
          isToday: true,
          label: todayLabel,
          tasks: []
        };

        filteredTasks.forEach(task => {
          if (!task.dueDate) {
            const key = 'sin-fecha';
            if (!groups[key]) {
              groups[key] = { dateObj: new Date(0), isToday: false, label: 'Sin fecha programada', tasks: [] };
            }
            groups[key].tasks.push(task);
          } else {
            const d = new Date(task.dueDate);
            const key = d.toISOString().split('T')[0];
            const isToday = key === todayKey;
            if (!groups[key]) {
              const label = isToday
                ? `HOY • ${d.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })}`
                : d.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
              groups[key] = { dateObj: d, isToday, label, tasks: [] };
            }
            groups[key].tasks.push(task);
          }
        });

        const sortedGroups = Object.values(groups).sort((a, b) => {
          if (a.isToday) return -1;
          if (b.isToday) return 1;
          if (a.dateObj.getTime() === 0) return 1;
          if (b.dateObj.getTime() === 0) return -1;
          return a.dateObj.getTime() - b.dateObj.getTime();
        });

        return (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {sortedGroups.map(group => (
              <div 
                key={group.label} 
                className="glass-panel" 
                style={{ 
                  padding: '1.5rem', 
                  border: group.isToday ? '2px solid var(--gold)' : '1px solid var(--border)',
                  backgroundColor: group.isToday ? 'var(--gold-light)' : 'var(--surface)',
                  boxShadow: group.isToday ? '0 8px 20px rgba(197, 160, 89, 0.25)' : 'var(--shadow-md)',
                  position: 'relative'
                }}
              >
                {group.isToday && (
                  <div style={{ position: 'absolute', top: '-12px', right: '16px', backgroundColor: 'var(--gold)', color: '#081C2C', padding: '0.2rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    ★ Día Actual
                  </div>
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: group.isToday ? '#8C6826' : 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{group.label}</span>
                  <span className="badge badge-gold">{group.tasks.length} {group.tasks.length === 1 ? 'tarea' : 'tareas'}</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {group.tasks.map(task => (
                    <div key={task.id} onClick={() => setEditingTask(task)} style={{ fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                        <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>👤 {task.assignedTo?.name || 'Sin Asignar'}</span>
                      </div>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: task.status === 'cancelled' ? 'var(--error)' : task.status === 'approved' ? 'var(--success)' : task.status === 'completed' ? '#3B82F6' : task.status === 'in-progress' ? 'var(--warning)' : 'var(--text-secondary)' }} title={task.status}></span>
                    </div>
                  ))}
                  {group.tasks.length === 0 && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                      Sin tareas programadas para este día
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <CreateTaskModal 
        workers={workers}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          router.refresh();
        }} 
      />

      <EditTaskModal
        workers={workers}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSuccess={() => {
          router.refresh();
        }}
        initialData={editingTask}
      />
    </div>
  );
}
