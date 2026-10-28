import type { ReactNode } from "react";
import SiteLayout from "../_src/components/SiteLayout";

/** Public course pages share the storefront header/footer. */
export default function CoursesSiteLayout({ children }: { children: ReactNode }) {
  return <SiteLayout>{children}</SiteLayout>;
}
