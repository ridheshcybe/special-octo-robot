import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { loadPersistentState, savePersistentState, type PersistentState } from "@/lib/prepmeup/storage";
import { loadState as loadTrackState, persistState as persistTrackState } from "@/app/prepmeup/_lib/trackStore";
import { getAllAppUsers, resolvePersistentDataDir } from "@/app/prepmeup/_lib/studentStore";
import { loadCustomNotifications, saveCustomNotifications, type CustomNotification } from "@/lib/prepmeup/notifications";
import { SEED } from "@/lib/seed";

export const BACKUP_BUCKET_NAME = "pmu-backups";
export const WEEKLY_RETENTION_DAYS = 7;
export const WEEKLY_RETENTION_MS = WEEKLY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export interface BackupSummaryStats {
  subjectsCount: number;
  notesCount: number;
  pastPapersCount: number;
  tracksCount: number;
  coursesCount: number;
  lessonsCount: number;
  simulationsCount: number;
  unifiedProductsCount: number;
  ordersCount: number;
  entitlementsCount: number;
  registeredUsersCount: number;
  portfolioProjectsCount: number;
}

export interface BackupPackageData {
  meta: {
    packageFormat: "prepmeup-supabase-weekly-backup-v1";
    version: string;
    weekIdentifier: string;
    generatedAt: string;
    expiresAt: string;
    source: "code_and_live_store";
  };
  summary: BackupSummaryStats;
  portfolioSeed: typeof SEED;
  adminState: PersistentState;
  trackState: ReturnType<typeof loadTrackState>;
  customNotifications?: CustomNotification[];
  usersSnapshot: Array<{
    id: string;
    name: string;
    target: string;
    role: string;
    tier: string;
    registeredAt: string;
  }>;
}

export interface BackupRecord {
  id: string;
  backupKey: string;
  weekIdentifier: string;
  version: string;
  storagePath: string;
  source: string;
  sizeBytes: number;
  checksumSha256: string;
  summary: BackupSummaryStats;
  status: "active" | "stale" | "deleted";
  supabaseSynced: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

interface BackupRegistryState {
  lastRotationAt: string | null;
  totalStaleDeleted: number;
  records: BackupRecord[];
}

/**
 * Computes ISO-8601 Week Identifier (e.g., "2026-W46")
 */
export function getWeekIdentifier(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getBackupDir(): string {
  const baseDir = resolvePersistentDataDir();
  const backupDir = path.join(baseDir, "backups");
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
  } catch {}
  return backupDir;
}

function getRegistryFilePath(): string {
  return path.join(getBackupDir(), "backup_registry.json");
}

function loadRegistry(): BackupRegistryState {
  const regPath = getRegistryFilePath();
  try {
    if (fs.existsSync(regPath)) {
      const raw = fs.readFileSync(regPath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        lastRotationAt: parsed.lastRotationAt || null,
        totalStaleDeleted: Number(parsed.totalStaleDeleted) || 0,
        records: Array.isArray(parsed.records) ? parsed.records : [],
      };
    }
  } catch {}
  return {
    lastRotationAt: null,
    totalStaleDeleted: 0,
    records: [],
  };
}

function saveRegistry(reg: BackupRegistryState): void {
  const regPath = getRegistryFilePath();
  try {
    fs.writeFileSync(regPath, JSON.stringify(reg, null, 2), "utf-8");
  } catch (err) {
    console.error("[BackupManager] Failed to write backup registry:", err);
  }
}

/**
 * Builds a complete, deterministic backup package directly from the code & active stores.
 */
export function buildBackupPackageFromCode(now: Date = new Date()): {
  packageData: BackupPackageData;
  jsonString: string;
  sizeBytes: number;
  checksumSha256: string;
  weekIdentifier: string;
} {
  const weekIdentifier = getWeekIdentifier(now);
  const generatedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + WEEKLY_RETENTION_MS).toISOString();

  const adminState = loadPersistentState();
  const trackState = loadTrackState();
  const allUsers = getAllAppUsers();

