import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogOut, Camera } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  full_name: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  address_line1: z.string().trim().max(120).optional().or(z.literal("")),
  address_line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

const profileQO = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.user.id)
      .maybeSingle();
    if (error) throw error;
    return { user: u.user, profile: data };
  },
});

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Your profile — Zest" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQO),
  component: ProfilePage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-10 text-sm text-muted-foreground">
      Couldn't load profile: {error.message}
    </div>
  ),
});

function ProfilePage() {
  const { data } = useSuspenseQuery(profileQO);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>({
    full_name: data.profile?.full_name ?? "",
    phone: data.profile?.phone ?? "",
    address_line1: data.profile?.address_line1 ?? "",
    address_line2: data.profile?.address_line2 ?? "",
    city: data.profile?.city ?? "",
    postal_code: data.profile?.postal_code ?? "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const path = data.profile?.avatar_url;
    if (!path) { setAvatarUrl(null); return; }
    supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data: s }) => {
      if (!cancelled) setAvatarUrl(s?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [data.profile?.avatar_url]);

  const save = useMutation({
    mutationFn: async (values: ProfileForm) => {
      const parsed = profileSchema.parse(values);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: parsed.full_name || null,
          phone: parsed.phone || null,
          address_line1: parsed.address_line1 || null,
          address_line2: parsed.address_line2 || null,
          city: parsed.city || null,
          postal_code: parsed.postal_code || null,
        })
        .eq("id", data.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  async function handleAvatar(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${data.user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", data.user.id);
      if (dbErr) throw dbErr;
      toast.success("Avatar updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.user.email}</p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold ring-1 ring-black/5 hover:bg-muted"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-pop ring-1 ring-black/5">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-secondary ring-2 ring-primary/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {(form.full_name || data.user.email || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop ring-2 ring-background"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">{form.full_name || "Add your name"}</div>
            Member since {new Date(data.profile?.created_at ?? Date.now()).toLocaleDateString()}
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <TextField label="Full name" value={form.full_name ?? ""} onChange={(v) => setForm({ ...form, full_name: v })} />
          <TextField label="Phone" value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
          <div className="sm:col-span-2">
            <TextField label="Address line 1" value={form.address_line1 ?? ""} onChange={(v) => setForm({ ...form, address_line1: v })} />
          </div>
          <div className="sm:col-span-2">
            <TextField label="Address line 2" value={form.address_line2 ?? ""} onChange={(v) => setForm({ ...form, address_line2: v })} />
          </div>
          <TextField label="City" value={form.city ?? ""} onChange={(v) => setForm({ ...form, city: v })} />
          <TextField label="Postal code" value={form.postal_code ?? ""} onChange={(v) => setForm({ ...form, postal_code: v })} />

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-pop active:scale-[.98] disabled:opacity-60"
            >
              {save.isPending && <Loader2 className="size-4 animate-spin" />} Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl bg-secondary px-4 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}
