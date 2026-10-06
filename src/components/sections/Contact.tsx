import { usePortfolio } from "../../contexts/PortfolioContext";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Mail, ArrowRight } from "lucide-react";

export function Contact() {
  const { data } = usePortfolio();

  return (
    <section id="contact" className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Let's build something together.</h2>
          <p className="text-primary-foreground/80 text-lg">
            I'm currently available for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 rounded-full text-primary font-bold">
              <a href={`mailto:${data.profile.email}`}>
                Say Hello <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
