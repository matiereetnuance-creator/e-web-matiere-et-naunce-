import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mn-bg px-6">
      <div className="w-full max-w-md rounded-card border border-mn-card-border bg-mn-card p-10 shadow-card">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo-noir.png" alt="Matière & Nuance" width={186} height={42} priority />
          <h1 className="font-serif-display mt-8 text-[30px] font-semibold text-mn-ink">Gestion</h1>
          <p className="mt-2 text-[14px] font-medium text-mn-muted">Connectez-vous à votre cockpit financier.</p>
        </div>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
