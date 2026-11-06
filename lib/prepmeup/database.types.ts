/**
 * Hand-written Supabase Database types for the prepmeup project.
 * Since the Supabase CLI cannot connect to a local stack in this environment,
 * these types are manually defined based on the actual database schema
 * observed through code patterns in the service files.
 * 
 * This file provides end-to-end type safety for `.from("table")` calls,
 * insert/update/select payloads, and matching nullable columns.
 * 
 * To regenerate from Supabase remote: `npx supabase gen types typescript --project-id <id> > lib/prepmeup/database.types.ts`
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Database = {
  public: {
    Tables: {
      pmu_admins: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          created_at?: string;
        };
      };
      pmu_certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          code: string;
          issued_at: string;
          pdf_url: string;
          verification_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          code: string;
          issued_at?: string;
          pdf_url: string;
          verification_count?: number;
          created_at?: string;
        };
        Update: {
          code?: string;
          issued_at?: string;
          pdf_url?: string;
          verification_count?: number;
        };
      };
      pmu_course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          access_type: 'paid' | 'free_early_adopter' | 'admin_granted';
          status: 'active' | 'revoked' | 'expired';
          started_at: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          access_type?: 'paid' | 'free_early_adopter' | 'admin_granted';
          status?: 'active' | 'revoked' | 'expired';
          started_at?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          access_type?: 'paid' | 'free_early_adopter' | 'admin_granted';
          status?: 'active' | 'revoked' | 'expired';
          expires_at?: string;
        };
      };
      pmu_courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          status?: 'draft' | 'published' | 'archived';
        };
      };
      pmu_quantum_early_adopter_redemptions: {
        Row: {
          id: string;
          user_id: string;
          quantum_course_id: string;
          redemption_code: string;
          status: 'claimed' | 'used' | 'expired';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quantum_course_id: string;
          redemption_code: string;
          status?: 'claimed' | 'used' | 'expired';
          created_at?: string;
        };
        Update: {
          redemption_code?: string;
          status?: 'claimed' | 'used' | 'expired';
        };
      };
      pmu_mentorship_packs: {
        Row: {
          id: string;
          user_id: string;
          total_sessions: number;
          consumed_sessions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_sessions?: number;
          consumed_sessions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          total_sessions?: number;
          consumed_sessions?: number;
          updated_at?: string;
        };
      };
      pmu_quantum_orders: {
        Row: {
          id: string;
          user_id: string;
          razorpay_order_id: string;
          quantum_course_id: string;
          amount_in_paise: number;
          status: 'created' | 'pending' | 'verified' | 'failed' | 'refunded';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razorpay_order_id: string;
          quantum_course_id: string;
          amount_in_paise: number;
          status?: 'created' | 'pending' | 'verified' | 'failed' | 'refunded';
          created_at?: string;
        };
        Update: {
          razorpay_order_id?: string;
          amount_in_paise?: number;
          status?: 'created' | 'pending' | 'verified' | 'failed' | 'refunded';
        };
      };
      pmu_quantum_payments: {
        Row: {
          id: string;
          user_id: string;
          quantum_order_id: string;
          razorpay_payment_id: string;
          amount_in_paise: number;
          status: 'pending' | 'verified' | 'failed' | 'refunded';
          verification_status: 'pending' | 'verified' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quantum_order_id: string;
          razorpay_payment_id?: string;
          amount_in_paise: number;
          status?: 'pending' | 'verified' | 'failed' | 'refunded';
          verification_status?: 'pending' | 'verified' | 'failed';
          created_at?: string;
        };
        Update: {
          razorpay_payment_id?: string;
          amount_in_paise?: number;
          status?: 'pending' | 'verified' | 'failed' | 'refunded';
          verification_status?: 'pending' | 'verified' | 'failed';
        };
      };
      pmu_cyber_orders: {
        Row: {
          id: string;
          user_id: string;
          razorpay_order_id: string;
          cyber_course_id: string;
          amount_in_paise: number;
          status: 'created' | 'pending' | 'verified' | 'failed' | 'refunded';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razorpay_order_id: string;
          cyber_course_id: string;
          amount_in_paise: number;
          status?: 'created' | 'pending' | 'verified' | 'failed' | 'refunded';
          created_at?: string;
        };
        Update: {
          razorpay_order_id?: string;
          amount_in_paise?: number;
          status?: 'created' | 'pending' | 'verified' | 'failed' | 'refunded';
        };
      };
      pmu_cyber_payments: {
        Row: {
          id: string;
          user_id: string;
          cyber_order_id: string;
          razorpay_payment_id: string;
          amount_in_paise: number;
          status: 'pending' | 'verified' | 'failed' | 'refunded';
          verification_status: 'pending' | 'verified' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cyber_order_id: string;
          razorpay_payment_id?: string;
          amount_in_paise: number;
          status?: 'pending' | 'verified' | 'failed' | 'refunded';
          verification_status?: 'pending' | 'verified' | 'failed';
          created_at?: string;
        };
        Update: {
          razorpay_payment_id?: string;
          amount_in_paise?: number;
          status?: 'pending' | 'verified' | 'failed' | 'refunded';
          verification_status?: 'pending' | 'verified' | 'failed';
        };
      };
      pmu_cyber_labs: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          title: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          title: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          is_published?: boolean;
        };
      };
      pmu_cyber_lab_tasks: {
        Row: {
          id: string;
          lab_id: string;
          title: string;
          description: string;
          expected_hash: string;
          max_attempts: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lab_id: string;
          title: string;
          description: string;
          expected_hash: string;
          max_attempts?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          expected_hash?: string;
          max_attempts?: number;
        };
      };
      pmu_cyber_lab_attempts: {
        Row: {
          id: string;
          user_id: string;
          lab_task_id: string;
          attempt_number: number;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          completed_at: string | null;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lab_task_id: string;
          attempt_number?: number;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          completed_at?: string | null;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          completed_at?: string | null;
          score?: number | null;
        };
      };
      pmu_cyber_lab_progress: {
        Row: {
          id: string;
          user_id: string;
          lab_id: string;
          task_id: string;
          progress_percentage: number;
          last_activity_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lab_id: string;
          task_id: string;
          progress_percentage?: number;
          last_activity_at?: string;
          created_at?: string;
        };
        Update: {
          progress_percentage?: number;
          last_activity_at?: string;
        };
      };
      pmu_lab_acceptances: {
        Row: {
          id: string;
          user_id: string;
          lab_id: string;
          accepted_by: string;
          accepted_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lab_id: string;
          accepted_by: string;
          accepted_at?: string;
          created_at?: string;
        };
        Update: {
          accepted_by?: string;
          accepted_at?: string;
        };
      };
      pmu_cyber_incident_cases: {
        Row: {
          id: string;
          user_id: string;
          lab_task_id: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          status: 'open' | 'investigating' | 'resolved' | 'closed';
          reported_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lab_task_id: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'open' | 'investigating' | 'resolved' | 'closed';
          reported_at?: string;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Update: {
          severity?: 'low' | 'medium' | 'high' | 'critical';
          status?: 'open' | 'investigating' | 'resolved' | 'closed';
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
      };
      pmu_notes: {
        Row: {
          id: string;
          title: string;
          content_markdown: string;
          topic: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content_markdown: string;
          topic: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          content_markdown?: string;
          topic?: string;
        };
      };
      pmu_topics: {
        Row: {
          id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          created_at?: string;
        };
        Update: {
          title?: string;
        };
      };
    };
    Views: {};
    Functions: {
      pmu_consume_mentorship_session: {
        Args: {
          p_user_id: string;
        };
        Returns: object;
      };
    };
    Enums: {
      pmu_course_access_type: 'paid' | 'free_early_adopter' | 'admin_granted';
      pmu_course_status: 'draft' | 'published' | 'archived';
      pmu_enrollment_status: 'active' | 'revoked' | 'expired';
      pmu_payment_status: 'pending' | 'verified' | 'failed' | 'refunded';
      pmu_verification_status: 'pending' | 'verified' | 'failed';
      pmu_cyber_lab_task_status: 'pending' | 'in_progress' | 'completed' | 'failed';
      pmu_cyber_lab_attempt_status: 'pending' | 'in_progress' | 'completed' | 'failed';
      pmu_cyber_incident_severity: 'low' | 'medium' | 'high' | 'critical';
      pmu_cyber_incident_status: 'open' | 'investigating' | 'resolved' | 'closed';
    };
  };
};