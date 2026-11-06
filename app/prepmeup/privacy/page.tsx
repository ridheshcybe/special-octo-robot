/* Privacy Policy */

import Image from "next/image";

export const metadata = {
  title: "Privacy Policy - PrepMeUp AI",
  description: "Privacy policy for PrepMeUp AI platform",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-lg mb-4">
          Last updated: January 2024
        </p>
        <p className="text-white/80 mb-6">
          We respect your privacy and are committed to protecting your personal
          data.
        </p>
        <ul className="list-disc list-inside text-white/60 mb-4">
          <li>Information we collect</li>
          <li>How we use your information</li>
          <li>Data retention policies</li>
          <li>Your rights and choices</li>
        </ul>
        <p className="text-white/80 mt-6">
          For more information, contact us at privacy@prepmeup.ai
        </p>
      </div>
    </main>
  );
}