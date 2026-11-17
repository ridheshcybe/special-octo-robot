/* Terms of Service */

import Image from "next/image";

export const metadata = {
  title: "Terms of Service - PrepMeUp AI",
  description: "Terms of service for PrepMeUp AI platform",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-lg mb-4">
          Last updated: January 2024
        </p>
        <p className="text-white/80 mb-6">
          These terms govern your use of the PrepMeUp AI platform. By accessing
          or using the service, you agree to these terms.
        </p>
        <ul className="list-disc list-inside text-white/60 mb-4">
          <li>Acceptance of terms</li>
          <li>User responsibilities</li>
          <li>Intellectual property</li>
          <li>Limitation of liability</li>
        </ul>
        <p className="text-white/80 mt-6">
          PrepMeUp AI reserves the right to modify these terms at any time.
        </p>
      </div>
    </main>
  );
}