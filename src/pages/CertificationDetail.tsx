import { useParams, Link } from "wouter";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, ExternalLink, Calendar, Building, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function CertificationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = usePortfolio();
  
  const cert = data.certifications?.find(c => c.slug === slug);

  useEffect(() => {
    if (cert) {
      document.title = `${cert.title} | Certification`;
    } else {
      document.title = `Certification Not Found`;
    }
  }, [cert]);

  if (!cert) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Certification not found</h1>
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const verifUrl = cert.verificationUrl || cert.proofUrl;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <article className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          <Link href="/#certifications" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certifications
          </Link>

          <header className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6 text-muted-foreground text-sm font-medium"
            >
              <span className="flex items-center gap-1.5"><Building className="h-4 w-4" /> {cert.issuer}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {cert.date}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6"
            >
              {cert.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl"
            >
              {cert.shortDescription}
            </motion.p>
            
            {verifUrl && verifUrl !== "#" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
                  <a href={verifUrl} target="_blank" rel="noopener noreferrer">
                    <Award className="mr-2 h-5 w-5" /> Verify Credential
                  </a>
                </Button>
              </motion.div>
            )}
          </header>

          {cert.fullImageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div className="w-full rounded-2xl overflow-hidden border border-border shadow-lg cursor-zoom-in bg-muted group relative">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-background/90 text-foreground px-4 py-2 rounded-full font-medium text-sm shadow-sm transition-opacity">
                        Click to expand
                      </span>
                    </div>
                    <img 
                      src={cert.fullImageUrl} 
                      alt={`${cert.title} Certificate`} 
                      className="w-full h-auto max-h-[60vh] object-contain"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-1 bg-transparent border-none shadow-none">
                  <img 
                    src={cert.fullImageUrl} 
                    alt={`${cert.title} Certificate Full`} 
                    className="w-full h-auto rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          <div className="space-y-16">
            
            <section className="grid md:grid-cols-[2fr_1fr] gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">What I Learned</h2>
                <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap">
                  {cert.whatLearned}
                </div>
              </div>
              
              <div>
                <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-muted-foreground mb-4">Skills Gained</h2>
                <div className="flex flex-wrap gap-2">
                  {cert.skillsGained.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-card">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Application</h2>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap">
                {cert.application}
              </div>
            </section>

            {cert.relatedProblems && cert.relatedProblems.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Problems I can now solve</h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {cert.relatedProblems.map((problem, i) => (
                    <li key={i} className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl border border-border">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{problem}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {cert.relatedProjectIds && cert.relatedProjectIds.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Applied in Projects</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cert.relatedProjectIds.map(projectId => {
                    const project = data.projects.find(p => p.id === projectId);
                    if (!project) return null;
                    return (
                      <Link key={project.id} href={`/projects/${project.slug}`}>
                        <div className="group flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                          <div className="aspect-video bg-muted overflow-hidden">
                            <img src={project.thumbnailUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.shortDescription}</p>
                            <span className="text-xs font-semibold text-primary mt-auto flex items-center">
                              View Project <ArrowRight className="ml-1 h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="pt-8 border-t border-border">
              <h2 className="text-xl font-bold mb-4 text-foreground">Future Learning Plan</h2>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground whitespace-pre-wrap">
                {cert.futureLearningPlan}
              </div>
            </section>

          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}