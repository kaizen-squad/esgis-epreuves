import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createClient } from "./client";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.R2_ACCOUNT_ID = "account-id";
  process.env.R2_ACCESS_KEY_ID = "access-key";
  process.env.R2_SECRET_ACCESS_KEY = "secret-key";
  delete process.env.R2_ENDPOINT;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("createClient", () => {
  it("pointe sur le compte Cloudflare R2 sans R2_ENDPOINT", async () => {
    const client = createClient();
    expect(await client.config.endpoint?.()).toMatchObject({
      hostname: "account-id.r2.cloudflarestorage.com",
    });
  });

  it("surcharge l'endpoint par R2_ENDPOINT (stockage S3 local de Supabase en CI E2E)", async () => {
    process.env.R2_ENDPOINT = "http://127.0.0.1:54321/storage/v1/s3";
    const client = createClient();
    expect(await client.config.endpoint?.()).toMatchObject({
      hostname: "127.0.0.1",
      port: 54321,
    });
    expect(client.config.forcePathStyle).toBe(true);
  });

  it("ignore R2_ENDPOINT vide (valeur declaree mais non renseignee)", async () => {
    process.env.R2_ENDPOINT = "";
    const client = createClient();
    expect(await client.config.endpoint?.()).toMatchObject({
      hostname: "account-id.r2.cloudflarestorage.com",
    });
    expect(client.config.forcePathStyle).toBe(false);
  });
});
