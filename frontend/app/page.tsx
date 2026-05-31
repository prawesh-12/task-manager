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
      <section className="w-full max-w-sm text-center">
        <h1 className="font-mono text-4xl font-bold tracking-normal text-app-primary">
          task-manager
        </h1>

        <button
          type="button"
          onClick={continueWithGoogle}
          className="mt-10 h-12 w-full rounded-md bg-app-primary px-4 text-sm font-semibold text-app-bg transition hover:opacity-90"
        >
          Continue with Google
        </button>
      </section>
    </main>
  );
}
