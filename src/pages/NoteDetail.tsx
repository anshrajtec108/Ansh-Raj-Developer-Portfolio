import { useParams, Link } from "wouter";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { useEffect } from "react";
import { MotionConfig, motion } from "framer-motion";

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = usePortfolio();
  
  const note = data.engineeringNotes?.find(n => n.slug === slug);

  useEffect(() => {
    if (note) {
      document.title = `${note.title} | Engineering Note`;
    } else {
      document.title = `Note Not Found`;
    }
  }, [note]);

  if (!note) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Note not found</h1>
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <MotionConfig reducedMotion="user">
        <article className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          <Link href="/#engineering" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Engineering
          </Link>

          <header className="mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                <Lightbulb className="h-4 w-4 text-primary" /> Engineering
              </Badge>
              <div className="flex gap-2">
                {note.tags.map(tag => (
                  <span key={tag} className="text-muted-foreground text-sm font-mono border border-border px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
            >
              {note.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
            >
              {note.summary}
            </motion.p>
          </header>

          {note.technologies && note.technologies.length > 0 && (
            <section aria-label="Technologies used" className="mb-12">
              <h2 className="mb-3 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Technologies used</h2>
              <div className="flex flex-wrap gap-2">
                {note.technologies.map(technology => (
                  <Badge key={technology} variant="secondary">{technology}</Badge>
                ))}
              </div>
            </section>
          )}

          {note.imageUrl && (
            <figure className="mb-16 overflow-hidden rounded-2xl border border-border bg-card">
              <img src={note.imageUrl} alt={`${note.title} architecture diagram`} className="h-auto max-h-[34rem] w-full object-contain" />
              <figcaption className="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
                Architecture and data-flow illustration for {note.title}
              </figcaption>
            </figure>
          )}

          <div className="space-y-16">
            
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-primary/5 border border-primary/20 p-8 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-primary mb-4">
                Problem Statement
              </h2>
              <div className="prose dark:prose-invert prose-lg text-foreground whitespace-pre-wrap font-medium">
                {note.problem || note.highlight}
              </div>
            </motion.section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Implementation Details</h2>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap">
                {note.implementationDetails || note.thoughtProcess}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-8 text-foreground">Approaches Considered</h2>
              <div className="space-y-6">
                {note.approaches.map((app, idx) => (
                  <div key={app.id} className="bg-card border border-border p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-3">
                      <span className="flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-full text-sm font-mono">
                        {idx + 1}
                      </span>
                      {app.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">{app.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" /> Pros
                        </h4>
                        <ul className="space-y-2">
                          {app.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> Cons
                        </h4>
                        <ul className="space-y-2">
                          {app.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-card border-2 border-primary p-8 rounded-2xl relative">
              <div className="absolute -top-4 -left-2 bg-primary text-primary-foreground px-4 py-1 font-mono text-sm font-bold rounded-lg transform -rotate-2">
                Selected Path
              </div>
              <h2 className="text-2xl font-bold mb-4 text-foreground mt-2">Technical Approach</h2>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap">
                {note.technicalApproach || note.finalApproach}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Trade-offs</h2>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap">
                {note.tradeoffs}
              </div>
            </section>

            {note.architectureNotes && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                  <Layers className="h-6 w-6 text-primary" /> Architecture Notes
                </h2>
                <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap bg-muted p-6 rounded-xl border border-border">
                  {note.architectureNotes}
                </div>
              </section>
            )}

            <div className="grid md:grid-cols-2 gap-12 border-t border-border pt-12">
              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">Real-World Applicability</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {note.realWorldApplicability}
                </p>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">{note.whatILearned ? "What I Learned" : "Conclusion"}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {note.whatILearned || note.conclusion}
                </p>
              </section>
            </div>

          </div>
        </article>
        </MotionConfig>
      </main>

      <Footer />
    </div>
  );
}