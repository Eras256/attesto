import { GITHUB_URL, SITE_URL } from "@/app/lib/site";

const LINKS = [
  { href: `${GITHUB_URL}#readme`, label: "Docs", external: true },
  { href: "/legal", label: "Legal", external: false },
  { href: GITHUB_URL, label: "GitHub", external: true },
  { href: `${SITE_URL}/v1/metrics`, label: "Live API", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-border-low py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <span className="text-sm text-foreground/40">
          Attesto — built for Crypto World&apos;s Fair (Colosseum), Solana
          track.
        </span>
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm text-foreground/60 underline underline-offset-2 transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
