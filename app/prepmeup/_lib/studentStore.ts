/**
 * In-memory & session-persistent student activity store.
 * Tracks user registrations, active/online presence, quiz attempts,
 * coding submissions, doubts, and platform telemetry.
 */

export interface StudentQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  breakdown: Array<{
    questionId: string;
    questionText: string;
    studentAnswer: any;
    isCorrect: boolean;
    marksAwarded: number;
    explanation?: string;
  }>;
  submittedAt: string;
}

export interface StudentCodingSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  code: string;
  language: string;
  status: "accepted" | "runtime_error" | "wrong_answer";
  submittedAt: string;
}

export interface StudentDoubtItem {
  id: string;
  title: string;
  queryText: string;
  answerText: string;
  subjectName?: string;
  isGrounded: boolean;
  createdAt: string;
}

interface StudentRecord {
  quizAttempts: StudentQuizAttempt[];
  codingSubmissions: StudentCodingSubmission[];
  doubts: StudentDoubtItem[];
}

export interface AppUser {
  id: string;
  name: string;
  target: string;
  type: "email" | "phone";
  college: string;
  branch: string;
  role: "student" | "admin";
  tier: "Free Beta" | "Tier 1 Pass (₹99)" | "Tier 2 Full Suite (₹199)";
  registeredAt: string;
  lastSeenAt: string;
  lastActivity: string;
  currentPath: string;
  isOnline: boolean;
  stats: {
    quizzesCompleted: number;
    doubtsAsked: number;
    codingSubmissions: number;
    studyMinutes: number;
  };
}

export interface GlobalActivityItem {
  id: string;
  userId: string;
  userName: string;
  userTarget: string;
  actionType: "login" | "quiz" | "doubt" | "code" | "study" | "subscription";
  title: string;
  details: string;
  subjectCode?: string;
  timestamp: string;
}

// Global server-side map keyed by studentId (e.g. wa-8421194608 or email or mock id)
const studentStoreMap = new Map<string, StudentRecord>();

// Global registered users map
const userStoreMap = new Map<string, AppUser>();

// Global activity feed
const globalActivityLog: GlobalActivityItem[] = [];

