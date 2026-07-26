import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SupervisorOverview() {
  const activeWorkersCount = await prisma.user.count({ where: { role: 'worker' } });

  const pendingTasksCount = await prisma.task.count({ where: { status: 'pending' } });
  const inProgressTasksCount = await prisma.task.count({ where: { status: 'in-progress' } });
  const reviewTasksCount = await prisma.task.count({ where: { status: 'completed' } });

  const stats = [
    { label: 'Total Trabajadores', value: activeWorkersCount.toString(), icon: '👷', color: 'var(--primary)', href: '/supervisor/workers' },
    { label: 'Tareas Pendientes', value: pendingTasksCount.toString(), icon: '📋', color: 'var(--warning)', href: '/supervisor/tasks' },
    { label: 'En Progreso', value: inProgressTasksCount.toString(), icon: '🚀', color: 'var(--secondary)', href: '/supervisor/tasks' },
    { label: 'Por Revisar', value: reviewTasksCount.toString(), icon: '🔍', color: 'var(--success)', href: '/supervisor/tasks' },
  ];

  // Fetch recent completed/updated tasks
  const recentTasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { assignedTo: true }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Panel del Supervisor</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Supervisa la ejecución de tareas y la asistencia de personal.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/supervisor/tasks" className="btn btn-primary">+ Gestionar Tareas</Link>
          <Link href="/supervisor/workers" className="btn btn-outline">+ Ver Trabajadores</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: `4px solid ${stat.color}`, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '2.5rem', backgroundColor: `${stat.color}22`, width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Últimas Actividades en Tareas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentTasks.length > 0 ? recentTasks.map((task, i) => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: i !== recentTasks.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{task.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Asignado a: <strong>{task.assignedTo?.name || 'Sin asignar'}</strong> • {task.location}
                </div>
              </div>
              <div>
                <span className={`badge ${task.status === 'completed' ? 'badge-completed' : task.status === 'approved' ? 'badge-success' : 'badge-pending'}`}>
                  {task.status === 'completed' ? 'Por Revisar' : task.status === 'approved' ? 'Aprobada' : task.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                </span>
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No hay tareas registradas aún.</div>
          )}
        </div>
      </div>
    </div>
  );
}
