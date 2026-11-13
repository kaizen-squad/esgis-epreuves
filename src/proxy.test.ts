import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const updateSession = vi.fn();
vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: (...args: unknown[]) => updateSession(...args),
}));

const { proxy } = await import("./proxy");

describe("proxy", () => {
  it("laisse passer la requete si une session existe", async () => {
    const response = NextResponse.next();
    updateSession.mockResolvedValue({ response, hasSession: true });

    const result = await proxy(new NextRequest("http://localhost/admin/exams"));

    expect(result).toBe(response);
  });

  it("redirige vers /login si aucune session, en conservant les cookies rafraichis", async () => {
    const response = NextResponse.next();
    response.cookies.set("sb-access-token", "refreshed");
    updateSession.mockResolvedValue({ response, hasSession: false });

    const result = await proxy(new NextRequest("http://localhost/admin/exams"));

    expect(result.headers.get("location")).toBe("http://localhost/login");
    expect(result.cookies.get("sb-access-token")?.value).toBe("refreshed");
  });
});
