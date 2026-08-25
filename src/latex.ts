import katex from "katex";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderTex = (tex: string, display: boolean): string => {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode: display,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return `<code class="tex-inline">${esc(tex)}</code>`;
  }
};

/** Render only the $...$ fragments inside an arbitrary string (quiz questions, options). */
export function texInline(s: string): string {
  return s.replace(/\$([^$]+)\$/g, (_, tex: string) => renderTex(tex, false));
}

/* ---------------- mini Python highlighter ---------------- */

const PY_KW =
  /\b(def|return|for|in|if|elif|else|import|from|while|lambda|range|print|class|as|with|yield|not|and|or|True|False|None)\b/g;

export function highlightCode(code: string): string {
  let out = esc(code);
  const stash: string[] = [];
  const keep = (html: string) => {
    stash.push(html);
    return `\u0001${stash.length - 1}\u0001`;
  };
  out = out.replace(/(#[^\n]*)/g, (m) => keep(`<span class="tk-com">${m}</span>`));
  out = out.replace(/(&quot;[^&]*?&quot;|'[^']*?'|"[^"]*?")/g, (m) => keep(`<span class="tk-str">${m}</span>`));
  out = out.replace(PY_KW, (m) => keep(`<span class="tk-kw">${m}</span>`));
  out = out.replace(/\b(\d+\.?\d*)\b/g, (m) => keep(`<span class="tk-num">${m}</span>`));
  out = out.replace(/(?<=\bdef\s+)(\w+)/g, (m) => keep(`<span class="tk-fn">${m}</span>`));
  return out.replace(/\u0001(\d+)\u0001/g, (_, i: string) => stash[+i]);
}

/* ---------------- LaTeX → HTML ---------------- */

const THM_LABELS: Record<string, string> = {
  theorem: "Theorem",
  lemma: "Lemma",
  definition: "Definition",
  corollary: "Corollary",
  proposition: "Proposition",
  example: "Example",
  remark: "Remark",
};

const THM_CLASS: Record<string, string> = {
  theorem: "thm-theorem",
  lemma: "thm-theorem",
  corollary: "thm-theorem",
  proposition: "thm-theorem",
  definition: "thm-definition",
  example: "thm-example",
  remark: "thm-remark",
};

function inlineCommands(s: string): string {
  return s
    .replace(/\\textbf\{([^}]*)\}/g, "<strong>$1</strong>")
    .replace(/\\textit\{([^}]*)\}/g, "<em>$1</em>")
    .replace(/\\emph\{([^}]*)\}/g, "<em>$1</em>")
    .replace(/\\underline\{([^}]*)\}/g, "<u>$1</u>")
    .replace(/\\texttt\{([^}]*)\}/g, '<code class="tex-inline">$1</code>')
    .replace(/\\footnote\{[^}]*\}/g, "")
    .replace(/\\label\{[^}]*\}/g, "")
    .replace(/\\ref\{[^}]*\}/g, "§")
    .replace(/\\cite\{[^}]*\}/g, "[1]")
    .replace(/\\ldots/g, "…")
    .replace(/\\dots/g, "…")
    .replace(/~/g, "&nbsp;")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/``/g, "“")
    .replace(/''/g, "”")
    .replace(/\\%/g, "%")
    .replace(/\\&/g, "&amp;")
    .replace(/\\#/g, "#")
    .replace(/\\\\/g, "<br/>");
}

export interface CompileResult {
  html: string;
  warnings: string[];
  formulas: number;
}

