/* Refund Policy */

import Image from "next/image";

export const metadata = {
  title: "Refund Policy - PrepMeUp AI",
  description: "Refund policy for PrepMeUp AI platform",
};

export default function RefundsPage() {
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
        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
        <p className="text-lg mb-4">
          Last updated: January 2024
        </p>
        <p className="text-white/80 mb-6">
          We offer refunds under the following conditions:
        </p>
        <ul className="list-disc list-inside text-white/60 mb-4">
          <li>Within 7 days of purchase for unused items</li>
          <li>For defective or incorrect products</li>
          <li>As required by applicable law</li>
        </ul>
        <p className="text-white/80 mt-6">
          Refund requests must be submitted within 30 days of purchase.
        </p>
      </div>
    </main>
  );
}