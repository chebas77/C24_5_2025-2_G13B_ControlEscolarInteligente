"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AuthStorageService, BasicAuthService, RoleRouteResolver } from "@/core/auth";
import PublicLayout from "./PublicLayout";

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
        shape: "pill",
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

  const institutionalHighlights = [
    {
      icon: Sparkles,
      title: "Ingreso simple",
      description: "Una sola puerta de acceso con Google para validar identidad y dirigir cada cuenta a su portal.",
    },
    {
      icon: GraduationCap,
      title: "Correo institucional",
      description: "El sistema usa la cuenta de Google registrada para reconocer el rol correspondiente.",
    },
    {
      icon: Landmark,
      title: "Fe y Alegria N. 39",
      description: "Un acceso sobrio para la comunidad educativa de El Agustino, Lima.",
    },
  ];

  const trustPoints = [
    { icon: ShieldCheck, label: "Sesion protegida con Google" },
    { icon: BookOpen, label: "Redireccion automatica por rol" },
    { icon: Users, label: "Administracion, docentes y familias" },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[24rem] bg-[linear-gradient(135deg,rgba(185,28,28,0.12),rgba(255,255,255,0.92)_58%,rgba(15,23,42,0.05))] dark:bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(15,23,42,0.78)_48%,rgba(30,41,59,0.94))]" />
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:pt-20">
          <div className="relative">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white/85 px-4 py-2 text-sm font-medium text-red-700 shadow-sm backdrop-blur dark:border-red-400/20 dark:bg-slate-900/75 dark:text-red-200">
              <BadgeCheck className="size-4" />
              Acceso institucional con Google
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Ingresa a Control Escolar Inteligente
            </h1>
            <p className="mt-3 text-xl font-medium text-slate-700 dark:text-slate-300 sm:text-2xl">
              Fe y Alegria N. 39
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Usa tu cuenta de Google autorizada. El sistema identifica tu perfil y te lleva automaticamente al portal que corresponde.
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200 dark:text-red-300">Acceso unificado</p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold text-white">
                Sin formularios alternos ni accesos demo: solo cuentas gestionadas por Google.
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

          <Card className="relative overflow-hidden border-red-100 bg-white/94 shadow-2xl shadow-red-100/40 backdrop-blur dark:border-white/10 dark:bg-slate-900/76 dark:shadow-black/30">
            <div className="absolute inset-x-0 top-0 h-2.5 bg-gradient-to-r from-red-700 via-red-500 to-amber-400" />
            <CardHeader className="space-y-4 border-b border-slate-100 pb-6 dark:border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-slate-950 dark:text-white">Iniciar sesion</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Continua con Google para ingresar de forma segura al sistema.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-red-50 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  <ShieldCheck className="size-6" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/35">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm dark:bg-slate-900 dark:text-red-300">
                    <BadgeCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">Cuenta autorizada</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Usa el correo registrado por la institucion.</p>
                  </div>
                </div>

                <div className="flex min-h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-white/10 dark:bg-slate-900/85">
                  {googleClientId ? (
                    <div ref={googleButtonRef} className="flex max-w-full justify-center overflow-hidden" />
                  ) : (
                    <p className="text-center text-sm text-red-600 dark:text-red-300">
                      Configura NEXT_PUBLIC_GOOGLE_CLIENT_ID para habilitar Google OAuth.
                    </p>
                  )}
                </div>

                {loadingEmail === "google" && (
                  <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    Validando credenciales de Google...
                  </p>
                )}
              </div>

              <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/58">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Como funciona
                </p>
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-950/50 dark:text-slate-300">
                    Google verifica la identidad y el backend devuelve el rol de la cuenta.
                  </div>
                  <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700 dark:bg-red-500/10 dark:text-red-200">
                    Si tu correo no esta registrado, solicita la vinculacion al administrador del sistema.
                  </div>
                </div>
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
