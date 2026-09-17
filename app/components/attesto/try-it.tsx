"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./copy-button";
import { ATTESTO_PROGRAM_ID, explorerUrl } from "@/app/lib/site";
import { useWallet } from "@/app/lib/wallet/context";
import { useSendTransaction } from "@/app/lib/hooks/use-send-transaction";
import { buildAttestoPaymentInstructions } from "@/app/lib/attesto-payment";
import { WalletButton } from "../wallet-button";
import type { Address } from "@solana/kit";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

interface Quote {
  address: string;
  maxAmountRequired: string;
  payTo: string;
  asset: string;
  resourceId: string;
  maxTimeoutSeconds: number;
  fetchedAt: number;
  decimals: number;
}

interface SkillCheckResult {
  address: string;
  score: number;
  found: boolean;
  revoked: boolean;
  attestationCount: number;
  distinctActionTypes: number;
  mostRecentAttestationDaysAgo: number | null;
  breakdown: { volume: number; recency: number; diversity: number };
  attestation: {
    program: string;
    receipt: string;
    transaction: string;
    resourceId: string;
    network: string;
  };
}

type Stage =
  | { step: "address" }
  | { step: "quote"; quote: Quote }
  | { step: "result"; result: SkillCheckResult }
  | { step: "error"; message: string; canRetryQuote: boolean };

function formatUsdc(atomic: string, decimals: number): string {
  return (Number(atomic) / 10 ** decimals).toFixed(decimals);
}

function useCountdown(expiresAt: number | null) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, expiresAt - Date.now()) : 0
  );
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

