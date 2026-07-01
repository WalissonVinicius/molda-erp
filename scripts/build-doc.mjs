// Converte docs/documentacao.md em docs/documentacao.html (estilizado, com o DER
// renderizado via Mermaid). Abra o HTML no navegador e use "Salvar como PDF".
// Uso: npm run doc:build
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { marked } from "marked";

const base = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(base);

const md = readFileSync("docs/documentacao.md", "utf8");

// Isola o bloco mermaid para virar <div class="mermaid"> (e não <pre><code>).
const m = md.match(/```mermaid\n([\s\S]*?)```/);
const mermaid = m ? m[1] : "";
const semMermaid = md.replace(/```mermaid\n[\s\S]*?```/, "\n[[MERMAID]]\n");

let body = await marked.parse(semMermaid);
body = body.replace("<p>[[MERMAID]]</p>", `<div class="mermaid">${mermaid}</div>`);

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Documentação — ERP Molda</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root { --accent:#5B58F6; --ink:#1b1b22; --muted:#6b6b73; --line:#e7e7ec; --soft:#f6f6f8; }
  * { box-sizing: border-box; }
  body { font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:var(--ink); line-height:1.62; margin:0; background:#fff; -webkit-font-smoothing:antialiased; }
  article { max-width:820px; margin:0 auto; padding:56px 44px 80px; }
  h1,h2,h3,h4 { line-height:1.25; letter-spacing:-0.02em; }
  h1 { font-size:34px; font-weight:700; margin:0 0 6px; }
  h1 + p { color:var(--muted); }
  h2 { font-size:23px; font-weight:600; margin:42px 0 12px; padding-top:18px; border-top:1px solid var(--line); }
  h3 { font-size:17px; font-weight:600; margin:24px 0 8px; }
  p { margin:10px 0; }
  a { color:var(--accent); text-decoration:none; }
  strong { font-weight:600; }
  hr { border:none; border-top:1px solid var(--line); margin:26px 0; }
  ul,ol { padding-left:22px; }
  li { margin:5px 0; }
  blockquote { margin:16px 0; padding:10px 16px; background:var(--soft); border-left:3px solid var(--accent); border-radius:8px; color:#333; }
  code { font-family:"JetBrains Mono",ui-monospace,monospace; font-size:0.85em; background:var(--soft); padding:1px 5px; border-radius:5px; }
  pre { background:#0f0f16; color:#e9e9ee; padding:16px; border-radius:12px; overflow:auto; }
  pre code { background:none; color:inherit; padding:0; font-size:12.5px; line-height:1.55; }
  table { border-collapse:collapse; width:100%; margin:14px 0; font-size:13.5px; }
  th,td { border:1px solid var(--line); padding:8px 11px; text-align:left; vertical-align:top; }
  th { background:var(--soft); font-weight:600; }
  img { max-width:100%; border:1px solid var(--line); border-radius:12px; margin:12px 0; display:block; }
  .mermaid { background:var(--soft); border:1px solid var(--line); border-radius:12px; padding:20px; margin:18px 0; text-align:center; }
  @page { size:A4; margin:16mm; }
  @media print {
    article { padding:0; max-width:none; }
    h2 { break-after:avoid; }
    table, pre, img, .mermaid, blockquote { break-inside:avoid; }
    a { color:var(--ink); }
  }
</style>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad:true, theme:"neutral", securityLevel:"loose" });
</script>
</head>
<body>
<article>
${body}
</article>
</body>
</html>`;

writeFileSync("docs/documentacao.html", html);
console.log("Gerado: docs/documentacao.html");
