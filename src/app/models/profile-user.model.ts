export interface ProfileUser {
  uid: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  address?: string;
  photoURL?: string;
  role?: 'admin' | 'manager' | 'user';
}

export interface User {
  uid: string;
  displayName: string;
  role?: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified?: boolean;
}
