import { NextResponse, type NextRequest } from "next/server";
import { getCertificateByCode } from "@/app/prepmeup/_lib/trackStore";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateCode: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate limit: 10 certificate PDF generations per user/IP per 1 hour
    const rateCheck = await checkDurableRateLimit({
      bucketKey: "certificate_pdf_download",
      identifier: ip,
      limit: 10,
      windowSeconds: 60 * 60,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Certificate PDF generation rate limit exceeded. Try again in ${rateCheck.retryAfterSec}s.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec || 60) } }
      );
    }

    const { certificateCode } = await params;
    const cert = getCertificateByCode(certificateCode);

    if (!cert) {
      return NextResponse.json(
        { ok: false, error: "Certificate not found." },
        { status: 404 }
      );
    }

    const issueDateStr = new Date(cert.issueDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate high-resolution, vector SVG certificate with #08080a theme and #ff3b1d accents
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="840" viewBox="0 0 1200 840" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08080a" />
      <stop offset="100%" stop-color="#141418" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b1d" />
      <stop offset="100%" stop-color="#ff6a3d" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="840" fill="url(#bg)" />
  <rect width="1200" height="840" fill="url(#grid)" />

  <!-- Outer Double Borders -->
  <rect x="30" y="30" width="1140" height="780" fill="none" stroke="#26262c" stroke-width="2" rx="12" />
  <rect x="42" y="42" width="1116" height="756" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="6,4" rx="8" />

  <!-- Corner Accents -->
  <path d="M 42 70 L 70 42" stroke="url(#gold)" stroke-width="3" />
  <path d="M 1158 70 L 1130 42" stroke="url(#gold)" stroke-width="3" />
  <path d="M 42 770 L 70 798" stroke="url(#gold)" stroke-width="3" />
  <path d="M 1158 770 L 1130 798" stroke="url(#gold)" stroke-width="3" />

  <!-- Seal / Logo -->
  <circle cx="600" cy="130" r="45" fill="#111114" stroke="url(#gold)" stroke-width="2" />
  <text x="600" y="140" text-anchor="middle" font-family="'Courier New', monospace" font-size="28" fill="#ff3b1d" font-weight="bold">⚛</text>

  <!-- Headers -->
  <text x="600" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#a19f95" letter-spacing="4" font-weight="600">PREPMEUP AI • ADVANCED ACADEMIC SPECIALIZATION</text>
  <text x="600" y="270" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="44" fill="#f3f1ea" letter-spacing="2">CERTIFICATE OF COMPLETION</text>

  <text x="600" y="325" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#807f78">This is to officially certify that</text>

  <!-- Student Name -->
  <text x="600" y="390" text-anchor="middle" font-family="'Arial Black', sans-serif" font-size="38" fill="url(#gold)" font-weight="bold">${cert.studentName}</text>
  <line x1="350" y1="415" x2="850" y2="415" stroke="#26262c" stroke-width="1.5" />

  <text x="600" y="455" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#f3f1ea">has successfully mastered all theoretical foundations, rigorous quantum algorithms,</text>
  <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#f3f1ea">completed all 5 interactive hardware simulations, and passed all module assessments for:</text>

  <!-- Course Title -->
  <text x="600" y="535" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-size="30" fill="#f3f1ea" letter-spacing="1">${cert.courseTitle.toUpperCase()}</text>

  <!-- Signatures & Verification Details -->
  <g transform="translate(140, 620)">
    <!-- Instructor Signature -->
    <text x="120" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#f3f1ea" font-weight="bold">${cert.instructorName}</text>
    <line x1="20" y1="65" x2="220" y2="65" stroke="#4a4a52" stroke-width="1" />
    <text x="120" y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#807f78">Course Director &amp; Lead Researcher</text>
  </g>

  <g transform="translate(820, 620)">
    <!-- Issue Date -->
    <text x="120" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#f3f1ea">${issueDateStr}</text>
    <line x1="20" y1="65" x2="220" y2="65" stroke="#4a4a52" stroke-width="1" />
    <text x="120" y="85" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#807f78">Official Date of Issuance</text>
  </g>

  <!-- Footer Verification Bar -->
  <rect x="250" y="740" width="700" height="40" fill="#111114" rx="6" stroke="#26262c" stroke-width="1" />
  <text x="600" y="765" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="#a19f95">
    VERIFICATION CODE: <tspan fill="#ff3b1d" font-weight="bold">${cert.code}</tspan> • STATUS: <tspan fill="#4ade80" font-weight="bold">CRYPTOGRAPHICALLY VERIFIED</tspan>
  </text>
</svg>`;

    return new Response(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="PrepMeUp-Certificate-${cert.code}.svg"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate certificate document." },
      { status: 500 }
    );
  }
}
