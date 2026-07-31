import { useEffect, useState } from "react";
import { AuthService, UserSession } from "@/lib/services/auth-service";

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read initial session
    setSession(AuthService.getSession());
    setLoading(false);

    // Listen for cross-tab or cross-component auth changes
    const handleAuthChange = () => {
      setSession(AuthService.getSession());
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const user = session ? {
    email: session.loginId,
    user_metadata: {
      full_name: session.fullName
    }
  } : null;

  const isAdmin = session?.role === "ADMIN";

  return { session, user, isAdmin, loading };
}
