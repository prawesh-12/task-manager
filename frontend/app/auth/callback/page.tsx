"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { clearToken, setToken } from "@/lib/auth";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Redirecting />}>
      <AuthCallbackHandler />
    </Suspense>
  );
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      setToken(token);
      router.replace("/dashboard");
      return;
    }

    if (error) {
      clearToken();
      router.replace("/");
      return;
    }

    router.replace("/");
  }, [router, searchParams]);

  return <Redirecting />;
}

function Redirecting() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-6 text-sm text-app-secondary">
      Redirecting...
    </main>
  );
}
