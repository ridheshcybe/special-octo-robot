import { z } from "zod";

/**
 * Normalizes Indian numbers to E.164 (+91XXXXXXXXXX) format.
 */
export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]\d{9}$/.test(digits.slice(1))) {
    return `+91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    return `+${digits}`;
  }
  return null;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    const normalized = normalizeIndianPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid 10-digit Indian WhatsApp mobile number",
      });
      return z.NEVER;
    }
    return normalized;
  });

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .toLowerCase();

export const authTargetSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    if (val.includes("@")) {
      const parsed = z.string().email().safeParse(val.toLowerCase());
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid email address",
        });
        return z.NEVER;
      }
      return { type: "email" as const, value: parsed.data };
    }

    const normalized = normalizeIndianPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address or 10-digit mobile number",
      });
      return z.NEVER;
    }
    return { type: "phone" as const, value: normalized };
  });

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit number");

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(60, "Name too long"),
  college: z.string().trim().max(120, "College name too long").optional().default(""),
  branch: z.string().trim().min(2, "Branch must be at least 2 characters").default("B.Tech CSE AI/ML"),
  currentSemester: z.coerce.number().int().min(1).max(8).default(1),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid admin email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function sanitizeRedirect(url: string | null | undefined): string {
  if (!url) return "/prepmeup/dashboard";
  if (url.startsWith("/prepmeup") && !url.startsWith("//") && !url.includes("://")) {
    return url;
  }
  return "/prepmeup/dashboard";
}

// ============================================================================
// Phase 3 Zod Validation Schemas
// ============================================================================

export const syllabusExtractionSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  pdfText: z.string().min(20, "Syllabus text must contain at least 20 characters"),
  fileName: z.string().min(1, "File name is required"),
});

export const structuredSyllabusSchema = z.object({
  modules: z.array(
    z.object({
      moduleNumber: z.number().int().positive(),
      title: z.string().min(2),
      description: z.string().optional().default(""),
      topics: z.array(
        z.object({
          topicNumber: z.number().int().positive(),
          title: z.string().min(2),
          slug: z.string().min(2),
          estimatedReadingMinutes: z.number().int().positive().default(15),
          isSample: z.boolean().default(false),
        })
      ),
    })
  ),
  suggestedReferences: z.array(z.string()).optional().default([]),
});

export const generateNotesDraftSchema = z.object({
  subjectId: z.string().uuid(),
  subjectTitle: z.string().min(2),
  moduleId: z.string().uuid().optional(),
  moduleTitle: z.string().min(2),
  topicId: z.string().uuid().optional(),
  topicTitle: z.string().min(2),
  syllabusContext: z.string().optional().default(""),
});

export const generateQuestionsBatchSchema = z.object({
  subjectId: z.string().uuid(),
  subjectTitle: z.string().min(2),
  moduleId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  topicTitle: z.string().min(2),
  count: z.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  types: z.array(z.enum(["mcq_single", "numerical", "short_answer", "long_answer", "coding"])).min(1),
});

export const questionBankItemSchema = z.object({
  questionType: z.enum(["mcq_single", "numerical", "short_answer", "long_answer", "coding"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionText: z.string().min(5),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any(),
  explanation: z.string().min(5),
  marks: z.number().min(0.5).max(20).default(1),
  rubric: z.string().optional(),
});

export const structuredQuestionsResponseSchema = z.object({
  questions: z.array(questionBankItemSchema),
});

export const noteUpsertSchema = z.object({
  topicId: z.string().uuid("Valid topic ID required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  contentMarkdown: z.string().min(10, "Markdown content must be at least 10 characters"),
  readingTimeMin: z.number().int().min(1).max(120).default(15),
  isSample: z.boolean().default(false),
  status: z.enum(["draft", "under_review", "approved", "published", "rejected"]).default("draft"),
  isPublished: z.boolean().default(false),
});

export const pastPaperUpsertSchema = z.object({
  subjectId: z.string().uuid("Valid subject ID required"),
  examYear: z.number().int().min(2015).max(2035),
  examType: z.enum(["End-Semester", "Mid-Semester Test 1", "Mid-Semester Test 2", "Supplementary", "Model Paper"]),
  title: z.string().min(5, "Paper title must be at least 5 characters"),
  filePath: z.string().min(1, "File path is required"),
  solutionPath: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const draftReviewSchema = z.object({
  draftId: z.string().uuid("Valid draft ID required"),
  action: z.enum(["approved", "rejected", "edited", "regeneration_requested"]),
  comments: z.string().optional().default(""),
  editedContent: z.any().optional(),
});
