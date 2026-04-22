"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthStorageService, RoleRouteResolver, type UserRole } from "@/core/auth";

interface ProtectedModuleProps {
  allowedRole: UserRole;
  children: (session: { email: string; logout: () => void }) => ReactNode;
}

export function ProtectedModule({ allowedRole, children }: ProtectedModuleProps) {
  const router = useRouter();
  const authStorage = useMemo(() => new AuthStorageService(), []);
  const routeResolver = useMemo(() => new RoleRouteResolver(), []);
  const session = useMemo(() => authStorage.load(), [authStorage]);

  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role !== allowedRole) {
      router.replace(routeResolver.resolveHomeByRole(session.role));
    }
  }, [allowedRole, routeResolver, router, session]);

  const handleLogout = () => {
    authStorage.clear();
    router.replace("/login");
  };

  if (!session || session.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Validando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children({ email: session.email, logout: handleLogout })}</>;
}

export default ProtectedModule;
