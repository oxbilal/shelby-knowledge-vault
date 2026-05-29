"use client";

import { motion } from "framer-motion";
import { Brain, DatabaseZap, Eye, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileUp,
    title: "Upload files",
    copy: "Add files to the vault.",
  },
  {
    icon: Eye,
    title: "Preview files",
    copy: "Preview files instantly.",
  },
  {
    icon: Brain,
    title: "Ask AI",
    copy: "Ask questions about a selected file.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/10 bg-slate-950/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Product workflow.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              viewport={{ once: true, amount: 0.25 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-400">{feature.copy}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-center text-sm text-slate-200">
          <DatabaseZap className="size-4 shrink-0 text-primary" />
          Files are handled through a Shelby-ready storage layer.
        </div>
      </div>
    </section>
  );
}
