import { SettingsForm, type SettingsField } from "@/components/admin/SettingsForm";
import { AdminPageHead } from "@/components/admin/ui";

const FIELDS: SettingsField[] = [
  {
    kind: "list",
    name: "hero_roles",
    label: "Hero roles",
    hint: "Stacked on the left of the hero, top to bottom.",
    addLabel: "Add role",
  },
  {
    kind: "textarea",
    name: "hero_description",
    label: "Hero description",
    hint: "Sits right-aligned opposite the roles.",
  },
  {
    kind: "list",
    name: "marquee_words",
    label: "Marquee words",
    hint: "Looped with an accent dot between each word. Five entries reads best.",
    addLabel: "Add word",
  },
  { kind: "text", name: "projects_heading", label: "Projects heading", full: true },
  { kind: "text", name: "research_heading", label: "Research heading", full: true },
  { kind: "text", name: "numbers_heading", label: "Numbers heading", full: true },
  { kind: "textarea", name: "contact_heading", label: "Contact heading" },
  { kind: "textarea", name: "contact_body", label: "Contact body" },
  { kind: "text", name: "contact_email", label: "Contact email", full: true },
  {
    kind: "text",
    name: "github_username",
    label: "GitHub username",
    hint: "Drives the live repos / stars / followers figures in Numbers.",
    full: true,
  },
  {
    kind: "number",
    name: "papers_count",
    label: "Papers published",
    hint: "The fourth Numbers figure.",
    full: true,
  },
];

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHead
        title="Settings"
        sub="Hero copy, the marquee, every section heading, and the Numbers inputs."
      />
      <SettingsForm
        title="Site copy"
        hint="These values render across the whole one-pager. Save pushes the change live."
        fields={FIELDS}
      />
    </>
  );
}
