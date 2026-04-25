"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthSession, AuthStorageService, RoleRouteResolver, type UserRole } from "@/core/auth";

interface ProtectedModuleProps {
  allowedRole: UserRole;
  children: (session: { email: string; logout: () => void }) => ReactNode;
}

export function ProtectedModule({ allowedRole, children }: ProtectedModuleProps) {
  const router = useRouter();
  const authStorage = useMemo(() => new AuthStorageService(), []);
  const routeResolver = useMemo(() => new RoleRouteResolver(), []);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const storedSession = authStorage.load();
    setSession(storedSession);
    setIsCheckingSession(false);

    if (!storedSession) {
      router.replace("/login");
      return;
    }

    if (storedSession.role !== allowedRole) {
      router.replace(routeResolver.resolveHomeByRole(storedSession.role));
    }
  }, [allowedRole, authStorage, routeResolver, router]);

  const handleLogout = () => {
    authStorage.clear();
    router.replace("/login");
  };

  if (isCheckingSession || !session || session.role !== allowedRole) {
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