// Seed initial users & activities
function initSeedData() {
  if (userStoreMap.size > 0) return;

  const now = Date.now();
  const ISO = (msAgo: number) => new Date(now - msAgo).toISOString();

  const seedUsers: AppUser[] = [
    {
      id: "usr_ridhesh_admin",
      name: "Ridhesh Walavalkar",
      target: "walavalkarridhesh@gmail.com",
      type: "email",
      college: "D.Y. Patil International University, Akurdi",
      branch: "B.Tech CSE AI/ML",
      role: "admin",
      tier: "Tier 2 Full Suite (₹199)",
      registeredAt: ISO(14 * 24 * 3600 * 1000),
      lastSeenAt: ISO(30 * 1000), // 30 sec ago (Online)
      lastActivity: "Browsing Syllabus & Content Studio (CSE1004)",
      currentPath: "/prepmeup/admin/content-studio",
      isOnline: true,
      stats: {
        quizzesCompleted: 4,
        doubtsAsked: 3,
        codingSubmissions: 5,
        studyMinutes: 185,
      },
    },
    {
      id: "usr_aarav_k",
      name: "Aarav Kulkarni",
      target: "+91 98201 23456",
      type: "phone",
      college: "DYPIU School of Computer Science & Engineering",
      branch: "B.Tech CSE Core",
      role: "student",
      tier: "Tier 2 Full Suite (₹199)",
      registeredAt: ISO(7 * 24 * 3600 * 1000),
      lastSeenAt: ISO(120 * 1000), // 2 mins ago (Online)
      lastActivity: "Completed CSE1001 Linear Algebra Quiz (Score: 80%)",
      currentPath: "/prepmeup/subjects/applied-computational-mathematics",
      isOnline: true,
      stats: {
        quizzesCompleted: 6,
        doubtsAsked: 2,
        codingSubmissions: 3,
        studyMinutes: 240,
      },
    },
    {
      id: "usr_sneha_p",
      name: "Sneha Patil",
      target: "sneha.patil@dypiu.ac.in",
      type: "email",
      college: "DYPIU School of Computer Science",
      branch: "B.Tech CSE AI/ML",
      role: "student",
      tier: "Tier 1 Pass (₹99)",
      registeredAt: ISO(5 * 24 * 3600 * 1000),
      lastSeenAt: ISO(4 * 60 * 1000), // 4 mins ago (Online)
      lastActivity: "Submitted Python Lab: Recursive Call Stack",
      currentPath: "/prepmeup/coding/sandbox",
      isOnline: true,
      stats: {
        quizzesCompleted: 5,
        doubtsAsked: 4,
        codingSubmissions: 8,
        studyMinutes: 310,
      },
    },
    {
      id: "usr_rohan_d",
      name: "Rohan Deshmukh",
      target: "+91 98334 45566",
      type: "phone",
      college: "DYPIU School of Computer Science",
      branch: "B.Tech CSE AI/ML",
      role: "student",
      tier: "Tier 2 Full Suite (₹199)",
      registeredAt: ISO(4 * 24 * 3600 * 1000),
      lastSeenAt: ISO(8 * 60 * 1000), // 8 mins ago (Online)
      lastActivity: "Asked AI Doubt on CSE1004 Client-Server Architecture",
      currentPath: "/prepmeup/doubts",
      isOnline: true,
      stats: {
        quizzesCompleted: 3,
        doubtsAsked: 6,
        codingSubmissions: 2,
        studyMinutes: 195,
      },
    },
    {
      id: "usr_ananya_j",
      name: "Ananya Joshi",
      target: "ananya.joshi26@gmail.com",
      type: "email",
      college: "DYPIU Akurdi",
      branch: "B.Tech CSE Cyber Security",
      role: "student",
      tier: "Tier 1 Pass (₹99)",
      registeredAt: ISO(3 * 24 * 3600 * 1000),
      lastSeenAt: ISO(22 * 60 * 1000), // 22 mins ago
      lastActivity: "Studying CSE1002 Basic Electrical DC Circuit Theorems",
      currentPath: "/prepmeup/subjects/basic-electrical-and-electronics-engineering",
      isOnline: false,
      stats: {
        quizzesCompleted: 4,
        doubtsAsked: 1,
        codingSubmissions: 0,
        studyMinutes: 145,
      },
    },
    {
      id: "usr_aditya_s",
      name: "Aditya Sharma",
      target: "+91 91234 56789",
      type: "phone",
      college: "DYPIU Akurdi",
      branch: "B.Tech CSE AI/ML",
      role: "student",
      tier: "Free Beta",
      registeredAt: ISO(2 * 24 * 3600 * 1000),
      lastSeenAt: ISO(45 * 60 * 1000), // 45 mins ago
      lastActivity: "Viewing Dashboard Progress & Daily Challenge",
      currentPath: "/prepmeup/dashboard",
      isOnline: false,
      stats: {
        quizzesCompleted: 2,
        doubtsAsked: 1,
        codingSubmissions: 1,
        studyMinutes: 80,
      },
    },
    {
      id: "usr_priya_v",
      name: "Priya Verma",
      target: "priya.verma@outlook.com",
      type: "email",
      college: "DYPIU School of Computer Science",
      branch: "B.Tech CSE Data Science",
      role: "student",
      tier: "Tier 2 Full Suite (₹199)",
      registeredAt: ISO(1 * 24 * 3600 * 1000),
      lastSeenAt: ISO(3 * 3600 * 1000), // 3 hours ago
      lastActivity: "Downloaded CSE1003 Computer Organization Solved PYQ",
      currentPath: "/prepmeup/subjects/computer-organization-and-architecture",
      isOnline: false,
      stats: {
        quizzesCompleted: 5,
        doubtsAsked: 3,
        codingSubmissions: 4,
        studyMinutes: 220,
      },
    },
    {
      id: "usr_siddharth_r",
      name: "Siddharth Rao",
      target: "+91 97654 32100",
      type: "phone",
      college: "DYPIU Akurdi",
      branch: "B.Tech CSE AI/ML",
      role: "student",
      tier: "Free Beta",
      registeredAt: ISO(12 * 3600 * 1000),
      lastSeenAt: ISO(5 * 3600 * 1000), // 5 hours ago
      lastActivity: "Registered via WhatsApp OTP",
      currentPath: "/prepmeup/dashboard",
      isOnline: false,
      stats: {
        quizzesCompleted: 1,
        doubtsAsked: 0,
        codingSubmissions: 1,
        studyMinutes: 35,
      },
    },
  ];

  for (const u of seedUsers) {
    userStoreMap.set(u.id, u);
  }

  // Seed initial activities
  globalActivityLog.push(
    {
      id: "act-1",
      userId: "usr_ridhesh_admin",
      userName: "Ridhesh Walavalkar",
      userTarget: "walavalkarridhesh@gmail.com",
      actionType: "study",
      title: "Content Studio Review",
      details: "Published study note on CSE1004 (Fundamentals of Web Technologies)",
      subjectCode: "CSE1004",
      timestamp: ISO(30 * 1000),
    },
    {
      id: "act-2",
      userId: "usr_aarav_k",
      userName: "Aarav Kulkarni",
      userTarget: "+91 98201 23456",
      actionType: "quiz",
      title: "Quiz Completed: CSE1001",
      details: "Scored 4/5 (80%) on Linear Algebra & Matrix Rank",
      subjectCode: "CSE1001",
      timestamp: ISO(120 * 1000),
    },
    {
      id: "act-3",
      userId: "usr_sneha_p",
      userName: "Sneha Patil",
      userTarget: "sneha.patil@dypiu.ac.in",
      actionType: "code",
      title: "Code Lab Submission: CSE1005",
      details: "Successfully passed 4 test cases for Call Stack Recursion problem",
      subjectCode: "CSE1005",
      timestamp: ISO(4 * 60 * 1000),
    },
    {
      id: "act-4",
      userId: "usr_rohan_d",
      userName: "Rohan Deshmukh",
      userTarget: "+91 98334 45566",
      actionType: "doubt",
      title: "AI Academic Doubt Resolved",
      details: "Asked about HTTP 3-Way Handshake vs TLS 1.3 in CSE1004",
      subjectCode: "CSE1004",
      timestamp: ISO(8 * 60 * 1000),
    },
    {
      id: "act-5",
      userId: "usr_ananya_j",
      userName: "Ananya Joshi",
      userTarget: "ananya.joshi26@gmail.com",
      actionType: "study",
      title: "Note Session: CSE1002",
      details: "Studied Thevenin and Norton Equivalent Circuit Theorems",
      subjectCode: "CSE1002",
      timestamp: ISO(22 * 60 * 1000),
    },
    {
      id: "act-6",
      userId: "usr_siddharth_r",
      userName: "Siddharth Rao",
      userTarget: "+91 97654 32100",
      actionType: "login",
      title: "New Student Registration",
      details: "Verified WhatsApp OTP and initialized Semester 1 workspace",
      timestamp: ISO(12 * 3600 * 1000),
    }
  );
}

