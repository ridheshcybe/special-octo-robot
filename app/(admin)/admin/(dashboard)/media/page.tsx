import { SettingsForm, type SettingsField } from "@/components/admin/SettingsForm";
import { AdminPageHead, AdminNotice } from "@/components/admin/ui";

const FIELDS: SettingsField[] = [
  {
    kind: "asset",
    name: "hero_portrait_url",
    label: "Hero portrait (transparent cutout)",
    hint: "Composited in front of the giant accent name. A PNG or WebP with alpha.",
    accept: "image",
    folder: "hero",
  },
  {
    kind: "asset",
    name: "hero_video_url",
    label: "Hero looped video",
    hint: "Muted, autoplaying, looping. VP9/WebM with an alpha plane is ideal; browsers without it fall back to the portrait still.",
    accept: "video",
    folder: "hero",
  },
];

export default function AdminMediaPage() {
  return (
    <>
      <AdminPageHead
        title="Media"
        sub="The hero portrait and its looped video. Project images live on each project card."
      />

      <SettingsForm
        title="Hero media"
        hint="Leave either field empty to fall back to the bundled asset in public/assets/hero/."
        fields={FIELDS}
      >
        <AdminNotice tone="ok">
          Uploads land in the public portfolio-assets bucket. The site falls back in this order:
          Storage URL → bundled asset → the branded placeholder.
        </AdminNotice>
      </SettingsForm>
    </>
  );
}
