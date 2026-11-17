import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import UnifiedCheckoutClient from "./UnifiedCheckoutClient";
import { getUnifiedProductBySlug } from "@/app/prepmeup/_lib/trackStore";
import { InteractiveWaitLoader } from "@/app/prepmeup/_components/InteractiveWaitLoader";

export const metadata = {
  title: "Unified Checkout | PrepMeUp AI",
  description: "Secure enrollment and checkout across PrepMeUp AI tracks and academic passes.",
};

interface Props {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ earlyAdopter?: string }>;
}

export default async function UnifiedCheckoutPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { productSlug } = resolvedParams;

  const product = getUnifiedProductBySlug(productSlug);
  if (!product) {
    notFound();
  }

  const isEarlyAdopter = resolvedSearchParams.earlyAdopter === "true";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "40px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "840px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "#807f78",
              fontFamily: "monospace",
            }}
          >
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>
              PrepMeUp
            </Link>
            <span>/</span>
            <Link href="/prepmeup/pricing" style={{ color: "#807f78", textDecoration: "none" }}>
              Unified Pricing
            </Link>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>Checkout</span>
          </div>
        </div>

        <Suspense
          fallback={
            <InteractiveWaitLoader
              title="Preparing Secure Checkout…"
              subtitle="Validating product entitlement and Razorpay gateway availability."
            />
          }
        >
          <UnifiedCheckoutClient
            product={JSON.parse(JSON.stringify(product))}
            initialEarlyAdopter={isEarlyAdopter}
          />
        </Suspense>
      </div>
    </main>
  );
}
