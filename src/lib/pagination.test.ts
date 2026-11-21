import { describe, expect, it } from "vitest";
import { pageCountOf, visiblePages } from "./pagination";

describe("visiblePages", () => {
  it("affiche toutes les pages quand il y en a peu", () => {
    expect(visiblePages(2, 3)).toEqual([1, 2, 3]);
  });

  it("resume les pages eloignees par des points de suspension", () => {
    expect(visiblePages(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(visiblePages(1, 10)).toEqual([1, 2, "…", 10]);
    expect(visiblePages(10, 10)).toEqual([1, "…", 9, 10]);
  });
});

describe("pageCountOf", () => {
  it("arrondit au superieur, au moins une page", () => {
    expect(pageCountOf(0, 12)).toBe(1);
    expect(pageCountOf(12, 12)).toBe(1);
    expect(pageCountOf(13, 12)).toBe(2);
  });
});
