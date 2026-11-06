/* Backup Status */

import Image from "next/image";

export const metadata = {
  title: "Backup Status - PrepMeUp AI Admin",
  description: "Admin backup status dashboard",
};

export default function BackupStatus() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Image
        src="/assets/hero/hero.webm"
        alt="PrepMeUp AI"
        width={200}
        height={150}
        className="mx-auto my-8"
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Backup Status</h1>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Database Backups</h3>
            <p className="text-white/60 text-sm">Daily automated</p>
            <p className="text-white/60 text-sm">Retention: 30 days</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Storage Backups</h3>
            <p className="text-white/60 text-sm">Separate plan required</p>
            <p className="text-white/60 text-sm">PITR: Paid add-on</p>
          </div>
        </div>
        <p className="text-white/80 mt-6">
          Daily Supabase database backups configured. PITR is a paid add-on.
          Storage objects require separate backup plan.
        </p>
      </div>
    </main>
  );
}