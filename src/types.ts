export interface Subject {
  _id: string;
  name: string;
  slug: string;
}

export interface QuizQ {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
}

export interface ModuleDoc {
  _id: string;
  subject: string;
  order: number;
  title: string;
  desc: string;
  lesson: string;
  quiz: QuizQ[];
  task: string;
  project: { title: string; description: string };
  placeholder?: boolean;
}

export interface ProgressRow {
  _id: string;
  student: string;
  module: string;
  lessonDone: boolean;
  quizScore: number | null;
  quizAttempts: number;
  taskText: string;
  taskSubmitted: boolean;
  projectText: string;
  projectSubmitted: boolean;
}

export interface LiveClass {
  _id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  link: string;
}

export interface StudentRec {
  _id: string;
  name: string;
  subject: string;
  createdAt: string;
  /** ISO date (YYYY-MM-DD) → number of progress saves that day */
  activity?: Record<string, number>;
}

export interface TrainerRec {
  _id: string;
  name: string;
}

export interface Announcement {
  _id: string;
  text: string;
  author: string;
  at: string; // ISO datetime
}

export interface DB {
  subjects: Subject[];
  students: StudentRec[];
  trainers: TrainerRec[];
  modules: ModuleDoc[];
  progress: ProgressRow[];
  liveClasses: LiveClass[];
  announcements?: Announcement[];
}

export interface StudentWithSubject {
  _id: string;
  name: string;
  createdAt: string;
  subject: Subject;
}

export interface StudentSummary {
  _id: string;
  name: string;
  createdAt: string;
  subject: Subject;
  modulesDone: number;
  totalModules: number;
  avgQuiz: number | null;
}

export interface StudentModuleStatus {
  moduleId: string;
  title: string;
  order: number;
  lessonDone: boolean;
  quizScore: number | null;
  quizAttempts: number;
  taskText: string;
  taskSubmitted: boolean;
  projectText: string;
  projectSubmitted: boolean;
}

export interface StudentDetailData {
  _id: string;
  name: string;
  createdAt: string;
  subject: Subject;
  modules: StudentModuleStatus[];
}

export type Role = "student" | "trainer";

export interface Session {
  role: Role;
  id: string;
  name: string;
  subject?: Subject; // students only
}
