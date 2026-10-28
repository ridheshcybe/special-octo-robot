import { Suspense } from "react";
import LoginPage from "../../_src/pages/LoginPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-sm text-zinc-500">Loading…</p>}>
      <LoginPage />
    </Suspense>
  );
}