export function TryIt() {
  const { signer, status: walletStatus } = useWallet();
  const { send, isSending } = useSendTransaction();
  const [address, setAddress] = useState("");
  const [stage, setStage] = useState<Stage>({ step: "address" });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [signature, setSignature] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const quote = stage.step === "quote" ? stage.quote : null;
  const expiresAt = quote
    ? quote.fetchedAt + quote.maxTimeoutSeconds * 1000
    : null;
  const remainingMs = useCountdown(expiresAt);
  const expired = quote !== null && remainingMs <= 0;

  const reset = () => {
    setStage({ step: "address" });
    setAcknowledged(false);
    setSignature("");
    setVerifyError(null);
  };

  const requestQuote = async () => {
    const trimmed = address.trim();
    if (!BASE58_RE.test(trimmed)) {
      setStage({
        step: "error",
        message: "That doesn't look like a valid Solana address.",
        canRetryQuote: false,
      });
      return;
    }

    setQuoteLoading(true);
    try {
      const res = await fetch(`/v1/skill-check/${trimmed}`);
      const body = await res.json();

      if (res.status !== 402) {
        setStage({
          step: "error",
          message:
            body?.error ??
            `Unexpected response (${res.status}) requesting a quote.`,
          canRetryQuote: true,
        });
        return;
      }

      const accept = body.accepts?.[0];
      if (!accept) {
        setStage({
          step: "error",
          message: "Malformed 402 response — no payment option returned.",
          canRetryQuote: true,
        });
        return;
      }

      setStage({
        step: "quote",
        quote: {
          address: trimmed,
          maxAmountRequired: accept.maxAmountRequired,
          payTo: accept.payTo,
          asset: accept.asset,
          resourceId: accept.extra.resourceId,
          maxTimeoutSeconds: accept.maxTimeoutSeconds,
          fetchedAt: Date.now(),
          decimals: accept.extra.decimals,
        },
      });
    } catch {
      setStage({
        step: "error",
        message: "Couldn't reach Attesto. Check your connection and try again.",
        canRetryQuote: true,
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const verifyPayment = async (sig: string) => {
    if (!quote) return;
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      const payload = {
        x402Version: 1,
        scheme: "exact",
        network: "solana-devnet",
        payload: { resourceId: quote.resourceId, signature: sig.trim() },
      };
      const header = btoa(JSON.stringify(payload));

      const res = await fetch(`/v1/skill-check/${quote.address}`, {
        headers: { "X-PAYMENT": header },
      });
      const body = await res.json();

      if (res.status === 200) {
        setStage({ step: "result", result: body as SkillCheckResult });
      } else {
        setVerifyError(body?.error ?? `Verification failed (${res.status}).`);
      }
    } catch {
      setVerifyError("Couldn't reach Attesto to verify payment. Try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const payWithWallet = async () => {
    if (!quote || !signer) return;
    setVerifyError(null);
    try {
      const instructions = buildAttestoPaymentInstructions({
        payerAddress: signer.address as Address,
        payTo: quote.payTo,
        mint: quote.asset,
        amountAtomic: quote.maxAmountRequired,
        decimals: quote.decimals,
        resourceId: quote.resourceId,
      });
      const sig = await send({ instructions });
      setSignature(sig);
      await verifyPayment(sig);
    } catch (err) {
      setVerifyError(
        err instanceof Error ? err.message : "Payment failed or was rejected.",
      );
    }
  };

  return (
    <section id="try-it" className="scroll-mt-20 py-16 md:py-20">
      <div className="mb-10 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Try it
        </h2>
        <p className="max-w-2xl text-foreground/60">
          The full flow, live against devnet. Connect a devnet wallet with
          USDC and pay in one click, or build the transaction yourself — the
          API reference below has the exact recipe.
        </p>
      </div>

      <div className="rounded-2xl border border-border-low bg-card p-6">
        {stage.step === "address" && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                Solana address to check
              </span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 9jFjRSwN7zchM83LDLHugcDmGKe3fJ7MKaZPZVb8VYvh"
                className="rounded-lg border border-border-low bg-background px-3 py-2 font-mono text-sm outline-none focus:border-foreground/30"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={requestQuote}
                disabled={quoteLoading || address.trim().length === 0}
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {quoteLoading ? "Requesting quote…" : "Get price"}
              </button>
              <button
                onClick={() => setAddress(ATTESTO_PROGRAM_ID)}
                className="cursor-pointer text-sm text-foreground/50 underline underline-offset-2 hover:text-foreground"
              >
                Use an example address
              </button>
            </div>
          </div>
        )}

        {stage.step === "quote" && quote && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/60">
                  Quote for {quote.address.slice(0, 4)}…
                  {quote.address.slice(-4)}
                </span>
                <span
                  className={`font-mono text-xs ${expired ? "text-destructive" : "text-foreground/50"}`}
                >
                  {expired
                    ? "expired"
                    : `expires in ${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0")}`}
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-xl bg-cream p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-foreground/50">Amount</span>
                  <span className="font-mono text-lg font-bold">
                    {formatUsdc(quote.maxAmountRequired, quote.decimals)} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground/50">Pay to</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{quote.payTo}</span>
                    <CopyButton value={quote.payTo} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground/50">
                    USDC mint (devnet)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{quote.asset}</span>
                    <CopyButton value={quote.asset} />
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-foreground/60">
                Paying with a connected wallet sends a{" "}
                <code className="rounded bg-cream px-1 py-0.5">
                  transferChecked
                </code>{" "}
                plus a memo binding the payment to this exact quote — required
                so a payment can only ever be redeemed for the request it was
                made for.
              </p>
            </div>

            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-foreground"
              />
              <span className="text-foreground/70">
                I certify that I am not located in, and am not paying on behalf
                of anyone in, Cuba, Iran, North Korea, Syria, the
                Russian-occupied regions of Ukraine, or mainland China.{" "}
                <a
                  href="/legal#restricted-jurisdictions"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Details
                </a>
                . Required to continue.
              </span>
            </label>

            {verifyError && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {verifyError}
              </p>
            )}

            {walletStatus === "connected" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={payWithWallet}
                  disabled={
                    !acknowledged || expired || isSending || verifyLoading
                  }
                  className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending
                    ? "Confirm in wallet…"
                    : verifyLoading
                      ? "Verifying…"
                      : `Pay ${formatUsdc(quote.maxAmountRequired, quote.decimals)} USDC & get attestation`}
                </button>
                <WalletButton />
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-sm text-foreground/60">
                  Connect a devnet wallet with USDC to pay:
                </span>
                <WalletButton />
              </div>
            )}

            <button
              onClick={() => setShowManualEntry((v) => !v)}
              className="cursor-pointer self-start text-xs text-foreground/50 underline underline-offset-2 hover:text-foreground"
            >
              {showManualEntry
                ? "Hide manual entry"
                : "I already paid and have a transaction signature"}
            </button>

            {showManualEntry && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-2">
                  <span className="text-sm font-medium">
                    Confirmed transaction signature
                  </span>
                  <input
                    value={signature}
                    onChange={(e) => {
                      setSignature(e.target.value);
                      if (verifyError) setVerifyError(null);
                    }}
                    placeholder="Base58 transaction signature"
                    disabled={!acknowledged || expired}
                    className="rounded-lg border border-border-low bg-background px-3 py-2 font-mono text-sm outline-none focus:border-foreground/30 disabled:opacity-50"
                  />
                </label>
                <button
                  onClick={() => verifyPayment(signature)}
                  disabled={
                    !acknowledged ||
                    expired ||
                    verifyLoading ||
                    signature.trim().length === 0
                  }
                  className="cursor-pointer rounded-lg border border-border-low bg-card px-4 py-2 text-sm font-semibold whitespace-nowrap transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyLoading ? "Verifying…" : "Verify this signature"}
                </button>
              </div>
            )}

            <div className="flex gap-4 text-xs">
              {expired && (
                <button
                  onClick={requestQuote}
                  className="cursor-pointer text-foreground/50 underline underline-offset-2 hover:text-foreground"
                >
                  Request a fresh quote
                </button>
              )}
              <button
                onClick={reset}
                className="cursor-pointer text-foreground/50 underline underline-offset-2 hover:text-foreground"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {stage.step === "result" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/60">
                Result for {stage.result.address.slice(0, 4)}…
                {stage.result.address.slice(-4)}
              </span>
              <span className="font-mono text-3xl font-bold tabular-nums">
                {stage.result.score}
                <span className="text-base font-normal text-foreground/40">
                  /100
                </span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-cream p-3">
                <div className="text-xs text-foreground/50">Volume</div>
                <div className="font-mono font-semibold">
                  {stage.result.breakdown.volume}/50
                </div>
              </div>
              <div className="rounded-lg bg-cream p-3">
                <div className="text-xs text-foreground/50">Recency</div>
                <div className="font-mono font-semibold">
                  {stage.result.breakdown.recency}/30
                </div>
              </div>
              <div className="rounded-lg bg-cream p-3">
                <div className="text-xs text-foreground/50">Diversity</div>
                <div className="font-mono font-semibold">
                  {stage.result.breakdown.diversity}/20
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground/60">
              {stage.result.found
                ? `${stage.result.attestationCount} attestation(s) found on Prova's registry, ${stage.result.distinctActionTypes} distinct action type(s)${stage.result.revoked ? " — this agent is revoked." : "."}`
                : "No Prova attestation history found for this address."}
            </p>

            <div className="flex flex-col gap-2 rounded-xl bg-cream p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-foreground/50">
                  Fulfillment receipt
                </span>
                <a
                  href={explorerUrl(
                    `/address/${stage.result.attestation.receipt}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs underline underline-offset-2 hover:text-foreground"
                >
                  {stage.result.attestation.receipt}
                </a>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-foreground/50">
                  Attestation transaction
                </span>
                <a
                  href={explorerUrl(
                    `/tx/${stage.result.attestation.transaction}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs underline underline-offset-2 hover:text-foreground"
                >
                  {stage.result.attestation.transaction.slice(0, 12)}…
                </a>
              </div>
            </div>

            <button
              onClick={reset}
              className="cursor-pointer self-start text-sm text-foreground/50 underline underline-offset-2 hover:text-foreground"
            >
              Check another address
            </button>
          </div>
        )}

        {stage.step === "error" && (
          <div className="flex flex-col gap-4">
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {stage.message}
            </p>
            <div className="flex gap-4">
              {stage.canRetryQuote && (
                <button
                  onClick={requestQuote}
                  className="cursor-pointer text-sm text-foreground/50 underline underline-offset-2 hover:text-foreground"
                >
                  Try again
                </button>
              )}
              <button
                onClick={reset}
                className="cursor-pointer text-sm text-foreground/50 underline underline-offset-2 hover:text-foreground"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
