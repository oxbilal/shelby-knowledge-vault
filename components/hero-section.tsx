"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, DatabaseZap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="vault-grid absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="mx-auto flex min-h-[calc(78vh-4rem)] max-w-7xl flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge className="mb-6 gap-2">
            <DatabaseZap className="size-3.5" />
            Shelby hot storage
          </Badge>
          <h1 className="text-balance text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-8xl">
            Shelby Knowledge Vault
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-slate-300">
            Upload files. Preview instantly. Ask AI.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open Vault
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
