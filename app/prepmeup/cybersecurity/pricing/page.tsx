/* Cybersecurity Pricing */

import Image from "next/image";

export const metadata = {
  title: "Cybersecurity Pricing - PrepMeUp AI",
  description: "Cybersecurity pricing plans",
};

export default function CybersecurityPricing() {
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
        <h1 className="text-3xl font-bold mb-6">Cybersecurity Plans</h1>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-8 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-2xl font-bold mb-3">₹999 / 6 Months</h3>
            <ul className="list-disc list-inside text-white/60 space-y-3">
              <li>All CyberSecurity lessons</li>
              <li>All CyberSecurity labs</li>
              <li>CTF challenges</li>
              <li>Quizzes</li>
              <li>AI tutor access</li>
              <li>Certificate eligibility</li>
              <li>Included mentorship benefit</li>
              <li>6-month duration</li>
            </ul>
            <p className="text-white/50 mt-4">Limited seats available</p>
          </div>
          <div className="p-8 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-2xl font-bold mb-3">₹499</h3>
            <ul className="list-disc list-inside text-white/60 space-y-3">
              <li>One 45-minute mentorship session</li>
              <li>Valid 90 days from purchase</li>
              <li>If unused after 90 days</li>
            </ul>
            <p className="text-white/50 mt-4">Early renewal available</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-white/60 mb-4">Free preview: One lesson, one lab, one quiz</p>
        </div>
      </div>
    </main>
  );
}