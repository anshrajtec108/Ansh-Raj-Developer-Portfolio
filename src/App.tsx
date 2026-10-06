import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

import Home from "@/pages/Home";
import ProjectDetail from "@/pages/ProjectDetail";
import ProofDetail from "@/pages/ProofDetail";
import NoteDetail from "@/pages/NoteDetail";
import CertificationDetail from "@/pages/CertificationDetail";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects/:slug" component={ProjectDetail} />
      <Route path="/proofs/:slug" component={ProofDetail} />
      <Route path="/notes/:slug" component={NoteDetail} />
      <Route path="/certifications/:slug" component={CertificationDetail} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PortfolioProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;