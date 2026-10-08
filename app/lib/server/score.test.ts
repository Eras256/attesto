import { describe, expect, it, vi } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { PROVA_PROGRAM_ID } from "./config";

const AGENT_SEED = Buffer.from("prova_agent");
const DISC_ATTESTATION_ISSUED = Buffer.from([173, 237, 90, 123, 155, 224, 231, 242]);

function encodeAgentAccount(opts: { attestationCount: bigint; revoked: boolean }) {
  const buf = Buffer.alloc(122);
  buf.writeBigUInt64LE(opts.attestationCount, 104);
  buf.writeBigInt64LE(BigInt(Math.floor(Date.now() / 1000) - 1000), 112);
  buf.writeUInt8(opts.revoked ? 1 : 0, 120);
  return buf;
}

/** Minimal "AttestationIssued" event log line matching prova-events.ts's decoder. */
function encodeAttestationLog(agent: PublicKey, actionTypeIndex: number, timestamp: number) {
  const payload = Buffer.alloc(170);
  agent.toBuffer().copy(payload, 0);
  payload.writeUInt8(actionTypeIndex, 64);
  payload.writeUInt32LE(timestamp, 98);
  payload.writeInt32LE(0, 102);
  const full = Buffer.concat([DISC_ATTESTATION_ISSUED, payload]);
  return `Program data: ${full.toString("base64")}`;
}

function agentPdaFor(checkedAddress: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [AGENT_SEED, checkedAddress.toBuffer()],
    PROVA_PROGRAM_ID,
  );
  return pda;
}

const mockGetAccountInfo = vi.fn();
const mockGetSignaturesForAddress = vi.fn();
const mockGetTransactions = vi.fn();

vi.mock("./attesto-program", () => ({
  getConnection: () => ({
    getAccountInfo: mockGetAccountInfo,
    getSignaturesForAddress: mockGetSignaturesForAddress,
    getTransactions: mockGetTransactions,
  }),
}));

// Imported after the mock so computeSkillCheckScore picks up the mocked connection.
const { computeSkillCheckScore } = await import("./score");

describe("computeSkillCheckScore", () => {
  it("reports a full, non-degraded score when the RPC history lookup succeeds", async () => {
    const checkedAddress = new PublicKey("9jFjRSwN7zchM83LDLHugcDmGKe3fJ7MKaZPZVb8VYvh");
    const agentPda = agentPdaFor(checkedAddress);

    mockGetAccountInfo.mockResolvedValue({
      data: encodeAgentAccount({ attestationCount: 25n, revoked: false }),
    });
    mockGetSignaturesForAddress.mockResolvedValue([{ signature: "sig1" }]);
    mockGetTransactions.mockResolvedValue([
      {
        meta: {
          logMessages: [encodeAttestationLog(agentPda, 0, Math.floor(Date.now() / 1000) - 60)],
        },
      },
    ]);

    const result = await computeSkillCheckScore(checkedAddress);

    expect(result.degraded).toBe(false);
    expect(result.found).toBe(true);
    expect(result.breakdown.volume).toBe(50); // min(25, 20) / 20 * 50
    expect(result.breakdown.recency).toBe(30); // attestation one minute ago
    expect(result.distinctActionTypes).toBe(1);
  });

  it("degrades to a volume-only score, and says so, when the RPC keeps failing", async () => {
    const checkedAddress = new PublicKey("DunieuTibE6hUYsMsYHn6JCz344b2i5NNfoTNPu6cs9A");

    mockGetAccountInfo.mockResolvedValue({
      data: encodeAgentAccount({ attestationCount: 167151n, revoked: false }),
    });
    mockGetSignaturesForAddress.mockResolvedValue([{ signature: "sig1" }]);
    mockGetTransactions.mockRejectedValue(
      new Error("429 Too Many Requests for a specific RPC call"),
    );

    const result = await computeSkillCheckScore(checkedAddress);

    // Must not throw — a crash here strands a payment that was already
    // verified and spent, which is the exact bug this guards against.
    expect(result.degraded).toBe(true);
    expect(result.found).toBe(true);
    expect(result.breakdown.volume).toBe(50); // min(167151, 20) / 20 * 50 — still known on-chain
    expect(result.breakdown.recency).toBe(0);
    expect(result.breakdown.diversity).toBe(0);
    expect(result.score).toBe(50);
    // getTransactions must actually have been retried, not given up on the first try.
    expect(mockGetTransactions.mock.calls.length).toBeGreaterThan(1);
  });

  it("is never degraded for an address Prova has no record of", async () => {
    const checkedAddress = new PublicKey("11111111111111111111111111111111");
    mockGetAccountInfo.mockResolvedValue(null);

    const result = await computeSkillCheckScore(checkedAddress);

    expect(result.found).toBe(false);
    expect(result.degraded).toBe(false);
  });
});
