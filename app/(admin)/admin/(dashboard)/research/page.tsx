import { CrudList, type CrudField } from "@/components/admin/CrudList";
import { AdminPageHead } from "@/components/admin/ui";

const FIELDS: CrudField[] = [
  { name: "meta", label: "Meta line", placeholder: "IAEME Publication — 2026", full: true },
  { name: "title", label: "Title", type: "textarea", full: true },
  { name: "url", label: "Paper URL", placeholder: "https://…", full: true },
  { name: "published", label: "Published", type: "checkbox", full: true },
];

export default function AdminResearchPage() {
  return (
    <>
      <AdminPageHead
        title="Research"
        sub="Each entry is one rule-bounded block with its own “Read the paper” link."
      />
      <CrudList
        table="research"
        title="Papers"
        hint="Keep the meta line short — it is set in wide uppercase tracking."
        fields={FIELDS}
        defaults={{ sort_order: 0, published: true, meta: "Publication — 2026", title: "New paper", url: "" }}
        rowTitle="title"
        metaFields={["meta"]}
        addLabel="Add paper"
      />
    </>
  );
}
