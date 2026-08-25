import { seedDB } from "./data/seed";
import { avg, rowDone, todayISO } from "./util";
import type {
  Announcement,
  DB,
  LiveClass,
  ModuleDoc,
  ProgressRow,
  StudentDetailData,
  StudentSummary,
  StudentWithSubject,
  Subject,
  TrainerRec,
} from "./types";

const DB_KEY = "track.db.v1";
export const TRAINER_PASSCODE = "track-2026";

const wait = (ms = 220) => new Promise<void>((r) => setTimeout(r, ms + Math.random() * 170));

function defaultAnnouncements(): Announcement[] {
  const now = Date.now();
  return [
    {
      _id: "ann_office",
      text: "Office hours moved to Fridays 17:00. Bring your module project repo — we review code live and leave comments on the spot.",
      author: "Coach Ade",
      at: new Date(now - 6 * 3600_000).toISOString(),
    },
    {
      _id: "ann_welcome",
      text: "Welcome to the new cohort! Finish Module 01's lesson before Thursday's live session — we build on it from the very first minute.",
      author: "Coach Ade",
      at: new Date(now - 2 * 86400_000).toISOString(),
    },
  ];
}

function normalize(db: DB): DB {
  if (!Array.isArray(db.announcements)) db.announcements = defaultAnnouncements();
  return db;
}

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return normalize(JSON.parse(raw) as DB);
  } catch {
    /* corrupted storage — reseed */
  }
  const db = normalize(seedDB());
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

const subjectOf = (db: DB, id: string): Subject => {
  const s = db.subjects.find((x) => x._id === id);
  if (!s) throw new Error("Subject not found");
  return s;
};

/** Records a learning day for the streak / heatmap. */
function bumpActivity(db: DB, studentId: string) {
  const student = db.students.find((s) => s._id === studentId);
  if (!student) return;
  student.activity = student.activity ?? {};
  const day = todayISO();
  student.activity[day] = (student.activity[day] ?? 0) + 1;
}

export type ProgressPatch = Partial<
  Pick<
    ProgressRow,
    "lessonDone" | "quizScore" | "quizAttempts" | "taskText" | "taskSubmitted" | "projectText" | "projectSubmitted"
  >
>;

/* ---------------- subjects ---------------- */

export async function getSubjects(): Promise<Subject[]> {
  await wait(180);
  return read((db) => [...db.subjects].sort((a, b) => a.name.localeCompare(b.name)));
}

export async function getModules(slug: string): Promise<ModuleDoc[]> {
  await wait();
  if (!slug) throw new Error("Missing subject param");
  return read((db) => {
    const subject = db.subjects.find((s) => s.slug === slug);
    if (!subject) throw new Error("Subject not found");
    return db.modules.filter((m) => m.subject === subject._id).sort((a, b) => a.order - b.order);
  });
}

/* ---------------- auth (trust-based) ---------------- */

