"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { AuthStorageService, BasicAuthService, RoleRouteResolver } from "@/core/auth";
import PublicLayout from "./PublicLayout";

interface QuickAccessUser {
  email: string;
  label: string;
  dniHijo?: string;
}

export function LoginModule() {
  const router = useRouter();
  const authStorage = useMemo(() => new AuthStorageService(), []);
  const authService = useMemo(() => new BasicAuthService(), []);
  const routeResolver = useMemo(() => new RoleRouteResolver(), []);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [dniHijo, setDniHijo] = useState("");
  const [parentLoading, setParentLoading] = useState(false);

  useEffect(() => {
    const session = authStorage.load();
    if (session) {
      router.replace(routeResolver.resolveHomeByRole(session.role));
    }
  }, [authStorage, routeResolver, router]);

  const demoSections: Array<{ title: string; users: QuickAccessUser[] }> = [
    {
      title: "Administracion",
      users: [
        { email: "admin001@demo.scei.pe", label: "Admin varones" },
        { email: "admin002@demo.scei.pe", label: "Director varones" },
        { email: "admin.mujeres001@demo.scei.pe", label: "Admin mujeres" },
        { email: "admin.mujeres002@demo.scei.pe", label: "Directora mujeres" },
      ],
    },
    {
      title: "Docentes",
      users: [
        { email: "profesor001@demo.scei.pe", label: "Profesor Silva" },
        { email: "profesor002@demo.scei.pe", label: "Profesor Martinez" },
      ],
    },
    {
      title: "Padres",
      users: [
        { email: "padre001@demo.scei.pe", label: "Padre Garcia", dniHijo: "50000001" },
        { email: "padre002@demo.scei.pe", label: "Madre Rodriguez", dniHijo: "50000002" },
      ],
    },
  ];

  const navigateWithSession = async (email: string) => {
    setError("");
    setLoadingEmail(email);

    try {
      const session = authService.loginWithDemoUser(email);
      authStorage.save(session);
      router.push(routeResolver.resolveHomeByRole(session.role));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo iniciar sesion.");
    } finally {
      setLoadingEmail(null);
    }
  };

  const navigateWithQuickAccess = async (user: QuickAccessUser) => {
    if (user.dniHijo) {
      setError("");
      setLoadingEmail(user.email);

      try {
        const session = await authService.loginParent({ email: user.email, dniHijo: user.dniHijo });
        authStorage.save(session);
        router.push(routeResolver.resolveHomeByRole(session.role));
      } catch (currentError) {
        setError(currentError instanceof Error ? currentError.message : "No se pudo iniciar sesion.");
      } finally {
        setLoadingEmail(null);
      }

      return;
    }

    await navigateWithSession(user.email);
  };

  const loginWithRandomGoogle = async () => {
    setError("");
    setLoadingEmail("google");

    try {
      const session = await authService.loginWithRandomDemoUser();
      authStorage.save(session);
      router.push(routeResolver.resolveHomeByRole(session.role));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo iniciar sesion.");
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleParentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setParentLoading(true);

    try {
      const session = await authService.loginParent({ email: parentEmail, dniHijo });
      authStorage.save(session);
      router.push(routeResolver.resolveHomeByRole(session.role));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No se pudo iniciar sesion.");
    } finally {
      setParentLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <span className="mb-3 inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
            Acceso modular
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Un login mas claro para entrar a cada modulo sin mezclar toda la app en una sola pantalla.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Esta version ordena el acceso por roles y conecta los accesos rapidos con usuarios demo reales.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900">Index</h2>
              <p className="mt-2 text-sm text-slate-600">Pantalla inicial y presentacion institucional.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900">About</h2>
              <p className="mt-2 text-sm text-slate-600">Informacion de la institucion y propuesta educativa.</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-red-100/30">
          <CardHeader>
            <CardTitle>Iniciar sesion</CardTitle>
            <CardDescription>
              Selecciona una ruta de acceso rapida o autentica a un padre con correo y DNI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={loginWithRandomGoogle}
              disabled={loadingEmail === "google"}
              className="h-12 w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {loadingEmail === "google" ? "Conectando..." : "Continuar con Google"}
            </Button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {demoSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">{section.title}</h3>
                  <div className="grid gap-2">
                    {section.users.map((user) => (
                      <Button
                        key={user.email}
                        type="button"
                        variant="outline"
                        className="justify-between border-slate-200 text-left hover:border-red-200 hover:bg-red-50"
                        onClick={() => navigateWithQuickAccess(user)}
                        disabled={loadingEmail === user.email}
                      >
                        <span>{user.label}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-medium text-slate-900">Acceso para padres</h3>
              <p className="mt-1 text-sm text-slate-600">
                Usa el correo del padre y el DNI del hijo para validar el acceso.
              </p>

              <form onSubmit={handleParentSubmit} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="parent-email">Correo del padre</Label>
                  <Input
                    id="parent-email"
                    type="email"
                    value={parentEmail}
                    onChange={(event) => setParentEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni-hijo">DNI del hijo</Label>
                  <Input
                    id="dni-hijo"
                    value={dniHijo}
                    onChange={(event) => setDniHijo(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={parentLoading} className="w-full bg-red-600 hover:bg-red-700">
                  {parentLoading ? "Validando acceso..." : "Ingresar como padre o madre"}
                </Button>
              </form>
            </div>

            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}

export default LoginModule;
