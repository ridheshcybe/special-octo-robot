// ============================================================================
// markdown.ts — Phase 5. Tiny, dependency-free markdown → HTML renderer for
// exercise instructions. Deliberately minimal: headings, bold/italic, inline
// code, fenced code blocks, bullet lists, links, paragraphs.
// ALL input is HTML-escaped first — admin markdown can never inject scripts
// into the student's page (it renders as text, exactly as written).
// ============================================================================
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-100 px-1 py-0.5 text-[13px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">$1</a>');
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md).split(/\r?\n/);
  const out: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeBuf: string[] = [];
  let listBuf: string[] = [];

  const flushList = () => {
    if (listBuf.length) {
      out.push('<ul class="list-disc space-y-1 pl-5">' + listBuf.map((i) => `<li>${inline(i)}</li>`).join("") + "</ul>");
      listBuf = [];
    }
  };
  const flushCode = () => {
    if (inCode) {
      out.push(`<pre class="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[13px] leading-relaxed text-zinc-100"><code>${codeBuf.join("\n")}</code></pre>`);
      codeBuf = [];
      inCode = false;
      codeLang = "";
    }
  };

  for (const line of lines) {
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      if (inCode) flushCode();
      else {
        inCode = true;
        codeLang = fence[1];
      }
      void codeLang;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const sizes = ["text-xl", "text-lg", "text-base", "text-sm"];
      out.push(`<h${level + 1} class="${sizes[level - 1]} font-semibold text-zinc-900 mt-1">${inline(h[2])}</h${level + 1}>`);
      continue;
    }
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) {
      listBuf.push(li[1]);
      continue;
    }
    if (line.trim() === "") {
      flushList();
      continue;
    }
    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  flushCode();
  return out.join("\n");
}
