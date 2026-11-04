import React, { Suspense } from "react";
import Link from "next/link";
import CheckoutClient from "./CheckoutClient";
import { InteractiveWaitLoader } from "@/app/prepmeup/_components/InteractiveWaitLoader";

export const metadata = {
  title: "Quantum Checkout | PrepMeUp AI",
  description: "Secure enrollment and checkout for PrepMeUp AI Quantum Computing Foundations.",
};

interface Props {
  searchParams: Promise<{ product?: string; earlyAdopter?: string }>;
}

export default async function QuantumCheckoutPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const product = resolvedParams.product === "mentorship_pack" ? "mentorship_pack" : "semester_pass";
  const isEarlyAdopter = resolvedParams.earlyAdopter === "true";

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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#807f78", fontFamily: "monospace" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <Link href="/prepmeup/quantum/pricing" style={{ color: "#807f78", textDecoration: "none" }}>Pricing</Link>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>Checkout</span>
          </div>
        </div>

        <Suspense fallback={<InteractiveWaitLoader title="Preparing Checkout Session…" subtitle="Checking eligibility and payment gateway status." />}>
          <CheckoutClient initialProduct={product} initialEarlyAdopter={isEarlyAdopter} />
        </Suspense>
      </div>
    </main>
  );
}
