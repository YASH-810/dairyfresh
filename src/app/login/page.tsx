"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthPortal from "@/components/AuthPortal";
import type { Role } from "@/lib/types";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role")?.toUpperCase();
  const role: Role =
    rawRole === "B2B" || rawRole === "DELIVERY" || rawRole === "ADMIN"
      ? (rawRole as Role)
      : "CUSTOMER";

  return <AuthPortal role={role} />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
