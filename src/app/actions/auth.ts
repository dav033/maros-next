'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

export async function loginAction(_: unknown, formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Please enter a password.' };
  }

  let ok = false;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    ok = res.ok;
  } catch {
    return { error: 'Could not connect to server. Please try again.' };
  }

  if (!ok) {
    return { error: 'Incorrect password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('maros_session', 'authenticated', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
    sameSite: 'lax',
  });

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('maros_session');
  redirect('/login');
}
