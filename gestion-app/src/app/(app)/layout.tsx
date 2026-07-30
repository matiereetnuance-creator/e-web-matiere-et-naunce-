import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { PageTransition } from '@/components/layout/PageTransition';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { deriveDisplayName } from '@/lib/user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    redirect('/login');
  }

  const displayName = deriveDisplayName(session.email);

  return (
    <ToastProvider>
      <div className="flex min-h-screen w-full bg-mn-bg">
        <Sidebar userLabel={displayName} />
        <main className="flex min-w-0 flex-1 flex-col">
          <Header greeting={`Bonjour ${displayName}`} />
          <div className="px-12 pb-[52px] pt-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
