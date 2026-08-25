export interface CoursePricing {
  amount: number;
  currency: "INR";
  discountPrice: number | null;
  trialDays: number;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  level: string;
  totalHours: number;
  pricing: CoursePricing;
  isPublished: boolean;
  instructorId: string;
  enrolled: number;
  rating: number;
  createdAt: string;
}

export type ContentType = "lesson" | "quiz" | "assignment" | "project";

export interface ModuleContent {
  latexSource: string;
  compiledHtml: string;
  compiledAt: string | null;
  status: "uncompiled" | "compiling" | "compiled";
  warnings: string[];
}

export interface QuizQ {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
}

export interface CourseModule {
  _id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  contentType: ContentType;
  content: ModuleContent;
  isDraft: boolean;
  estimatedMinutes: number;
  quiz: QuizQ[];
}

export type EnrollmentStatus = "trial" | "active" | "expired" | "blocked";

export interface StudentProgress {
  completed: string[];
  quizScores: Record<string, number>;
}

export interface StudentRec {
  _id: string;
  name: string;
  email: string;
  courseId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  trialStart: string;
  trialEnd: string;
  paymentStatus: "pending" | "completed" | "failed";
  progress: StudentProgress;
  moduleVisibility: Record<string, boolean>;
  lastActive: string;
}

export type MeetingProvider = "jitsi" | "gmeet";
export type LiveStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

export interface LiveClass {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMin: number;
  provider: MeetingProvider;
  meetingLink: string;
  meetingId: string;
  status: LiveStatus;
  recordingUrl?: string;
}

export type PaymentStatus = "created" | "completed" | "failed";

export interface Payment {
  _id: string;
  studentId: string;
  courseId: string;
  amount: number;
  currency: "INR";
  gateway: "razorpay";
  orderId: string;
  paymentId: string;
  status: PaymentStatus;
  method: "card" | "upi";
  createdAt: string;
}

export interface Trainer {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "instructor";
  bio: string;
  hue: number;
  specialization: string[];
  experienceYears: number;
}

export interface DB {
  courses: Course[];
  modules: CourseModule[];
  students: StudentRec[];
  liveClasses: LiveClass[];
  payments: Payment[];
  trainers: Trainer[];
}

export type Session =
  | { role: "student"; id: string; name: string; email: string }
  | { role: "admin"; id: string; name: string; email: string };

export type ModuleState = "done" | "open" | "locked" | "restricted" | "paywall";

export interface ModuleAccess {
  module: CourseModule;
  state: ModuleState;
}

export interface StudentHome {
  student: StudentRec;
  course: Course;
  instructor: Trainer;
  modules: ModuleAccess[];
  progressPct: number;
  payments: Payment[];
}

export interface AdminStudentRow {
  student: StudentRec;
  courseTitle: string;
  completionPct: number;
  modulesDone: number;
  modulesTotal: number;
}

export interface Analytics {
  revenueTotal: number;
  revenueMonthly: Array<{ label: string; value: number }>;
  statusCounts: Record<EnrollmentStatus, number>;
  conversionPct: number;
  avgCompletionPct: number;
  weeklyActive: Array<{ label: string; value: number }>;
}

export interface CourseBundle {
  course: Course;
  modules: CourseModule[];
  instructor: Trainer;
}
