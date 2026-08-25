import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../../api";
import { toast } from "../../toast";
import type { Course, CourseModule } from "../../types";
import { fmtINR } from "../../util";
import Reveal from "../Reveal";
import { IconChevron, IconEye, IconEyeOff, IconFileTex, IconPlus, IconTrash, IconWand } from "../icons";

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [courseId, setCourseId] = useState<string>("crs_calc");
  const [modules, setModules] = useState<CourseModule[] | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const refreshCourses = useCallback(() => {
    api.adminListCourses().then((c) => {
      setCourses(c);
      if (!c.some((x) => x._id === courseId) && c.length) setCourseId(c[0]._id);
    });
  }, [courseId]);

  const refreshModules = useCallback(() => {
    api.adminListModules(courseId).then(setModules);
  }, [courseId]);

  useEffect(refreshCourses, [refreshCourses]);
  useEffect(refreshModules, [refreshModules]);

  const course = courses?.find((c) => c._id === courseId) ?? null;

  const createModule = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const m = await api.adminCreateModule(courseId, newTitle);
      setNewTitle("");
      setOpenModule(m._id);
      toast(`Module created as draft — write the LaTeX, then compile.`);
      refreshModules();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not create module", "err");
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (c: Course) => {
    await api.adminSetPublished(c._id, !c.isPublished);
    toast(c.isPublished ? "Course unpublished — hidden from the homepage" : "Course published — live on the homepage", "info");
    refreshCourses();
  };

  return (
    <div>
      <div className="label-xs">// courses & content</div>
      <h1 className="mt-2 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
        Author in <span className="text-chalk">LaTeX,</span> publish in one click.
      </h1>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-mute">
        Draft modules are invisible to students until compiled and published. Compilation runs the LaTeX through the KaTeX engine and stores the HTML.
      </p>

      {/* course tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(courses ?? []).map((c) => (
          <button
            key={c._id}
            onClick={() => { setCourseId(c._id); setOpenModule(null); }}
            className={`btn !text-[11px] ${courseId === c._id ? "btn-chalk" : "btn-ghost"}`}
          >
            {c.title.toUpperCase()}
            <span className={`chip ml-1 ${c.isPublished ? "chip-mint" : ""}`}>{c.isPublished ? "LIVE" : "DRAFT"}</span>
          </button>
        ))}
      </div>

      {course && (
        <Reveal>
          <div className="panel mt-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-[20px] font-bold italic text-ink">{course.title}</div>
                <div className="mt-1 font-code text-[10.5px] tracking-[0.08em] text-dim">
                  /{course.slug} · {fmtINR(course.pricing.discountPrice ?? course.pricing.amount)} · {course.enrolled.toLocaleString("en-IN")} ENROLLED
                </div>
              </div>
              <div className="flex gap-2">
                <button className={`btn !text-[11px] ${course.isPublished ? "btn-ghost" : "btn-mint"}`} onClick={() => togglePublish(course)}>
                  {course.isPublished ? <><IconEyeOff size={13} /> UNPUBLISH</> : <><IconEye size={13} /> PUBLISH TO HOMEPAGE</>}
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* add module */}
      <div className="mt-5 flex max-w-xl gap-2">
        <input className="input" placeholder="New module title — e.g. “Compactness & Heine–Borel”" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createModule()} />
        <button className="btn btn-chalk shrink-0" onClick={createModule} disabled={creating || !newTitle.trim()}>
          <IconPlus size={14} sw={2.4} /> ADD
        </button>
      </div>

      {/* module list */}
      <div className="mt-5 flex flex-col gap-3">
        {(modules ?? []).map((m, i) => (
          <ModuleEditor
            key={m._id}
            module={m}
            index={i}
            open={openModule === m._id}
            onToggle={() => setOpenModule(openModule === m._id ? null : m._id)}
            onChanged={refreshModules}
          />
        ))}
        {modules !== null && modules.length === 0 && (
          <p className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-[13px] text-dim">No modules yet — add the first one above.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- module editor ---------------- */

function ModuleEditor({ module: m, index, open, onToggle, onChanged }: {
  module: CourseModule; index: number; open: boolean; onToggle: () => void; onChanged: () => void;
}) {
  const [title, setTitle] = useState(m.title);
  const [desc, setDesc] = useState(m.description);
  const [mins, setMins] = useState(m.estimatedMinutes);
  const [src, setSrc] = useState(m.content.latexSource);
  const [logs, setLogs] = useState<string[]>([]);
  const [compiling, setCompiling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(m.content.compiledHtml);
  const [dirty, setDirty] = useState(false);
  const logTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(logTimer.current), []);

  const save = async () => {
    setSaving(true);
    try {
      await api.adminUpdateModule(m._id, { title, description: desc, estimatedMinutes: mins, content: { ...m.content, latexSource: src } });
      setDirty(false);
      toast("Module saved");
      onChanged();
    } catch {
      toast("Could not save module", "err");
    } finally {
      setSaving(false);
    }
  };

  const compile = async () => {
    setCompiling(true);
    setLogs([]);
    setPreview("");
    try {
      const res = await api.adminCompileModule(m._id);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        setLogs(res.logs);
      } else {
        res.logs.forEach((line, i) => {
          window.setTimeout(() => setLogs((l) => [...l, line]), 140 * (i + 1));
        });
      }
      window.setTimeout(() => {
        onChanged();
        toast(`Compiled — ${res.formulas} formulas typeset in ${(res.ms / 1000).toFixed(1)}s`);
      }, reduced ? 0 : 140 * res.logs.length + 200);
      /* fetch compiled html after server-side save */
      window.setTimeout(async () => {
        const mods = await api.adminListModules(m.courseId);
        const fresh = mods.find((x) => x._id === m._id);
        if (fresh) setPreview(fresh.content.compiledHtml);
      }, reduced ? 60 : 140 * res.logs.length + 350);
      setCompiling(false);
    } catch (e) {
      setCompiling(false);
      toast(e instanceof Error ? e.message : "Compilation failed", "err");
    }
  };

  const toggleDraft = async () => {
    await api.adminSetDraft(m._id, !m.isDraft);
    toast(m.isDraft ? "Module published to students" : "Module moved back to draft", "info");
    onChanged();
  };

  const remove = async () => {
    if (!window.confirm(`Delete module “${m.title}”? This cannot be undone.`)) return;
    await api.adminDeleteModule(m._id);
    toast("Module deleted", "info");
    onChanged();
  };

  return (
    <Reveal delay={Math.min(index * 50, 250)}>
      <div className={`panel overflow-hidden ${open ? "border-line2" : ""}`}>
        <button className="flex w-full items-center gap-4 px-5 py-4 text-left" onClick={onToggle}>
          <span className={`font-display text-[20px] font-bold italic ${m.isDraft ? "text-dim" : "text-chalk"}`}>{String(m.order).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-bold text-ink">{m.title}</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className={`chip ${m.isDraft ? "" : "chip-mint"}`}>{m.isDraft ? "draft" : "published"}</span>
              <span className={`chip ${m.content.status === "compiled" ? "chip-sky" : "chip-chalk"}`}>
                {m.content.status === "compiled" ? "compiled" : "not compiled"}
              </span>
              <span className="font-code text-[10px] tracking-[0.08em] text-dim">{m.estimatedMinutes} MIN · {m.quiz.length} QUIZ Qs</span>
            </span>
          </span>
          <span className={`text-dim transition-transform duration-300 ${open ? "rotate-180 text-chalk" : ""}`}><IconChevron size={16} /></span>
        </button>

        {open && (
          <div className="border-t border-line p-5">
            <div className="grid gap-3.5 sm:grid-cols-[1fr_1fr_120px]">
              <div>
                <label className="label-xs mb-1.5 block">title</label>
                <input className="input" value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} />
              </div>
              <div>
                <label className="label-xs mb-1.5 block">description (roadmap line)</label>
                <input className="input" value={desc} onChange={(e) => { setDesc(e.target.value); setDirty(true); }} />
              </div>
              <div>
                <label className="label-xs mb-1.5 block">minutes</label>
                <input className="input" type="number" min={10} value={mins} onChange={(e) => { setMins(Number(e.target.value)); setDirty(true); }} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {/* editor */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="label-xs flex items-center gap-1.5"><IconFileTex size={12} /> latex source (.tex)</label>
                  {dirty && <span className="chip chip-chalk">unsaved</span>}
                </div>
                <textarea
                  className="textarea mt-2 min-h-[320px] resize-y bg-[#0a100c] font-code !text-[12px] !leading-[1.8]"
                  value={src}
                  onChange={(e) => { setSrc(e.target.value); setDirty(true); }}
                  spellCheck={false}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn btn-ghost" onClick={save} disabled={saving}>
                    {saving ? "SAVING…" : "SAVE SOURCE"}
                  </button>
                  <button className="btn btn-chalk" onClick={compile} disabled={compiling}>
                    <IconWand size={14} /> {compiling ? "COMPILING…" : "COMPILE"}
                  </button>
                  <button className={`btn ${m.isDraft ? "btn-mint" : "btn-ghost"}`} onClick={toggleDraft}>
                    {m.isDraft ? <><IconEye size={13} /> PUBLISH</> : <><IconEyeOff size={13} /> BACK TO DRAFT</>}
                  </button>
                  <button className="btn btn-coral ml-auto !px-3" onClick={remove} title="Delete module"><IconTrash size={14} /></button>
                </div>
              </div>

              {/* compile console + preview */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="label-xs">compiler output</div>
                  <div className="term-console mt-2 min-h-[110px] rounded-lg border border-line bg-[#0a100c] p-3.5 font-code text-[11px] leading-[1.9] text-mute">
                    {logs.length === 0 && !compiling && <span className="text-dim">$ edutex module.tex — idle. Hit COMPILE after saving edits.</span>}
                    {compiling && logs.length === 0 && <span className="text-chalk">Spinning up sandboxed TeX distribution…<span className="caret" /></span>}
                    {logs.map((l, i) => (
                      <div key={i} className={l.startsWith("Warning") ? "text-chalk" : l.includes("Output written") ? "text-mint" : ""}>{l}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label-xs">compiled preview · what students see</div>
                  <div className="mt-2 max-h-[300px] min-h-[120px] overflow-y-auto rounded-lg border border-line bg-panel2/60 p-4">
                    {preview ? (
                      <div className="tex-prose" dangerouslySetInnerHTML={{ __html: preview }} />
                    ) : (
                      <p className="text-[12px] text-dim">Nothing compiled yet — students would see a live KaTeX fallback render.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}
