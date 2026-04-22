import { AuthSession } from "./AuthSession";
import type { ParentLoginPayload, UserRole } from "./types";

export class BasicAuthService {
  private readonly allowedDomains = ["@gmail.com", "@feyalegria39.edu.pe"];

  private readonly demoUsers: Record<string, UserRole> = {
    "admin.varones@gmail.com": "admin",
    "director.varones@gmail.com": "admin",
    "admin.mujeres@gmail.com": "admin-mujeres",
    "directora.mujeres@gmail.com": "admin-mujeres",
    "profesor.silva@gmail.com": "teacher",
    "profesor.martinez@gmail.com": "teacher",
    "profesor.lopez@gmail.com": "teacher",
    "padre.garcia@gmail.com": "parent",
    "madre.rodriguez@gmail.com": "parent",
    "tutor.mendoza@gmail.com": "parent",
  };

  public getDemoUsers(): Record<string, UserRole> {
    return this.demoUsers;
  }

  public loginWithDemoUser(email: string): AuthSession {
    const role = this.demoUsers[email];

    if (!role) {
      throw new Error("Usuario demo no reconocido.");
    }

    this.validateEmail(email);
    return new AuthSession({ email, role });
  }

  public async loginWithRandomDemoUser(): Promise<AuthSession> {
    const emails = Object.keys(this.demoUsers);
    const randomEmail = emails[Math.floor(Math.random() * emails.length)];

    await new Promise((resolve) => setTimeout(resolve, 1200));
    return this.loginWithDemoUser(randomEmail);
  }

  public async loginParent(payload: ParentLoginPayload): Promise<AuthSession> {
    const response = await fetch("http://localhost:8000/api/reports/padres/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        dni_hijo: payload.dniHijo,
      }),
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas.");
    }

    const data = await response.json();
    return new AuthSession({
      email: payload.email,
      role: "parent",
      accessToken: data.access,
    });
  }

  private validateEmail(email: string): void {
    const isAllowed = this.allowedDomains.some((domain) => email.endsWith(domain));
    if (!isAllowed) {
      throw new Error("Solo se permiten cuentas autorizadas.");
    }
  }
}
