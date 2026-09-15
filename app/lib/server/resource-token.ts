import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getHmacSecret } from "./config";

/**
 * A 402 challenge, self-contained and stateless. Attesto doesn't keep a
 * pending-challenge database: the resourceId returned in the 402 body IS
 * the challenge, HMAC-signed so the server can trust it on retry without
 * having stored anything. This is what keeps "never accumulate a
 * per-client balance" true by construction — there is no request state to
 * accumulate.
 *
 * On-chain replay protection (the thing that actually matters) lives in
 * attesto_program itself: the 32-byte seed derived from this token backs a
 * PDA that can only be `init`-ed once.
 */
export interface ChallengePayload {
  checkedAddress: string;
  priceAtomic: string;
  payTo: string;
  mint: string;
  expiresAt: number;
  nonce: string;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getHmacSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function issueChallenge(
  payload: Omit<ChallengePayload, "expiresAt" | "nonce">,
  ttlSeconds: number,
): { token: string; resourceIdHex: string; expiresAt: number } {
  const full: ChallengePayload = {
    ...payload,
    expiresAt: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(16).toString("hex"),
  };
  const payloadB64 = Buffer.from(JSON.stringify(full)).toString("base64url");
  const token = `${payloadB64}.${sign(payloadB64)}`;
  const resourceId = createHash("sha256").update(token).digest();
  return { token, resourceIdHex: resourceId.toString("hex"), expiresAt: full.expiresAt };
}

export function verifyToken(
  token: string,
): { payload: ChallengePayload; resourceId: Buffer } | { error: string } {
  const parts = token.split(".");
  if (parts.length !== 2) return { error: "malformed resourceId token" };
  const [payloadB64, sig] = parts;

  const expected = sign(payloadB64);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return { error: "invalid resourceId signature" };
  }

  let payload: ChallengePayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    return { error: "invalid resourceId payload" };
  }

  if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
    return { error: "resourceId expired, request a new quote" };
  }

  const resourceId = createHash("sha256").update(token).digest();
  return { payload, resourceId };
}
