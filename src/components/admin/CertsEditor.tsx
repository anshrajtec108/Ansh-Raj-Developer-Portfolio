import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, Award, Image as ImageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Certification } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";

export function CertsEditor() {
  const { data, updateData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  const defaultCert: Certification = {
    id: "",
    slug: "",
    title: "",
    issuer: "",
    date: "",
    shortDescription: "",
    thumbnailUrl: "",
    fullImageUrl: "",
    whatLearned: "",
    skillsGained: [],
    application: "",
    relatedProblems: [],
    relatedProjectIds: [],
    futureLearningPlan: "",
    verificationUrl: ""
  };

  const [formData, setFormData] = useState<Certification>(defaultCert);
  const [skillInput, setSkillInput] = useState("");
  const [problemInput, setProblemInput] = useState("");

  const handleOpen = (cert?: Certification) => {
    if (cert) {
      setFormData(cert);
      setEditingCert(cert);
    } else {
      setFormData({ ...defaultCert, id: `c_${Date.now()}` });
      setEditingCert(null);
    }
    setSkillInput("");
    setProblemInput("");
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.issuer) {
      toast({ title: "Validation Error", description: "Title and issuer are required.", variant: "destructive" });
      return;
    }

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const certToSave = { ...formData, slug };

    let newCerts = [...data.certifications];
    if (editingCert) {
      newCerts = newCerts.map(c => c.id === formData.id ? certToSave : c);
    } else {
      newCerts.push(certToSave);
    }

    updateData({ ...data, certifications: newCerts });
    setIsOpen(false);
    toast({ title: "Certification saved" });
  };

  const handleDelete = (id: string) => {
    updateData({ ...data, certifications: data.certifications.filter(c => c.id !== id) });
    toast({ title: "Certification deleted" });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillsGained.includes(skillInput.trim())) {
      setFormData({ ...formData, skillsGained: [...formData.skillsGained, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skillsGained: formData.skillsGained.filter(s => s !== skill) });
  };

  const addProblem = () => {
    if (problemInput.trim() && !formData.relatedProblems.includes(problemInput.trim())) {
      setFormData({ ...formData, relatedProblems: [...formData.relatedProblems, problemInput.trim()] });
      setProblemInput("");
    }
  };

  const removeProblem = (problem: string) => {
    setFormData({ ...formData, relatedProblems: formData.relatedProblems.filter(p => p !== problem) });
  };

  const projectOptions = data.projects.map(p => ({ label: p.title, value: p.id }));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" /> Add Certification</Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto border-l border-border">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingCert ? "Edit Certification" : "Add Certification"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 pb-20">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AWS Certified Solutions Architect" />
              </div>
              <div className="space-y-2">
                <Label>Slug (auto-generated if empty)</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. aws-solutions-architect" />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} placeholder="e.g. Amazon Web Services" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} placeholder="e.g. 2024-01" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description (Card Teaser)</Label>
              <Input value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} placeholder="1-2 line summary of the certification..." />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thumbnail URL (For Card)</Label>
                <Input value={formData.thumbnailUrl || ''} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="URL to small preview image" />
              </div>
              <div className="space-y-2">
                <Label>Full Image URL (For Detail Page)</Label>
                <Input value={formData.fullImageUrl || ''} onChange={e => setFormData({...formData, fullImageUrl: e.target.value})} placeholder="URL to high-res certificate image" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Verification URL / Proof Link</Label>
              <Input value={formData.verificationUrl || formData.proofUrl || ''} onChange={e => setFormData({...formData, verificationUrl: e.target.value, proofUrl: e.target.value})} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label>What I Learned</Label>
              <Textarea 
                value={formData.whatLearned} 
                onChange={e => setFormData({...formData, whatLearned: e.target.value})} 
                rows={5}
                placeholder="Detailed description of the curriculum, topics covered, and core learnings..."
              />
            </div>

            <div className="space-y-2">
              <Label>Skills Gained</Label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={skillInput} 
                  onChange={e => setSkillInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="e.g. React Performance..." 
                />
                <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsGained.map(skill => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
                    {skill} <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>How I Apply This</Label>
              <Textarea 
                value={formData.application} 
                onChange={e => setFormData({...formData, application: e.target.value})} 
                rows={3}
                placeholder="How this knowledge is applied in my day-to-day engineering..."
              />
            </div>

            <div className="space-y-2">
              <Label>Related Problem Statements</Label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={problemInput} 
                  onChange={e => setProblemInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addProblem())}
                  placeholder="e.g. Optimizing large React apps..." 
                />
                <Button type="button" onClick={addProblem} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.relatedProblems.map(prob => (
                  <Badge key={prob} variant="outline" className="flex items-center gap-1">
                    {prob} <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeProblem(prob)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Related Projects</Label>
              <MultiSelect
                options={projectOptions}
                selected={formData.relatedProjectIds}
                onChange={(selected) => setFormData({ ...formData, relatedProjectIds: selected })}
                placeholder="Select projects..."
              />
            </div>

            <div className="space-y-2">
              <Label>Future Learning Plan</Label>
              <Textarea 
                value={formData.futureLearningPlan} 
                onChange={e => setFormData({...formData, futureLearningPlan: e.target.value})} 
                rows={3}
                placeholder="What's next in this domain..."
              />
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-border mt-8">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Certification</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-1 gap-4">
        {data.certifications.map((cert) => (
          <div key={cert.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
            <div className="h-16 w-24 bg-muted rounded-md overflow-hidden shrink-0 flex items-center justify-center border border-border">
              {cert.thumbnailUrl ? (
                <img src={cert.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Award className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{cert.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{cert.issuer} • {cert.date}</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => handleOpen(cert)} className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {cert.title}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(cert.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      
      {data.certifications.length === 0 && (
        <div className="text-center p-12 bg-card border border-dashed rounded-xl text-muted-foreground">
          No certifications added yet.
        </div>
      )}
    </div>
  );
}