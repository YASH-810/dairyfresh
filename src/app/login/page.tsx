"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { demoUsers, DEMO_PASSWORD } from "@/lib/seed-data";

function LoginForm() {
  const { login } = useStore();
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/dashboard";

  function loginAs(userId: string) {
    login(userId);
    router.push(next);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-dairy">Log in</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Demo mode — no real Firebase Auth is wired up yet. Pick any demo account below (password for reference: <code className="rounded bg-dairy/10 px-1">{DEMO_PASSWORD}</code>).
      </p>

      <div className="mt-6 space-y-3">
        {demoUsers.map((u) => (
          <button
            key={u.id}
            onClick={() => loginAs(u.id)}
            className="flex w-full items-center justify-between rounded-xl border border-dairy/10 p-4 text-left hover:border-sky"
          >
            <div>
              <div className="font-medium text-dairy">{u.name}</div>
              <div className="text-xs text-foreground/60">{u.email}</div>
            </div>
            <span className="rounded-full bg-sky/10 px-2 py-1 text-xs font-medium text-sky">{u.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
