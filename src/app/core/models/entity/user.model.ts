import { Role, UserStatus } from '../enums/enums.model';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: Role;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone?: string;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}
