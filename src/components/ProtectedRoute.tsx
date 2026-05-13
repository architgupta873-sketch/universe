"use client";

import { useAppContext, UserRole } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

/**
 * ProtectedRoute — checks Supabase auth session + profile role.
 * Redirects to /login if not authenticated or wrong role.
 * Shows a loading spinner while checking.
 */
export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { role, isLoading } = useAppContext();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth loading to complete before checking
    if (isLoading) return;

    if (role !== allowedRole) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [role, allowedRole, router, isLoading]);

  if (isLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
