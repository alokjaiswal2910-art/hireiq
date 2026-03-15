"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/lib/types';

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'recruiter' | 'applicant';

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'An account with this email already exists' };
    }
    if (authError.message.includes('rate limit')) {
      return { error: 'Too many attempts. Please wait a moment and try again.' };
    }
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Sign up failed. Please try again.' };
  }

  // Insert profile into public users table. Run supabase/add_user_email.sql to add email column for recruiter contact.
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      full_name: name.trim(),
      role,
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Redirect based on role
  redirect(role === 'recruiter' ? '/recruiter' : '/applicant');
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: 'Invalid email or password' };
  }

  // Get role for redirect
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  const role = profile?.role ?? 'applicant';
  redirect(role === 'recruiter' ? '/recruiter' : '/applicant');
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ─── Get User ─────────────────────────────────────────────────────────────────
export async function getUser(): Promise<{ user: User | null }> {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { user: null };

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile) return { user: null };
  return { user: profile as User };
}

// ─── Get User Role ────────────────────────────────────────────────────────────
export async function getUserRole(): Promise<'recruiter' | 'applicant' | null> {
  const { user } = await getUser();
  return user?.role ?? null;
}
