import { usePortfolio } from "../../contexts/PortfolioContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "../ui/badge";
import { ArrowRight } from "lucide-react";

export function Projects() {
  const { data } = usePortfolio();
  const featuredProjects = data.projects.filter(p => p.featured);

  if (featuredProjects.length === 0) return null;

  return (
    <section id="projects" className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-primary">Featured Work</h2>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="flex flex-col gap-16">
            {featuredProjects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col md:flex-row gap-8 items-center"
              >
                <div className={`w-full md:w-1/2 aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-sm ${index % 2 !== 0 ? 'md:order-last' : ''}`}>
                  <Link href={`/projects/${project.slug}`}>
                    <div className="w-full h-full relative cursor-pointer">
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 z-10" />
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                  </Link>
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <h3 className="text-3xl font-bold text-foreground">
                    <Link href={`/projects/${project.slug}`} className="hover:text-primary transition-colors">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {project.shortDescription}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.techStack.slice(0, 4).map(tech => (
                      <Badge key={tech} variant="outline" className="bg-background">
                        {tech}
                      </Badge>
                    ))}
                    {project.techStack.length > 4 && (
                      <Badge variant="outline" className="bg-background text-muted-foreground">
                        +{project.techStack.length - 4}
                      </Badge>
                    )}
                  </div>
                  
                  <Link href={`/projects/${project.slug}`} className="inline-flex items-center text-primary font-medium mt-4 hover:underline underline-offset-4">
                    Read Case Study <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
