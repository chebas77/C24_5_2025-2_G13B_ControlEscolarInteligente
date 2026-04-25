import type { UserRole } from "./types";

export class RoleRouteResolver {
  public resolveHomeByRole(role: UserRole): string {
    switch (role) {
      case "admin":
        return "/admin";
      case "admin-mujeres":
        return "/admin-mujeres";
      case "teacher":
        return "/teacher";
      case "parent":
        return "/parent";
      default:
        return "/login";
    }
  }
}
