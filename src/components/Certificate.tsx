import { useMemo } from "react";
import { fmtDateLong } from "../util";
import { IconPrint, IconX, LogoMark } from "./icons";

interface CertificateProps {
  name: string;
  subjectName: string;
  modulesCount: number;
  avgQuiz: number | null;
  onClose: () => void;
}

export default function Certificate({ name, subjectName, modulesCount, avgQuiz, onClose }: CertificateProps) {
  const certId = useMemo(() => {
    const s = `${name}|${subjectName}`;
    let h = 7;
    for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return `TT-${h.toString(36).toUpperCase().padStart(7, "0")}`;
  }, [name, subjectName]);

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-void/95 p-4 backdrop-blur-sm sm:p-8">
      <div className="cert-root mx-auto max-w-3xl">
        {/* ornate frame */}
        <div className="rounded-xl border border-amber/45 bg-gradient-to-b from-panel to-abyss p-1.5 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]">
          <div className="relative overflow-hidden rounded-lg border border-line px-6 py-10 sm:px-14 sm:py-14">
            {/* corner ticks */}
            <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-amber/60" />
            <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-amber/60" />
            <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-amber/60" />
            <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-amber/60" />

            <div className="flex flex-col items-center text-center">
              <span className="text-amber">
                <LogoMark size={34} sw={2} />
              </span>
              <div className="label-xs mt-4 tracking-[0.34em]!">the track · skill training hub</div>

              <div className="mt-7 flex items-center gap-4">
                <span className="h-px w-10 bg-amber/50 sm:w-20" />
                <h1 className="font-display text-[17px] font-extrabold tracking-[0.3em] text-amber2 sm:text-[21px]">
                  CERTIFICATE OF COMPLETION
                </h1>
                <span className="h-px w-10 bg-amber/50 sm:w-20" />
              </div>

              <p className="mt-8 font-display text-[11px] tracking-[0.24em] text-dim">THIS CERTIFIES THAT</p>

              <div className="mt-4 border-b border-amber/35 pb-3">
                <div className="text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[46px]">{name}</div>
              </div>

              <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-mute">
                has successfully completed the <span className="font-semibold text-amber2">{subjectName}</span> track —{" "}
                <span className="font-semibold text-ink">{modulesCount} modules</span> of lessons, quizzes, tasks and
                projects{avgQuiz != null && (
                  <>
                    {" "}
                    with an average quiz score of <span className="font-semibold text-mint">{avgQuiz}%</span>
                  </>
                )}
                .
              </p>

              <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-8">
                <div>
                  <div className="border-t border-line2 pt-2 font-display text-[10px] font-bold tracking-[0.2em] text-mute">
                    PROGRAM DIRECTOR
                  </div>
                  <div className="mt-1 font-display text-[10px] tracking-[0.14em] text-dim">THE TRACK FACULTY</div>
                </div>
                <div>
                  <div className="border-t border-line2 pt-2 font-display text-[10px] font-bold tracking-[0.2em] text-mute">
                    {fmtDateLong(new Date().toISOString()).toUpperCase()}
                  </div>
                  <div className="mt-1 font-display text-[10px] tracking-[0.14em] text-dim">DATE ISSUED</div>
                </div>
              </div>

              <div className="mt-8 font-display text-[10px] tracking-[0.2em] text-dim">VERIFY · {certId}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="print-hide mx-auto mt-6 flex max-w-3xl items-center justify-center gap-3 pb-8">
        <button className="btn btn-amber" onClick={() => window.print()}>
          <IconPrint size={15} /> PRINT CERTIFICATE
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          <IconX size={14} /> CLOSE
        </button>
      </div>
    </div>
  );
}
