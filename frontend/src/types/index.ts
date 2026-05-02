export type Role = 'super_admin' | 'hospital_admin' | 'engineer' | 'staff';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  hospitalId?: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
