import { usePortfolio } from "../../contexts/PortfolioContext";
import { Button } from "../ui/button";
import { ArrowDownRight, ArrowRight, GitBranch, Link as LinkIcon, Mail } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const { data } = usePortfolio();
  const firstName = data.profile.name.split(" ")[0];

  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden pt-24 pb-16">
      <div aria-hidden="true" className="hero-backdrop absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
      </div>

      <div className="container mx-auto grid items-center gap-14 px-6 md:px-12 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-start gap-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-xs tracking-wide text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            BACKEND · SYSTEMS · AI
          </div>

          <div className="space-y-5">
            <p className="font-mono text-sm text-primary">Hello, I’m {firstName}.</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-foreground md:text-7xl">
              I build backend systems
              <span className="text-muted-foreground"> and explore what comes next.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {data.profile.headline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <a href="#projects">
                Explore my work <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <a href="#engineering">
                Explore Engineering <ArrowDownRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a href={data.profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="rounded-lg border border-border bg-card/70 p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <GitBranch className="h-4 w-4" />
            </a>
            <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="rounded-lg border border-border bg-card/70 p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <LinkIcon className="h-4 w-4" />
            </a>
            <a href={`mailto:${data.profile.email}`} aria-label="Email Ansh" className="rounded-lg border border-border bg-card/70 p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm lg:ml-auto"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img
                src={data.profile.profilePhotoUrl}
                alt={`${data.profile.name}, developer`}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{data.profile.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{data.profile.location}</p>
              </div>
              <span className="rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Building & learning
              </span>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
            Backend engineering <span className="text-primary">→</span> Distributed systems <span className="text-primary">→</span> AI engineering
          </p>
        </motion.div>
      </div>
    </section>
  );
}
