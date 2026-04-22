"use client";

"use client";

import ParentView from "./ParentView";
import ProtectedModule from "@/app/components/auth/ProtectedModule";

export function ParentModule() {
  return (
    <ProtectedModule allowedRole="parent">
      {({ email, logout }) => <ParentView userEmail={email} onLogout={logout} />}
    </ProtectedModule>
  );
}

export default ParentModule;
