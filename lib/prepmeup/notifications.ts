import fs from "fs";
import path from "path";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { resolvePersistentDataDir } from "@/app/prepmeup/_lib/studentStore";

export type NotificationCategory = "info" | "alert" | "success" | "mentorship";
export type NotificationAudience = "all" | "paid" | "free" | "specific_user";

export interface CustomNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  audience: NotificationAudience;
  recipientTarget?: string;
  ctaLabel?: string;
  ctaHref?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

function getNotificationsFilePath(): string {
  return path.join(resolvePersistentDataDir(), "custom_notifications.json");
}

const DEFAULT_NOTIFICATIONS: CustomNotification[] = [
  {
    id: "notif-welcome-sem1",
    title: "⚡ Semester 1 High-Yield Notes & Quantum Track Live",
    message:
      "Access verified LaTeX derivations for CSE1001–CSE1006 and explore interactive Quantum & CyberSecurity labs.",
    category: "info",
    audience: "all",
    ctaLabel: "Explore Subjects →",
    ctaHref: "/prepmeup/subjects",
    isActive: true,
    createdBy: "admin@ridheshcybe.dpdns.org",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function loadCustomNotifications(): CustomNotification[] {
  const filePath = getNotificationsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  saveCustomNotifications(DEFAULT_NOTIFICATIONS);
  return [...DEFAULT_NOTIFICATIONS];
}

export function saveCustomNotifications(list: CustomNotification[]): void {
  const filePath = getNotificationsFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[Notifications] Failed to save notifications:", err);
  }
}

export async function createCustomNotification(params: {
  title: string;
  message: string;
  category?: NotificationCategory;
  audience?: NotificationAudience;
  recipientTarget?: string;
  ctaLabel?: string;
  ctaHref?: string;
  expiresInHours?: number;
  createdBy?: string;
}): Promise<CustomNotification> {
  const list = loadCustomNotifications();
  const now = new Date();
  const hours = Math.max(1, Math.min(720, Number(params.expiresInHours) || 72));
  const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

  const item: CustomNotification = {
    id: `cnotif-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    title: params.title.trim(),
    message: params.message.trim(),
    category: params.category || "info",
    audience: params.audience || "all",
    recipientTarget: params.recipientTarget?.trim() || undefined,
    ctaLabel: params.ctaLabel?.trim() || undefined,
    ctaHref: params.ctaHref?.trim() || undefined,
    isActive: true,
    createdBy: params.createdBy || "admin@ridheshcybe.dpdns.org",
    createdAt: now.toISOString(),
    expiresAt,
  };

  list.unshift(item);
  saveCustomNotifications(list);

  // Sync to Supabase if configured
  const service = createPmuServiceClient();
  if (service) {
    try {
      await service.from("pmu_custom_notifications").insert({
        id: item.id,
        title: item.title,
        message: item.message,
        category: item.category,
        audience: item.audience,
        recipient_target: item.recipientTarget || null,
        cta_label: item.ctaLabel || null,
        cta_href: item.ctaHref || null,
        is_active: item.isActive,
        created_by: item.createdBy,
        created_at: item.createdAt,
        expires_at: item.expiresAt,
      });
    } catch {}
  }

  return item;
}

export function getActiveNotificationsForUser(params?: {
  userTarget?: string;
  isPaidUser?: boolean;
}): CustomNotification[] {
  const list = loadCustomNotifications();
  const nowMs = Date.now();
  const targetLower = params?.userTarget?.toLowerCase().trim() || "";

  return list.filter((n) => {
    if (!n.isActive) return false;
    if (new Date(n.expiresAt).getTime() <= nowMs) return false;

    if (n.audience === "all") return true;
    if (n.audience === "paid") return Boolean(params?.isPaidUser);
    if (n.audience === "free") return !params?.isPaidUser;
    if (n.audience === "specific_user") {
      if (!targetLower || !n.recipientTarget) return false;
      return n.recipientTarget.toLowerCase().trim() === targetLower;
    }
    return true;
  });
}

export async function toggleCustomNotification(id: string): Promise<CustomNotification | null> {
  const list = loadCustomNotifications();
  const item = list.find((n) => n.id === id);
  if (!item) return null;

  item.isActive = !item.isActive;
  saveCustomNotifications(list);

  const service = createPmuServiceClient();
  if (service) {
    try {
      await service
        .from("pmu_custom_notifications")
        .update({ is_active: item.isActive })
        .eq("id", id);
    } catch {}
  }

  return item;
}

export async function deleteCustomNotification(id: string): Promise<boolean> {
  const list = loadCustomNotifications();
  const filtered = list.filter((n) => n.id !== id);
  if (filtered.length === list.length) return false;

  saveCustomNotifications(filtered);

  const service = createPmuServiceClient();
  if (service) {
    try {
      await service.from("pmu_custom_notifications").delete().eq("id", id);
    } catch {}
  }

  return true;
}
