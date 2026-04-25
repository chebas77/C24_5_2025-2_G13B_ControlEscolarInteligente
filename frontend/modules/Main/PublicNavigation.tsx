"use client";

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

const routeMap = {
  "/": "index",
  "/about": "about",
  "/login": "login",
} as const;

export function PublicNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = routeMap[pathname as keyof typeof routeMap] ?? "index";

  const navItems = [
    { id: "index", label: "Inicio", href: "/" },
    { id: "about", label: "Nosotros", href: "/about" },
    { id: "login", label: "Ingresar", href: "/login" },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-red-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/")}
          className="text-left"
          type="button"
        >
          <span className="block text-xs uppercase tracking-[0.25em] text-red-500">SCEI</span>
          <span className="block text-xl font-semibold text-slate-900">Fe y Alegría 39</span>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              onClick={() => router.push(item.href)}
              className={
                currentPage === item.id
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-slate-600 hover:bg-red-50 hover:text-red-600"
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
