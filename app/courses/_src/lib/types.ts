export type LessonType = "pdf" | "video" | "live" | "exercise";
export type ExerciseLanguage = "javascript" | "python" | "html-css" | "sql";
export type PaymentStatus = "created" | "paid" | "failed";

export interface Profile {
  id: string;
  full_name: string;
  role: "student" | "admin";
  access_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseTest {
  name: string;
  /** For js/python: the expression to evaluate. For sql/html-css: unused. */
  fn: string;
  /** Expected value (deep-equality) or result grid string (sql). */
  expect: unknown;
}

export interface Exercise {
  lesson_id: number;
  language: ExerciseLanguage;
  instructions_md: string;
  starter_code: string;
  tests: ExerciseTest[];
  hints: string[];
  /** SQL exercises: CREATE/INSERT statements preloaded before student SQL. */
  sample_db_sql: string;
}

export interface ExerciseProgress {
  latest_code: string;
  best_score: number;
  passed: boolean;
  attempts: number;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  type: LessonType;
  /** Phase 4: which player a video lesson uses — YouTube embed or R2 HLS. */
  video_source: "youtube" | "hls";
  position: number;
  storage_path: string | null;
  duration_label: string | null;
  live_starts_at: string | null;
  live_duration_minutes: number;
  is_free_preview: boolean;
  created_at: string;
}

export interface LessonSecret {
  lesson_id: number;
  youtube_id: string | null;
  meeting_url: string | null;
  recording_youtube_id: string | null;
  /** Phase 4: R2 key of the HLS master playlist (folder part is listed). */
  hls_path: string | null;
}

export interface Plan {
  id: number;
  name: string;
  price_inr: number;
  duration_days: number;
  active: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: string;
  plan_id: number | null;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number; // paise
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile extends Profile {
  email: string;
}

export interface AdminPayment extends Payment {
  plan_name: string | null;
  user_email: string;
}
