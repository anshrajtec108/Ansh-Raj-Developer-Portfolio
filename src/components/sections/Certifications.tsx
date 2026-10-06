import { usePortfolio } from "../../contexts/PortfolioContext";
import { motion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function Certifications() {
  const { data } = usePortfolio();

  if (!data.certifications || data.certifications.length === 0) return null;

  return (
    <section id="certifications" className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-primary">Certifications</h2>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/certifications/${cert.slug}`}>
                  <div className="flex flex-col h-full rounded-2xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden group cursor-pointer">
                    {cert.thumbnailUrl ? (
                      <div className="aspect-[16/9] bg-muted w-full overflow-hidden border-b border-border">
                        <img 
                          src={cert.thumbnailUrl} 
                          alt={cert.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-muted flex items-center justify-center border-b border-border text-muted-foreground group-hover:text-primary transition-colors">
                        <Award className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3">
                        <span className="text-primary font-bold">{cert.issuer}</span>
                        <span>•</span>
                        <span>{cert.date}</span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                        {cert.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
                        {cert.shortDescription}
                      </p>
                      
                      <div className="mt-auto inline-flex items-center text-primary font-medium text-sm group-hover:underline underline-offset-4">
                        View Certificate <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}