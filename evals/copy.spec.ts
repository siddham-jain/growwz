import { expect, test, type Page } from "@playwright/test";
import { demo } from "./helpers";
import { saveMetrics } from "./metrics";

// screens where a first-time investor makes decisions; Learn is excluded because it is the dictionary
const screens: { name: string; path: string; prepare?: (page: Page) => Promise<void> }[] = [
  { name: "Home", path: "/" },
  { name: "Stash detail", path: "/", prepare: async (page) => page.getByRole("button", { name: /Freedom fund/ }).first().click() },
  { name: "New stash plan", path: "/new-stash", prepare: async (page) => {
    await page.getByRole("button", { name: /New gadget/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
  } },
  { name: "Payday split", path: "/payday" },
  { name: "Invest", path: "/invest" },
  { name: "Stock", path: "/stock/TRENT" },
  { name: "F&O reality check", path: "/fno" },
  { name: "Squads", path: "/squads" },
  { name: "You", path: "/you" },
];

const jargon: { term: RegExp; explainedBy?: RegExp }[] = [
  { term: /\bNAV\b/ },
  { term: /\bXIRR\b/ },
  { term: /\bCAGR\b/ },
  { term: /\bAUM\b/ },
  { term: /\bNFO\b/ },
  { term: /\bexpense ratio\b/i },
  { term: /\bexit load\b/i },
  { term: /\blumpsum\b/i },
  { term: /\bELSS\b/ },
  { term: /\bLTCG\b/ },
  { term: /\b(large|mid|small)[ -]cap\b/i },
  { term: /\bstep-up\b/i },
  { term: /\bF&O\b/, explainedBy: /futures (&|and) options/i },
  { term: /\blot size\b/i },
  { term: /\bdemat\b/i },
  { term: /\bDirect\b/ },
];

function syllables(word: string) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  const groups = cleaned.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function fleschReadingEase(text: string) {
  const sentences = text.split(/[.!?\n]+/).map((part) => part.trim()).filter((part) => part.split(/\s+/).length >= 3);
  const words = sentences.flatMap((sentence) => sentence.split(/\s+/).filter((word) => /[a-z]/i.test(word)));
  if (!words.length) return { score: 100, words: 0, wordsPerSentence: 0 };
  const syllableCount = words.reduce((sum, word) => sum + syllables(word), 0);
  const wordsPerSentence = words.length / sentences.length;
  return { score: 206.835 - 1.015 * wordsPerSentence - 84.6 * (syllableCount / words.length), words: words.length, wordsPerSentence };
}

for (const screen of screens) {
  test(`C · ${screen.name}: no unexplained jargon, plain-English copy`, async ({ page }) => {
    await demo(page, screen.path);
    if (screen.prepare) await screen.prepare(page);
    await page.waitForTimeout(500);
    const { plain, all, decoded } = await page.locator("#scroller").evaluate((root) => {
      const clone = root.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("[data-term]").forEach((node) => node.remove());
      const decoded = [...root.querySelectorAll<HTMLElement>("[data-term]")].map((node) => node.innerText).join(" | ");
      return { plain: clone.innerText, all: (root as HTMLElement).innerText, decoded };
    });
    // a term passes if it is tappable-to-decode or spelled out somewhere on the same screen
    const unexplained = jargon
      .filter(({ term, explainedBy }) => term.test(plain) && !term.test(decoded) && !(explainedBy && explainedBy.test(all)))
      .map(({ term }) => term.source);
    const readability = fleschReadingEase(all);
    saveMetrics("copy", screen.name, { screen: screen.name, unexplained, readingEase: Math.round(readability.score), words: readability.words, wordsPerSentence: Number(readability.wordsPerSentence.toFixed(1)) });
    expect(unexplained, `unexplained jargon on ${screen.name}`).toEqual([]);
    expect(readability.score, `reading ease on ${screen.name}`).toBeGreaterThanOrEqual(60);
  });
}
