/* Cybersecurity Ethics */

import Image from "next/image";

export const metadata = {
  title: "Cybersecurity Ethics - PrepMeUp AI",
  description: "Cybersecurity ethics guidelines for PrepMeUp AI",
};

export default function CybersecurityEthicsPage() {
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
        <h1 className="text-3xl font-bold mb-6">Cybersecurity Ethics</h1>
        <p className="text-lg mb-4">
          PrepMeUp AI is committed to responsible cybersecurity education.
        </p>
        <ul className="list-disc list-inside text-white/60 mb-4">
          <li>Ethical hacking principles</li>
          <li>Legal boundaries for security research</li>
          <li>Responsible disclosure practices</li>
          <li>Privacy protection for all users</li>
          <li>Educational purpose only</li>
        </ul>
        <p className="text-white/80 mt-6">
          All CTF challenges and lab exercises are designed for authorized
          educational use within approved environments.
        </p>
      </div>
    </main>
  );
}