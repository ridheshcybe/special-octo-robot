export interface CyberDoubtRecord {
  id: string;
  studentId: string;
  courseSlug: string;
  moduleNumber?: number;
  questionText: string;
  aiResponse: string;
  isDefensiveGrounded: boolean;
  isOffensiveRefused: boolean;
  safetyNotice?: string;
  suggestedMitigation?: string;
  createdAt: string;
}

const OFFENSIVE_TRIGGERS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\b(write|create|build|generate|make)\s+(a\s+)?(malware|ransomware|trojan|keylogger|rootkit|botnet|worm|virus)\b/i,
    reason: "Malware creation or distribution.",
  },
  {
    pattern: /\b(hack|infiltrate|breach|exploit|attack)\s+(google|facebook|instagram|amazon|netflix|bank|paypal|external|gov|[a-z0-9.-]+\.(com|org|net|in|io|co))\b/i,
    reason: "Attacking external unauthorized targets.",
  },
  {
    pattern: /\b(ddos|dos\s+attack|denial\s+of\s+service|stress\s+test\s+target|loic|slowloris)\b/i,
    reason: "Denial of Service attacks.",
  },
  {
    pattern: /\b(steal\s+passwords?|credential\s+harvester|phishing\s+template|fake\s+login\s+page)\b/i,
    reason: "Credential harvesting and phishing.",
  },
  {
    pattern: /\b(reverse\s+shell\s+one-liner|msfvenom\s+payload|eternalblue\s+exploit\s+code)\b/i,
    reason: "Weaponized exploit generation.",
  },
  {
    pattern: /\b(nmap|scan)\s+(-[a-zA-Z0-9-]+\s+)?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|[a-z0-9.-]+\.com)\b/i,
    reason: "Unconsented scanning of public internet infrastructure.",
  },
];

