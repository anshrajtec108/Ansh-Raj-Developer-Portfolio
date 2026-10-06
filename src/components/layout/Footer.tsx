import { usePortfolio } from "../../contexts/PortfolioContext";
import { Link } from "wouter";
import { GitBranch, Link as LinkIcon, Mail } from "lucide-react";

export function Footer() {
  const { data } = usePortfolio();
  
  return (
    <footer className="bg-card border-t border-border py-12 mt-20">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            {data.profile.name}
            <span className="text-primary">.</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
            {data.profile.headline}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <a
            href={data.profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitBranch className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href={data.profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LinkIcon className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href={`mailto:${data.profile.email}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </a>
        </div>
        
        <div className="text-sm text-muted-foreground flex flex-col items-center md:items-end gap-2">
          <p>© {new Date().getFullYear()} {data.profile.name}. All rights reserved.</p>
          <Link href="/admin/login" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
