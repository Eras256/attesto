import type { Metadata } from "next";
import Link from "next/link";
import { GridBackground } from "../components/grid-background";
import { Nav } from "../components/attesto/nav";
import { Footer } from "../components/attesto/footer";
import { HowItWorks } from "../components/attesto/how-it-works";
import { LiveActivity } from "../components/attesto/live-activity";
import {
  ATTESTO_PROGRAM_ID,
  GITHUB_URL,
  PRICE_USDC,
  PROVA_PROGRAM_ID,
  SITE_URL,
  explorerUrl,
} from "@/app/lib/site";

// Set this once a demo video is recorded and uploaded. Leaving it empty
// hides the video card in the Links section entirely, rather than
// showing a "coming soon" placeholder.
const DEMO_VIDEO_URL = "";

const PITCH_DESCRIPTION =
  "Attesto's pitch: a paid skill oracle for autonomous agents on Solana, with on-chain proof at every step.";

export const metadata: Metadata = {
  title: "Pitch",
  description: PITCH_DESCRIPTION,
  openGraph: {
    title: "Attesto: pitch",
    description: PITCH_DESCRIPTION,
  },
};

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border-low py-16 md:py-20">
      <div className="mb-8 flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">
          {eyebrow}
        </span>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Fact({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5">
      <div className="text-sm leading-relaxed text-foreground/70">
        {children}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-mono text-xs text-foreground/50 underline underline-offset-2 hover:text-foreground"
      >
        {href}
      </a>
    </li>
  );
}

