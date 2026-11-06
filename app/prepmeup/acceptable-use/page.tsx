/* Acceptable Use Policy */

import Image from "next/image";

export const metadata = {
  title: "Acceptable Use Policy - PrepMeUp AI",
  description: "Acceptable use policy for PrepMeUp AI platform",
};

export default function AcceptableUsePage() {
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
        <h1 className="text-3xl font-bold mb-6">Acceptable Use Policy</h1>
        <p className="text-lg mb-4">
          Last updated: January 2024
        </p>
        <p className="text-white/80 mb-6">
          When using the PrepMeUp AI platform, you agree to the following:
        </p>
        <ul className="list-disc list-inside text-white/60 mb-4">
          <li>Do not attempt to bypass security measures</li>
          <li>Do not use the service for illegal activities</li>
          <li>Do not generate content that violates laws</li>
          <li>Respect other users' privacy and data</li>
          <li>Do not reverse-engineer or scrape the service</li>
        </ul>
        <p className="text-white/80 mt-6">
          Violations may result in account suspension or termination.
        </p>
      </div>
    </main>
  );
}