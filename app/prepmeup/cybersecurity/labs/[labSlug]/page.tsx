import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  getCyberLabBySlug,
  hasUserAcceptedLabPolicy,
  getUserCyberLabProgress,
} from "@/app/prepmeup/_lib/trackStore";
import { canAccessCyberLab } from "@/lib/prepmeup/access";
import LabWorkspaceClient from "./LabWorkspaceClient";

export const dynamic = "force-dynamic";

export default async function CyberLabWorkspacePage({
  params,
}: {
  params: Promise<{ labSlug: string }>;
}) {
  const { labSlug } = await params;
  const lab = getCyberLabBySlug(labSlug);

  if (!lab) {
    notFound();
  }

  const cookieStore = await cookies();
  const identity = resolveSessionIdentity(cookieStore);
  const userIdentifier = identity?.email || identity?.phone || identity?.canonicalId || null;

  const hasAccess = canAccessCyberLab(userIdentifier, lab);
  const hasAcceptedPolicy = hasUserAcceptedLabPolicy(identity?.canonicalId, lab.id);
  const userProgress = getUserCyberLabProgress(identity?.canonicalId, lab.id);

  return (
    <LabWorkspaceClient
      lab={lab}
      hasAccess={hasAccess}
      initialAcceptedPolicy={hasAcceptedPolicy}
      userProgress={userProgress}
      userTarget={userIdentifier}
    />
  );
}
