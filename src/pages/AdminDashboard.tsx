import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { isAuthenticated, logout } from "@/lib/auth";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home, Save, Download, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportData } from "@/lib/storage";

import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { SkillsEditor } from "@/components/admin/SkillsEditor";
import { ProjectsEditor } from "@/components/admin/ProjectsEditor";
import { CertsEditor } from "@/components/admin/CertsEditor";
import { ProofsEditor } from "@/components/admin/ProofsEditor";
import { NotesEditor } from "@/components/admin/NotesEditor";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data, updateData, resetToSeed } = usePortfolio();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast({ title: "Logged out successfully" });
  };

  const handleExport = () => {
    exportData(data);
    toast({ title: "Data exported", description: "JSON file downloaded." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profile && json.skills && json.projects && json.certifications) {
          updateData(json);
          toast({ title: "Data imported successfully" });
        } else {
          throw new Error("Invalid structure");
        }
      } catch (err) {
        toast({ title: "Import failed", description: "Invalid JSON format.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleReset = () => {
    if(window.confirm("Are you sure? This will overwrite all current data with the default seed data.")) {
      resetToSeed();
      toast({ title: "Reset to defaults" });
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary p-2 rounded-lg font-bold font-mono tracking-wider text-xs border border-primary/20">
              CMS
            </div>
            <h1 className="font-bold text-foreground hidden sm:block">Portfolio Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <Home className="mr-2 h-4 w-4" /> View Site
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <div className="relative">
              <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Button variant="outline" size="sm" className="pointer-events-none">
                <Upload className="mr-2 h-4 w-4" /> Import JSON
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <AlertCircle className="mr-2 h-4 w-4" /> Reset to Defaults
          </Button>
        </div>

        {/* Editor Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 mb-8">
            <TabsList className="grid grid-cols-6 min-w-[700px] sm:min-w-[900px] w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="certs">Certifications</TabsTrigger>
              <TabsTrigger value="proofs">Proofs</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="max-w-4xl mx-auto pb-16">
            <TabsContent value="profile" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <p className="text-muted-foreground">Manage your personal information and hero section.</p>
              </div>
              <ProfileEditor />
            </TabsContent>
            
            <TabsContent value="skills" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage Skills</h2>
                <p className="text-muted-foreground">Add, edit, and link skills to your projects.</p>
              </div>
              <SkillsEditor />
            </TabsContent>
            
            <TabsContent value="projects" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage Projects</h2>
                <p className="text-muted-foreground">Create detailed case studies.</p>
              </div>
              <ProjectsEditor />
            </TabsContent>
            
            <TabsContent value="certs" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage Certifications</h2>
                <p className="text-muted-foreground">Add your latest credentials.</p>
              </div>
              <CertsEditor />
            </TabsContent>

            <TabsContent value="proofs" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage Proofs</h2>
                <p className="text-muted-foreground">Document deep dives, code snippets, and evidence.</p>
              </div>
              <ProofsEditor />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage Engineering Notes</h2>
                <p className="text-muted-foreground">Share how you think through hard problems.</p>
              </div>
              <NotesEditor />
            </TabsContent>
          </div>
        </Tabs>

      </main>
    </div>
  );
}