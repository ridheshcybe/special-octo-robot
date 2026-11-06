/* Payment Success */

import Image from "next/image";

export const metadata = {
  title: "Payment Success - PrepMeUp AI Cybersecurity",
  description: "Payment success confirmation page",
};

export default function PaymentSuccess() {
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
        <h1 className="text-3xl font-bold mb-6">Payment Successful</h1>
        <div className="bg-green-600/20 border-green-600/20 rounded p-8 mb-8">
          <h3 className="text-green-400 mb-4">Thank you!</h3>
          <p className="text-white/80 mb-4">Your payment has been processed successfully.</p>
          <p className="text-white/60 text-sm">Your CyberSecurity Semester Pass is now active.</p>
          <p className="text-white/60 text-sm">Duration: 6 months from activation</p>
        </div>
        <Image
          src="/assets/hero/hero.webm"
          alt="PrepMeUp AI"
          width={100}
          height={75}
          className="mx-auto my-8"
        />
        <p className="text-white/60 text-center">
          Redirecting to your dashboard...
        </p>
        <button className="w-full bg-orange-600 text-black font-medium py-3 rounded mt-8">
          Go to Dashboard
        </button>
      </div>
    </main>
  );
}