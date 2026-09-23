import { Suspense } from "react";
import AuthPortal from "@/components/AuthPortal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Login & Registration | DairyFresh",
  description: "Sign in or register for fresh dairy deliveries and milk subscriptions.",
};

export default function CustomerLoginPage() {
  return (
    <Suspense>
      <AuthPortal role="CUSTOMER" />
    </Suspense>
  );
}