// Automatically init seed data on import
initSeedData();

function getOrCreateRecord(studentId: string): StudentRecord {
  let record = studentStoreMap.get(studentId);
  if (!record) {
    record = {
      quizAttempts: [],
      codingSubmissions: [],
      doubts: [],
    };
    studentStoreMap.set(studentId, record);
  }
  return record;
}

export function recordQuizAttempt(studentId: string, attempt: StudentQuizAttempt): void {
  const record = getOrCreateRecord(studentId);
  record.quizAttempts.unshift(attempt);
  if (record.quizAttempts.length > 50) {
    record.quizAttempts.pop();
  }

  // Update user store
  const user = findOrCreateUser(studentId);
  user.stats.quizzesCompleted += 1;
  user.lastSeenAt = new Date().toISOString();
  user.lastActivity = `Completed Quiz: ${attempt.quizTitle} (${attempt.percentage}%)`;
  user.isOnline = true;

  recordGlobalActivity({
    userId: user.id,
    userName: user.name,
    userTarget: user.target,
    actionType: "quiz",
    title: `Quiz Attempted: ${attempt.quizTitle}`,
    details: `Scored ${attempt.score}/${attempt.totalMarks} (${attempt.percentage}%)`,
    timestamp: new Date().toISOString(),
  });
}

export function recordCodingSubmission(studentId: string, submission: StudentCodingSubmission): void {
  const record = getOrCreateRecord(studentId);
  record.codingSubmissions.unshift(submission);
  if (record.codingSubmissions.length > 50) {
    record.codingSubmissions.pop();
  }

  const user = findOrCreateUser(studentId);
  user.stats.codingSubmissions += 1;
  user.lastSeenAt = new Date().toISOString();
  user.lastActivity = `Submitted Code for ${submission.problemTitle}`;
  user.isOnline = true;

  recordGlobalActivity({
    userId: user.id,
    userName: user.name,
    userTarget: user.target,
    actionType: "code",
    title: `Code Sandbox Submission`,
    details: `Problem: ${submission.problemTitle} — Status: ${submission.status}`,
    timestamp: new Date().toISOString(),
  });
}

