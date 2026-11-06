/* Content Readiness */

import Image from "next/image";

export const metadata = {
  title: "Content Readiness - PrepMeUp AI Admin",
  description: "Admin content readiness dashboard",
};

export default function ContentReadiness() {
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
        <h1 className="text-3xl font-bold mb-6">Content Readiness</h1>
        <p className="text-white/80 mb-6">
          Per-track content readiness status:
        </p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-800 rounded">
            <h4 className="text-semibold mb-2">Quantum Track</h4>
            <p className="text-white/60">Published: 12/15</p>
            <p className="text-white/60">Draft: 3</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h4 className="text-semibold mb-2">CyberSecurity Track</h4>
            <p className="text-white/60">Published: 8/10</p>
            <p className="text-white/60">Draft: 2</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <h4 className="text-semibold mb-2">B.Tech CSE</h4>
            <p className="text-white/60">Published: 20/25</p>
            <p className="text-white/60">Draft: 5</p>
          </div>
        </div>
        <p className="text-white/80 mt-6">
          All critical content reviewed and verified.
        </p>
      </div>
    </main>
  );
}