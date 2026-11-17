"use client";

import React from "react";
import { PageHeader, EmptyState } from "../../_components/ui";

export default function CyberSecurityPricingPage() {
  return (
    <main
      className="pmu-container"
      style={{
        paddingTop: "40px",
        paddingBottom: "80px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <PageHeader title="CyberSecurity" subtitle="Under construction — coming soon." />
      <EmptyState
        title="Coming Soon"
        description="CyberSecurity is currently under construction. Check back soon or explore your active Semester 1 courses."
        action={{ label: "Back to Pricing", href: "/prepmeup/pricing" }}
      />
    </main>
  );
}
