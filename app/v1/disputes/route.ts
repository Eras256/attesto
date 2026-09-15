import { NextRequest, NextResponse } from "next/server";
import {
  deriveDisputePda,
  deriveReceiptPda,
  getDisputeAccount,
  getReceiptAccount,
} from "@/app/lib/server/attesto-program";
import { verifyDisputeTransaction } from "@/app/lib/server/verify-dispute";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

interface DisputeRequestBody {
  resourceId?: string;
  signature?: string;
}

function parseResourceId(hex: string | undefined): Buffer | null {
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) return null;
  return Buffer.from(hex, "hex");
}

/**
 * The client already signed and submitted `file_dispute` themselves,
 * directly on-chain, with their own wallet (required — the program checks
 * disputer.key() == receipt.payer). This endpoint doesn't file the dispute,
 * it verifies and surfaces the one that's already there: confirms the
 * transaction succeeded, confirms it actually touched this resourceId's
 * dispute PDA, and reads back the resulting on-chain record.
 */
export async function POST(request: NextRequest) {
  let body: DisputeRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400, headers: corsHeaders() });
  }

  const resourceId = parseResourceId(body.resourceId);
  if (!resourceId) {
    return NextResponse.json(
      { error: "resourceId must be a 64-character hex string" },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (!body.signature || typeof body.signature !== "string") {
    return NextResponse.json(
      { error: "signature is required — the confirmed file_dispute transaction signature" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const receipt = await getReceiptAccount(resourceId);
  if (!receipt) {
    return NextResponse.json(
      { error: "no fulfillment receipt exists for this resourceId — nothing to dispute" },
      { status: 404, headers: corsHeaders() },
    );
  }

  const disputePda = deriveDisputePda(resourceId);
  const txCheck = await verifyDisputeTransaction(body.signature, disputePda.toBase58());
  if (!txCheck.ok) {
    return NextResponse.json({ error: txCheck.error }, { status: 400, headers: corsHeaders() });
  }

  const dispute = await getDisputeAccount(resourceId);
  if (!dispute) {
    return NextResponse.json(
      { error: "transaction confirmed but no dispute account found on-chain for this resourceId" },
      { status: 502, headers: corsHeaders() },
    );
  }

  return NextResponse.json(
    {
      resourceId: resourceId.toString("hex"),
      receipt: deriveReceiptPda(resourceId).toBase58(),
      dispute: dispute.address.toBase58(),
      disputer: dispute.data.disputer.toBase58(),
      reason: dispute.data.reason,
      createdAt: dispute.data.createdAt,
      transaction: body.signature,
      network: "solana-devnet",
    },
    { status: 200, headers: corsHeaders() },
  );
}
