"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm({
  showGoogle,
  showEmailMagicLink,
  showDemoLogin,
  demoEmail,
  demoPassword
}: {
  showGoogle: boolean;
  showEmailMagicLink: boolean;
  showDemoLogin: boolean;
  demoEmail: string;
  demoPassword: string;
}) {
  const { register, handleSubmit, setValue, getValues, formState: { isSubmitting } } = useForm<LoginValues>();
  const [message, setMessage] = useState("");

  const onSubmit = async (values: LoginValues) => {
    setMessage("");
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    if (result?.error) {
      setMessage(result.error === "CredentialsSignin" ? "Invalid credentials." : `Login error: ${result.error}`);
      return;
    }
    window.location.href = "/dashboard";
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
    <div className="card max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
          Continue
        </button>
      </form>

      {showDemoLogin ? (
        <button
          type="button"
          onClick={() => {
            setValue("email", demoEmail);
            setValue("password", demoPassword);
            void onSubmit({ email: demoEmail, password: demoPassword });
          }}
          className="btn-secondary mt-3 w-full"
        >
          Use Demo Login
        </button>
      ) : null}

      {showGoogle ? (
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-secondary mt-3 w-full">
          Continue with Google
        </button>
      ) : (
        <p className="mt-3 text-xs text-slate-400">Google OAuth is not configured.</p>
      )}

      {showEmailMagicLink ? (
        <button
          onClick={() => {
            const email = getValues("email");
            if (email) void sendMagicLink(email);
          }}
          className="btn-secondary mt-2 w-full"
        >
          Send Magic Link
        </button>
      ) : (
        <p className="mt-2 text-xs text-slate-400">Magic links are not configured.</p>
      )}

      {message ? <p className="mt-3 text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
