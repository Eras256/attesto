"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border-low bg-card px-2 py-1 text-xs font-medium text-foreground/60 transition hover:bg-cream hover:text-foreground ${className}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
