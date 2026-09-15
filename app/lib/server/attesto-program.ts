import { AnchorProvider, Program } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import idl from "./idl/attesto_program.json";
import type { AttestoProgram } from "./idl/attesto_program";
import { ATTESTO_PROGRAM_ID, RPC_URL, getIssuerKeypair } from "./config";
import {
  decodeDispute,
  decodeFulfillmentReceipt,
  type DecodedDispute,
  type DecodedFulfillmentReceipt,
} from "./decode-accounts";

const RECEIPT_SEED = Buffer.from("attesto_receipt");
const DISPUTE_SEED = Buffer.from("attesto_dispute");

// Byte offset of `payment_signature` inside a serialized FulfillmentReceipt
// account: 8 (discriminator) + 32 (resource_id) + 32 (payer)
// + 32 (checked_address) + 1 (score) = 105.
const PAYMENT_SIGNATURE_OFFSET = 105;

export function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

export function getAttestoProgram(): Program<AttestoProgram> {
  const connection = getConnection();
  const wallet = new NodeWallet(getIssuerKeypair());
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program(idl as AttestoProgram, provider);
}

export function deriveReceiptPda(resourceId: Buffer): PublicKey {
  return PublicKey.findProgramAddressSync(
    [RECEIPT_SEED, resourceId],
    ATTESTO_PROGRAM_ID,
  )[0];
}

export function deriveDisputePda(resourceId: Buffer): PublicKey {
  return PublicKey.findProgramAddressSync(
    [DISPUTE_SEED, resourceId],
    ATTESTO_PROGRAM_ID,
  )[0];
}

/**
 * Has this exact payment transaction already backed a different
 * FulfillmentReceipt? The on-chain `init` on the receipt PDA already stops
 * the same resourceId minting twice; this closes the other half — the same
 * confirmed payment being replayed under a *different* resourceId to mint a
 * second attestation for free. Enforced by scanning the chain itself
 * (memcmp on the stored payment_signature field) rather than a private
 * database, so it stays independently auditable.
 */
export async function findReceiptByPaymentSignature(
  paymentSignature: string,
): Promise<PublicKey | null> {
  const connection = getConnection();
  const accounts = await connection.getProgramAccounts(ATTESTO_PROGRAM_ID, {
    dataSlice: { offset: 0, length: 0 },
    filters: [
      {
        memcmp: {
          offset: PAYMENT_SIGNATURE_OFFSET,
          bytes: paymentSignature,
        },
      },
    ],
  });
  return accounts.length > 0 ? accounts[0].pubkey : null;
}

export async function getReceiptAccount(
  resourceId: Buffer,
): Promise<{ address: PublicKey; data: DecodedFulfillmentReceipt } | null> {
  const address = deriveReceiptPda(resourceId);
  const info = await getConnection().getAccountInfo(address);
  if (!info) return null;
  return { address, data: decodeFulfillmentReceipt(info.data) };
}

export async function getDisputeAccount(
  resourceId: Buffer,
): Promise<{ address: PublicKey; data: DecodedDispute } | null> {
  const address = deriveDisputePda(resourceId);
  const info = await getConnection().getAccountInfo(address);
  if (!info) return null;
  return { address, data: decodeDispute(info.data) };
}

export interface RecordFulfillmentArgs {
  resourceId: Buffer;
  payer: PublicKey;
  checkedAddress: PublicKey;
  score: number;
  paymentSignature: string;
}

export async function recordFulfillmentAttestation(
  args: RecordFulfillmentArgs,
): Promise<{ signature: string; receipt: PublicKey }> {
  const program = getAttestoProgram();
  const issuer = getIssuerKeypair();
  const receipt = deriveReceiptPda(args.resourceId);
  const paymentSigBytes = Array.from(bs58.decode(args.paymentSignature));

  const signature = await program.methods
    .recordFulfillmentAttestation(
      Array.from(args.resourceId),
      args.payer,
      args.checkedAddress,
      args.score,
      paymentSigBytes,
    )
    // `receipt` and `systemProgram` are omitted on purpose, not missing:
    // the IDL declares `receipt`'s PDA seeds and `systemProgram`'s fixed
    // address, so Anchor's client resolves both on its own from the
    // `resourceId` arg above. Passing them explicitly is a type error
    // against the generated ResolvedAccounts<> type, not just redundant.
    .accounts({
      issuer: issuer.publicKey,
    })
    .rpc();

  return { signature, receipt };
}
