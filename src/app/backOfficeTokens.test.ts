import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Perimetre du ticket #217 : back-office Admin et BDE, plus la confirmation qu'ils partagent.
const DIRS = ["(admin)", "(bde)"].map((dir) => join(import.meta.dirname, dir));
const FILES = [
  ...DIRS.flatMap((dir) =>
    readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => join(dir, file)),
  ),
  join(import.meta.dirname, "../components/ui/ConfirmDialog.tsx"),
];

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const RAW_COLOR = new RegExp(
  `(?<![\\w-])(?:bg|text|border|ring|divide|outline|from|via|to|fill|stroke|placeholder|decoration)-(?:(?:${PALETTE})-\\d{2,3}|black|white)(?![\\w-])`,
  "g",
);
// Seuls rounded-control, rounded-card et rounded-full sont admis (globals.css).
const RAW_RADIUS =
  /(?<![\w-])rounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e))?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?(?![\w-])/g;
// Seuls shadow-card et shadow-elevated sont admis.
const RAW_SHADOW = /(?<![\w-])shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl))?(?![\w-])/g;

function rawClasses(source: string) {
  return [RAW_COLOR, RAW_RADIUS, RAW_SHADOW].flatMap((pattern) =>
    [...source.matchAll(pattern)].map((match) => match[0]),
  );
}

describe("back-office : uniquement les tokens du theme", () => {
  it.each(FILES)("%s", (file) => {
    expect(rawClasses(readFileSync(file, "utf8"))).toEqual([]);
  });
});
