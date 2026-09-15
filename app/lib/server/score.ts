import { PublicKey } from "@solana/web3.js";
import { getConnection } from "./attesto-program";
import { PROVA_PROGRAM_ID } from "./config";
import { decodeAgentAccount, decodeAttestationsFromLogs } from "./prova-events";

const AGENT_SEED = Buffer.from("prova_agent");
const RECENT_SIGNATURES_LIMIT = 25;
const SECONDS_PER_DAY = 86_400;

export interface SkillCheckResult {
  found: boolean;
  revoked: boolean;
  score: number;
  attestationCount: number;
  distinctActionTypes: number;
  mostRecentAttestationDaysAgo: number | null;
  breakdown: { volume: number; recency: number; diversity: number };
}

/**
 * Score is derived entirely from what Prova's own registry already has
 * on-chain for this address — Attesto computes it, doesn't invent it. The
 * formula:
 *   volume    (0-50): min(attestation_count, 20) / 20 * 50
 *   recency   (0-30): 30 if <=30 days since the last attestation, linearly
 *                      down to 0 by 180 days
 *   diversity (0-20): distinct action_types seen in the most recent 25
 *                      attestations / 7 possible types * 20
 * A revoked agent scores 0 regardless of history.
 */
export async function computeSkillCheckScore(
  checkedAddress: PublicKey,
): Promise<SkillCheckResult> {
  const connection = getConnection();
  const [agentPda] = PublicKey.findProgramAddressSync(
    [AGENT_SEED, checkedAddress.toBuffer()],
    PROVA_PROGRAM_ID,
  );

  const accountInfo = await connection.getAccountInfo(agentPda, "confirmed");
  if (!accountInfo) {
    return {
      found: false,
      revoked: false,
      score: 0,
      attestationCount: 0,
      distinctActionTypes: 0,
      mostRecentAttestationDaysAgo: null,
      breakdown: { volume: 0, recency: 0, diversity: 0 },
    };
  }

  const agent = decodeAgentAccount(accountInfo.data);

  if (agent.revoked) {
    return {
      found: true,
      revoked: true,
      score: 0,
      attestationCount: Number(agent.attestationCount),
      distinctActionTypes: 0,
      mostRecentAttestationDaysAgo: null,
      breakdown: { volume: 0, recency: 0, diversity: 0 },
    };
  }

  const signatures = await connection.getSignaturesForAddress(agentPda, {
    limit: RECENT_SIGNATURES_LIMIT,
  });

  const actionTypesSeen = new Set<string>();
  let mostRecentTimestamp: number | null = null;

  if (signatures.length > 0) {
    const txs = await connection.getTransactions(
      signatures.map((s) => s.signature),
      { commitment: "confirmed", maxSupportedTransactionVersion: 0 },
    );

    for (const tx of txs) {
      const logs = tx?.meta?.logMessages;
      if (!logs) continue;
      for (const evt of decodeAttestationsFromLogs(logs)) {
        if (!evt.agent.equals(agentPda)) continue;
        actionTypesSeen.add(evt.actionType);
        if (mostRecentTimestamp === null || evt.timestamp > mostRecentTimestamp) {
          mostRecentTimestamp = evt.timestamp;
        }
      }
    }
  }

  const attestationCount = Number(agent.attestationCount);
  const volume = Math.min(attestationCount, 20) / 20 * 50;

  let recency = 0;
  let daysAgo: number | null = null;
  if (mostRecentTimestamp !== null) {
    daysAgo = Math.max(0, (Date.now() / 1000 - mostRecentTimestamp) / SECONDS_PER_DAY);
    recency = daysAgo <= 30 ? 30 : Math.max(0, 30 * (1 - (daysAgo - 30) / 150));
  }

  const diversity = (actionTypesSeen.size / 7) * 20;

  const score = Math.round(Math.min(100, volume + recency + diversity));

  return {
    found: true,
    revoked: false,
    score,
    attestationCount,
    distinctActionTypes: actionTypesSeen.size,
    mostRecentAttestationDaysAgo: daysAgo === null ? null : Math.round(daysAgo * 10) / 10,
    breakdown: {
      volume: Math.round(volume * 10) / 10,
      recency: Math.round(recency * 10) / 10,
      diversity: Math.round(diversity * 10) / 10,
    },
  };
}
