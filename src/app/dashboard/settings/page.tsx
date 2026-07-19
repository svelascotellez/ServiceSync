import SettingsClient from './SettingsClient';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    const session = await getServerSession(authOptions);
    
    // Debug logic
    if (!session) {
      redirect('/login');
    }

    const workerTypes = await prisma.workerType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    });

    return <SettingsClient initialWorkerTypes={JSON.parse(JSON.stringify(workerTypes))} />;
  } catch (error: any) {
    return (
      <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Server Error in SettingsPage</h2>
        <p style={{ marginTop: '0.5rem' }}>{error.message}</p>
        <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{error.stack}</pre>
      </div>
    );
  }
}
