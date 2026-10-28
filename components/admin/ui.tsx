import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

export function AdminCard({
  title,
  hint,
  actions,
  children,
}: {
  title?: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-card">
      {(title || actions) && (
        <header className="admin-card-head">
          <div>
            {title ? <h2 className="admin-card-title">{title}</h2> : null}
            {hint ? <p className="admin-card-hint">{hint}</p> : null}
          </div>
          {actions ? <div className="admin-actions">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

export function AdminField({
  label,
  hint,
  className,
  full,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  /** span every column of the surrounding admin-grid */
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx("admin-field", className)}
      style={full ? { gridColumn: "1 / -1" } : undefined}
    >
      <label>{label}</label>
      {children}
      {hint ? <p className="admin-hint">{hint}</p> : null}
    </div>
  );
}

export function AdminNotice({ tone, children }: { tone: "ok" | "err"; children: ReactNode }) {
  return <p className={cx("admin-toast", tone === "err" && "err")}>{children}</p>;
}

export function AdminPageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-top">
      <div>
        <h1 className="admin-title">{title}</h1>
        {sub ? <p className="admin-sub">{sub}</p> : null}
      </div>
      {actions ? <div className="admin-actions">{actions}</div> : null}
    </header>
  );
}
