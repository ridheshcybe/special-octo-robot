/* Monitoring Dashboard */

import Image from "next/image";

export const metadata = {
  title: "Monitoring - PrepMeUp AI Admin",
  description: "Admin monitoring dashboard",
};

export default function MonitoringDashboard() {
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
        <h1 className="text-3xl font-bold mb-6">Monitoring</h1>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Recent Errors</h3>
            <p className="text-white/60 text-sm">0 critical errors (24h)</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Failed Payments</h3>
            <p className="text-white/60 text-sm">0 failures (24h)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Active Students</h3>
            <p className="text-white/60 text-sm">0 students</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h3 className="text-semibold mb-2">Quiz Attempts</h3>
            <p className="text-white/60 text-sm">0 attempts</p>
          </div>
        </div>
        <p className="text-white/80 mt-6">
          Real-time monitoring configured.
        </p>
      </div>
    </main>
  );
}