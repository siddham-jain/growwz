import { readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";

const appUrl = "https://siddham-jain.github.io/growwz/";

const style = `
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap");
  :root { --mint: #00d09c; --ink: #2b2d3a; --ink-2: #5c5e6d; --line: #e9e9eb; --soft: #e6faf4; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, system-ui, sans-serif; color: var(--ink); background: #f1f3f5; line-height: 1.55; -webkit-font-smoothing: antialiased; }
  main { max-width: 820px; margin: 32px auto; background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 44px 52px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; color: var(--ink-2); font-size: 14px; margin-bottom: 18px; }
  .brand svg { width: 24px; height: 24px; }
  h1, h2, h3, th, .brand { font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif; }
  h1 { font-size: 32px; line-height: 1.1; letter-spacing: -0.03em; font-weight: 800; margin: 0 0 4px; }
  h1 + p em { color: var(--ink-2); font-style: normal; }
  h2 { font-size: 17px; margin: 26px 0 8px; padding-top: 14px; border-top: 1px solid var(--line); letter-spacing: -0.02em; font-weight: 800; }
  h3 { font-size: 15px; margin: 18px 0 6px; }
  p, li { font-size: 14.5px; }
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 3px 0; }
  li::marker { color: var(--mint); font-weight: 700; }
  strong { font-weight: 700; }
  a { color: #007a5c; font-weight: 600; }
  code { background: #f6f7f8; padding: 1px 6px; border-radius: 6px; font-size: 13px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0 16px; font-size: 13.5px; }
  th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { background: var(--soft); font-weight: 700; }
  img { max-width: 100%; border-radius: 16px; border: 1px solid var(--line); }
  blockquote { margin: 10px 0; padding: 10px 16px; background: #f6f7f8; border-left: 3px solid var(--mint); border-radius: 0 12px 12px 0; color: var(--ink-2); }
  .shots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 12px 0; }
  @media (max-width: 640px) { main { margin: 0; border-radius: 0; padding: 28px 20px; } .shots { grid-template-columns: repeat(2, 1fr); } }
  @page { size: A4; margin: 10mm 12mm; }
  @media print {
    body { background: #fff; }
    main { margin: 0; padding: 0; border: 0; max-width: none; }
  }
`;

const logo = `<svg viewBox="0 0 64 64"><defs><clipPath id="c"><circle cx="32" cy="32" r="30"/></clipPath></defs><g clip-path="url(#c)"><rect width="64" height="64" fill="#5367FF"/><path d="M0 38 L18 28 L30 36 L46 20 L64 26 V64 H0Z" fill="#00D09C"/></g></svg>`;

function page(source: string, target: string, title: string) {
  const body = marked.parse(readFileSync(source, "utf8"), { async: false }) as string;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><link rel="icon" href="./favicon.svg"><style>${style}</style></head><body><main><div class="brand">${logo} Groww · Gen Z redesign</div>${body}</main></body></html>`;
  writeFileSync(target, html);
}

// the 1-pager is hand-written html in google-docs style; only the links are filled in here
const brief = readFileSync("docs/one-pager.html", "utf8")
  .replaceAll("{{URL}}", appUrl)
  .replaceAll("{{URL_SHORT}}", appUrl.replace(/^https:\/\//, "").replace(/\/$/, ""));
writeFileSync("public/brief.html", brief);

page("EVALS.md", "public/evals.html", "Groww for Gen Z — Evals");
console.log("docs built");
