"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function continueWithGoogle() {
    window.location.href = `${apiUrl}/auth/login`;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-6">
      <section className="w-full max-w-sm rounded-md border border-app-border bg-app-surface p-6">
        <div className="text-center">
          <p className="text-sm font-medium text-app-secondary">Welcome back to</p>
          <h1 className="mt-2 font-mono text-4xl font-bold tracking-normal text-app-primary">
            task-manager
          </h1>
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-md bg-app-primary px-4 text-sm font-semibold text-app-bg transition hover:opacity-90"
        >
          <GoogleLogo />
          Continue with Google
        </button>
      </section>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#FFC107"
        d="M43.61 20.08H42V20H24v8h11.3c-1.65 4.66-6.08 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
      />
      <path
        fill="#FF3D00"
        d="m6.31 14.69 6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 16.32 4 9.66 8.34 6.31 14.69Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.17 0 9.86-1.98 13.41-5.19l-6.19-5.24C29.21 35.09 26.72 36 24 36c-5.2 0-9.62-3.32-11.28-7.95l-6.52 5.03C9.51 39.56 16.23 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.61 20.08H42V20H24v8h11.3a12.05 12.05 0 0 1-4.08 5.57l6.19 5.24C36.97 39.21 44 34 44 24c0-1.34-.14-2.65-.39-3.92Z"
      />
    </svg>
  );
}
