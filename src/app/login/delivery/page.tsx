import { Suspense } from "react";
import AuthPortal from "@/components/AuthPortal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Staff Hub | DairyFresh",
  description: "Sign in to access today's assigned delivery routes and fulfill orders.",
};

export default function DeliveryLoginPage() {
  return (
    <Suspense>
      <AuthPortal role="DELIVERY" />
    </Suspense>
  );
}
