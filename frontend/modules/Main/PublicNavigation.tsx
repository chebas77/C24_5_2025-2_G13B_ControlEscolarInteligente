"use client";

import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/app/components/ui/button";

const routeMap = {
  "/": "index",
  "/about": "about",
  "/login": "login",
} as const;

export function PublicNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const currentPage = routeMap[pathname as keyof typeof routeMap] ?? "index";

  const navItems = [
    { id: "index", label: "Inicio", href: "/" },
    { id: "about", label: "Nosotros", href: "/about" },
    { id: "login", label: "Ingresar", href: "/login" },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-red-100 bg-white/90 backdrop-blur transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push("/")} className="flex items-center gap-3 text-left" type="button">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-red-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
            <Image
              src="/logo.jpg"
              alt="Logo de Fe y Alegria 39"
              width={36}
              height={36}
              className="h-auto w-8"
              priority
            />
          </span>
          <span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-red-500 dark:text-red-300">I.E.</span>
            <span className="block text-xl font-semibold text-slate-900 dark:text-slate-50">Fe y Alegria 39</span>
          </span>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Cambiar tema"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Sun className="hidden size-4 dark:block" />
            <Moon className="size-4 dark:hidden" />
          </Button>

          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              onClick={() => router.push(item.href)}
              className={
                currentPage === item.id
                  ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-500"
                  : "text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-300"
              }
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default PublicNavigation;
