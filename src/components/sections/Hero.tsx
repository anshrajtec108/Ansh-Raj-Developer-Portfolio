import { usePortfolio } from "../../contexts/PortfolioContext";
import { Button } from "../ui/button";
import { ArrowRight, GitBranch, Link, Mail } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const { data } = usePortfolio();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 mix-blend-overlay pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Available for new opportunities
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Hi, I'm {data.profile.name.split(" ")[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Software Engineer
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            {data.profile.headline}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Button asChild size="lg" className="h-12 px-8 rounded-full">
              <a href="#projects">
                View Work <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <div className="flex items-center gap-3 ml-2">
              <a href={data.profile.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-card border border-border rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors">
                <GitBranch className="h-5 w-5" />
              </a>
              <a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-card border border-border rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors">
                <Link className="h-5 w-5" />
              </a>
              <a href={`mailto:${data.profile.email}`} className="p-3 bg-card border border-border rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto lg:ml-auto w-full max-w-md aspect-square"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] transform rotate-3" />
          <div className="absolute inset-0 bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <img 
              src={data.profile.profilePhotoUrl} 
              alt={data.profile.name} 
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
