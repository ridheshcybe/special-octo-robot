import { CrudList, type CrudField } from "@/components/admin/CrudList";
import { AdminPageHead } from "@/components/admin/ui";

const FIELDS: CrudField[] = [
  { name: "label", label: "Label", placeholder: "GitHub" },
  { name: "url", label: "URL", placeholder: "https://…" },
];

export default function AdminSocialPage() {
  return (
    <>
      <AdminPageHead title="Social" sub="The footer link column, in order." />
      <CrudList
        table="social_links"
        title="Links"
        hint="All links open in a new tab. Labels are set in sentence case as typed."
        fields={FIELDS}
        defaults={{ sort_order: 0, label: "New link", url: "" }}
        rowTitle="label"
        metaFields={["url"]}
        addLabel="Add link"
      />
    </>
  );
}
