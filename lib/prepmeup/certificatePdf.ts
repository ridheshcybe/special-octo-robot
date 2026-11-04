/**
 * Minimal, dependency-free server-side PDF generator for PrepMeUp AI
 * CyberSecurity certificates. Produces a single landscape A4 page as a Buffer.
 */

export interface CyberCertificatePdfInput {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  certificateCode: string;
  verificationUrl: string;
}

function pdfEscape(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function textLine(
  text: string,
  x: number,
  y: number,
  size: number,
  font: "F1" | "F2",
  grey = 0.95
): string {
  return [
    `BT`,
    `/${font} ${size} Tf`,
    `${grey} ${grey} ${grey} rg`,
    `${x} ${y} Td`,
    `(${pdfEscape(text)}) Tj`,
    `ET`,
  ].join("\n");
}

export function generateCyberCertificatePdf(input: CyberCertificatePdfInput): Buffer {
  const issueDate = new Date(input.issueDate);
  const formattedDate = Number.isNaN(issueDate.getTime())
    ? input.issueDate
    : issueDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });

  const accent = "1 0.231 0.114 RG"; // #ff3b1d
  const contentLines: string[] = [
    // Dark background (#08080a)
    "0.031 0.031 0.039 rg",
    "0 0 842 595 re f",
    // Accent frame
    `${accent}`,
    "2 w",
    "30 30 782 535 re S",
    // Inner hairline
    "0.15 0.15 0.18 RG",
    "1 w",
    "40 40 762 515 re S",
    // Small brand mark
    "1 0.231 0.114 rg",
    "56 512 26 26 re f",
    textLine("PREPMEUP AI", 96, 520, 12, "F1", 0.95),
    textLine("VERIFIED ACADEMIC CREDENTIAL", 96, 504, 8, "F2", 0.62),
    textLine("CERTIFICATE OF COMPLETION", 56, 452, 30, "F1", 0.96),
    textLine(
      "This certifies that the following scholar has fulfilled all required defensive",
      56,
      424,
      11,
      "F2",
      0.72
    ),
    textLine("security modules, browser labs, CTF challenges, and assessments.", 56, 408, 11, "F2", 0.72),
    textLine("STUDENT", 56, 360, 8, "F2", 0.62),
    textLine(input.studentName, 56, 330, 26, "F1", 0.94),
    "0.15 0.15 0.18 RG",
    "1 w",
    "56 316 m 786 316 l S",
    textLine("COURSE", 56, 286, 8, "F2", 0.62),
    textLine(input.courseTitle, 56, 264, 17, "F1", 0.94),
    textLine("INSTRUCTOR", 430, 286, 8, "F2", 0.62),
    textLine(input.instructorName, 430, 264, 14, "F1", 0.94),
    textLine("ISSUE DATE", 56, 226, 8, "F2", 0.62),
    textLine(formattedDate, 56, 206, 12, "F2", 0.8),
    textLine("CERTIFICATE CODE", 430, 226, 8, "F2", 0.62),
    textLine(input.certificateCode, 430, 206, 12, "F1", 0.94),
    textLine("PUBLIC VERIFICATION", 56, 160, 8, "F2", 0.62),
    textLine(input.verificationUrl, 56, 142, 10, "F2", 0.8),
    textLine(
      "This credential remains valid only while the public verification registry reports status: ISSUED.",
      56,
      92,
      8,
      "F2",
      0.55
    ),
    textLine("PrepMeUp AI  •  Academic Registry  •  prepmeupai.in", 56, 74, 8, "F2", 0.55),
  ];

  const stream = contentLines.join("\n");
  const objects: string[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[6] = `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, "latin1");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
