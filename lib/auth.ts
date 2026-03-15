import { redirect } from 'next/navigation';
import { getUser } from '@/app/actions/auth';
import type { UserRole, User } from '@/lib/types';

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Returns the authenticated user.
 */
export async function requireAuth(): Promise<User> {
  const { user } = await getUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Require a specific role. Redirects to the correct dashboard if wrong role,
 * or to /login if not authenticated.
 */
export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth();

  if (user.role !== role) {
    // Redirect to the correct dashboard for their actual role
    redirect(user.role === 'recruiter' ? '/recruiter' : '/applicant');
  }

  return user;
}
