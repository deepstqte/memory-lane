export interface Memory {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
  timestamp: number;
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