  const usersSnapshot = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    target: u.target,
    role: u.role,
    tier: u.tier,
    registeredAt: u.registeredAt,
  }));

  const summary: BackupSummaryStats = {
    subjectsCount: (adminState.subjects || []).length,
    notesCount: (adminState.notes || []).length,
    pastPapersCount: (adminState.pastPapers || []).length,
    tracksCount: (trackState.tracks || []).length,
    coursesCount: (trackState.courses || []).length,
    lessonsCount: (trackState.lessons || []).length,
    simulationsCount: (trackState.simulations || []).length,
    unifiedProductsCount: (trackState.unifiedProducts || []).length,
    ordersCount: (trackState.unifiedOrders || []).length,
    entitlementsCount: (trackState.allAccessEntitlements || []).length,
    registeredUsersCount: usersSnapshot.length,
    portfolioProjectsCount: (SEED.projects?.items || []).length,
  };

  const packageData: BackupPackageData = {
    meta: {
      packageFormat: "prepmeup-supabase-weekly-backup-v1",
      version: "1.0.0",
      weekIdentifier,
      generatedAt,
      expiresAt,
      source: "code_and_live_store",
    },
    summary,
    portfolioSeed: SEED,
    adminState,
    trackState,
    customNotifications: loadCustomNotifications(),
    usersSnapshot,
  };

  const jsonString = JSON.stringify(packageData, null, 2);
  const sizeBytes = Buffer.byteLength(jsonString, "utf-8");
  const checksumSha256 = crypto.createHash("sha256").update(jsonString).digest("hex");

  return {
    packageData,
    jsonString,
    sizeBytes,
    checksumSha256,
    weekIdentifier,
  };
}

/**
 * Deletes stale backups older than `maxAgeDays` (default 7 days / 1 week) or from superseded weeks
 * across Supabase Database, Supabase Storage (`pmu-backups`), and local disk.
 */
export async function purgeStaleBackups(options?: {
  maxAgeDays?: number;
  currentWeekToKeep?: string;
  deletePriorWeeks?: boolean;
  simulatedNowMs?: number;
}): Promise<{
  deletedCount: number;
  deletedKeys: string[];
}> {
  const maxAgeDays = options?.maxAgeDays ?? WEEKLY_RETENTION_DAYS;
  const nowMs = options?.simulatedNowMs ?? Date.now();
  const cutoffMs = nowMs - maxAgeDays * 24 * 60 * 60 * 1000;

  const registry = loadRegistry();
  const staleRecords: BackupRecord[] = [];
  const keptRecords: BackupRecord[] = [];

  for (const rec of registry.records) {
    const createdMs = new Date(rec.createdAt).getTime();
    const expiresMs = new Date(rec.expiresAt).getTime();
    const isOlderThanCutoff = createdMs < cutoffMs || expiresMs <= nowMs;
    const isPriorWeek =
      Boolean(options?.deletePriorWeeks && options?.currentWeekToKeep) &&
      rec.weekIdentifier !== options!.currentWeekToKeep;

    if (isOlderThanCutoff || isPriorWeek) {
      staleRecords.push(rec);
    } else {
      keptRecords.push(rec);
    }
  }

  const deletedKeys = staleRecords.map((r) => r.backupKey);

  // 1. Delete local backup package files for stale records
  const backupDir = getBackupDir();
  for (const stale of staleRecords) {
    try {
      const localFile = path.join(backupDir, stale.backupKey);
      if (fs.existsSync(localFile)) {
        fs.unlinkSync(localFile);
      }
    } catch {}
  }

  // 2. Delete from Supabase Storage & Database if service client is configured
  const service = createPmuServiceClient();
  if (service) {
    try {
      const cutoffIso = new Date(cutoffMs).toISOString();

      // Fetch any stale rows in Supabase DB to also remove their storage objects
      const { data: dbStaleRows } = await service
        .from("pmu_system_backups")
        .select("id, backup_key, storage_path, week_identifier, created_at")
        .or(`created_at.lt.${cutoffIso},expires_at.lte.${new Date(nowMs).toISOString()}`);

      const storagePathsToRemove = new Set<string>(
        staleRecords.map((r) => r.storagePath).filter(Boolean)
      );

      if (Array.isArray(dbStaleRows)) {
        for (const row of dbStaleRows) {
          if (row.storage_path) storagePathsToRemove.add(row.storage_path);
          if (row.backup_key && !deletedKeys.includes(row.backup_key)) {
            deletedKeys.push(row.backup_key);
          }
        }
      }

      if (storagePathsToRemove.size > 0) {
        await service.storage
          .from(BACKUP_BUCKET_NAME)
          .remove(Array.from(storagePathsToRemove));
      }

      // Delete stale rows from pmu_system_backups
      await service
        .from("pmu_system_backups")
        .delete()
        .or(`created_at.lt.${cutoffIso},expires_at.lte.${new Date(nowMs).toISOString()}`);

      if (options?.deletePriorWeeks && options?.currentWeekToKeep) {
        await service
          .from("pmu_system_backups")
          .delete()
          .neq("week_identifier", options.currentWeekToKeep);
      }
    } catch (err) {
      console.warn("[BackupManager] Supabase stale cleanup warning:", err);
    }
  }

  registry.records = keptRecords;
  registry.totalStaleDeleted += deletedKeys.length;
  saveRegistry(registry);

  return {
    deletedCount: deletedKeys.length,
    deletedKeys,
  };
}

