export type UserRole = "admin" | "admin-mujeres" | "teacher" | "parent";

export interface ParentLoginPayload {
  email: string;
  dniHijo: string;
}

export interface GoogleRegisterPayload {
  credential: string;
}

export interface AuthSessionData {
  email: string;
  role: UserRole;
  accessToken?: string;
  name?: string;
  picture?: string;
}
