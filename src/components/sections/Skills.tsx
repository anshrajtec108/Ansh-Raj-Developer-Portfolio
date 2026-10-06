import { usePortfolio } from "../../contexts/PortfolioContext";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Link } from "wouter";
import { SkillCategory, ProofType } from "../../types";
import { FileText, Award, Code, Image as ImageIcon, Link as LinkIcon, Video, Newspaper } from "lucide-react";

const getProofIcon = (type: ProofType) => {
  switch (type) {
    case 'document': return <FileText className="h-4 w-4" />;
    case 'certificate': return <Award className="h-4 w-4" />;
    case 'code': return <Code className="h-4 w-4" />;
    case 'screenshot': return <ImageIcon className="h-4 w-4" />;
    case 'link': return <LinkIcon className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    case 'article': return <Newspaper className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

export function Skills() {
  const { data } = usePortfolio();

  const categories: SkillCategory[] = ["Frontend", "Backend", "Tools & DevOps", "Future Skills"];

  return (
    <section id="skills" className="py-24 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-primary">Technical Arsenal</h2>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {categories.map((category) => {
              const categorySkills = data.skills.filter(s => s.category === category);
              if (categorySkills.length === 0) return null;

              return (
                <div key={category} className="space-y-6">
                  <h3 className="text-xl font-bold text-foreground border-b border-border pb-2">{category}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {categorySkills.map((skill) => (
                      <AccordionItem key={skill.id} value={skill.id} className="border-border">
                        <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold">{skill.name}</span>
                            {category !== "Future Skills" && (
                              <div className="flex gap-1 h-2 w-16 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${skill.proficiency}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pt-2">
                          <p className="mb-6 text-sm leading-relaxed">{skill.notes}</p>
                          
                          <div className="space-y-6">
                            {skill.linkedProofIds && skill.linkedProofIds.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs font-mono text-foreground uppercase tracking-wider">Evidence & Proofs:</p>
                                <div className="grid gap-2">
                                  {skill.linkedProofIds.map(proofId => {
                                    const proof = data.proofs?.find(p => p.id === proofId);
                                    if (!proof) return null;
                                    return (
                                      <Link key={proof.id} href={`/proofs/${proof.slug}`}>
                                        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer group">
                                          <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                                            {getProofIcon(proof.type)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{proof.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{proof.shortDescription}</p>
                                          </div>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {skill.linkedProjectIds.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs font-mono text-foreground uppercase tracking-wider">Applied In Projects:</p>
                                <div className="flex flex-wrap gap-2">
                                  {skill.linkedProjectIds.map(projectId => {
                                    const project = data.projects.find(p => p.id === projectId);
                                    if (!project) return null;
                                    return (
                                      <Link key={project.id} href={`/projects/${project.slug}`}>
                                        <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                                          {project.title}
                                        </Badge>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}