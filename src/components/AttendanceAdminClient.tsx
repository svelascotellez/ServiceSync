"use client";

import { useState } from 'react';
import { ExcelColumnHeader } from '@/components/ExcelColumnHeader';
import { ExportExcelButton } from '@/components/ExportExcelButton';
import { formatCancunDate, formatCancunTime } from '@/lib/dateUtils';

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  evaluation: string | null;
  checkInPhotoUrl: string | null;
  checkInLat: number | null;
  checkInLng: number | null;
  checkOutPhotoUrl: string | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  worker: {
    id: string;
    name: string;
    email: string;
    photoUrl: string | null;
    workerType: string | null;
  };
}

export function AttendanceAdminClient({ attendances }: { attendances: AttendanceRecord[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState('all');
  const [workerTypeFilter, setWorkerTypeFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Selected photo modal state
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; time?: string; lat?: number | null; lng?: number | null } | null>(null);

  // Extract unique worker types
  const uniqueWorkerTypes = Array.from(
    new Set(attendances.map(a => a.worker?.workerType || 'General'))
  ).filter(Boolean);

  const filteredAttendances = attendances
    .filter(att => {
      // Evaluation filter
      if (evaluationFilter !== 'all') {
        if (evaluationFilter === 'active' && att.checkOutTime !== null) return false;
        if (evaluationFilter !== 'active' && att.evaluation !== evaluationFilter) return false;
      }

      // Worker type filter
      const type = att.worker?.workerType || 'General';
      if (workerTypeFilter !== 'all' && type !== workerTypeFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = att.worker?.name?.toLowerCase().includes(q);
        const typeMatch = type.toLowerCase().includes(q);
        const evalMatch = (att.evaluation || '').toLowerCase().includes(q);
        if (!nameMatch && !typeMatch && !evalMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let res = 0;
      if (sortColumn === 'date') {
        const tA = new Date(a.date).getTime();
        const tB = new Date(b.date).getTime();
        res = tA - tB;
      } else if (sortColumn === 'worker') {
        res = (a.worker?.name || '').localeCompare(b.worker?.name || '');
      } else if (sortColumn === 'workerType') {
        res = (a.worker?.workerType || 'General').localeCompare(b.worker?.workerType || 'General');
      } else if (sortColumn === 'checkInTime') {
        const tA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
        const tB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
        res = tA - tB;
      } else if (sortColumn === 'evaluation') {
        res = (a.evaluation || '').localeCompare(b.evaluation || '');
      }
      return sortOrder === 'asc' ? res : -res;
    });

  // Calculate stats metrics
  const totalCount = attendances.length;
  const onTimeCount = attendances.filter(a => a.evaluation === 'A Tiempo').length;
  const lateCount = attendances.filter(a => a.evaluation === 'Retardo').length;
  const activeCount = attendances.filter(a => a.checkInTime && !a.checkOutTime).length;

  const attendanceExportData = filteredAttendances.map(att => ({
    'ID Registro': att.id,
    'Trabajador': att.worker?.name || 'Desconocido',
    'Correo Electrónico': att.worker?.email || 'N/A',
    'Tipo de Servicio': att.worker?.workerType || 'General',
    'Fecha (Cancún)': formatCancunDate(att.date),
    'Hora Entrada (Cancún)': att.checkInTime ? formatCancunTime(att.checkInTime) : 'N/A',
    'Hora Salida (Cancún)': att.checkOutTime ? formatCancunTime(att.checkOutTime) : 'En Turno',
    'Evaluación Puntualidad': att.evaluation || (att.checkInTime && !att.checkOutTime ? 'En Turno' : 'Sin Evaluación'),
    'Coordenadas GPS Entrada': att.checkInLat ? `${att.checkInLat.toFixed(5)}, ${att.checkInLng?.toFixed(5)}` : 'No registrada',
    'Coordenadas GPS Salida': att.checkOutLat ? `${att.checkOutLat.toFixed(5)}, ${att.checkOutLng?.toFixed(5)}` : 'No registrada',
    'Foto Entrada (URL)': att.checkInPhotoUrl || 'Sin foto',
    'Foto Salida (URL)': att.checkOutPhotoUrl || 'Sin foto'
  }));

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Control de Asistencia del Personal</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Supervisa entradas, salidas, puntualidad y geolocalización GPS en Cancún.</p>
        </div>
        <div>
          <ExportExcelButton 
            data={attendanceExportData} 
            filename="Reporte_Asistencia_Personal_ServiceSync" 
            sheetName="Asistencias" 
            buttonText="📊 Exportar Reporte Excel" 
          />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Registros</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{totalCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>A Tiempo</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>{onTimeCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>Retardos Registrados</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>{lateCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'var(--surface)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>En Turno Activo</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)', marginTop: '0.25rem' }}>{activeCount}</div>
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
        <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔍</span>
          <input 
            type="text"
            className="input-field"
            placeholder="Buscar por nombre, especialidad o estado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Evaluación:</span>
          <select 
            className="input-field" 
            value={evaluationFilter}
            onChange={(e) => setEvaluationFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            <option value="all">Todas</option>
            <option value="A Tiempo">A Tiempo</option>
            <option value="Retardo">Retardo</option>
            <option value="active">En Turno Activo</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Especialidad:</span>
          <select 
            className="input-field" 
            value={workerTypeFilter}
            onChange={(e) => setWorkerTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            <option value="all">Todas las especialidades</option>
            {uniqueWorkerTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--surface-hover)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Trabajador"
                  columnKey="worker"
                  uniqueValues={[]}
                  selectedValues={[]}
                  onFilterChange={() => {}}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>
              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Especialidad"
                  columnKey="workerType"
                  uniqueValues={uniqueWorkerTypes}
                  selectedValues={workerTypeFilter === 'all' ? [] : [workerTypeFilter]}
                  onFilterChange={(vals) => setWorkerTypeFilter(vals.length === 1 ? vals[0] : 'all')}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>
              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Fecha (Cancún)"
                  columnKey="date"
                  uniqueValues={[]}
                  selectedValues={[]}
                  onFilterChange={() => {}}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>
              <th style={{ padding: '0.85rem 1rem' }}>Entrada (Check-In)</th>
              <th style={{ padding: '0.85rem 1rem' }}>Salida (Check-Out)</th>
              <th style={{ padding: '0.85rem 1rem' }}>
                <ExcelColumnHeader 
                  title="Puntualidad"
                  columnKey="evaluation"
                  uniqueValues={['A Tiempo', 'Retardo']}
                  selectedValues={evaluationFilter === 'all' ? [] : [evaluationFilter]}
                  onFilterChange={(vals) => setEvaluationFilter(vals.length === 1 ? vals[0] : 'all')}
                  currentSort={{ column: sortColumn, order: sortOrder }}
                  onSortChange={(col, order) => { setSortColumn(col); setSortOrder(order); }}
                />
              </th>
              <th style={{ padding: '0.85rem 1rem' }}>Ubicación GPS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendances.map((att) => (
              <tr key={att.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', overflow: 'hidden' }}>
                      {att.worker?.photoUrl ? (
                        <img src={att.worker.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        att.worker?.name ? att.worker.name.charAt(0) : 'W'
                      )}
                    </div>
                    <div>
                      <div>{att.worker?.name || 'Desconocido'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{att.worker?.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                  <span className="badge badge-pending">{att.worker?.workerType || 'General'}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  {formatCancunDate(att.date)}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {att.checkInPhotoUrl && (
                      <img 
                        src={att.checkInPhotoUrl} 
                        alt="Entrada" 
                        onClick={() => setPreviewPhoto({
                          url: att.checkInPhotoUrl!,
                          title: `Entrada: ${att.worker?.name}`,
                          time: att.checkInTime ? formatCancunTime(att.checkInTime) : undefined,
                          lat: att.checkInLat,
                          lng: att.checkInLng
                        })}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '0.35rem', cursor: 'pointer', border: '1px solid var(--border)' }} 
                        title="Hacer clic para ampliar foto de Entrada" 
                      />
                    )}
                    <div>
                      {att.checkInTime ? (
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>⏰ {formatCancunTime(att.checkInTime)}</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {att.checkOutPhotoUrl && (
                      <img 
                        src={att.checkOutPhotoUrl} 
                        alt="Salida" 
                        onClick={() => setPreviewPhoto({
                          url: att.checkOutPhotoUrl!,
                          title: `Salida: ${att.worker?.name}`,
                          time: att.checkOutTime ? formatCancunTime(att.checkOutTime) : undefined,
                          lat: att.checkOutLat,
                          lng: att.checkOutLng
                        })}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '0.35rem', cursor: 'pointer', border: '1px solid var(--border)' }} 
                        title="Hacer clic para ampliar foto de Salida" 
                      />
                    )}
                    <div>
                      {att.checkOutTime ? (
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>⏰ {formatCancunTime(att.checkOutTime)}</span>
                      ) : (
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>En Turno</span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className={`badge ${att.evaluation === 'A Tiempo' ? 'badge-success' : att.evaluation === 'Retardo' ? 'badge-pending' : 'badge-completed'}`}>
                    {att.evaluation || (att.checkInTime && !att.checkOutTime ? 'En Turno' : 'Sin Evaluación')}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {att.checkInLat ? (
                      <a 
                        href={`https://www.google.com/maps?q=${att.checkInLat},${att.checkInLng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        📍 Entrada: {att.checkInLat.toFixed(4)}, {att.checkInLng?.toFixed(4)}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Sin GPS Entrada</span>
                    )}

                    {att.checkOutLat ? (
                      <a 
                        href={`https://www.google.com/maps?q=${att.checkOutLat},${att.checkOutLng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        📍 Salida: {att.checkOutLat.toFixed(4)}, {att.checkOutLng?.toFixed(4)}
                      </a>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAttendances.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No se encontraron registros de asistencia con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="glass-panel" style={{ backgroundColor: 'var(--surface)', maxWidth: '500px', width: '100%', padding: '1.5rem', position: 'relative' }}>
            <button 
              onClick={() => setPreviewPhoto(null)} 
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>{previewPhoto.title}</h3>
            <img src={previewPhoto.url} alt="Foto Ampliada" style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              {previewPhoto.time && <div>⏰ Hora Cancún: <strong>{previewPhoto.time}</strong></div>}
              {previewPhoto.lat && (
                <a 
                  href={`https://www.google.com/maps?q=${previewPhoto.lat},${previewPhoto.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}
                >
                  📍 Ver en Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
