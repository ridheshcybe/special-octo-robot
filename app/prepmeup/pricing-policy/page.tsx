/* Pricing Policy */

import Image from "next/image";

export const metadata = {
  title: "Pricing Policy - PrepMeUp AI",
  description: "Pricing policy for PrepMeUp AI platform",
};

export default function PricingPolicyPage() {
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
        <h1 className="text-3xl font-bold mb-6">Pricing Policy</h1>
        <p className="text-lg mb-4">
          Last updated: January 2024
        </p>
        <p className="text-white/80 mb-6">
          All prices are in Indian Rupees (₹) and include applicable taxes.
        </p>
        <ul className="list-disc list-inside text-white/60 mb-4">
          <li>Semester Pass: ₹999</li>
          <li>Mentorship Pack: ₹499</li>
          <li>Free preview includes one lesson, one lab, one quiz</li>
        </ul>
        <p className="text-white/80 mt-6">
          Prices are subject to change. Previous purchases are grandfathered.
        </p>
      </div>
    </main>
  );
}