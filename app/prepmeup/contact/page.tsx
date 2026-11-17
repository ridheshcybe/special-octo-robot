/* Contact Us */

import Image from "next/image";

export const metadata = {
  title: "Contact - PrepMeUp AI",
  description: "Contact information for PrepMeUp AI",
};

export default function ContactPage() {
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
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg mb-4">
          Have questions or feedback? We'd love to hear from you.
        </p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Email</h3>
            <p className="text-white/60 mb-2">hello@prepmeup.ai</p>
            <p className="text-white/60 mb-2">support@prepmeup.ai</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Social</h3>
            <p className="text-white/60">Twitter: @PrepMeUpAI</p>
            <p className="text-white/60">LinkedIn: Company/PrepMeUp</p>
          </div>
        </div>
        <p className="text-white/80 mt-6">
          We typically respond within 2-3 business days.
        </p>
      </div>
    </main>
  );
}