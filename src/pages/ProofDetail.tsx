import { useParams, Link } from "wouter";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, FileText, Award, Code, Image as ImageIcon, 
  Link as LinkIcon, Video, Newspaper, ExternalLink 
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ProofType } from "@/types";

const getTypeIcon = (type: ProofType) => {
  switch (type) {
    case 'document': return <FileText className="h-5 w-5" />;
    case 'certificate': return <Award className="h-5 w-5" />;
    case 'code': return <Code className="h-5 w-5" />;
    case 'screenshot': return <ImageIcon className="h-5 w-5" />;
    case 'link': return <LinkIcon className="h-5 w-5" />;
    case 'video': return <Video className="h-5 w-5" />;
    case 'article': return <Newspaper className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
};

function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function extractVimeoId(url: string) {
  const regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function ProofDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = usePortfolio();
  
  const proof = data.proofs?.find(p => p.slug === slug);

  useEffect(() => {
    if (proof) {
      document.title = `${proof.title} | Proof`;
    } else {
      document.title = `Proof Not Found`;
    }
  }, [proof]);

  if (!proof) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Proof not found</h1>
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const ytId = proof.videoUrl ? extractYouTubeId(proof.videoUrl) : null;
  const vimeoId = proof.videoUrl ? extractVimeoId(proof.videoUrl) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <article className="container mx-auto px-6 md:px-12 max-w-4xl">
          
          <Link href="/#skills" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>

          <header className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <Badge variant="secondary" className="capitalize flex items-center gap-1.5 px-3 py-1">
                {getTypeIcon(proof.type)}
                {proof.type}
              </Badge>
              {proof.date && <span className="text-muted-foreground text-sm font-mono">{proof.date}</span>}
              {proof.issuer && <span className="text-muted-foreground text-sm flex items-center gap-2">• {proof.issuer}</span>}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6"
            >
              {proof.title}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              {proof.documentUrl && proof.documentUrl !== "#" && (
                <Button asChild size="lg" className="rounded-full">
                  <a href={proof.documentUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-5 w-5" /> View Document
                  </a>
                </Button>
              )}
              {proof.externalUrl && proof.externalUrl !== "#" && (
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <a href={proof.externalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" /> External Link
                  </a>
                </Button>
              )}
            </motion.div>
          </header>

          {proof.imageUrl && proof.imageUrl !== "#" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full rounded-2xl overflow-hidden border border-border shadow-lg mb-16"
            >
              <img 
                src={proof.imageUrl} 
                alt={proof.title} 
                className="w-full h-auto max-h-[70vh] object-contain bg-muted"
              />
            </motion.div>
          )}
          
          {(ytId || vimeoId) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-lg mb-16 bg-muted"
            >
              {ytId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : vimeoId ? (
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : null}
            </motion.div>
          )}

          <div className="space-y-12">
            <section>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground max-w-none whitespace-pre-wrap">
                {proof.description}
              </div>
            </section>
            
            {proof.codeSnippet && (
              <section>
                <div className="rounded-xl overflow-hidden border border-border bg-zinc-950">
                  <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                    <span className="text-xs font-mono text-zinc-400">{proof.codeLanguage || 'text'}</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-zinc-50 leading-relaxed">
                      <code>{proof.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {((proof.tags && proof.tags.length > 0) || (proof.linkedProjectIds && proof.linkedProjectIds.length > 0)) && (
              <section className="pt-8 border-t border-border grid sm:grid-cols-2 gap-8">
                {proof.tags && proof.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-muted-foreground mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {proof.tags.map(tag => (
                         <Badge key={tag} variant="outline" className="bg-card">
                           {tag}
                         </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {proof.linkedProjectIds && proof.linkedProjectIds.length > 0 && (
                  <div>
                    <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-muted-foreground mb-4">Related Projects</h3>
                    <div className="flex flex-col gap-2">
                      {proof.linkedProjectIds.map(projectId => {
                        const project = data.projects.find(p => p.id === projectId);
                        if (!project) return null;
                        return (
                          <Link key={project.id} href={`/projects/${project.slug}`}>
                            <span className="inline-flex items-center text-primary font-medium hover:underline underline-offset-4 cursor-pointer">
                              {project.title} <ArrowLeft className="ml-1 h-3 w-3 rotate-135" />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}
            
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}