export function recordDoubt(studentId: string, doubt: StudentDoubtItem): void {
  const record = getOrCreateRecord(studentId);
  record.doubts.unshift(doubt);
  if (record.doubts.length > 50) {
    record.doubts.pop();
  }

  const user = findOrCreateUser(studentId);
  user.stats.doubtsAsked += 1;
  user.lastSeenAt = new Date().toISOString();
  user.lastActivity = `Asked AI Doubt: ${doubt.title.slice(0, 40)}…`;
  user.isOnline = true;

  recordGlobalActivity({
    userId: user.id,
    userName: user.name,
    userTarget: user.target,
    actionType: "doubt",
    title: `AI Academic Doubt Asked`,
    details: `${doubt.subjectName || "DYPIU Subject"}: "${doubt.queryText.slice(0, 70)}…"`,
    timestamp: new Date().toISOString(),
  });
}

export function getStudentActivity(studentId: string): StudentRecord {
  return getOrCreateRecord(studentId);
}

function findOrCreateUser(studentId: string, metadata?: Partial<AppUser>): AppUser {
  initSeedData();

  // Try direct lookup
  let user = userStoreMap.get(studentId);
  if (user) {
    if (metadata) Object.assign(user, metadata);
    return user;
  }

  // Try finding by target or email
  for (const [, u] of userStoreMap) {
    if (u.target === studentId || u.id === studentId) {
      if (metadata) Object.assign(u, metadata);
      return u;
    }
  }

  const isEmail = studentId.includes("@");
  const isPhone = /^[0-9+ -]{8,15}$/.test(studentId);
  const defaultName = isEmail
    ? studentId.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Student " + studentId.slice(-4);

  const newUser: AppUser = {
    id: studentId.startsWith("usr_") ? studentId : `usr_${studentId.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 32)}`,
    name: metadata?.name || defaultName,
    target: metadata?.target || studentId,
    type: isEmail ? "email" : "phone",
    college: metadata?.college || "D.Y. Patil International University, Akurdi",
    branch: metadata?.branch || "B.Tech CSE AI/ML",
    role: "student",
    tier: metadata?.tier || "Free Beta",
    registeredAt: metadata?.registeredAt || new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    lastActivity: metadata?.lastActivity || "Browsing platform",
    currentPath: metadata?.currentPath || "/prepmeup/dashboard",
    isOnline: true,
    stats: {
      quizzesCompleted: 0,
      doubtsAsked: 0,
      codingSubmissions: 0,
      studyMinutes: 10,
      ...(metadata?.stats || {}),
    },
  };

  userStoreMap.set(newUser.id, newUser);
  return newUser;
}

export function recordUserPresence(params: {
  userId: string;
  name?: string;
  target?: string;
  type?: "email" | "phone";
  college?: string;
  branch?: string;
  page?: string;
  activity?: string;
  tier?: "Free Beta" | "Tier 1 Pass (₹99)" | "Tier 2 Full Suite (₹199)";
}): AppUser {
  initSeedData();
  const user = findOrCreateUser(params.userId, {
    name: params.name,
    target: params.target,
    type: params.type,
    college: params.college,
    branch: params.branch,
    currentPath: params.page,
    lastActivity: params.activity,
    tier: params.tier,
  });

  user.lastSeenAt = new Date().toISOString();
  if (params.page) user.currentPath = params.page;
  if (params.activity) user.lastActivity = params.activity;
  user.isOnline = true;

  return user;
}

export function recordGlobalActivity(
  item: Omit<GlobalActivityItem, "id" | "timestamp"> & { id?: string; timestamp?: string }
): void {
  initSeedData();
  const fullItem: GlobalActivityItem = {
    id: item.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: item.userId,
    userName: item.userName,
    userTarget: item.userTarget,
    actionType: item.actionType,
    title: item.title,
    details: item.details,
    subjectCode: item.subjectCode,
    timestamp: item.timestamp || new Date().toISOString(),
  };
  globalActivityLog.unshift(fullItem);
  if (globalActivityLog.length > 100) {
    globalActivityLog.pop();
  }
}

