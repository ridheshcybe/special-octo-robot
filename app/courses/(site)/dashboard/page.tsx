import DashboardPage from "../../_src/pages/DashboardPage";
import { RequireUser } from "../../_src/auth/guards";

export default function Page() {
  return (
    <RequireUser>
      <DashboardPage />
    </RequireUser>
  );
}
