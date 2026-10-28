"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/components/admin/api";
import { AdminField } from "@/components/admin/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-brand">
          <span className="logo-badge">RW</span>
          <span className="admin-brand-text">
            <span className="admin-brand-name">Admin</span>
            <span className="admin-brand-sub">Ridhesh Walavalkar</span>
          </span>
        </div>

        <h1 className="admin-login-title">Sign in</h1>

        <AdminField label="Email">
          <input
            className="admin-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AdminField>

        <AdminField label="Password">
          <input
            className="admin-input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AdminField>

        {error ? <p className="admin-toast err">{error}</p> : null}

        <button className="admin-btn admin-btn-primary" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="admin-hint">
          The admin account is created in the Supabase dashboard (Authentication → Users). Only
          walavalkarridhesh@gmail.com can write content.
        </p>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
