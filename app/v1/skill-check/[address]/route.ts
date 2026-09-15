import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  CHALLENGE_TTL_SECONDS,
  PRICE_ATOMIC,
  TREASURY_ATA,
  USDC_DECIMALS,
  USDC_MINT,
} from "@/app/lib/server/config";
import { issueChallenge, verifyToken } from "@/app/lib/server/resource-token";
import { verifyPaymentTransaction } from "@/app/lib/server/verify-payment";
import {
  deriveReceiptPda,
  findReceiptByPaymentSignature,
  getConnection,
  recordFulfillmentAttestation,
} from "@/app/lib/server/attesto-program";
import { computeSkillCheckScore } from "@/app/lib/server/score";

const NETWORK = "solana-devnet";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT",
    "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function paymentRequired(address: string) {
  const { token, resourceIdHex, expiresAt } = issueChallenge(
    {
      checkedAddress: address,
      priceAtomic: PRICE_ATOMIC.toString(),
      payTo: TREASURY_ATA.toBase58(),
      mint: USDC_MINT.toBase58(),
    },
    CHALLENGE_TTL_SECONDS,
  );

  return NextResponse.json(
    {
      x402Version: 1,
      error: "payment required",
      accepts: [
        {
          scheme: "exact",
          network: NETWORK,
          maxAmountRequired: PRICE_ATOMIC.toString(),
          resource: `/v1/skill-check/${address}`,
          description: `Skill-check attestation lookup for ${address}, backed by Prova's on-chain attestation registry`,
          mimeType: "application/json",
          payTo: TREASURY_ATA.toBase58(),
          maxTimeoutSeconds: CHALLENGE_TTL_SECONDS,
          asset: USDC_MINT.toBase58(),
          extra: {
            resourceId: token,
            decimals: USDC_DECIMALS,
            note:
              "Send an SPL transferChecked of exactly maxAmountRequired base units " +
              "of `asset` to `payTo`, wait for confirmation, then retry this exact " +
              "request with header X-PAYMENT: base64({x402Version,scheme,network," +
              "payload:{resourceId,signature}}).",
          },
        },
      ],
    },
    { status: 402, headers: corsHeaders() },
  );
}

interface XPaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: { resourceId: string; signature: string };
}

function parseXPaymentHeader(header: string): XPaymentPayload | null {
  try {
    const json = Buffer.from(header, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (
      typeof parsed?.payload?.resourceId === "string" &&
      typeof parsed?.payload?.signature === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;

  let checkedAddress: PublicKey;
  try {
    checkedAddress = new PublicKey(address);
  } catch {
    return NextResponse.json(
      { error: "invalid Solana address" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const xPaymentHeader = request.headers.get("X-PAYMENT");
  if (!xPaymentHeader) {
    return paymentRequired(address);
  }

  const xPayment = parseXPaymentHeader(xPaymentHeader);
  if (!xPayment) {
    return NextResponse.json(
      { error: "malformed X-PAYMENT header" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const verified = verifyToken(xPayment.payload.resourceId);
  if ("error" in verified) {
    return NextResponse.json({ error: verified.error }, { status: 400, headers: corsHeaders() });
  }
  const { payload: challenge, resourceId } = verified;

  if (challenge.checkedAddress !== address) {
    return NextResponse.json(
      { error: "resourceId was issued for a different address" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const paymentSignature = xPayment.payload.signature;

  let decodedSignature: Uint8Array;
  try {
    decodedSignature = bs58.decode(paymentSignature);
  } catch {
    return NextResponse.json(
      { error: "malformed payment signature — expected base58" },
      { status: 400, headers: corsHeaders() },
    );
  }
  if (decodedSignature.length !== 64) {
    return NextResponse.json(
      { error: "malformed payment signature — expected a 64-byte ed25519 signature" },
      { status: 400, headers: corsHeaders() },
    );
  }

  const alreadyUsed = await findReceiptByPaymentSignature(paymentSignature);
  if (alreadyUsed) {
    return NextResponse.json(
      {
        error: "this payment signature has already backed a fulfillment receipt",
        receipt: alreadyUsed.toBase58(),
      },
      { status: 409, headers: corsHeaders() },
    );
  }

  const existingReceipt = deriveReceiptPda(resourceId);
  const existingAccount = await getConnection().getAccountInfo(existingReceipt);
  if (existingAccount) {
    return NextResponse.json(
      { error: "this resourceId has already been fulfilled", receipt: existingReceipt.toBase58() },
      { status: 409, headers: corsHeaders() },
    );
  }

  const paymentCheck = await verifyPaymentTransaction(paymentSignature, challenge.expiresAt);
  if (!paymentCheck.ok) {
    return NextResponse.json({ error: paymentCheck.error }, { status: 402, headers: corsHeaders() });
  }

  const result = await computeSkillCheckScore(checkedAddress);

  let attestation;
  try {
    attestation = await recordFulfillmentAttestation({
      resourceId,
      payer: paymentCheck.payment.payer,
      checkedAddress,
      score: result.score,
      paymentSignature,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "payment verified but on-chain attestation failed", detail: String(err) },
      { status: 502, headers: corsHeaders() },
    );
  }

  return NextResponse.json(
    {
      address,
      score: result.score,
      found: result.found,
      revoked: result.revoked,
      attestationCount: result.attestationCount,
      distinctActionTypes: result.distinctActionTypes,
      mostRecentAttestationDaysAgo: result.mostRecentAttestationDaysAgo,
      breakdown: result.breakdown,
      attestation: {
        program: "EgLkDDxhS1Cd61VjJzMSURC1zko3xtbcAexQqyGBqvdk",
        receipt: attestation.receipt.toBase58(),
        transaction: attestation.signature,
        resourceId: resourceId.toString("hex"),
        network: NETWORK,
      },
    },
    { status: 200, headers: corsHeaders() },
  );
}
