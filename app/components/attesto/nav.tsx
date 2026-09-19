import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { GITHUB_URL } from "@/app/lib/site";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#live-activity", label: "Live activity" },
  { href: "#try-it", label: "Try it" },
  { href: "#api-reference", label: "API" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-low bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight"
        >
          <img
            src="/branding-attesto/svg/logo-mono-light.svg"
            alt=""
            className="size-5 dark:hidden"
          />
          <img
            src="/branding-attesto/svg/logo-mono-dark.svg"
            alt=""
            className="hidden size-5 dark:block"
          />
          Attesto
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/60 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border-low bg-card text-foreground/70 transition hover:bg-cream hover:text-foreground"
            aria-label="Attesto on GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
