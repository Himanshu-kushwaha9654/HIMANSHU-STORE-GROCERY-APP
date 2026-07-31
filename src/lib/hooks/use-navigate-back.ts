import { useNavigate, useRouter } from "@tanstack/react-router";

export function useNavigateBack() {
  const router = useRouter();
  const navigate = useNavigate();

  return (fallback: string = "/") => {
    // Basic heuristic: if history length > 2 (usually the case if the user navigated within the app)
    // we can safely go back. Otherwise, we fallback to the provided route.
    if (window.history.length > 2) {
      router.history.back();
    } else {
      navigate({ to: fallback as any });
    }
  };
}
