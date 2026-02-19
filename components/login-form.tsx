"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

type AuthMode = "signin" | "signup";

type AuthValues = {
  name?: string;
  email: string;
  password: string;
};

export function LoginForm({
  initialMode = "signin",
  showGoogle,
  showEmailMagicLink,
  showDemoLogin
}: {
  initialMode?: AuthMode;
  showGoogle: boolean;
  showEmailMagicLink: boolean;
  showDemoLogin: boolean;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { isSubmitting }
  } = useForm<AuthValues>();
  const [message, setMessage] = useState("");

  const onSignIn = async (values: AuthValues) => {
    setMessage("");
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    if (result?.error) {
      setMessage(result.error === "CredentialsSignin" ? "Invalid credentials." : `Login error: ${result.error}`);
      return;
    }
    window.location.href = "/dashboard";
  };

  const onSignUp = async (values: AuthValues) => {
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name?.trim() || "New User",
        email: values.email,
        password: values.password
      })
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error || "Sign up failed.");
      return;
    }

    await onSignIn(values);
  };

  const onSubmit = async (values: AuthValues) => {
    if (mode === "signup") {
      await onSignUp(values);
      return;
    }
    await onSignIn(values);
  };

  const sendMagicLink = async (email: string) => {
    setMessage("");
    const result = await signIn("email", { email, redirect: false, callbackUrl: "/dashboard" });
    if (result?.error) {
      setMessage("Could not send magic link.");
      return;
    }
    setMessage("Magic link sent. Check your inbox.");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/40 shadow-2xl shadow-black/30 md:grid md:grid-cols-2">
        <div className="p-7 sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight">{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "signin" ? "Continue your progress." : "Start tracking every session."}
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
            {mode === "signup" ? (
              <input
                {...register("name", { required: mode === "signup" })}
                placeholder="Name"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              />
            ) : null}
            <input
              {...register("email", { required: true })}
              placeholder="Email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-3 space-y-2">
            {showGoogle ? (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="btn-secondary w-full"
              >
                Continue with Google
              </button>
            ) : (
              <p className="text-xs text-slate-400">Google OAuth is not configured.</p>
            )}

            {mode === "signin" && showEmailMagicLink ? (
              <button
                type="button"
                onClick={() => {
                  const email = getValues("email");
                  if (email) void sendMagicLink(email);
                }}
                className="btn-secondary w-full"
              >
                Send Magic Link
              </button>
            ) : null}

            {mode === "signin" && showDemoLogin ? (
              <p className="text-xs text-slate-400">Demo account remains enabled in backend for local/demo environments.</p>
            ) : null}
          </div>

          {message ? <p className="mt-4 text-sm text-amber-300">{message}</p> : null}
        </div>

        <div className="flex flex-col justify-center bg-gradient-to-br from-cyan-500 to-sky-600 p-7 text-slate-50 sm:p-10">
          <p className="text-3xl font-bold">{mode === "signin" ? "Hello, friend!" : "Welcome back!"}</p>
          <p className="mt-3 max-w-xs text-sm text-cyan-50/95">
            {mode === "signin"
              ? "Create an account to sync progress, rankings, and premium insights."
              : "Already have an account? Sign in and continue your typing streaks."}
          </p>
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setMode((prev) => (prev === "signin" ? "signup" : "signin"));
            }}
            className="mt-6 inline-flex w-fit rounded-full border border-white/70 px-5 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-white/15"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
