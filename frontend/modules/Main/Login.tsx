"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, BookOpen, GraduationCap, Landmark, Mail, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { AuthStorageService, BasicAuthService, RoleRouteResolver } from "@/core/auth";
import PublicLayout from "./PublicLayout";

interface QuickAccessUser {
  email: string;
  label: string;
  dniHijo?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: string;
              size: string;
              type: string;
              shape: string;
              text: string;
              width: number;
            },
          ) => void;
        };
      };
    };
  }
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
  const [selectedSection, setSelectedSection] = useState("Administracion");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    const session = authStorage.load();
    if (session) {
      router.replace(routeResolver.resolveHomeByRole(session.role));
    }
  }, [authStorage, routeResolver, router]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google no devolvio credenciales.");
            return;
          }

          setError("");
          setLoadingEmail("google");

          try {
            const session = await authService.registerWithGoogle({
              credential: response.credential,
            });
            authStorage.save(session);
            router.push(routeResolver.resolveHomeByRole(session.role));
          } catch (currentError) {
            setError(currentError instanceof Error ? currentError.message : "No se pudo iniciar sesion con Google.");
          } finally {
            setLoadingEmail(null);
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "rectangular",
        text: "continue_with",
        width: 360,
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [authService, authStorage, googleClientId, routeResolver, router]);

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

  const institutionalHighlights = [
    {
      icon: Sparkles,
      title: "Educando en valores",
      description: "Una experiencia de acceso alineada con una institucion que prioriza formacion integral y acompanamiento.",
    },
    {
      icon: GraduationCap,
      title: "Comunidad educativa",
      description: "Ingreso diferenciado para administracion, docentes y familias, con rutas claras para cada perfil.",
    },
    {
      icon: Landmark,
      title: "Fe y Alegria N. 39",
      description: "El Agustino, Lima. Institucion de gestion publica en convenio, con identidad y proposito institucional.",
    },
  ];

  const trustPoints = [
    { icon: ShieldCheck, label: "Acceso ordenado por rol" },
    { icon: BookOpen, label: "Entorno pensado para seguimiento escolar" },
    { icon: Users, label: "Ingreso para familias, docentes y administracion" },
  ];

  const activeSection = demoSections.find((section) => section.title === selectedSection) ?? demoSections[0];

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(185,28,28,0.12),rgba(255,255,255,0.92)_55%,rgba(15,23,42,0.05))] dark:bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(15,23,42,0.78)_48%,rgba(30,41,59,0.94))]" />
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-red-200/30 blur-3xl dark:bg-rose-500/10" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-300/8" />

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-start gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
          <div className="relative flex flex-col pt-0 lg:-mt-1">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white/85 px-4 py-2 text-sm font-medium text-red-700 shadow-sm backdrop-blur dark:border-red-400/20 dark:bg-slate-900/75 dark:text-red-200">
              <BadgeCheck className="size-4" />
              Acceso institucional
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Plataforma de control escolar
            </h1>
            <p className="mt-3 text-xl font-medium text-slate-700 dark:text-slate-300 sm:text-2xl">
              Fe y Alegria N. 39
            </p>

            <div className="mt-6">
              <div className="inline-flex rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-900/65 dark:shadow-black/20">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Educando en valores</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Comunidad educativa de El Agustino, Lima.</p>
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Un acceso claro, sobrio y confiable para una institucion educativa que acompana a estudiantes, docentes y familias con una cultura de valores, cuidado y organizacion.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {institutionalHighlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/20"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-red-100 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/30 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] dark:shadow-black/30">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200 dark:text-red-300">Confianza y acompanamiento</p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold text-white">
                Un entorno de ingreso pensado para seguimiento escolar, consulta segura y organizacion por rol.
              </h2>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200 dark:text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 dark:bg-white/6">
                  <MapPin className="size-4" />
                  El Agustino, Lima
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 dark:bg-white/6">
                  <Mail className="size-4" />
                  feyalegria39@hotmail.com
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {trustPoints.map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 dark:border-white/8 dark:bg-white/[0.04]">
                    <Icon className="size-5 text-red-300" />
                    <p className="mt-3 text-sm leading-6 text-slate-100">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="relative overflow-hidden border-red-100 bg-white/92 shadow-2xl shadow-red-100/40 backdrop-blur dark:border-white/10 dark:bg-slate-900/72 dark:shadow-black/30">
            <div className="absolute inset-x-0 top-0 h-2.5 bg-gradient-to-r from-red-700 via-red-500 to-amber-400" />
            <CardHeader className="space-y-4 border-b border-slate-100 pb-6 dark:border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-slate-950 dark:text-white">Iniciar sesion</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Selecciona el tipo de acceso y entra con una ruta rapida o con la validacion de familias.
                  </CardDescription>
                </div>
                <div className="hidden rounded-2xl bg-red-50 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-300 sm:block">
                  <ShieldCheck className="size-6" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-slate-900/85">
                  {googleClientId ? (
                    <div ref={googleButtonRef} />
                  ) : (
                    <p className="text-sm text-red-600">
                      Configura NEXT_PUBLIC_GOOGLE_CLIENT_ID para habilitar Google OAuth.
                    </p>
                  )}
                </div>
                {loadingEmail === "google" && (
                  <p className="text-center text-sm text-slate-500">Validando credenciales de Google...</p>
                )}
                <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                  El acceso con Google usa el correo institucional del alumno y abre directamente el portal de padres.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/58">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Accesos rapidos</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Cambia de vista segun el rol que deseas utilizar.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                    {activeSection.users.length} accesos
                  </span>
                </div>

                <Tabs value={selectedSection} onValueChange={setSelectedSection} className="mt-4">
                  <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/85">
                    {demoSections.map((section) => (
                      <TabsTrigger
                        key={section.title}
                        value={section.title}
                        className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] data-[state=active]:bg-white data-[state=active]:text-red-600 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-red-300"
                      >
                        {section.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="mt-4 grid gap-3">
                  {activeSection.users.map((user) => (
                    <Button
                      key={user.email}
                      type="button"
                      variant="outline"
                      className="h-auto justify-between rounded-2xl border-slate-200 bg-slate-50/50 px-4 py-4 text-left hover:border-red-200 hover:bg-red-50/70 dark:border-white/10 dark:bg-slate-900/65 dark:hover:border-red-400/30 dark:hover:bg-slate-900/90"
                      onClick={() => navigateWithQuickAccess(user)}
                      disabled={loadingEmail === user.email}
                    >
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-900 dark:text-slate-100">{user.label}</span>
                        <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-800/85 dark:text-slate-200">
                        {loadingEmail === user.email ? "Ingresando..." : "Entrar"}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-red-100 bg-[linear-gradient(180deg,rgba(254,242,242,0.9),rgba(255,255,255,1))] p-5 dark:border-red-400/15 dark:bg-[linear-gradient(180deg,rgba(127,29,29,0.12),rgba(30,41,59,0.72))]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">Acceso para padres y madres</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Puedes validar el acceso manualmente con el correo del apoderado y el DNI del estudiante. Si usas Google, el sistema toma el correo institucional del alumno y entra al mismo portal.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-2.5 text-red-600 shadow-sm dark:bg-slate-900/90 dark:text-red-300">
                    <Users className="size-5" />
                  </div>
                </div>

                <form onSubmit={handleParentSubmit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Correo del padre o madre</Label>
                    <Input
                      id="parent-email"
                      type="email"
                      value={parentEmail}
                      onChange={(event) => setParentEmail(event.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/85"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni-hijo">DNI del estudiante</Label>
                    <Input
                      id="dni-hijo"
                      value={dniHijo}
                      onChange={(event) => setDniHijo(event.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/85"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={parentLoading}
                    className="h-11 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                  >
                    {parentLoading ? "Validando acceso..." : "Ingresar como padre o madre"}
                  </Button>
                </form>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:bg-slate-800/85"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="size-4" />
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}

export default LoginModule;
