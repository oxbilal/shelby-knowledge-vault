import Link from "next/link";
import { DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <DatabaseZap className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Shelby Knowledge Vault</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <Link href="/#features" className="transition hover:text-white">
            Features
          </Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/dashboard">Open Vault</Link>
        </Button>
      </div>
    </header>
  );
}
