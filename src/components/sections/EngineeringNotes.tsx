import { usePortfolio } from "../../contexts/PortfolioContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "../ui/badge";
import { ArrowRight, Lightbulb } from "lucide-react";

export function EngineeringNotes() {
  const { data } = usePortfolio();
  const visibleNotes = data.engineeringNotes?.filter(n => n.visible).sort((a, b) => a.order - b.order) || [];

  return (
    <section id="engineering-notes" className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-primary flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Engineering Notes
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              How I think through hard problems.
            </h3>
          </div>

          {visibleNotes.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">No engineering notes published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative flex flex-col p-8 rounded-2xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex flex-wrap gap-2 mb-6">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-background text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h4 className="text-xl font-bold text-foreground mb-3 leading-tight">
                    <Link href={`/notes/${note.slug}`} className="before:absolute before:inset-0">
                      {note.title}
                    </Link>
                  </h4>
                  
                  <p className="text-muted-foreground text-sm mb-6 flex-grow">
                    {note.summary}
                  </p>

                  <div className="border-l-2 border-primary pl-4 mb-6 py-1">
                    <p className="text-sm font-medium text-foreground italic">
                      "{note.highlight}"
                    </p>
                  </div>

                  <div className="inline-flex items-center text-primary font-semibold text-sm mt-auto group-hover:underline underline-offset-4">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}