'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { createSessionToken, SESSION_COOKIE_NAME, timingSafeEqual } from '@/lib/session';

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Merci de renseigner votre email et votre mot de passe.' };
  }

  const validEmail = timingSafeEqual(email, env.adminEmail.toLowerCase());
  const validPassword = timingSafeEqual(password, env.adminPassword);

  if (!validEmail || !validPassword) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  const token = await createSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  redirect('/login');
}
