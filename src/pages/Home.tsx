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
import { MotionConfig } from "framer-motion";

export default function Home() {
  const { data } = usePortfolio();

  useEffect(() => {
    document.title = `${data.profile.name} | ${data.profile.headline}`;

    const updateScrollState = () => {
      const root = document.documentElement;
      const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(window.scrollY / maxScroll, 1);

      root.style.setProperty("--scroll-progress", ratio.toFixed(4));
      root.style.setProperty("--scroll-shift", `${window.scrollY * 0.12}px`);

      const sections = Array.from(document.querySelectorAll("main > section"));
      if (sections.length === 0) return;

      let activeSection: Element | null = sections[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const centerDistance = Math.abs(rect.top - window.innerHeight * 0.38);

        if (centerDistance < closestDistance) {
          closestDistance = centerDistance;
          activeSection = section;
        }
      });

      sections.forEach((section) => {
        section.classList.toggle("is-active", section === activeSection);
      });
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [data.profile.name, data.profile.headline]);

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="hero-global-backdrop" />
      </div>
      <Navbar />
      <MotionConfig reducedMotion="user">
        <main className="relative z-10 flex-grow">
        <Hero />
        <EngineeringNotes />
        <About />
        <Skills />
        <Projects />
        <Certifications />
        <Contact />
        </main>
      </MotionConfig>
      <Footer />
    </div>
  );
}