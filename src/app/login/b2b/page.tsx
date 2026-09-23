import { Suspense } from "react";
import AuthPortal from "@/components/AuthPortal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B Wholesale Portal | DairyFresh",
  description: "Wholesale dairy account login and registration for cafés, hotels, restaurants, and sweet shops.",
};

export default function B2BLoginPage() {
  return (
    <Suspense>
      <AuthPortal role="B2B" />
    </Suspense>
  );
}
