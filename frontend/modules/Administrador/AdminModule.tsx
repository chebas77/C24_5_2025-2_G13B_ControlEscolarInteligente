"use client";

"use client";

import AdminDashboard from "./AdminDashboard";
import ProtectedModule from "@/app/components/auth/ProtectedModule";

export function AdminModule() {
  return (
    <ProtectedModule allowedRole="admin">
      {({ email, logout }) => <AdminDashboard userEmail={email} onLogout={logout} />}
    </ProtectedModule>
  );
}

export default AdminModule;
