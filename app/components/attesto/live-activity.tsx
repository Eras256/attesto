"use client";

import useSWR from "swr";
import { ATTESTO_PROGRAM_ID, explorerUrl } from "@/app/lib/site";

interface AttestoMetrics {
  network: string;
  program: string;
  uniquePayers: number;
  requestsServed: number;
  attestations: number;
  disputes: number;
  volumeAtomic: string;
  volumeUsdc: string;
  asOf: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`metrics request failed: ${res.status}`);
    return res.json() as Promise<AttestoMetrics>;
  });

const REFRESH_MS = 15_000;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border-low bg-card p-5">
      <span className="text-xs font-medium text-foreground/50">{label}</span>
      <span className="font-mono text-3xl font-bold tabular-nums tracking-tight">
        {value}
      </span>
    </div>
  );
}

export function LiveActivity() {
  const { data, error, isLoading } = useSWR("/v1/metrics", fetcher, {
    refreshInterval: REFRESH_MS,
    revalidateOnFocus: true,
  });

  return (
    <section id="live-activity" className="scroll-mt-20 py-16 md:py-20">
      <div className="mb-10 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Live activity
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-low bg-card px-2.5 py-1 text-xs font-medium text-foreground/60">
            {/* Solana green kept deliberately here too — see hero.tsx. */}
            <span className="size-1.5 animate-pulse rounded-full bg-[#14F195]" />
            Solana devnet — real data, not simulated
          </span>
        </div>
        <p className="max-w-2xl text-foreground/60">
          Read live from{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-sm">
            GET /v1/metrics
          </code>{" "}
          on every request — counted directly off on-chain accounts, never
          cached in a database that could drift from what&apos;s actually there.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t reach /v1/metrics right now. It&apos;s a public, unpaid
          endpoint — try refreshing.
        </p>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Stat
              label="Unique payers"
              value={isLoading ? "—" : String(data?.uniquePayers ?? 0)}
            />
            <Stat
              label="Requests served"
              value={isLoading ? "—" : String(data?.requestsServed ?? 0)}
            />
            <Stat
              label="Volume (USDC)"
              value={isLoading ? "—" : (data?.volumeUsdc ?? "0.000000")}
            />
            <Stat
              label="Attestations"
              value={isLoading ? "—" : String(data?.attestations ?? 0)}
            />
            <Stat
              label="Disputes"
              value={isLoading ? "—" : String(data?.disputes ?? 0)}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/40">
            {data?.asOf && (
              <span>As of {new Date(data.asOf).toLocaleTimeString()}</span>
            )}
            <a
              href={explorerUrl(`/address/${ATTESTO_PROGRAM_ID}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground/70"
            >
              View program on Explorer
            </a>
          </div>
        </>
      )}
    </section>
  );
}
