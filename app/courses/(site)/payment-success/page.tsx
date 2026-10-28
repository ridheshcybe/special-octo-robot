import { Suspense } from "react";
import PaymentSuccessPage from "../../_src/pages/PaymentSuccessPage";
import { RequireUser } from "../../_src/auth/guards";

export default function Page() {
  return (
    <RequireUser>
      <Suspense fallback={<p className="py-16 text-center text-sm text-zinc-500">Loading…</p>}>
        <PaymentSuccessPage />
      </Suspense>
    </RequireUser>
  );
}
