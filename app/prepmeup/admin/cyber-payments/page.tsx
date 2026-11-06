/* Admin Cyber Payments */

import Image from "next/image";

export const metadata = {
  title: "Cyber Payments - PrepMeUp AI Admin",
  description: "Admin cyber payments dashboard",
};

export default function AdminCyberPayments() {
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
        <h1 className="text-3xl font-bold mb-6">Cyber Payments</h1>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Recent Transactions</h3>
            <p className="text-white/60 text-sm">0 transactions (24h)</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Pending Payments</h3>
            <p className="text-white/60 text-sm">0 pending</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-semibold mb-2">Payment Summary</h3>
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-white/60 text-sm">Semester Pass: 0 sales</p>
            <p className="text-white/60 text-sm">Mentorship Pack: 0 sales</p>
            <p className="text-white/60 text-sm">Free previews: 0 taken</p>
          </div>
        </div>
        <p className="text-white/80 mt-6">
          Payment tracking and admin tools.
        </p>
      </div>
    </main>
  );
}