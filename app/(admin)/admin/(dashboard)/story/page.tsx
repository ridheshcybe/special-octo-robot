import { CrudList } from "@/components/admin/CrudList";
import { SettingsForm, type SettingsField } from "@/components/admin/SettingsForm";
import { AdminPageHead } from "@/components/admin/ui";

const FIELDS: SettingsField[] = [
  { kind: "text", name: "story_heading", label: "Heading", full: true },
  { kind: "textarea", name: "story_body", label: "Body", full: true },
];

const PRINCIPLE_FIELDS = [
  { name: "title", label: "Title", full: true },
  { name: "body", label: "Body", type: "textarea" as const, full: true },
];

export default function AdminStoryPage() {
  return (
    <>
      <AdminPageHead
        title="Story"
        sub="The left column copy and the numbered principles on the right."
      />

      <SettingsForm title="Heading and body" fields={FIELDS} />

      <CrudList
        table="story_principles"
        title="Principles"
        hint="Rendered in order with the index number derived from position."
        fields={PRINCIPLE_FIELDS}
        defaults={{ sort_order: 0, title: "New principle", body: "" }}
        rowTitle="title"
        addLabel="Add principle"
      />
    </>
  );
}
