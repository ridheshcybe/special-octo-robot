/* Cybersecurity Checkout */

import Image from "next/image";

export const metadata = {
  title: "Checkout - PrepMeUp AI Cybersecurity",
  description: "Cybersecurity checkout page",
};

export default function CybersecurityCheckout() {
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
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-3">Select Plan</h3>
            <div className="p-4 bg-gray-800 rounded mb-4">
              <h4 className="text-semibold">₹999 / 6 Months - CyberSecurity Semester Pass</h4>
              <p className="text-white/60">Includes all lessons, labs, CTF, quizzes, AI tutor, certificate eligibility</p>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <h4 className="text-semibold">₹499</h4>
              <p className="text-white/60">One 45-minute mentorship session, valid 90 days</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Free Preview</h3>
            <p className="text-white/60 mb-2">One lesson</p>
            <p className="text-white/60">One browser lab</p>
            <p className="text-white/60">One quiz</p>
            <p className="text-white/60">One incident investigation</p>
          </div>
        </div>
        <p className="text-white/80 mb-8">Your data is secure. All payments processed via Razorpay.</p>
        <button className="w-full bg-orange-600 text-black font-medium py-3 rounded mt-8">
          Proceed to Payment
        </button>
      </div>
    </main>
  );
}