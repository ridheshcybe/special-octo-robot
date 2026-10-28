import Link from "next/link";
import { AdminNotice, AdminPageHead } from "@/components/admin/ui";
import { getSiteContent } from "@/lib/content";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const content = await getSiteContent();
  const configured = hasSupabaseEnv();

  const cells = [
    { figure: content.projects.items.length, label: "Projects" },
    { figure: content.story.principles.length, label: "Story principles" },
    { figure: content.research.items.length, label: "Research papers" },
    { figure: content.social.length, label: "Social links" },
  ];

  return (
    <>
      <AdminPageHead
        title="Overview"
        sub="Everything the public one-pager renders. Saves here push straight to the live site."
        actions={
          <Link className="admin-btn" href="/" target="_blank" rel="noreferrer">
            Open site ↗
          </Link>
        }
      />

      <div className="admin-body">
        {!configured ? (
          <AdminNotice tone="err">
            Supabase is not configured, so the panel is showing the built-in fallback content and
            cannot save. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
            .env.local, then restart the dev server.
          </AdminNotice>
        ) : null}

        <div className="admin-stats">
          {cells.map((cell) => (
            <div className="admin-stat" key={cell.label}>
              <span className="admin-stat-figure">{cell.figure}</span>
              <span className="admin-stat-label">{cell.label}</span>
            </div>
          ))}
        </div>

        <section className="admin-card">
          <header className="admin-card-head">
            <div>
              <h2 className="admin-card-title">Current copy</h2>
              <p className="admin-card-hint">
                A quick read of what is live right now. Edit any slice from its own screen.
              </p>
            </div>
          </header>

          <div className="admin-list">
            <div className="admin-row">
              <div className="admin-row-main">
                <p className="admin-row-title">{content.story.heading}</p>
                <p className="admin-row-body">{content.story.body}</p>
              </div>
              <div className="admin-row-actions">
                <Link className="admin-btn admin-btn-sm" href="/admin/story">
                  Edit
                </Link>
              </div>
            </div>

            <div className="admin-row">
              <div className="admin-row-main">
                <p className="admin-row-title">{content.projects.heading}</p>
                <p className="admin-row-body">
                  {content.projects.countLabel} · {content.projects.items.map((p) => p.name).join(", ")}
                </p>
              </div>
              <div className="admin-row-actions">
                <Link className="admin-btn admin-btn-sm" href="/admin/projects">
                  Edit
                </Link>
              </div>
            </div>

            <div className="admin-row">
              <div className="admin-row-main">
                <p className="admin-row-title">{content.contact.heading}</p>
                <p className="admin-row-body">
                  {content.contact.body} · {content.contact.email}
                </p>
              </div>
              <div className="admin-row-actions">
                <Link className="admin-btn admin-btn-sm" href="/admin/settings">
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
