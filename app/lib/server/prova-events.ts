/**
 * Minimal, read-only port of Prova's own event-decoding logic
 * (packages/sdk-typescript/src/events.ts in the Prova repo — same discriminators,
 * same byte layout, verified there against sha256("event:<Name>")[0..8]).
 * Kept local instead of depending on the sibling Prova repo by filesystem path,
 * since that path won't exist once this deploys to Vercel.
 */
import { PublicKey } from "@solana/web3.js";

const DISC_ATTESTATION_ISSUED = Buffer.from([173, 237, 90, 123, 155, 224, 231, 242]);

const ACTION_TYPE_VARIANTS = [
  "Transaction",
  "Decision",
  "ModelInvocation",
  "ToolCall",
  "ResourceAccess",
  "PolicyCheck",
  "Custom",
] as const;

export type ProvaActionType = (typeof ACTION_TYPE_VARIANTS)[number];

export interface ProvaAttestationEvent {
  agent: PublicKey;
  actionType: ProvaActionType;
  timestamp: number;
}

function readI64LE(buf: Buffer, offset: number): number {
  const lo = buf.readUInt32LE(offset);
  const hi = buf.readInt32LE(offset + 4);
  return hi * 0x100000000 + lo;
}

const PROGRAM_DATA_PREFIX = "Program data: ";

export function decodeAttestationsFromLogs(logs: string[]): ProvaAttestationEvent[] {
  const out: ProvaAttestationEvent[] = [];
  for (const log of logs) {
    if (!log.startsWith(PROGRAM_DATA_PREFIX)) continue;
    try {
      const buf = Buffer.from(log.slice(PROGRAM_DATA_PREFIX.length), "base64");
      if (buf.length < 8) continue;
      const disc = buf.subarray(0, 8);
      if (!disc.equals(DISC_ATTESTATION_ISSUED)) continue;
      const p = buf.subarray(8);
      if (p.length < 170) continue;

      out.push({
        agent: new PublicKey(p.subarray(0, 32)),
        actionType: ACTION_TYPE_VARIANTS[p[64] ?? 0] ?? "Custom",
        timestamp: readI64LE(p, 98),
      });
    } catch {
      // unparseable log line — skip
    }
  }
  return out;
}

export interface ProvaAgentAccount {
  operator: PublicKey;
  agentId: Buffer;
  policyRoot: Buffer;
  attestationCount: bigint;
  createdAt: number;
  revoked: boolean;
  bump: number;
}

/** Layout: 8 (disc) + operator(32) + agent_id(32) + policy_root(32) + attestation_count(u64) + created_at(i64) + revoked(bool) + bump(u8). */
export function decodeAgentAccount(data: Buffer): ProvaAgentAccount {
  let o = 8;
  const operator = new PublicKey(data.subarray(o, o + 32));
  o += 32;
  const agentId = data.subarray(o, o + 32);
  o += 32;
  const policyRoot = data.subarray(o, o + 32);
  o += 32;
  const attestationCount = data.readBigUInt64LE(o);
  o += 8;
  const createdAt = Number(data.readBigInt64LE(o));
  o += 8;
  const revoked = data[o] !== 0;
  o += 1;
  const bump = data[o];

  return { operator, agentId, policyRoot, attestationCount, createdAt, revoked, bump };
}
