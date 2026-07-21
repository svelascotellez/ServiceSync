"use client";

import Link from 'next/link';

export default function AttendanceClient({ attendances }: { attendances: any[] }) {
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Historial de Asistencia</h1>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {attendances.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fecha</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Entrada</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Salida</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Ubicación (Coordenadas)</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Selfies</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((att) => (
                <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem' }}>{new Date(att.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {att.checkInLat ? <span>Entrada: {att.checkInLat.toFixed(5)}, {att.checkInLng?.toFixed(5)}</span> : null}
                      {att.checkOutLat ? <span>Salida: {att.checkOutLat.toFixed(5)}, {att.checkOutLng?.toFixed(5)}</span> : null}
                      {!att.checkInLat && !att.checkOutLat && <span style={{ color: 'var(--text-secondary)' }}>No registradas</span>}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {att.checkInPhotoUrl && (
                        <a href={att.checkInPhotoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', border: '1px solid var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>Entrada</a>
                      )}
                      {att.checkOutPhotoUrl && (
                        <a href={att.checkOutPhotoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--success)', textDecoration: 'none', border: '1px solid var(--success)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>Salida</a>
                      )}
                      {!att.checkInPhotoUrl && !att.checkOutPhotoUrl && '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No hay registros de asistencia recientes.</p>
        )}
      </div>
    </div>
  );
}
