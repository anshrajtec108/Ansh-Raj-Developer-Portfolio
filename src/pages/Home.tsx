import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { EngineeringNotes } from "@/components/sections/EngineeringNotes";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";

export default function Home() {
  const { data } = usePortfolio();

  useEffect(() => {
    document.title = `${data.profile.name} | ${data.profile.headline}`;
  }, [data.profile.name, data.profile.headline]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <EngineeringNotes />
        <About />
        <Skills />
        <Projects />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}