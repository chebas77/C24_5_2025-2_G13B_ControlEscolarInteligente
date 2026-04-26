import type { AuthSessionData, UserRole } from "./types";

export class AuthSession {
  public readonly email: string;
  public readonly role: UserRole;
  public readonly accessToken?: string;
  public readonly name?: string;
  public readonly picture?: string;

  constructor(data: AuthSessionData) {
    this.email = data.email;
    this.role = data.role;
    this.accessToken = data.accessToken;
    this.name = data.name;
    this.picture = data.picture;
  }

  public toJSON(): AuthSessionData {
    return {
      email: this.email,
      role: this.role,
      accessToken: this.accessToken,
      name: this.name,
      picture: this.picture,
    };
  }

  public static fromJSON(data: AuthSessionData): AuthSession {
    return new AuthSession(data);
  }
}