export function latexToHtml(src: string): CompileResult {
  const warnings: string[] = [];
  let s = src;

  /* strip preamble */
  const bd = s.indexOf("\\begin{document}");
  if (bd >= 0) s = s.slice(bd + "\\begin{document}".length);
  const ed = s.indexOf("\\end{document}");
  if (ed >= 0) s = s.slice(0, ed);
  s = s
    .replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/g, "")
    .replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, "")
    .replace(/\\(title|author|date)\{[^}]*\}/g, "")
    .replace(/\\maketitle/g, "");

  const maths: string[] = [];
  const stashMath = (tex: string, display: boolean) => {
    maths.push(renderTex(tex, display));
    return `\u0000M${maths.length - 1}\u0000`;
  };

  /* code listings */
  const codes: string[] = [];
  s = s.replace(
    /\\begin\{lstlisting\}(\[[^\]]*\])?([\s\S]*?)\\end\{lstlisting\}/g,
    (_, _opts: string, code: string) => {
      codes.push(highlightCode(code.trim()));
      return `\u0000C${codes.length - 1}\u0000`;
    }
  );
  s = s.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, (_, code: string) => {
    codes.push(highlightCode(code.trim()));
    return `\u0000C${codes.length - 1}\u0000`;
  });

  /* display math */
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t: string) => stashMath(t, true));
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, t: string) => stashMath(t, true));
  s = s.replace(
    /\\begin\{(align\*?|gather\*?|eqnarray\*?)\}([\s\S]*?)\\end\{\1\}/g,
    (_, env: string, t: string) => stashMath(`\\begin{${env}}${t}\\end{${env}}`, true)
  );
  s = s.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, (_, t: string) =>
    stashMath(t, true)
  );
  s = s.replace(/\\begin\{displaymath\}([\s\S]*?)\\end\{displaymath\}/g, (_, t: string) =>
    stashMath(t, true)
  );
  /* inline math */
  s = s.replace(/\$([^$\n]+?)\$/g, (_, t: string) => stashMath(t, false));

  /* theorem-like environments */
  s = s.replace(
    /\\begin\{(theorem|lemma|definition|corollary|proposition|example|remark)\}(\[[^\]]*\])?([\s\S]*?)\\end\{\1\}/g,
    (_, env: string, opt: string | undefined, body: string) => {
      const name = opt ? opt.replace(/^\[|\]$/g, "") : "";
      const label = THM_LABELS[env] ?? env;
      const cls = THM_CLASS[env] ?? "thm-theorem";
      return `\u0000B<div class="thm ${cls}"><div class="thm-tag">${label}${name ? ` (${esc(name)})` : ""}.</div>${body.trim()}</div>\u0000B`;
    }
  );

  /* itemize / enumerate */
  s = s.replace(/\\begin\{(itemize|enumerate)\}([\s\S]*?)\\end\{\1\}/g, (_, _env: string, body: string) => {
    const items = body
      .split("\\item")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => `<li>${x}</li>`)
      .join("");
    return `\u0000B<ul class="tex-list">${items}</ul>\u0000B`;
  });

  s = s.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (_, body: string) =>
    `\u0000B<div style="text-align:center">${body.trim()}</div>\u0000B`
  );

  /* strip stray env markers */
  s = s.replace(/\\begin\{document\}|\\end\{document\}/g, "");
  if (/\\begin\{/.test(s)) warnings.push("Ignored an unsupported environment — content still compiled.");

  /* paragraphs */
  const blocks = s
    .split(/\n\s*\n/)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((p) => {
      const clean = inlineCommands(p.replace(/\n/g, " ").replace(/\s+/g, " "));
      if (/^\u0000B/.test(p)) return clean.replace(/\u0000B/g, "");
      if (/^\\(sub)?section\*?\{/.test(p)) {
        return clean
          .replace(/\\section\*?\{([^}]*)\}/g, "<h2>$1</h2>")
          .replace(/\\subsection\*?\{([^}]*)\}/g, "<h3>$1</h3>");
      }
      const withHeads = clean
        .replace(/\\section\*?\{([^}]*)\}/g, "</p><h2>$1</h2><p>")
        .replace(/\\subsection\*?\{([^}]*)\}/g, "</p><h3>$1</h3><p>");
      return `<p>${withHeads}</p>`;
    })
    .join("\n");

  s = blocks
    .replace(/<p>\s*(<h[23]>)/g, "$1")
    .replace(/(<\/h[23]>)\s*<\/p>/g, "$1")
    .replace(/<p>\s*<\/p>/g, "");

  /* restore */
  s = s.replace(/\u0000M(\d+)\u0000/g, (_, i: string) => maths[+i]);
  s = s.replace(/\u0000C(\d+)\u0000/g, (_, i: string) => `<pre class="tex-code">${codes[+i]}</pre>`);
  s = s.replace(/\u0000B/g, "");

  return { html: s, warnings, formulas: maths.length };
}

/* ---------------- fake compiler log ---------------- */

export function compileLogs(title: string, formulas: number, warnings: string[], ms: number): string[] {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "module";
  return [
    "This is EduTeX, Version 3.141592 (Web2C 2024) — sandboxed compiler",
    `(${slug}.tex`,
    "LaTeX2e <2024-06-01> patch level 2",
    "(article.cls  document class)",
    "(amsmath.sty) (amssymb.sty) (tcolorbox.sty)",
    `Typeset ${formulas} formula${formulas === 1 ? "" : "s"} via KaTeX engine`,
    ...warnings.map((w) => `Warning: ${w}`),
    `Output written on ${slug}.html (${Math.max(1, Math.round(formulas / 2) + 1)} screens, ${(ms / 1000).toFixed(2)}s).`,
    "Transcript written on compile.log.",
  ];
}
