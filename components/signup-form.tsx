"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

type Values = { name: string; email: string; password: string };

export function SignupForm() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Values>();
  const [message, setMessage] = useState("");

  const onSubmit = async (values: Values) => {
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error || "Sign up failed");
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    if (result?.error) {
      setMessage("Account created. Please log in.");
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="card max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register("name", { required: true })} placeholder="Name" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
        <input {...register("email", { required: true })} placeholder="Email" type="email" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
        <input {...register("password", { required: true })} placeholder="Password" type="password" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          Sign up
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
