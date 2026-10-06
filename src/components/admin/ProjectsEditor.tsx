import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, ExternalLink, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Project } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from "wouter";

function TagInput({ tags, onChange, placeholder }: { tags: string[], onChange: (tags: string[]) => void, placeholder?: string }) {
  const [val, setVal] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && val.trim()) {
      e.preventDefault();
      if (!tags.includes(val.trim())) {
        onChange([...tags, val.trim()]);
      }
      setVal("");
    }
  };
  const remove = (t: string) => onChange(tags.filter(tag => tag !== t));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm">
            {t}
            <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => remove(t)} />
          </span>
        ))}
      </div>
      <Input 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        onKeyDown={handleKeyDown} 
        placeholder={placeholder || "Type and press Enter"} 
      />
    </div>
  );
}

export function ProjectsEditor() {
  const { data, updateData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const defaultProject: Project = {
    id: "",
    title: "",
    slug: "",
    shortDescription: "",
    longOverview: "",
    problem: "",
    solution: "",
    techStack: [],
    keyFeatures: [],
    securityFeatures: [],
    screenshotUrls: [],
    challenges: "",
    learnings: "",
    thumbnailUrl: "",
    featured: false
  };

  const [formData, setFormData] = useState<Project>(defaultProject);

  const handleOpen = (project?: Project) => {
    if (project) {
      setFormData(project);
      setEditingProject(project);
    } else {
      setFormData({ ...defaultProject, id: `p_${Date.now()}` });
      setEditingProject(null);
    }
    setIsOpen(true);
  };

  const handleTitleChange = (val: string) => {
    if (!editingProject) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData({ ...formData, title: val, slug });
    } else {
      setFormData({ ...formData, title: val });
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.slug) {
      toast({ title: "Validation Error", description: "Title and slug are required.", variant: "destructive" });
      return;
    }
    
    if (!editingProject && data.projects.some(p => p.slug === formData.slug)) {
      toast({ title: "Validation Error", description: "Slug must be unique.", variant: "destructive" });
      return;
    }

    let newProjects = [...data.projects];
    if (editingProject) {
      newProjects = newProjects.map(p => p.id === formData.id ? formData : p);
    } else {
      newProjects.push(formData);
    }

    updateData({ ...data, projects: newProjects });
    setIsOpen(false);
    toast({ title: "Project saved successfully" });
  };

  const handleDelete = (id: string) => {
    updateData({ ...data, projects: data.projects.filter(p => p.id !== id) });
    toast({ title: "Project deleted" });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[700px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingProject ? "Edit Project" : "Add Project"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => handleTitleChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Long Overview</Label>
              <Textarea value={formData.longOverview} onChange={e => setFormData({...formData, longOverview: e.target.value})} rows={3} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Problem</Label>
                <Textarea value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Solution</Label>
                <Textarea value={formData.solution} onChange={e => setFormData({...formData, solution: e.target.value})} rows={3} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Challenges</Label>
                <Textarea value={formData.challenges} onChange={e => setFormData({...formData, challenges: e.target.value})} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Learnings</Label>
                <Textarea value={formData.learnings} onChange={e => setFormData({...formData, learnings: e.target.value})} rows={3} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tech Stack</Label>
              <TagInput tags={formData.techStack} onChange={tags => setFormData({...formData, techStack: tags})} />
            </div>

            <div className="space-y-2">
              <Label>Key Features</Label>
              <TagInput tags={formData.keyFeatures} onChange={tags => setFormData({...formData, keyFeatures: tags})} />
            </div>

            <div className="space-y-2">
              <Label>Security Features</Label>
              <TagInput tags={formData.securityFeatures} onChange={tags => setFormData({...formData, securityFeatures: tags})} />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL</Label>
              <Input value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Screenshot URLs</Label>
              <TagInput tags={formData.screenshotUrls} onChange={tags => setFormData({...formData, screenshotUrls: tags})} placeholder="Add URL and press Enter" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GitHub URL (Optional)</Label>
                <Input value={formData.githubUrl || ''} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Live URL (Optional)</Label>
                <Input value={formData.liveUrl || ''} onChange={e => setFormData({...formData, liveUrl: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={formData.featured} onCheckedChange={c => setFormData({...formData, featured: c})} id="featured" />
              <Label htmlFor="featured">Featured (Show on Home Page)</Label>
            </div>

            <div className="pt-4 flex justify-end gap-2 pb-8">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-4">
        {data.projects.map((project) => (
          <div key={project.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-card border border-border rounded-xl items-start sm:items-center">
            {project.thumbnailUrl && (
              <div className="w-full sm:w-24 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
                <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{project.title}</h3>
                {project.featured && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Featured</span>}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">{project.shortDescription}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
              <Button asChild variant="outline" size="sm">
                <Link href={`/projects/${project.slug}`}>
                  <ExternalLink className="mr-2 h-4 w-4" /> View
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleOpen(project)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {project.title}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      
      {data.projects.length === 0 && (
        <div className="text-center p-12 bg-card border border-dashed rounded-xl text-muted-foreground">
          No projects added yet.
        </div>
      )}
    </div>
  );
}