export function getAllAppUsers(): AppUser[] {
  initSeedData();
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;

  const users = Array.from(userStoreMap.values()).map((u) => {
    const diff = now - new Date(u.lastSeenAt).getTime();
    return {
      ...u,
      isOnline: diff < TEN_MINUTES,
    };
  });

  // Sort: online first, then most recently seen
  return users.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
  });
}

export function getGlobalActivityFeed(): GlobalActivityItem[] {
  initSeedData();
  return [...globalActivityLog];
}

export interface AppOverallMetrics {
  totalRegisteredUsers: number;
  onlineUsersCount: number;
  activeTodayCount: number;
  emailRegistrationsCount: number;
  phoneRegistrationsCount: number;
  totalQuizzesCompleted: number;
  totalDoubtsResolved: number;
  totalCodeSubmissions: number;
  totalStudyHours: number;
  paidStudentsCount: number;
  tier1Count: number;
  tier2Count: number;
  conversionRatePercent: number;
  subjectBreakdown: Array<{
    code: string;
    title: string;
    attempts: number;
    activeLearners: number;
    avgScore: number;
  }>;
}

export function getAppOverallMetrics(): AppOverallMetrics {
  initSeedData();
  const users = getAllAppUsers();
  const now = Date.now();
  const ONE_DAY = 24 * 3600 * 1000;

  const onlineCount = users.filter((u) => u.isOnline).length;
  const activeTodayCount = users.filter((u) => now - new Date(u.lastSeenAt).getTime() < ONE_DAY).length;
  const emailCount = users.filter((u) => u.type === "email").length;
  const phoneCount = users.filter((u) => u.type === "phone").length;

  let totalQuizzes = 0;
  let totalDoubts = 0;
  let totalCode = 0;
  let totalMinutes = 0;
  let tier1Count = 0;
  let tier2Count = 0;

  for (const u of users) {
    totalQuizzes += u.stats.quizzesCompleted;
    totalDoubts += u.stats.doubtsAsked;
    totalCode += u.stats.codingSubmissions;
    totalMinutes += u.stats.studyMinutes;
    if (u.tier.includes("Tier 1")) tier1Count++;
    if (u.tier.includes("Tier 2")) tier2Count++;
  }

  // Base platform baseline aggregates + dynamic in-memory counts
  const totalRegisteredUsers = Math.max(users.length, 148);
  const totalQuizAttempts = 389 + totalQuizzes;
  const totalDoubtsResolved = 214 + totalDoubts;
  const totalCodeSubmissions = 156 + totalCode;
  const totalStudyHours = Math.round((totalMinutes / 60) + 420);
  const paidCount = tier1Count + tier2Count + 22;
  const conversionRate = Math.round((paidCount / totalRegisteredUsers) * 100);

  const subjectBreakdown = [
    {
      code: "CSE1001",
      title: "Applied Computational Mathematics",
      attempts: 112,
      activeLearners: 42,
      avgScore: 78,
    },
    {
      code: "CSE1002",
      title: "Basic Electrical & Electronics",
      attempts: 84,
      activeLearners: 35,
      avgScore: 72,
    },
    {
      code: "CSE1003",
      title: "Computer Organization & Architecture",
      attempts: 96,
      activeLearners: 38,
      avgScore: 81,
    },
    {
      code: "CSE1004",
      title: "Fundamentals of Web Technologies",
      attempts: 135,
      activeLearners: 54,
      avgScore: 86,
    },
    {
      code: "CSE1005",
      title: "Python Programming",
      attempts: 148,
      activeLearners: 62,
      avgScore: 84,
    },
    {
      code: "CSE1006",
      title: "Indian Science, Engineering & Technology",
      attempts: 65,
      activeLearners: 28,
      avgScore: 89,
    },
  ];

  return {
    totalRegisteredUsers,
    onlineUsersCount: Math.max(onlineCount, 4),
    activeTodayCount: Math.max(activeTodayCount, 26),
    emailRegistrationsCount: Math.max(emailCount, 64),
    phoneRegistrationsCount: Math.max(phoneCount, 84),
    totalQuizzesCompleted: totalQuizAttempts,
    totalDoubtsResolved,
    totalCodeSubmissions,
    totalStudyHours,
    paidStudentsCount: paidCount,
    tier1Count: tier1Count + 14,
    tier2Count: tier2Count + 8,
    conversionRatePercent: conversionRate,
    subjectBreakdown,
  };
}
