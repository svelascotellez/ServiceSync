"use client";

import { useState } from 'react';
import { formatCancunDate, formatCancunTime } from '@/lib/dateUtils';

interface WorkerDossierModalProps {
  worker: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    photoUrl?: string | null;
    workerType?: string | null;
    createdAt?: string | Date | null;
    assignedTasks?: any[];
    attendances?: any[];
  };
  onClose: () => void;
}

export function WorkerDossierModal({ worker, onClose }: WorkerDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'tasks' | 'attendance'>('summary');

  const tasks = worker.assignedTasks || [];
  const attendances = worker.attendances || [];

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;

  const totalAttendances = attendances.length;
  const onTimeAttendances = attendances.filter(a => a.evaluation === 'A Tiempo').length;
  const lateAttendances = attendances.filter(a => a.evaluation === 'Retardo').length;
  const punctualityRate = totalAttendances > 0 ? Math.round((onTimeAttendances / totalAttendances) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(8, 28, 44, 0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '0.5rem'
    }}>
      <div 
        className="glass-panel animate-fade-in printable-dossier" 
        style={{
          width: '100%',
          maxWidth: '850px',
          height: '92vh',
          maxHeight: '92vh',
          backgroundColor: 'var(--surface)',
          borderRadius: '1rem',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--gold)'
        }}
      >
        {/* Modal Fixed Top Header Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#081C2C',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🗂️</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)', margin: 0 }}>
              Expediente Digital del Trabajador
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--gold)', borderColor: 'var(--gold)' }}
            >
              🖨️ Imprimir
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0 0.5rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container (Worker Profile + Sticky Tab Bar + Content) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Worker Header Card */}
          <div style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--surface-hover)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap'
          }}>
            {/* Avatar Photo */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.75rem',
              overflow: 'hidden',
              border: '3px solid var(--gold)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}>
              {worker.photoUrl ? (
                <img src={worker.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                worker.name.charAt(0)
              )}
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{worker.name}</h1>
                <span className="badge badge-gold">{worker.workerType || 'General'}</span>
                <span className="badge badge-success">Activo</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem', marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>📧 <strong>Correo:</strong> {worker.email}</div>
                <div>📞 <strong>Teléfono:</strong> {worker.phone || 'No registrado'}</div>
                <div>📅 <strong>Fecha Registro:</strong> {formatCancunDate(worker.createdAt)}</div>
                <div>🆔 <strong>ID Sistema:</strong> <code style={{ fontSize: '0.75rem' }}>{worker.id.substring(0, 8)}...</code></div>
              </div>
            </div>
          </div>

          {/* Sticky Tab Bar (Horizontal Touch Scrollable on Mobile) */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--surface)',
            borderBottom: '2px solid var(--border)',
            display: 'flex',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            padding: '0 0.5rem'
          }}>
            <button 
              onClick={() => setActiveTab('summary')}
              style={{
                padding: '0.85rem 1.1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                background: 'none',
                flexShrink: 0,
                color: activeTab === 'summary' ? 'var(--gold)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'summary' ? '3px solid var(--gold)' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              📊 Resumen & Rendimiento
            </button>

            <button 
              onClick={() => setActiveTab('tasks')}
              style={{
                padding: '0.85rem 1.1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                background: 'none',
                flexShrink: 0,
                color: activeTab === 'tasks' ? 'var(--gold)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'tasks' ? '3px solid var(--gold)' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              📋 Historial de Tareas ({totalTasks})
            </button>

            <button 
              onClick={() => setActiveTab('attendance')}
              style={{
                padding: '0.85rem 1.1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                background: 'none',
                flexShrink: 0,
                color: activeTab === 'attendance' ? 'var(--gold)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'attendance' ? '3px solid var(--gold)' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              ⏱️ Asistencia y Puntualidad ({totalAttendances})
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div style={{ padding: '1.25rem' }}>
            {activeTab === 'summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* KPI Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tareas</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{totalTasks}</div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Completadas / Aprobadas</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>{completedTasks}</div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>Pendientes / En Progreso</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>{pendingTasks}</div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '0.5rem', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>Tasa de Puntualidad</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)', marginTop: '0.25rem' }}>{punctualityRate}%</div>
                  </div>
                </div>

                {/* Performance Analysis Box */}
                <div style={{ padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                    Evaluación de Desempeño General
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <strong>Puntualidad:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {onTimeAttendances} asistencias a tiempo de {totalAttendances} registros totales ({lateAttendances} retardos registrados).
                      </p>
                    </div>
                    <div>
                      <strong>Efectividad en Trabajo:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {completedTasks} tareas entregadas satisfactoriamente ({cancelledTasks} canceladas o reasignadas).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Este trabajador no tiene tareas asignadas aún.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '550px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem' }}>Título de Tarea</th>
                        <th style={{ padding: '0.6rem' }}>Ubicación</th>
                        <th style={{ padding: '0.6rem' }}>Prioridad</th>
                        <th style={{ padding: '0.6rem' }}>Estado</th>
                        <th style={{ padding: '0.6rem' }}>Fecha Límite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t: any) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.6rem', fontWeight: 600 }}>{t.title}</td>
                          <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>📍 {t.location}</td>
                          <td style={{ padding: '0.6rem', fontWeight: 700, color: t.priority === 'Alta' ? 'var(--error)' : 'var(--text-secondary)' }}>{t.priority}</td>
                          <td style={{ padding: '0.6rem' }}>
                            <span className={`badge ${t.status === 'cancelled' ? 'badge-cancelled' : t.status === 'completed' ? 'badge-completed' : t.status === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                              {t.status === 'cancelled' ? 'Cancelada' : t.status === 'completed' ? 'Por Revisar' : t.status === 'approved' ? 'Aprobada' : t.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{formatCancunDate(t.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {attendances.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    No existen registros de asistencia para este trabajador.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '550px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem' }}>Fecha (Cancún)</th>
                        <th style={{ padding: '0.6rem' }}>Entrada</th>
                        <th style={{ padding: '0.6rem' }}>Salida</th>
                        <th style={{ padding: '0.6rem' }}>Evaluación</th>
                        <th style={{ padding: '0.6rem' }}>Ubicación GPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendances.map((a: any) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.6rem', fontWeight: 600 }}>{formatCancunDate(a.date)}</td>
                          <td style={{ padding: '0.6rem' }}>{a.checkInTime ? formatCancunTime(a.checkInTime) : '-'}</td>
                          <td style={{ padding: '0.6rem' }}>{a.checkOutTime ? formatCancunTime(a.checkOutTime) : 'En Turno'}</td>
                          <td style={{ padding: '0.6rem' }}>
                            <span className={`badge ${a.evaluation === 'A Tiempo' ? 'badge-success' : a.evaluation === 'Retardo' ? 'badge-pending' : 'badge-completed'}`}>
                              {a.evaluation || 'En Turno'}
                            </span>
                          </td>
                          <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>
                            {a.checkInLat ? (
                              <a 
                                href={`https://www.google.com/maps?q=${a.checkInLat},${a.checkInLng}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                              >
                                📍 GPS ({a.checkInLat.toFixed(4)}, {a.checkInLng?.toFixed(4)})
                              </a>
                            ) : 'Sin GPS'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