export default function PitchPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <GridBackground />

      <div className="relative z-10">
        <Nav />

        <main className="mx-auto max-w-6xl px-6">
          {/* 1. Hero */}
          <section className="pt-16 pb-12 md:pt-24 md:pb-16">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border-low bg-card px-3 py-1 text-xs font-medium text-foreground/60">
              <span className="size-1.5 rounded-full bg-[#14F195]" />
              Live on Solana devnet
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Attesto: an x402-metered skill oracle for AI agents on Solana.
            </h1>
          </section>

          {/* 2. Problem */}
          <Section id="problem" eyebrow="The problem" title="A Solana address alone proves nothing">
            <p className="max-w-2xl text-lg leading-relaxed text-foreground/60">
              AI agents are starting to hire each other, pay each other, and
              act on each other&apos;s behalf, on-chain, with no human
              approving each step. An address by itself says nothing about
              whether the agent behind it has a real track record worth
              trusting.
            </p>
          </Section>

          {/* 3. Solution */}
          <Section id="solution" eyebrow="The solution" title="Pay a few cents, get a verifiable answer">
            <p className="max-w-2xl text-lg leading-relaxed text-foreground/60">
              An agent pays {PRICE_USDC} USDC per check and gets back a score
              sourced from{" "}
              <a
                href="https://theprova.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Prova&apos;s
              </a>{" "}
              on-chain attestation data. Every paid check mints its own
              on-chain receipt. There is no facilitator in the middle:
              Attesto verifies the payment directly against Solana itself.
            </p>
          </Section>

          {/* 4. How it works: reuses the real component, no duplicated copy */}
          <div className="border-t border-border-low pt-16 md:pt-20">
            <HowItWorks />
          </div>

          {/* 5. Proof */}
          <Section
            id="proof"
            eyebrow="Proof, not a promise"
            title="Verified October 13, 2026, with a real payment in production"
          >
            <ul className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li className="flex flex-col gap-2 rounded-2xl border border-border-low bg-card p-5 sm:col-span-2">
                <span className="text-sm text-foreground/70">
                  Agent{" "}
                  <span className="break-all font-mono text-xs text-foreground/50">
                    GoNaEo5bAAFpBADnuqE8E3M3DqCMEcYVE8LzcVxjRNPS
                  </span>{" "}
                  scored 97/100: Volume 50/50, Recency 30/30, Diversity
                  17.1/20, across 174,437 attestations and 6 distinct action
                  types. As of Oct 13, 2026.
                </span>
              </li>
              <Fact href={explorerUrl("/address/GaGKFFH6RRftFmAiasv7gydEQKFEZ2iiZVsdbja8W9w3")}>
                The fulfillment receipt for that check, independently
                resolvable on-chain.
              </Fact>
              <Fact
                href={explorerUrl(
                  "/tx/tRz2UxH53LAe9mh4bgsx3DfvXbhYsTmHpAfkBGgCV7y9cRKxbZeYPgYtc8WjduuAom1dQTRBrTBwqmTsjZ6BR2C"
                )}
              >
                The attestation transaction that minted it.
              </Fact>
              <Fact href={explorerUrl(`/address/${ATTESTO_PROGRAM_ID}`)}>
                Attesto&apos;s program on Solana devnet.
              </Fact>
            </ul>

            <LiveActivity />
          </Section>

          {/* 6. Built on real work */}
          <Section id="lineage" eyebrow="Not built from scratch" title="Built on real work">
            <div className="flex flex-col gap-4">
              <p className="max-w-2xl text-foreground/60">
                Prova is our own attestation layer for AI agents, running as
                program{" "}
                <span className="break-all font-mono text-xs text-foreground/50">
                  {PROVA_PROGRAM_ID}
                </span>{" "}
                on Solana devnet since May 2026. Attesto only reads from
                Prova&apos;s registry; it never writes to Prova&apos;s own
                program.
              </p>
              <p className="max-w-2xl text-foreground/60">
                <a
                  href="https://vouch402.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Vouch402
                </a>{" "}
                runs the same pay, verify, attest, dispute pattern on Base.
                It&apos;s prior work by the same team, ported to Solana for
                Attesto.
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-foreground/60">
                  We&apos;ve also contributed four merged pull requests to
                  Anchor itself:
                </p>
                <ul className="flex flex-wrap gap-3">
                  {["4960", "5130", "5131", "5132"].map((pr) => (
                    <li key={pr}>
                      <a
                        href={`https://github.com/otter-sec/anchor/pull/${pr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-lg border border-border-low bg-card px-3 py-1.5 text-sm font-mono text-foreground/70 transition hover:bg-cream hover:text-foreground"
                      >
                        #{pr}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* 7. Team */}
          <Section id="team" eyebrow="Who built it" title="Team">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="https://github.com/Eras256"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5 transition hover:bg-cream"
              >
                <span className="font-semibold">Giovanny Amador</span>
                <span className="text-sm text-foreground/60">
                  Anchor program, payment verification, replay protection.
                </span>
                <span className="mt-2 text-xs text-foreground/40">
                  github.com/Eras256
                </span>
              </a>
              <a
                href="https://github.com/M0nsxx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5 transition hover:bg-cream"
              >
                <span className="font-semibold">Monserrat Mendoza</span>
                <span className="text-sm text-foreground/60">
                  attesto.xyz frontend, real-browser testing.
                </span>
                <span className="mt-2 text-xs text-foreground/40">
                  github.com/M0nsxx
                </span>
              </a>
            </div>
          </Section>

          {/* 8. Track record (attributed to Prova and the team, not Attesto) */}
          <Section id="track-record" eyebrow="Before Attesto" title="Track record">
            <ul className="flex flex-col gap-3">
              <li className="rounded-2xl border border-border-low bg-card p-5">
                <p className="text-sm leading-relaxed text-foreground/70">
                  Prova, built by this same team, placed 1st in Mexico at
                  Dev3pack Bridge (May 2026).
                </p>
                <a
                  href="https://x.com/vaiossx/status/2053541692427436399"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block break-all text-xs text-foreground/50 underline underline-offset-2 hover:text-foreground"
                >
                  x.com/vaiossx/status/2053541692427436399
                </a>
              </li>
              <li className="rounded-2xl border border-border-low bg-card p-5">
                <p className="text-sm leading-relaxed text-foreground/70">
                  The team graduated from WayLearn&apos;s Solana Latam Labs
                  Program (12 weeks, 2026), building Prova.
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  <a
                    href="https://www.youtube.com/watch?v=9db4T6JA6zo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-foreground/50 underline underline-offset-2 hover:text-foreground"
                  >
                    Demo Day recording (YouTube)
                  </a>
                  <a
                    href="https://x.com/theprovaxyz/status/2094914981779402985"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-foreground/50 underline underline-offset-2 hover:text-foreground"
                  >
                    Announcement (X)
                  </a>
                </div>
              </li>
            </ul>
          </Section>

          {/* 9. Traction */}
          <Section id="traction" eyebrow="Honest status" title="Traction">
            <p className="max-w-2xl text-foreground/60">
              Attesto is live on Solana devnet today. Real external testers,
              beyond our own team, are the next milestone.
            </p>
          </Section>

          {/* 10. Roadmap */}
          <Section id="roadmap" eyebrow="What's next" title="Roadmap">
            <ul className="flex flex-col gap-3">
              <li className="rounded-2xl border border-border-low bg-card p-5 text-sm text-foreground/70">
                More real external testers, beyond our own team.
              </li>
              <li className="rounded-2xl border border-border-low bg-card p-5 text-sm text-foreground/70">
                An independent security review before any move toward
                mainnet.
              </li>
              <li className="rounded-2xl border border-border-low bg-card p-5 text-sm text-foreground/70">
                Hardening the dispute flow.
              </li>
            </ul>
          </Section>

          {/* 11. Links */}
          <Section id="links" eyebrow="Follow along" title="Links">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5 transition hover:bg-cream"
              >
                <span className="font-semibold">Site</span>
                <span className="text-sm text-foreground/60">attesto.xyz</span>
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5 transition hover:bg-cream"
              >
                <span className="font-semibold">Repository</span>
                <span className="text-sm text-foreground/60">
                  github.com/Eras256/attesto
                </span>
              </a>
              <Link
                href="/#api-reference"
                className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5 transition hover:bg-cream"
              >
                <span className="font-semibold">API reference</span>
                <span className="text-sm text-foreground/60">
                  Three endpoints, no SDK
                </span>
              </Link>
              {DEMO_VIDEO_URL && (
                <a
                  href={DEMO_VIDEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 rounded-2xl border border-border-low bg-card p-5 transition hover:bg-cream"
                >
                  <span className="font-semibold">Demo video</span>
                  <span className="text-sm text-foreground/60">Watch it</span>
                </a>
              )}
            </div>
          </Section>

          {/* 12. Disclosure */}
          <div className="border-t border-border-low py-10">
            <p className="text-sm text-foreground/40">
              Built with AI assistance (Claude Code) under the team&apos;s
              direction.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
