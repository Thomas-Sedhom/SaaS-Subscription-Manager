export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}