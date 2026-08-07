'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, sessionCookieDomain } from '@/shared/auth/session';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: SESSION_COOKIE, path: '/', domain: sessionCookieDomain() });
  redirect('/login');
}