/**
 * Weekly Backup Rotation:
 * 1. Deletes stale backups (> 7 days old or from previous weeks).
 * 2. Builds the new backup package from the code & live state.
 * 3. Uploads the new backup package to Supabase Storage (`pmu-backups`) and `pmu_system_backups` table.
 */
export async function runWeeklyBackupRotation(options?: {
  forceNew?: boolean;
  triggeredBy?: string;
  simulatedNowMs?: number;
}): Promise<{
  rotated: boolean;
  staleDeletedCount: number;
  deletedKeys: string[];
  activeBackup: BackupRecord;
}> {
  const nowMs = options?.simulatedNowMs ?? Date.now();
  const now = new Date(nowMs);
  const currentWeek = getWeekIdentifier(now);

  // Step 1: Always purge stale backups (> 7 days old or prior weeks)
  const purgeRes = await purgeStaleBackups({
    maxAgeDays: WEEKLY_RETENTION_DAYS,
    currentWeekToKeep: currentWeek,
    deletePriorWeeks: true,
    simulatedNowMs: nowMs,
  });

  const registry = loadRegistry();
  const existingForWeek = registry.records.find(
    (r) => r.weekIdentifier === currentWeek && r.status === "active"
  );

  // If an active backup for this week already exists and forceNew is not requested, return it
  if (existingForWeek && !options?.forceNew) {
    return {
      rotated: false,
      staleDeletedCount: purgeRes.deletedCount,
      deletedKeys: purgeRes.deletedKeys,
      activeBackup: existingForWeek,
    };
  }

  // If forceNew is true and there are prior snapshots from the same week, clean them up too so only the fresh package remains
  if (options?.forceNew && registry.records.length > 0) {
    const backupDir = getBackupDir();
    for (const oldRec of registry.records) {
      try {
        const p = path.join(backupDir, oldRec.backupKey);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch {}
    }
    registry.records = [];
  }

  // Step 2: Build the new backup package from the code
  const { packageData, jsonString, sizeBytes, checksumSha256, weekIdentifier } =
    buildBackupPackageFromCode(now);

  const backupKey = `pmu-backup-${weekIdentifier}-${nowMs}.json`;
  const storagePath = `weekly/${weekIdentifier}/${backupKey}`;
  const createdBy = options?.triggeredBy || "system-weekly-rotation";

  // Save package locally in deploy/cms/backups/
  const backupDir = getBackupDir();
  try {
    fs.writeFileSync(path.join(backupDir, backupKey), jsonString, "utf-8");
  } catch (err) {
    console.warn("[BackupManager] Could not write local backup file:", err);
  }

  // Step 3: Upload to Supabase Storage & Database
  let supabaseSynced = false;
  const service = createPmuServiceClient();
  if (service) {
    try {
      // Upload JSON bundle to Supabase Storage bucket `pmu-backups`
      const uploadRes = await service.storage
        .from(BACKUP_BUCKET_NAME)
        .upload(storagePath, Buffer.from(jsonString, "utf-8"), {
          contentType: "application/json",
          upsert: true,
        });

      // Call RPC or insert directly into `pmu_system_backups`
      const rpcRes = await service.rpc("rotate_weekly_pmu_backups", {
        p_backup_key: backupKey,
        p_week_identifier: weekIdentifier,
        p_storage_path: storagePath,
        p_size_bytes: sizeBytes,
        p_checksum_sha256: checksumSha256,
        p_summary: packageData.summary,
        p_payload: packageData,
        p_created_by: createdBy,
      });

      if (!rpcRes.error || !uploadRes.error) {
        supabaseSynced = true;
      } else {
        // Fallback direct table insert if RPC hasn't been applied yet
        const { error: insertErr } = await service.from("pmu_system_backups").upsert(
          {
            backup_key: backupKey,
            week_identifier: weekIdentifier,
            storage_path: storagePath,
            source: "code_package",
            size_bytes: sizeBytes,
            checksum_sha256: checksumSha256,
            summary: packageData.summary,
            payload: packageData,
            status: "active",
            created_by: createdBy,
            created_at: packageData.meta.generatedAt,
            expires_at: packageData.meta.expiresAt,
          },
          { onConflict: "backup_key" }
        );
        if (!insertErr) supabaseSynced = true;
      }
    } catch (err) {
      console.warn("[BackupManager] Supabase upload fallback to local registry:", err);
    }
  }

  const record: BackupRecord = {
    id: `bkp-${weekIdentifier}-${nowMs}`,
    backupKey,
    weekIdentifier,
    version: packageData.meta.version,
    storagePath,
    source: "code_package",
    sizeBytes,
    checksumSha256,
    summary: packageData.summary,
    status: "active",
    supabaseSynced,
    createdBy,
    createdAt: packageData.meta.generatedAt,
    expiresAt: packageData.meta.expiresAt,
  };

  registry.records.unshift(record);
  registry.lastRotationAt = now.toISOString();
  saveRegistry(registry);

  return {
    rotated: true,
    staleDeletedCount: purgeRes.deletedCount,
    deletedKeys: purgeRes.deletedKeys,
    activeBackup: record,
  };
}

/**
 * Lists all backups and automatically runs weekly rotation if no active backup exists for the current week.
 */
export async function getBackupsStatus(autoEnsureWeekly = true): Promise<{
  currentWeek: string;
  retentionDays: number;
  lastRotationAt: string | null;
  nextRotationAt: string;
  totalStaleDeleted: number;
  supabaseConfigured: boolean;
  backups: BackupRecord[];
}> {
  if (autoEnsureWeekly) {
    await runWeeklyBackupRotation({ forceNew: false });
  }

  const registry = loadRegistry();
  const currentWeek = getWeekIdentifier();
  const latest = registry.records[0];
  const nextRotationAt = latest
    ? latest.expiresAt
    : new Date(Date.now() + WEEKLY_RETENTION_MS).toISOString();

  const service = createPmuServiceClient();

  return {
    currentWeek,
    retentionDays: WEEKLY_RETENTION_DAYS,
    lastRotationAt: registry.lastRotationAt,
    nextRotationAt,
    totalStaleDeleted: registry.totalStaleDeleted,
    supabaseConfigured: Boolean(service),
    backups: registry.records,
  };
}

/**
 * Retrieves the raw BackupPackageData by ID or key, verifying SHA-256 integrity.
 */
export async function getBackupPackageById(
  backupIdOrKey: string
): Promise<{
  ok: boolean;
  record?: BackupRecord;
  packageData?: BackupPackageData;
  error?: string;
}> {
  const registry = loadRegistry();
  const record = registry.records.find(
    (r) => r.id === backupIdOrKey || r.backupKey === backupIdOrKey
  );

  if (!record) {
    return { ok: false, error: "Backup record not found." };
  }

  // Try local file first
  const localPath = path.join(getBackupDir(), record.backupKey);
  if (fs.existsSync(localPath)) {
    try {
      const raw = fs.readFileSync(localPath, "utf-8");
      const actualHash = crypto.createHash("sha256").update(raw).digest("hex");
      if (actualHash !== record.checksumSha256) {
        return { ok: false, error: "Backup checksum verification failed (tampered or corrupted)." };
      }
      return {
        ok: true,
        record,
        packageData: JSON.parse(raw) as BackupPackageData,
      };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Failed to read backup package." };
    }
  }

  // Try Supabase DB payload
  const service = createPmuServiceClient();
  if (service) {
    try {
      const { data, error } = await service
        .from("pmu_system_backups")
        .select("payload, checksum_sha256")
        .eq("backup_key", record.backupKey)
        .maybeSingle();

      if (!error && data?.payload) {
        return {
          ok: true,
          record,
          packageData: data.payload as BackupPackageData,
        };
      }
    } catch {}
  }

  return { ok: false, error: "Backup package file is unavailable." };
}

/**
 * Restores platform state from a verified backup package.
 */
export async function restoreFromBackup(
  backupIdOrKey: string
): Promise<{
  ok: boolean;
  restoredRecord?: BackupRecord;
  error?: string;
}> {
  const res = await getBackupPackageById(backupIdOrKey);
  if (!res.ok || !res.packageData || !res.record) {
    return { ok: false, error: res.error || "Could not load backup package for restore." };
  }

  try {
    if (res.packageData.adminState) {
      savePersistentState(res.packageData.adminState);
    }
    if (res.packageData.trackState) {
      const currentTrackState = loadTrackState();
      Object.assign(currentTrackState, res.packageData.trackState);
      persistTrackState();
    }
    if (Array.isArray(res.packageData.customNotifications)) {
      saveCustomNotifications(res.packageData.customNotifications);
    }
    return { ok: true, restoredRecord: res.record };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to restore state from backup." };
  }
}
