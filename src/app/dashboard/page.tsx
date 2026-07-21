import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const activeWorkersCount = await prisma.user.count({ where: { role: 'worker' } });
  const totalResidentsCount = await prisma.user.count({ where: { role: 'resident' } });

  const pendingTasksCount = await prisma.task.count({ where: { status: 'pending' } });
  const inProgressTasksCount = await prisma.task.count({ where: { status: 'in-progress' } });

  const stats = [
    { label: 'Total Trabajadores', value: activeWorkersCount.toString(), icon: '👷', color: 'var(--primary)' },
    { label: 'Total Residentes', value: totalResidentsCount.toString(), icon: '👥', color: 'var(--secondary)' },
    { label: 'Tareas Pendientes', value: pendingTasksCount.toString(), icon: '📋', color: 'var(--warning)' },
    { label: 'Tareas en Progreso', value: inProgressTasksCount.toString(), icon: '🚀', color: 'var(--success)' },
  ];

  // Fetch recent activity: latest completed tasks and recent check-ins
  const recentCompletedTasks = await prisma.task.findMany({
    where: { status: { in: ['completed', 'approved'] } },
    orderBy: { completedAt: 'desc' },
    take: 3,
    include: { assignedTo: true }
  });

  const recentAttendances = await prisma.attendance.findMany({
    orderBy: { checkInTime: 'desc' },
    take: 3,
    include: { worker: true }
  });

  const activities = [
    ...recentCompletedTasks.map(t => ({
      time: t.completedAt ? new Date(t.completedAt).toLocaleString() : '',
      text: `${t.assignedTo?.name || 'Alguien'} completó la tarea: ${t.title}`,
      type: 'task',
      date: t.completedAt ? new Date(t.completedAt) : new Date(0)
    })),
    ...recentAttendances.map(a => ({
      time: a.checkInTime ? new Date(a.checkInTime).toLocaleString() : '',
      text: `${a.worker?.name || 'Trabajador'} registró su entrada`,
      type: 'checkin',
      date: a.checkInTime ? new Date(a.checkInTime) : new Date(0)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  // Active workers today (checked in today, no checkout or checkout today)
  const today = new Date();
  today.setHours(0,0,0,0);
  const activeAttendancesToday = await prisma.attendance.count({
    where: {
      date: { gte: today },
      checkOutTime: null
    }
  });

  const inactiveWorkersCount = Math.max(0, activeWorkersCount - activeAttendancesToday);
  const activePercentage = activeWorkersCount > 0 ? (activeAttendancesToday / activeWorkersCount) * 100 : 0;
  const inactivePercentage = activeWorkersCount > 0 ? (inactiveWorkersCount / activeWorkersCount) * 100 : 0;

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
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: i !== activities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activity.type === 'checkin' ? 'var(--success)' : 'var(--primary)', marginTop: '6px' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{activity.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{activity.time}</div>
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No hay actividad reciente.</div>
            )}
          </div>
        </div>

        {/* Worker Status Overview */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Estado de Trabajadores</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Activos (En Turno)</span>
                <span style={{ fontWeight: 600 }}>{activeAttendancesToday}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${activePercentage}%`, height: '100%', backgroundColor: 'var(--success)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Inactivos</span>
                <span style={{ fontWeight: 600 }}>{inactiveWorkersCount}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${inactivePercentage}%`, height: '100%', backgroundColor: 'var(--text-secondary)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
