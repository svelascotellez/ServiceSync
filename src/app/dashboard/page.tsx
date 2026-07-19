import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const activeWorkersCount = await prisma.user.count({ where: { role: 'worker' } });
  const totalResidentsCount = await prisma.user.count({ where: { role: 'resident' } });

  // In a real app we would have a Task model, for now we will just use placeholders for tasks
  const stats = [
    { label: 'Total Trabajadores', value: activeWorkersCount.toString(), icon: '👷', color: 'var(--primary)' },
    { label: 'Total Residentes', value: totalResidentsCount.toString(), icon: '👥', color: 'var(--secondary)' },
    { label: 'Tareas Pendientes', value: '12', icon: '📋', color: 'var(--warning)' },
    { label: 'Problemas Reportados', value: '3', icon: '🚨', color: 'var(--error)' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Resumen</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Bienvenido de nuevo al Panel de Administración de ServiceSync.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: '2.5rem', backgroundColor: `${stat.color}22`, width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Actividad Reciente</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { time: 'Hace 10 mins', text: 'Maria G. registró su entrada (Limpieza)', type: 'checkin' },
              { time: 'Hace 1 hora', text: 'Carlos S. completó la Tarea #402', type: 'task' },
              { time: 'Hace 2 horas', text: 'Nuevo problema reportado en Apt 4B', type: 'issue' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: i !== 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activity.type === 'checkin' ? 'var(--success)' : activity.type === 'task' ? 'var(--primary)' : 'var(--error)', marginTop: '6px' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{activity.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worker Status Overview */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Estado de Trabajadores</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Activos (En Turno)</span>
                <span style={{ fontWeight: 600 }}>18</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--success)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Inactivos</span>
                <span style={{ fontWeight: 600 }}>6</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
