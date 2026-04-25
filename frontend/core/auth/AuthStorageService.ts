import { AuthSession } from "./AuthSession";

export class AuthStorageService {
  private readonly storageKey = "auth";

  public save(session: AuthSession): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.storageKey, JSON.stringify(session.toJSON()));
    if (session.accessToken) {
      localStorage.setItem("accessToken", session.accessToken);
    }
  }

  public load(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const rawValue = localStorage.getItem(this.storageKey);
    if (!rawValue) return null;

    try {
      return AuthSession.fromJSON(JSON.parse(rawValue));
    } catch {
      this.clear();
      return null;
    }
  }

  public clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem("accessToken");
  }
}
