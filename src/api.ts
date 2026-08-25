import { seedDB } from "./data/seed";
import { compileLogs, latexToHtml } from "./latex";
import type {
  AdminStudentRow,
  Analytics,
  Course,
  CourseBundle,
  CourseModule,
  DB,
  EnrollmentStatus,
  LiveClass,
  MeetingProvider,
  ModuleAccess,
  Payment,
  Session,
  StudentHome,
  StudentRec,
  Trainer,
} from "./types";
import { effectiveStatus, uid } from "./util";

const DB_KEY = "edulaunch.db.v1";
export const ADMIN_EMAIL = "admin@edulaunch.io";
export const ADMIN_PASSWORD = "edulaunch";
const TRIAL_MS = 48 * 3600 * 1000;

const wait = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms + Math.random() * 160));

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {
    /* corrupted — reseed */
  }
  const db = seedDB();
  saveDB(db);
  return db;
}

function saveDB(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function mutate<T>(fn: (db: DB) => T): T {
  const db = loadDB();
  const out = fn(db);
  saveDB(db);
  return out;
}

const read = <T,>(fn: (db: DB) => T): T => fn(loadDB());

/** Trial students flip to expired the moment the clock passes. */
function normalize(db: DB) {
  const now = Date.now();
  for (const st of db.students) {
    if (st.status === "trial" && new Date(st.trialEnd).getTime() <= now) st.status = "expired";
  }
}

const courseOf = (db: DB, id: string): Course => {
  const c = db.courses.find((x) => x._id === id);
  if (!c) throw new Error("Course not found");
  return c;
};

const trainerOf = (db: DB, id: string): Trainer => {
  const t = db.trainers.find((x) => x._id === id);
  if (!t) throw new Error("Instructor not found");
  return t;
};

/* ------------------------------------------------------------------ */
/*  Public                                                             */
/* ------------------------------------------------------------------ */

export async function getPublicCourses(): Promise<Course[]> {
  await wait(160);
  return read((db) => db.courses.filter((c) => c.isPublished).sort((a, b) => b.enrolled - a.enrolled));
}

export async function getCourseBundle(slug: string): Promise<CourseBundle> {
  await wait();
  return read((db) => {
    const course = db.courses.find((c) => c.slug === slug && c.isPublished);
    if (!course) throw new Error("Course not found");
    const modules = db.modules
      .filter((m) => m.courseId === course._id && !m.isDraft)
      .sort((a, b) => a.order - b.order);
    return { course, modules, instructor: trainerOf(db, course.instructorId) };
  });
}

/* ------------------------------------------------------------------ */
/*  Auth (trust-based demo — no real crypto)                           */
/* ------------------------------------------------------------------ */

export async function registerStudent(name: string, email: string, courseId: string): Promise<Session> {
  await wait(340);
  const n = name.trim();
  const e = email.trim().toLowerCase();
  if (!n) throw new Error("Name is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error("Enter a valid email address");
  return mutate((db) => {
    normalize(db);
    if (db.students.some((s) => s.email.toLowerCase() === e))
      throw new Error("That email is already enrolled — use student sign-in instead.");
    courseOf(db, courseId);
    const nowIso = new Date().toISOString();
    const rec: StudentRec = {
      _id: uid("stu"),
      name: n,
      email: e,
      courseId,
      enrollmentDate: nowIso,
      status: "trial",
      trialStart: nowIso,
      trialEnd: new Date(Date.now() + TRIAL_MS).toISOString(),
      paymentStatus: "pending",
      progress: { completed: [], quizScores: {} },
      moduleVisibility: {},
      lastActive: nowIso,
    };
    db.students.push(rec);
    return { role: "student", id: rec._id, name: rec.name, email: rec.email };
  });
}

export async function loginStudent(email: string): Promise<Session> {
  await wait(300);
  const e = email.trim().toLowerCase();
  if (!e) throw new Error("Email is required");
  return mutate((db) => {
    normalize(db);
    const st = db.students.find((s) => s.email.toLowerCase() === e);
    if (!st) throw new Error("No student found for that email — start a free trial first.");
    st.lastActive = new Date().toISOString();
    return { role: "student", id: st._id, name: st.name, email: st.email };
  });
}

export async function loginAdmin(email: string, password: string): Promise<Session> {
  await wait(300);
  const e = email.trim().toLowerCase();
  return mutate((db) => {
    const t = db.trainers.find((x) => x.email.toLowerCase() === e);
    if (!t) throw new Error("Unknown trainer account.");
    if (t.password !== password) throw new Error("Wrong password — check the demo hint.");
    return { role: "admin", id: t._id, name: t.name, email: t.email };
  });
}

/* ------------------------------------------------------------------ */
/*  Student                                                            */
/* ------------------------------------------------------------------ */

export async function getStudentHome(studentId: string): Promise<StudentHome> {
  await wait();
  return mutate((db) => {
    normalize(db);
    const st = db.students.find((s) => s._id === studentId);
    if (!st) throw new Error("Student not found");
    st.lastActive = new Date().toISOString();
    const course = courseOf(db, st.courseId);
    const mods = db.modules
      .filter((m) => m.courseId === st.courseId && !m.isDraft)
      .sort((a, b) => a.order - b.order);

    const ok = st.status === "active" || st.status === "trial";
    let prevDone = true;
    const modules: ModuleAccess[] = mods.map((m) => {
      const done = st.progress.completed.includes(m._id);
      const vis = st.moduleVisibility[m._id] !== false;
      let state: ModuleAccess["state"];
      if (!vis) state = "restricted";
      else if (!ok) state = "paywall";
      else if (done) state = "done";
      else if (prevDone) state = "open";
      else state = "locked";
      if (state === "done") prevDone = true;
      else if (state === "open" || state === "locked") prevDone = false;
      return { module: m, state };
    });

    const progressPct = mods.length ? Math.round((st.progress.completed.length / mods.length) * 100) : 0;
    const payments = db.payments.filter((p) => p.studentId === studentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { student: st, course, instructor: trainerOf(db, course.instructorId), modules, progressPct, payments };
  });
}

export async function submitQuiz(studentId: string, moduleId: string, score: number): Promise<StudentRec> {
  await wait(220);
  return mutate((db) => {
    const st = db.students.find((s) => s._id === studentId);
    if (!st) throw new Error("Student not found");
    st.progress.quizScores[moduleId] = Math.max(st.progress.quizScores[moduleId] ?? 0, score);
    st.lastActive = new Date().toISOString();
    return st;
  });
}

export async function markModuleDone(studentId: string, moduleId: string): Promise<StudentRec> {
  await wait(220);
  return mutate((db) => {
    const st = db.students.find((s) => s._id === studentId);
    if (!st) throw new Error("Student not found");
    if (!st.progress.completed.includes(moduleId)) st.progress.completed.push(moduleId);
    st.lastActive = new Date().toISOString();
    return st;
  });
}

/* ---------------- payments ---------------- */

export async function createOrder(studentId: string, method: "card" | "upi"): Promise<{ orderId: string; amount: number }> {
  await wait(420);
  return mutate((db) => {
    const st = db.students.find((s) => s._id === studentId);
    if (!st) throw new Error("Student not found");
    const course = courseOf(db, st.courseId);
    const amount = course.pricing.discountPrice ?? course.pricing.amount;
    const rec: Payment = {
      _id: uid("pay"),
      studentId,
      courseId: course._id,
      amount,
      currency: "INR",
      gateway: "razorpay",
      orderId: `order_${Math.random().toString(36).slice(2, 12)}`,
      paymentId: "",
      status: "created",
      method,
      createdAt: new Date().toISOString(),
    };
    db.payments.push(rec);
    return { orderId: rec.orderId, amount };
  });
}

export async function completePayment(studentId: string, orderId: string): Promise<{ student: StudentRec; payment: Payment }> {
  await wait(500);
  return mutate((db) => {
    const st = db.students.find((s) => s._id === studentId);
    const pay = db.payments.find((p) => p.orderId === orderId && p.studentId === studentId);
    if (!st || !pay) throw new Error("Order not found");
    pay.status = "completed";
    pay.paymentId = `pay_${Math.random().toString(36).slice(2, 12)}`;
    st.status = "active";
    st.paymentStatus = "completed";
    st.trialEnd = new Date().toISOString();
    return { student: st, payment: pay };
  });
}

export async function failPayment(orderId: string): Promise<void> {
  await wait(300);
  mutate((db) => {
    const pay = db.payments.find((p) => p.orderId === orderId);
    if (pay) {
      pay.status = "failed";
      const st = db.students.find((s) => s._id === pay.studentId);
      if (st) st.paymentStatus = "failed";
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */

export async function adminListStudents(): Promise<AdminStudentRow[]> {
  await wait();
  return mutate((db) => {
    normalize(db);
    return db.students
      .map((st) => {
        const mods = db.modules.filter((m) => m.courseId === st.courseId && !m.isDraft);
        const done = st.progress.completed.filter((id) => mods.some((m) => m._id === id)).length;
        return {
          student: st,
          courseTitle: courseOf(db, st.courseId).title,
          modulesDone: done,
          modulesTotal: mods.length,
          completionPct: mods.length ? Math.round((done / mods.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.student.enrollmentDate.localeCompare(a.student.enrollmentDate));
  });
}

export async function adminSetStatus(studentId: string, status: EnrollmentStatus): Promise<StudentRec> {
  await wait(240);
  return mutate((db) => {
    const st = db.students.find((s) => s._id === studentId);
    if (!st) throw new Error("Student not found");
    st.status = status;
    if (status === "trial") {
      st.trialStart = new Date().toISOString();
      st.trialEnd = new Date(Date.now() + TRIAL_MS).toISOString();
    }
    return st;
  });
}

export async function adminToggleVisibility(studentId: string, moduleId: string): Promise<StudentRec> {
  await wait(200);
  return mutate((db) => {
    const st = db.students.find((s) => s._id === studentId);
    if (!st) throw new Error("Student not found");
    st.moduleVisibility[moduleId] = st.moduleVisibility[moduleId] === false ? true : false;
    return st;
  });
}

export async function adminListCourses(): Promise<Course[]> {
  await wait(160);
  return read((db) => [...db.courses].sort((a, b) => b.enrolled - a.enrolled));
}

export async function adminCreateCourse(data: Pick<Course, "title" | "tagline" | "description"> & { amount: number; discountPrice: number | null }): Promise<Course> {
  await wait(300);
  return mutate((db) => {
    const slug =
      data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
      "-" + Math.random().toString(36).slice(2, 5);
    const rec: Course = {
      _id: uid("crs"),
      title: data.title.trim(),
      slug,
      tagline: data.tagline.trim(),
      description: data.description.trim(),
      category: "Mathematics",
      level: "Undergraduate",
      totalHours: 12,
      pricing: { amount: data.amount, currency: "INR", discountPrice: data.discountPrice, trialDays: 2 },
      isPublished: false,
      instructorId: db.trainers[0]._id,
      enrolled: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
    };
    db.courses.push(rec);
    return rec;
  });
}

export async function adminUpdateCourse(id: string, patch: Partial<Course>): Promise<Course> {
  await wait(240);
  return mutate((db) => {
    const c = courseOf(db, id);
    Object.assign(c, patch);
    return c;
  });
}

export async function adminSetPublished(id: string, isPublished: boolean): Promise<Course> {
  await wait(220);
  return mutate((db) => {
    const c = courseOf(db, id);
    c.isPublished = isPublished;
    return c;
  });
}

export async function adminDeleteCourse(id: string): Promise<void> {
  await wait(260);
  mutate((db) => {
    db.courses = db.courses.filter((c) => c._id !== id);
    db.modules = db.modules.filter((m) => m.courseId !== id);
    db.liveClasses = db.liveClasses.filter((l) => l.courseId !== id);
  });
}

export async function adminListModules(courseId: string): Promise<CourseModule[]> {
  await wait(180);
  return read((db) => db.modules.filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order));
}

export async function adminCreateModule(courseId: string, title: string): Promise<CourseModule> {
  await wait(260);
  return mutate((db) => {
    courseOf(db, courseId);
    const order = db.modules.filter((m) => m.courseId === courseId).length + 1;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const rec: CourseModule = {
      _id: uid("mod"),
      courseId,
      order,
      title: title.trim(),
      description: "New module — add a description.",
      contentType: "lesson",
      content: {
        latexSource: `\\section{${title.trim()}}\nWrite your lesson here. Inline math like $e^{i\\pi} + 1 = 0$ renders with KaTeX.\n\n\\begin{theorem}\nState the result, then prove it honestly.\n\\end{theorem}`,
        compiledHtml: "",
        compiledAt: null,
        status: "uncompiled",
        warnings: [],
      },
      isDraft: true,
      estimatedMinutes: 45,
      quiz: [],
    };
    db.modules.push(rec);
    return rec;
  });
}

export async function adminUpdateModule(id: string, patch: Partial<CourseModule>): Promise<CourseModule> {
  await wait(240);
  return mutate((db) => {
    const m = db.modules.find((x) => x._id === id);
    if (!m) throw new Error("Module not found");
    Object.assign(m, patch);
    return m;
  });
}

export async function adminDeleteModule(id: string): Promise<void> {
  await wait(220);
  mutate((db) => {
    db.modules = db.modules.filter((m) => m._id !== id);
  });
}

export async function adminCompileModule(id: string): Promise<{ logs: string[]; warnings: string[]; formulas: number; ms: number }> {
  const started = performance.now();
  const result = read((db) => {
    const m = db.modules.find((x) => x._id === id);
    if (!m) throw new Error("Module not found");
    return latexToHtml(m.content.latexSource);
  });
  await wait(900);
  const ms = Math.round(performance.now() - started) + 400;
  mutate((db) => {
    const m = db.modules.find((x) => x._id === id);
    if (m) {
      m.content.compiledHtml = result.html;
      m.content.compiledAt = new Date().toISOString();
      m.content.status = "compiled";
      m.content.warnings = result.warnings;
    }
  });
  const title = read((db) => db.modules.find((x) => x._id === id)?.title ?? "module");
  return { logs: compileLogs(title, result.formulas, result.warnings, ms), warnings: result.warnings, formulas: result.formulas, ms };
}

export async function adminSetDraft(id: string, isDraft: boolean): Promise<CourseModule> {
  await wait(220);
  return mutate((db) => {
    const m = db.modules.find((x) => x._id === id);
    if (!m) throw new Error("Module not found");
    m.isDraft = isDraft;
    return m;
  });
}

/* ---------------- payments & analytics ---------------- */

export async function getPaymentsAdmin(): Promise<Array<Payment & { studentName: string; courseTitle: string }>> {
  await wait();
  return mutate((db) => {
    normalize(db);
    return db.payments
      .map((p) => ({
        ...p,
        studentName: db.students.find((s) => s._id === p.studentId)?.name ?? "—",
        courseTitle: db.courses.find((c) => c._id === p.courseId)?.title ?? "—",
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
}

export async function getAnalytics(): Promise<Analytics> {
  await wait();
  return mutate((db) => {
    normalize(db);
    const done = db.payments.filter((p) => p.status === "completed");
    const revenueTotal = done.reduce((a, p) => a + p.amount, 0);

    const months: Array<{ label: string; value: number }> = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${m.getFullYear()}-${m.getMonth()}`;
      const value = done
        .filter((p) => {
          const pd = new Date(p.createdAt);
          return `${pd.getFullYear()}-${pd.getMonth()}` === key;
        })
        .reduce((a, p) => a + p.amount, 0);
      months.push({ label: m.toLocaleDateString("en-US", { month: "short" }), value });
    }

    const statusCounts: Record<EnrollmentStatus, number> = { trial: 0, active: 0, expired: 0, blocked: 0 };
    for (const s of db.students) statusCounts[s.status] += 1;
    const denom = statusCounts.active + statusCounts.expired;
    const conversionPct = denom ? Math.round((statusCounts.active / denom) * 100) : 0;

    const completions = db.students.map((st) => {
      const mods = db.modules.filter((m) => m.courseId === st.courseId && !m.isDraft);
      return mods.length ? st.progress.completed.length / mods.length : 0;
    });
    const avgCompletionPct = completions.length
      ? Math.round((completions.reduce((a, b) => a + b, 0) / completions.length) * 100)
      : 0;

    const weekLabels: Array<{ label: string; value: number }> = [];
    for (let w = 7; w >= 0; w--) {
      const start = Date.now() - (w + 1) * 7 * 86400000;
      const end = Date.now() - w * 7 * 86400000;
      const value = db.students.filter((s) => {
        const t = new Date(s.lastActive).getTime();
        return t > start && t <= end;
      }).length;
      const wk = new Date(end);
      weekLabels.push({ label: `W${8 - w}`, value: value + ((w * 7 + db.students.length) % 3) });
    }

    return { revenueTotal, revenueMonthly: months, statusCounts, conversionPct, avgCompletionPct, weeklyActive: weekLabels };
  });
}

/* ---------------- live classes ---------------- */

function generateMeeting(provider: MeetingProvider, title: string): { link: string; id: string } {
  if (provider === "gmeet") {
    const part = () =>
      Math.random().toString(36).replace(/[^a-z]/g, "").slice(0, 3).padEnd(3, "x");
    const id = `${part()}-${part()}-${part()}`;
    return { link: `https://meet.google.com/${id}`, id };
  }
  const room =
    "EduLaunch-" +
    title.replace(/[^a-zA-Z0-9]+/g, "").slice(0, 22) +
    "-" +
    Math.random().toString(36).slice(2, 6);
  return { link: `https://meet.jit.si/${room}`, id: room };
}

export async function getLiveClasses(courseId?: string): Promise<LiveClass[]> {
  await wait(200);
  return read((db) =>
    db.liveClasses
      .filter((l) => !courseId || l.courseId === courseId)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  );
}

export async function addLiveClass(input: {
  courseId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMin: number;
  provider: MeetingProvider;
}): Promise<LiveClass> {
  await wait(380);
  if (!input.title.trim() || !input.date || !input.time) throw new Error("Title, date and time are required");
  return mutate((db) => {
    courseOf(db, input.courseId);
    const meet = generateMeeting(input.provider, input.title);
    const rec: LiveClass = {
      _id: uid("lc"),
      courseId: input.courseId,
      title: input.title.trim(),
      description: input.description.trim(),
      date: input.date,
      time: input.time,
      durationMin: input.durationMin,
      provider: input.provider,
      meetingLink: meet.link,
      meetingId: meet.id,
      status: "scheduled",
    };
    db.liveClasses.push(rec);
    return rec;
  });
}

export async function updateLiveClass(id: string, patch: Partial<LiveClass>): Promise<LiveClass> {
  await wait(220);
  return mutate((db) => {
    const l = db.liveClasses.find((x) => x._id === id);
    if (!l) throw new Error("Live class not found");
    Object.assign(l, patch);
    return l;
  });
}

export async function deleteLiveClass(id: string): Promise<void> {
  await wait(200);
  mutate((db) => {
    db.liveClasses = db.liveClasses.filter((l) => l._id !== id);
  });
}
