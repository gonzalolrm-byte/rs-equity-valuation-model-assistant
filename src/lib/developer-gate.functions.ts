import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Shared-passcode gate for the Developer Console. This is a gate, not
 * authentication: every visitor uses the same passcode. Role-based access
 * arrives with the backend phase.
 */
const sessionConfig = {
  password: process.env["SESSION_SECRET"] ?? "dev-only-fallback-session-secret-000000",
  name: "developer-gate",
  maxAge: 60 * 60 * 12,
  cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
};

type GateSession = { unlocked?: boolean };

function passcodeMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const isDeveloperUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig);
  return { unlocked: session.data.unlocked === true };
});

export const unlockDeveloper = createServerFn({ method: "POST" })
  .inputValidator((data: { passcode: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["DEVELOPER_PASSCODE"];
    if (!expected) return { ok: false as const };
    if (!passcodeMatches(data.passcode ?? "", expected)) return { ok: false as const };

    const session = await useSession<GateSession>(sessionConfig);
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockDeveloper = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig);
  await session.clear();
  return { ok: true as const };
});
