import { AuthSession } from "./AuthSession";
import type { GoogleRegisterPayload, ParentLoginPayload, UserRole } from "./types";

export class BasicAuthService {
  private readonly demoUsers: Record<string, UserRole> = {
    "admin001@demo.scei.pe": "admin",
    "admin002@demo.scei.pe": "admin",
    "admin.mujeres001@demo.scei.pe": "admin-mujeres",
    "admin.mujeres002@demo.scei.pe": "admin-mujeres",
    "profesor001@demo.scei.pe": "teacher",
    "profesor002@demo.scei.pe": "teacher",
    "profesor003@demo.scei.pe": "teacher",
  };

  public getDemoUsers(): Record<string, UserRole> {
    return this.demoUsers;
  }

  public loginWithDemoUser(email: string): AuthSession {
    const role = this.demoUsers[email];

    if (!role) {
      throw new Error("Usuario demo no reconocido.");
    }

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
      let message = "Credenciales incorrectas.";

      try {
        const errorData = (await response.json()) as { error?: string };
        if (errorData.error) {
          message = errorData.error;
        }
      } catch {
        // Si la respuesta no es JSON, mantenemos el mensaje por defecto.
      }

      throw new Error(message);
    }

    const data = await response.json();
    return new AuthSession({
      email: payload.email,
      role: "parent",
      accessToken: data.access,
    });
  }

  public async registerWithGoogle(payload: GoogleRegisterPayload): Promise<AuthSession> {
    const response = await fetch("http://localhost:8000/api/users/google/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        credential: payload.credential,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo registrar el usuario.");
    }

    return new AuthSession({
      email: data.email,
      role: data.role,
      accessToken: data.access,
      name: data.name,
      picture: data.picture,
    });
  }
}
