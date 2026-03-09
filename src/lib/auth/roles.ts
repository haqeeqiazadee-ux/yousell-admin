import { getUser, User } from './get-user';

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  return user?.role === 'admin';
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (user.role !== 'admin') {
    throw new Error('Forbidden: admin access required');
  }
  return user;
}
