import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Zest" },
      { name: "description", content: "Sign in or create your Zest account to shop fresh groceries." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectTo = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo });
    });
  }, [navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ fullName, email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Zest!");
        navigate({ to: redirectTo });
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: redirectTo });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: redirectTo });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleForgot() {
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email above first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Check your email for a reset link");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-3xl bg-card p-8 shadow-pop ring-1 ring-black/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signup" ? "Create your Zest account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Fresh groceries in 15 minutes" : "Sign in to keep shopping"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary text-sm font-semibold ring-1 ring-black/5 transition hover:bg-muted disabled:opacity-60"
        >
          {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <Field icon={<UserIcon className="size-4" />}>
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                autoComplete="name"
              />
            </Field>
          )}
          <Field icon={<Mail className="size-4" />}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              autoComplete="email"
              required
            />
          </Field>
          <Field icon={<Lock className="size-4" />}>
            <input
              type="password"
              placeholder={mode === "signup" ? "Create a password (8+ chars)" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
            />
          </Field>

          {mode === "signin" && (
            <button
              type="button"
              onClick={handleForgot}
              className="block w-full text-right text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-pop transition active:scale-[.98] disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New to Zest?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">← Back to shop</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-full bg-secondary px-4 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-primary/40">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.8 7.3l7.4 5.8c4.3-4 6.8-9.9 6.8-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.7 2.3-8.5 2.3-6.3 0-11.6-3.7-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
