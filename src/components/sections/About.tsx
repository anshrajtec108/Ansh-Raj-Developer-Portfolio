import { usePortfolio } from "../../contexts/PortfolioContext";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Calendar } from "lucide-react";

export function About() {
  const { data } = usePortfolio();

  return (
    <section id="about" className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-border flex-1" />
            <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-primary">About Me</h2>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid md:grid-cols-[2fr_1fr] gap-12 items-start">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-foreground">
                Engineering with purpose.
              </h3>
              <div className="prose dark:prose-invert prose-lg text-muted-foreground">
                <p>{data.profile.summary}</p>
                <p>
                  I approach development as a craft. It's not just about making things work, but making them work beautifully, securely, and reliably at scale. My focus is on creating intuitive user experiences backed by robust, scalable architectures.
                </p>
              </div>
            </div>
            
            <div className="bg-background border border-border p-6 rounded-2xl shadow-sm space-y-6">
              <h4 className="font-semibold text-foreground uppercase tracking-wider text-sm border-b border-border pb-4">
                Details
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Location</p>
                    <p className="text-muted-foreground text-sm">{data.profile.location}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Email</p>
                    <a href={`mailto:${data.profile.email}`} className="text-muted-foreground hover:text-primary transition-colors text-sm break-all">
                      {data.profile.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Phone</p>
                    <p className="text-muted-foreground text-sm">{data.profile.phone}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
