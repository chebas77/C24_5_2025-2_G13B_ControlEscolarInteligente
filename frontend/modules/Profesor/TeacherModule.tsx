"use client";

"use client";

import TeacherView from "./TeacherView";
import ProtectedModule from "@/app/components/auth/ProtectedModule";

export function TeacherModule() {
  return (
    <ProtectedModule allowedRole="teacher">
      {({ email, logout }) => <TeacherView userEmail={email} onLogout={logout} />}
    </ProtectedModule>
  );
}

export default TeacherModule;
