import { z } from "zod";

/** Shared zod schemas — every form input is validated before use. */

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const courseInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  description: z.string().trim().max(2000).default(""),
  thumbnail_url: z.string().trim().url("Thumbnail must be a URL").max(500).nullable().default(null),
  published: z.boolean().default(false),
});
export type CourseInput = z.infer<typeof courseInputSchema>;

export const lessonInputSchema = z.object({
  course_id: z.coerce.number().int().positive("Choose a course"),
  title: z.string().trim().min(1, "Title is required").max(200),
  type: z.enum(["pdf", "video", "live", "exercise"]),
  position: z.coerce.number().int().min(0).max(9999).default(0),
  storage_path: z.string().trim().max(500).nullable().default(null),
  duration_label: z.string().trim().max(40).nullable().default(null),
  youtube_id: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{6,20}$/, "That does not look like a YouTube id")
    .nullable()
    .default(null),
  meeting_url: z.string().trim().url("Meeting must be a URL").max(500).nullable().default(null),
  starts_at: z.string().trim().max(40).nullable().default(null),
  live_duration_minutes: z.coerce.number().int().min(5).max(600).default(90),
  recording_youtube_id: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{11}$/, "Recording must be an 11-char YouTube id")
    .nullable()
    .default(null),
  hls_path: z
    .string()
    .trim()
    .max(300)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9\-._/]*$/, "Path: letters, numbers, dash, dot, slash only")
    .nullable()
    .default(null),
  is_free_preview: z.boolean().default(false),
});
export type LessonInput = z.infer<typeof lessonInputSchema>;

export const planInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  price_inr: z.coerce
    .number()
    .int("Price must be a whole rupee amount")
    .min(1, "Price must be at least ₹1")
    .max(200, "Price must stay under ₹200"),
  duration_days: z.coerce.number().int().min(1).max(3650),
  active: z.boolean().default(true),
});
export type PlanInput = z.infer<typeof planInputSchema>;

export const grantDaysSchema = z.object({
  user_id: z.string().uuid(),
  days: z.coerce.number().int().min(1, "Grant at least 1 day").max(3650),
});

export const PDF_MAX_BYTES = 10 * 1024 * 1024; // 10 MB — free-tier cap

/** Phase 5 — coding exercises. */

/** Must match the DB CHECK (octet_length(latest_code) <= 20480). */
export const EXERCISE_CODE_MAX_BYTES = 20 * 1024;

export const exerciseLanguageSchema = z.enum(["javascript", "python", "html-css", "sql"]);

export const exerciseTestSchema = z.object({
  name: z.string().trim().min(1, "Test name is required").max(120),
  fn: z.string().trim().max(2000).default(""), // expression (js/python); unused for sql/html-css
  expect: z.union([z.string(), z.number(), z.boolean(), z.null()]).default(""),
});

export const exerciseInputSchema = z.object({
  lesson_id: z.coerce.number().int().positive(),
  language: exerciseLanguageSchema,
  instructions_md: z.string().trim().min(1, "Instructions are required").max(20000),
  starter_code: z.string().max(EXERCISE_CODE_MAX_BYTES, "Starter code over 20 KB"),
  tests: z.array(exerciseTestSchema).max(20, "Keep it under 20 tests"),
  hints: z.array(z.string().trim().max(500)).max(5, "Up to 5 hints"),
  sample_db_sql: z.string().max(10000).default(""),
});
export type ExerciseInput = z.infer<typeof exerciseInputSchema>;