export async function loginStudent(name: string, subjectSlug: string): Promise<StudentWithSubject> {
  await wait(320);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");
  if (!subjectSlug) throw new Error("Pick a subject");
  return mutate((db) => {
    const subject = db.subjects.find((s) => s.slug === subjectSlug);
    if (!subject) throw new Error("Subject not found");
    const key = trimmed.toLowerCase();
    let student = db.students.find((s) => s.subject === subject._id && s.name.toLowerCase() === key);
    if (!student) {
      student = {
        _id: `stu_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
        name: trimmed,
        subject: subject._id,
        createdAt: new Date().toISOString(),
      };
      db.students.push(student);
    }
    bumpActivity(db, student._id);
    return { _id: student._id, name: student.name, createdAt: student.createdAt, subject };
  });
}

export async function loginTrainer(name: string, passcode: string): Promise<{ rec: TrainerRec }> {
  await wait(320);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");
  if (!passcode) throw new Error("Passcode is required");
  if (passcode !== TRAINER_PASSCODE) throw new Error("Wrong passcode — ask the program admin.");
  return {
    rec: mutate((db) => {
      const key = trimmed.toLowerCase();
      let trainer = db.trainers.find((t) => t.name.toLowerCase() === key);
      if (!trainer) {
        trainer = { _id: `trn_${Date.now().toString(36)}`, name: trimmed };
        db.trainers.push(trainer);
      }
      return trainer;
    }),
  };
}

/* ---------------- students (trainer) ---------------- */

export async function listStudents(): Promise<StudentSummary[]> {
  await wait();
  return read((db) =>
    db.students
      .map((s) => {
        const subject = subjectOf(db, s.subject);
        const mods = db.modules.filter((m) => m.subject === s.subject);
        const rows = db.progress.filter((p) => p.student === s._id);
        const done = mods.filter((m) => rowDone(rows.find((p) => p.module === m._id))).length;
        const quizAvg = avg(rows.map((p) => p.quizScore).filter((q): q is number => q != null));
        return {
          _id: s._id,
          name: s.name,
          createdAt: s.createdAt,
          subject,
          modulesDone: done,
          totalModules: mods.length,
          avgQuiz: quizAvg,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export async function getStudentDetail(id: string): Promise<StudentDetailData> {
  await wait();
  return read((db) => {
    const student = db.students.find((s) => s._id === id);
    if (!student) throw new Error("Student not found");
    const subject = subjectOf(db, student.subject);
    const mods = db.modules.filter((m) => m.subject === subject._id).sort((a, b) => a.order - b.order);
    return {
      _id: student._id,
      name: student.name,
      createdAt: student.createdAt,
      subject,
      modules: mods.map((m) => {
        const p = db.progress.find((x) => x.student === id && x.module === m._id);
        return {
          moduleId: m._id,
          title: m.title,
          order: m.order,
          lessonDone: p?.lessonDone ?? false,
          quizScore: p?.quizScore ?? null,
          quizAttempts: p?.quizAttempts ?? 0,
          taskText: p?.taskText ?? "",
          taskSubmitted: p?.taskSubmitted ?? false,
          projectText: p?.projectText ?? "",
          projectSubmitted: p?.projectSubmitted ?? false,
        };
      }),
    };
  });
}

/* ---------------- progress (student) ---------------- */

export async function getProgress(studentId: string): Promise<ProgressRow[]> {
  await wait(180);
  return mutate((db) => {
    const student = db.students.find((s) => s._id === studentId);
    if (!student) return [];
    const mods = db.modules.filter((m) => m.subject === student.subject).sort((a, b) => a.order - b.order);
    for (const m of mods) {
      const exists = db.progress.some((p) => p.student === studentId && p.module === m._id);
      if (!exists) {
        db.progress.push({
          _id: `prg_${studentId}_${m._id}`,
          student: studentId,
          module: m._id,
          lessonDone: false,
          quizScore: null,
          quizAttempts: 0,
          taskText: "",
          taskSubmitted: false,
          projectText: "",
          projectSubmitted: false,
        });
      }
    }
    return db.progress
      .filter((p) => p.student === studentId)
      .sort((a, b) => {
        const oa = mods.findIndex((m) => m._id === a.module);
        const ob = mods.findIndex((m) => m._id === b.module);
        return oa - ob;
      });
  });
}

export async function getActivity(studentId: string): Promise<Record<string, number>> {
  await wait(120);
  return read((db) => ({ ...(db.students.find((s) => s._id === studentId)?.activity ?? {}) }));
}

export async function patchProgress(
  studentId: string,
  moduleId: string,
  patch: ProgressPatch
): Promise<ProgressRow> {
  await wait(200);
  return mutate((db) => {
    let row = db.progress.find((p) => p.student === studentId && p.module === moduleId);
    if (!row) {
      row = {
        _id: `prg_${studentId}_${moduleId}`,
        student: studentId,
        module: moduleId,
        lessonDone: false,
        quizScore: null,
        quizAttempts: 0,
        taskText: "",
        taskSubmitted: false,
        projectText: "",
        projectSubmitted: false,
      };
      db.progress.push(row);
    }
    Object.assign(row, patch);
    bumpActivity(db, studentId);
    return { ...row };
  });
}

/* ---------------- live classes ---------------- */

export async function getLiveClasses(): Promise<LiveClass[]> {
  await wait(200);
  return read((db) =>
    [...db.liveClasses].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  );
}

export async function addLiveClass(input: { title: string; date: string; time: string; link: string }): Promise<LiveClass> {
  await wait(260);
  const title = input.title.trim();
  const date = input.date;
  const time = input.time;
  const link = input.link.trim();
  if (!title || !date || !time || !link) throw new Error("All fields are required");
  if (!/^https?:\/\//.test(link)) throw new Error("Meet link must start with http(s)://");
  return mutate((db) => {
    const rec: LiveClass = {
      _id: `lc_${Date.now().toString(36)}`,
      title,
      date,
      time,
      link,
    };
    db.liveClasses.push(rec);
    return rec;
  });
}

export async function deleteLiveClass(id: string): Promise<void> {
  await wait(200);
  mutate((db) => {
    db.liveClasses = db.liveClasses.filter((c) => c._id !== id);
  });
}

/* ---------------- notice board ---------------- */

export async function listAnnouncements(): Promise<Announcement[]> {
  await wait(160);
  return read((db) => [...(db.announcements ?? [])].sort((a, b) => b.at.localeCompare(a.at)));
}

export async function addAnnouncement(text: string, author: string): Promise<Announcement> {
  await wait(240);
  const t = text.trim();
  if (!t) throw new Error("Announcement text is required");
  if (t.length > 400) throw new Error("Keep notices under 400 characters");
  return mutate((db) => {
    db.announcements = db.announcements ?? [];
    const rec: Announcement = {
      _id: `ann_${Date.now().toString(36)}`,
      text: t,
      author: author.trim() || "Coach",
      at: new Date().toISOString(),
    };
    db.announcements.push(rec);
    return rec;
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await wait(200);
  mutate((db) => {
    db.announcements = (db.announcements ?? []).filter((a) => a._id !== id);
  });
}
