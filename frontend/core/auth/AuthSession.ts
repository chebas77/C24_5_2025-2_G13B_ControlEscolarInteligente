import type { AuthSessionData, UserRole } from "./types";

export class AuthSession {
  public readonly email: string;
  public readonly role: UserRole;
  public readonly accessToken?: string;

  constructor(data: AuthSessionData) {
    this.email = data.email;
    this.role = data.role;
    this.accessToken = data.accessToken;
  }

  public toJSON(): AuthSessionData {
    return {
      email: this.email,
      role: this.role,
      accessToken: this.accessToken,
    };
  }

  public static fromJSON(data: AuthSessionData): AuthSession {
    return new AuthSession(data);
  }
}
