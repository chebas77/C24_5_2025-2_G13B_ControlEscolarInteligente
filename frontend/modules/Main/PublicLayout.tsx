import type { ReactNode } from "react";
import PublicNavigation from "./PublicNavigation";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff1f2,_#ffffff_48%,_#f8fafc_100%)]">
      <PublicNavigation />
      {children}
    </div>
  );
}

export default PublicLayout;
