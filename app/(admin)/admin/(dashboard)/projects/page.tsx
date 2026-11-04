import { CrudList, type CrudField } from "@/components/admin/CrudList";
import { AdminPageHead } from "@/components/admin/ui";

const FIELDS: CrudField[] = [
  { name: "name", label: "Name" },
  { name: "category", label: "Category", hint: "Shown under the card, e.g. AI Recommendation Engine." },
  { name: "year_label", label: "Year / status", hint: "“2026” or “Ongoing”." },
  { name: "outcome", label: "Outcome", hint: "“Live” or “Prototype”." },
  { name: "blurb", label: "Blurb", type: "textarea", full: true },
  { name: "href", label: "Link", placeholder: "https://github.com/…", full: true },
  { name: "image_url", label: "Image (16:11)", type: "image", full: true },
  { name: "published", label: "Published", type: "checkbox", full: true },
];

export default function AdminProjectsPage() {
  return (
    <>
      <AdminPageHead
        title="Projects"
        sub="Cards render in this order; odd-indexed ones sit lower on the grid."
      />
      <CrudList
        table="projects"
        title="Project cards"
        hint="Unpublished projects disappear from the site immediately."
        fields={FIELDS}
        defaults={{
          sort_order: 0,
          published: true,
          name: "New project",
          category: "",
          year_label: "",
          outcome: "Prototype",
          blurb: "",
          image_url: null,
          href: "",
        }}
        rowTitle="name"
        metaFields={["category", "year_label", "outcome"]}
        uploadFolder="projects"
        addLabel="Add project"
      />
    </>
  );
}
