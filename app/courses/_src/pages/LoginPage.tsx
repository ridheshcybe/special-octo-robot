"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase, envReady } from "../lib/supabase";
import { emailSchema, passwordSchema } from "../lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("next") ?? "/courses/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function goToDashboard(): void {
    router.replace(from);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setError(parsedEmail.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      setError(parsedPassword.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (mode === "signup" && fullName.trim().length === 0) {
      setError("Name is required");
      return;
    }

    if (!envReady) {
      setError("Supabase is not configured yet — fill in .env.local (see README §courses).");
      return;
    }

    setBusy(true);
    if (mode === "signin") {
      const { error: err } = await supabase().auth.signInWithPassword({
        email: parsedEmail.data,
        password: password,
      });
      setBusy(false);
      if (err) {
        setError("Invalid email or password.");
        return;
      }
      goToDashboard();
      return;
    }

    const { data, error: err } = await supabase().auth.signUp({
      email: parsedEmail.data,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/courses/login`,
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (!data.session) {
      setNotice("Check your email to confirm your account, then sign in.");
      return;
    }
    goToDashboard();
  }

  async function signInWithGoogle() {
    setError(null);
    if (!envReady) {
      setError("Supabase is not configured yet.");
      return;
    }
    const { error: err } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + from },
    });
    if (err) setError(err.message);
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 py-10">
      <form onSubmit={submit} className="card space-y-3">
        <h1 className="text-lg font-semibold">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}

        {mode === "signup" ? (
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aarav Sharma"
              autoComplete="name"
              required
            />
          </div>
        ) : null}

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "Password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          className="btn-outline w-full"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        or
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <button onClick={() => void signInWithGoogle()} className="btn-outline w-full">
        Continue with Google
      </button>

      <p className="text-center text-xs text-zinc-500">
        <Link href="/courses" className="underline">
          Back to courses
        </Link>
      </p>
    </div>
  );
}