export async function askCyberAITutor(params: {
  studentId: string;
  question: string;
  moduleNumber?: number;
}): Promise<CyberDoubtRecord> {
  const { studentId, question, moduleNumber } = params;
  const qClean = question.trim();
  const doubtId = `cyber-doubt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Guardrail Check
  for (const trigger of OFFENSIVE_TRIGGERS) {
    if (trigger.pattern.test(qClean)) {
      return {
        id: doubtId,
        studentId,
        courseSlug: "cybersecurity-foundations-ethical-hacking-soc-ctf",
        moduleNumber,
        questionText: qClean,
        aiResponse: `> [!WARNING]
> **Defensive Safety Boundary Active**
> Requests involving ${trigger.reason.toLowerCase()} violate PrepMeUp AI's Ethical Hacking Guidelines and will not be executed. All exercises must remain within authorized, browser-sandboxed environments.

### Educational & Defensive Context
In professional cybersecurity, real-world security practices are governed by strict ethical codes (e.g., EC-Council Code of Ethics, NIST SP 800-115, Computer Fraud and Abuse Act / IT Act 2000).

#### Why this boundary exists:
1. **Authorization**: Penetration tests require explicit, written Rules of Engagement (RoE) from target owners.
2. **Defensive Focus**: The objective of ethical hacking is vulnerability identification, root-cause remediation, and threat containment.
3. **Safe Sandboxes**: Use PrepMeUp AI's simulated lab environments (Header Inspector, Sandbox Terminal, SQLi Defense, SOC Log Viewer) to practice securely.`,
        isDefensiveGrounded: false,
        isOffensiveRefused: true,
        safetyNotice: `Refused: ${trigger.reason}`,
        suggestedMitigation: "Practice within PrepMeUp authorized browser sandboxes.",
        createdAt: new Date().toISOString(),
      };
    }
  }

  // 2. Synthesize Grounded Defensive Security Knowledge
  const qLower = qClean.toLowerCase();
  let aiResponse = "";
  let isDefensiveGrounded = true;

  if (qLower.includes("header") || qLower.includes("csp") || qLower.includes("hsts") || qLower.includes("cookie")) {
    aiResponse = `### HTTP Security Headers & Cookie Hardening Best Practices

Modern web application defense relies heavily on enforcing strict browser response headers to mitigate XSS, Clickjacking, and Man-in-the-Middle attacks.

#### 1. Critical Defensive Headers
- **\`Strict-Transport-Security\` (HSTS)**:
  \`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\`
  Forces clients to communicate exclusively over TLS, preventing SSL stripping.
- **\`Content-Security-Policy\` (CSP)**:
  \`Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';\`
  Restricts origins from which scripts, styles, and media can be loaded to nullify reflected/stored XSS.
- **\`X-Frame-Options\` / \`frame-ancestors\`**:
  \`X-Frame-Options: DENY\`
  Prevents UI redressing (Clickjacking) within \`<iframe>\` embeds.
- **\`X-Content-Type-Options\`**:
  \`X-Content-Type-Options: nosniff\`
  Prevents MIME-sniffing attacks.

#### 2. Secure Cookie Attributes
\`\`\`http
Set-Cookie: sessionId=xyz123; Secure; HttpOnly; SameSite=Strict; Path=/
\`\`\`
- **\`HttpOnly\`**: Blocks JavaScript (\`document.cookie\`) access, thwarting session hijacking via XSS.
- **\`Secure\`**: Transmits cookies only across HTTPS connections.
- **\`SameSite=Strict\`**: Blocks cross-site transmission during third-party initiated requests, eliminating CSRF.`;
  } else if (qLower.includes("nmap") || qLower.includes("port") || qLower.includes("recon") || qLower.includes("syn")) {
    aiResponse = `### Network Port Reconnaissance & TCP Handshake Mechanics

Reconnaissance is the initial phase of security assessments. Ethical analysts scan target systems only after establishing an authorized scope.

#### 1. TCP Three-Way Handshake vs. SYN Stealth Scan
- **Full Connect Scan (\`-sT\`)**:
  Completes full TCP handshake (\`SYN\` $\\to$ \`SYN-ACK\` $\\to$ \`ACK\`). Generates full connection logs in host firewalls.
- **SYN Stealth Scan (\`-sS\`)**:
  Sends \`SYN\`. If target responds with \`SYN-ACK\`, port is **OPEN**; the scanner immediately sends \`RST\` to terminate without completing the connection.

#### 2. Service Banner Grabbing (\`-sV\`)
Service version enumeration sends generic probes and matches banner signatures against known services (e.g. OpenSSH 8.2p1 on port 22, Apache 2.4.41 on port 80).

#### 3. Recommended Defensive Strategy
1. Restrict administrative services (SSH, RDP) using private VPC subnets or VPNs.
2. Implement network firewalls to block unsolicited inbound connections.
3. Deploy Port Knocking or fail2ban to detect aggressive reconnaissance.`;
  } else if (qLower.includes("sqli") || qLower.includes("sql injection") || qLower.includes("sanitize") || qLower.includes("prepared")) {
    aiResponse = `### SQL Injection Mechanisms & Parameterized Defense

SQL Injection (OWASP A03:2021) occurs when untrusted user input is concatenated directly into SQL command strings, altering query semantics.

#### 1. The Vulnerable Mechanism
\`\`\`sql
-- Vulnerable dynamic string concatenation:
SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';
\`\`\`
Because \`'1'='1'\` evaluates to true for every database record, the authentication check is completely bypassed.

#### 2. The Definitive Remediation: Parameterized Queries
Parameterized queries (Prepared Statements) separate SQL code from user-supplied data at the database engine protocol level:

\`\`\`typescript
// Secure implementation in Node.js / PostgreSQL / SQLite:
const query = "SELECT id, username, email FROM users WHERE username = $1 AND password_hash = $2";
const result = await db.query(query, [userInputUsername, computedPasswordHash]);
\`\`\`

#### 3. Additional Defense in Depth
- **Principle of Least Privilege**: The web application database role should not possess \`DROP TABLE\`, \`ALTER\`, or superuser privileges.
- **Input Validation**: Whitelist input formats using schemas like Zod.
- **WAF Rules**: Use web application firewall rules to detect common SQL injection signatures.`;
  } else if (qLower.includes("soc") || qLower.includes("incident") || qLower.includes("siem") || qLower.includes("log")) {
    aiResponse = `### Security Operations Center (SOC) Incident Triage & Log Analysis

SOC analysts follow standardized incident response frameworks (NIST SP 800-61r2) to detect, analyze, contain, eradicate, and recover from cybersecurity incidents.

#### 1. NIST Incident Response Lifecycle
1. **Preparation**: Hardening systems, defining baseline behavior, configuring central logging.
2. **Detection & Analysis**: Correlating SIEM alerts, reviewing authentication logs, triaging anomalies.
3. **Containment**: Isolating compromised endpoints from the network segment to halt lateral movement.
4. **Eradication**: Removing adversary persistence (backdoors, unauthorized cron jobs, rogue user accounts).
5. **Recovery**: Restoring services from verified clean backups.
6. **Lessons Learned**: Documenting root-cause analysis and improving defensive rules.

#### 2. Key Telemetry Indicators of Compromise (IoCs)
- High volume of \`401 Unauthorized\` or \`Failed password\` events followed by a single \`200 OK\` or \`Accepted\` from an anomalous foreign IP.
- Unusual process execution (e.g. \`cmd.exe\` or \`bash\` spawned by \`www-data\` or \`nginx\`).
- Outbound egress beaconing to unknown external IP addresses at fixed periodic intervals.`;
  } else if (qLower.includes("crypto") || qLower.includes("xor") || qLower.includes("base64") || qLower.includes("stego") || qLower.includes("ctf")) {
    aiResponse = `### Classical Cryptanalysis & Encoding in CTF Challenges

In Capture The Flag (CTF) security competitions, forensic and cryptography challenges frequently require distinguishing between encoding, hashing, and encryption.

#### 1. Encoding vs. Encryption
- **Base64**: Not encryption! An encoding scheme designed to represent binary data in ASCII strings. Easily reversible without a secret key.
- **Single-Byte XOR**: Encryption where each plaintext byte $P_i$ is XORed with a fixed key byte $K$:
  $$C_i = P_i \\oplus K$$
  Since XOR is self-inverting:
  $$P_i = C_i \\oplus K$$
  Because there are only 256 possible byte values ($0 \\times 00$ to $0 \\times FF$), single-byte XOR ciphertexts can be cracked instantaneously via frequency analysis or brute-force searching for known flag prefixes (\`PMU{\`).

#### 2. Modern Standards
- For confidentiality, always use authenticated symmetric ciphers like **AES-256-GCM** or **ChaCha20-Poly1305**.
- For integrity and digital signatures, use **SHA-256 / SHA-3** and **Ed25519 / RSA-PSS**.`;
  } else {
    isDefensiveGrounded = false;
    aiResponse = `### CyberSecurity Principles & Defensive Analysis

Your query touches on foundational cybersecurity concepts:

#### Core Pillars of Information Security (CIA Triad)
1. **Confidentiality**: Ensuring data is accessible only to authorized entities through encryption, access control (RBAC), and multi-factor authentication.
2. **Integrity**: Protecting information against unauthorized modification using cryptographic hashes (e.g., SHA-256) and digital signatures.
3. **Availability**: Ensuring authorized users have reliable access to systems via redundancy, DDoS mitigations, and high-availability architecture.

#### Ethical Security Practice
When exploring cybersecurity techniques, remember:
- Practice exclusively in authorized sandbox environments like PrepMeUp AI labs.
- Follow industry-standard frameworks (MITRE ATT&CK, OWASP Top 10, NIST Cybersecurity Framework).
- Always prioritize defense, vulnerability remediation, and ethical compliance.`;
  }

  return {
    id: doubtId,
    studentId,
    courseSlug: "cybersecurity-foundations-ethical-hacking-soc-ctf",
    moduleNumber,
    questionText: qClean,
    aiResponse,
    isDefensiveGrounded,
    isOffensiveRefused: false,
    createdAt: new Date().toISOString(),
  };
}
