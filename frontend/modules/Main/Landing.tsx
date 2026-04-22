"use client";

"use client";

import { useRouter } from "next/navigation";
import LandingPage from "@/app/components/LandingPage";
import PublicLayout from "./PublicLayout";

export function LandingModule() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    switch (page) {
      case "about":
        router.push("/about");
        break;
      case "teachers":
      case "login":
        router.push("/login");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <PublicLayout>
      <LandingPage onNavigate={handleNavigate} />
    </PublicLayout>
  );
}

export default LandingModule;
