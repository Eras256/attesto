import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "../components/attesto/nav";
import { Footer } from "../components/attesto/footer";
import { GITHUB_URL } from "@/app/lib/site";

export const metadata: Metadata = {
  title: "Legal",
  description:
    "Attesto's legal posture, data sourcing, and jurisdiction disclosures.",
};

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border-low py-8">
      <h2 className="mb-3 text-lg font-bold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground/70">
        {children}
      </div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-black tracking-tight">Legal</h1>
        <p className="mb-8 text-sm text-foreground/50">
          Last updated 2026-09-15. Attesto is a hackathon build (Crypto
          World&apos;s Fair, Colosseum) running against Solana devnet, not a
          production financial service.
        </p>

        <Section id="overview" title="1. What Attesto is">
          <p>
            Attesto is a paid software service: an API that computes and returns
            a skill-check score for a given Solana address, sourced from
            Prova&apos;s public on-chain attestation registry, and writes its
            own proof-of-fulfillment attestation on-chain for every request it
            serves. Attesto sells its own computation — the score and the
            attestation — not a financial service.
          </p>
        </Section>

        <Section
          id="not-an-intermediary"
          title="2. Attesto does not intermediate a payment"
        >
          <p>
            Every request settles atomically: the caller sends USDC directly
            on-chain to the address quoted in the 402 response, confirms the
            transaction themselves, and Attesto verifies that confirmed
            transaction directly against Solana RPC before releasing a result.
            Attesto never accrues or reports a running balance for any caller,
            never routes a payment through a third-party facilitator, and never
            settles or reconciles a transfer on behalf of another party. Each
            skill-check is a self-contained, one-off transaction, not a standing
            account relationship.
          </p>
        </Section>

        <Section id="data-sourcing" title="3. Attestation data and no warranty">
          <p>
            Skill-check scores are derived from Prova&apos;s on-chain
            attestation registry (a separate product, separate program) plus
            Attesto&apos;s own scoring formula, published in full in the
            project&apos;s{" "}
            <code className="rounded bg-cream px-1 py-0.5">DECISIONS.md</code>.
            Both the underlying attestations and Attesto&apos;s own fulfillment
            receipts are independently resolvable on-chain — you do not have to
            trust Attesto&apos;s word for the result. Attesto is provided on an
            as-is basis, without warranty of any kind, and makes no
            representation that a given score reflects real-world
            trustworthiness or fitness for any particular purpose.
          </p>
        </Section>

        <Section
          id="restricted-jurisdictions"
          title="4. Restricted jurisdictions"
        >
          <p>
            Attesto is not offered to, and may not be used by, any person or
            entity located in, or paying on behalf of anyone located in:{" "}
            <strong>
              Cuba, Iran, North Korea, Syria, the Russian-occupied regions of
              Ukraine (Crimea, Donetsk, Luhansk), or mainland China
            </strong>
            , consistent with OFAC-sanctioned-jurisdiction practice and Chinese
            financial-authority notices on crypto-asset activity.
          </p>
          <p>
            The European Union/EEA and United States are not blocked, but are
            flagged pending further legal review of how region-specific
            frameworks (e.g. MiCA, U.S. state money-transmission rules) apply to
            a pay-per-request on-chain oracle like this one.
          </p>
          <p>
            IP-based geo-blocking on an API that autonomous agents call directly
            is inherently weaker than the same technique in front of a human
            browser flow, so enforcement here is layered: a technical check plus
            the self-certification checkbox shown before payment in the
            &ldquo;Try it&rdquo; flow. Checking that box is a representation you
            are making, not a formality.
          </p>
        </Section>

        <Section id="not-legal-advice" title="5. Not legal or financial advice">
          <p>
            Nothing on this site or returned by the API is legal, financial, or
            investment advice. This is a hackathon submission; treat any devnet
            activity, pricing, or on-chain state accordingly.
          </p>
        </Section>

        <Section id="contact" title="6. Contact">
          <p>
            Questions about this page or the product itself: open an issue on{" "}
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              GitHub
            </Link>
            .
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
