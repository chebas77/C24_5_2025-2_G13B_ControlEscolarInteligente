import type { ReactNode } from "react";
import PublicNavigation from "./PublicNavigation";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff1f2,_#ffffff_48%,_#f8fafc_100%)] transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(127,29,29,0.28),_rgba(2,6,23,1)_38%,_rgba(15,23,42,1)_100%)]">
      <PublicNavigation />
      {children}
    </div>
  );
}

export default PublicLayout;
