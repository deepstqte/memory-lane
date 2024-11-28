export interface Memory {
  id?: number;
  name: string;
  description: string;
  timestamp: number;
  author: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  emailVerified?: boolean | null;
  object?: string | null;
  bio?: string;
}
