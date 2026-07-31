import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthService } from "@/lib/services/auth-service";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof localStorage === 'undefined') return { user: null };
    const session = AuthService.getSession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
    return { user: { email: session.loginId } };
  },
  component: () => <Outlet />,
});
