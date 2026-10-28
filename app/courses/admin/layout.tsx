import type { ReactNode } from "react";
import AdminLayout from "../_src/admin/AdminLayout";
import { RequireAdmin } from "../_src/auth/guards";

/** Admin-only shell for /courses/admin/* (route guard is UX; RLS is the wall). */
export default function CoursesAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-white text-zinc-900">
        <AdminLayout>{children}</AdminLayout>
      </div>
    </RequireAdmin>
  );
}
