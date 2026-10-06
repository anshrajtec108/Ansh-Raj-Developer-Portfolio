import { useParams, Link } from "wouter";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GitBranch, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = usePortfolio();
  
  const project = data.projects.find(p => p.slug === slug);

  useEffect(() => {
    if (project) {
      document.title = `${project.title} | Case Study`;
    } else {
      document.title = `Project Not Found`;
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Project not found</h1>
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
        <article className="container mx-auto px-6 md:px-12 max-w-5xl">
          
          <Link href="/#projects" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all projects
          </Link>

          <header className="mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
            >
              {project.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
            >
              {project.shortDescription}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              {project.githubUrl && (
                <Button asChild size="lg" className="rounded-full">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <GitBranch className="mr-2 h-5 w-5" /> View Source
                  </a>
                </Button>
              )}
              {project.liveUrl && (
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" /> Live Demo
                  </a>
                </Button>
              )}
            </motion.div>
          </header>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-lg mb-20"
          >
            <img 
              src={project.thumbnailUrl} 
              alt={`${project.title} interface preview`} 
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="grid md:grid-cols-[1fr_250px] gap-16 items-start">
            
            <div className="space-y-16">
              <section>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Overview</h2>
                <div className="prose dark:prose-invert prose-lg text-muted-foreground">
                  <p>{project.longOverview}</p>
                </div>
              </section>

              <div className="grid sm:grid-cols-2 gap-8">
                <section className="bg-card border border-border p-6 rounded-2xl">
                  <h2 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
                    The Problem
                  </h2>
                  <p className="text-muted-foreground">{project.problem}</p>
                </section>
                <section className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                  <h2 className="text-lg font-bold mb-3 text-primary flex items-center gap-2">
                    The Solution
                  </h2>
                  <p className="text-muted-foreground">{project.solution}</p>
                </section>
              </div>

              <section>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Key Features</h2>
                <ul className="space-y-4">
                  {project.keyFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <span className="text-lg text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {project.securityFeatures.length > 0 && (
                <section className="bg-card border border-border p-8 rounded-2xl">
                  <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" /> Security Considerations
                  </h2>
                  <ul className="space-y-4">
                    {project.securityFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span className="text-lg text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {project.screenshotUrls.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Gallery</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.screenshotUrls.map((url, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                        <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid sm:grid-cols-2 gap-8 border-t border-border pt-16">
                <section>
                  <h2 className="text-xl font-bold mb-4 text-foreground">Challenges</h2>
                  <p className="text-muted-foreground">{project.challenges}</p>
                </section>
                <section>
                  <h2 className="text-xl font-bold mb-4 text-foreground">What I Learned</h2>
                  <p className="text-muted-foreground">{project.learnings}</p>
                </section>
              </div>

            </div>

            <aside className="md:sticky md:top-24 space-y-8">
              <div>
                <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-muted-foreground mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map(tech => (
                    <Badge key={tech} variant="secondary" className="bg-card border-border">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </aside>
            
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
