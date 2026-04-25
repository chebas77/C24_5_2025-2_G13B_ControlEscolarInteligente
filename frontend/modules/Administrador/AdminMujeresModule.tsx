"use client";

"use client";

import AdminMujeresDashboard from "./AdminMujeresDashboard";
import ProtectedModule from "@/app/components/auth/ProtectedModule";

export function AdminMujeresModule() {
  return (
    <ProtectedModule allowedRole="admin-mujeres">
      {({ email, logout }) => <AdminMujeresDashboard userEmail={email} onLogout={logout} />}
    </ProtectedModule>
  );
}

export default AdminMujeresModule;
