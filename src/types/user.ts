/**
 * Model contracts for future Firebase Auth & Admin integration
 */
export type UserRole = 'user' | 'admin' | 'moderator';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  favorites: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminStats {
  totalChannels: number;
  activeChannels: number;
  totalCategories: number;
  featuredChannels: number;
}
