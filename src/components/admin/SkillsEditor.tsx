import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, MoveUp, MoveDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skill, SkillCategory } from "@/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const CATEGORIES: SkillCategory[] = ["Frontend", "Backend", "Tools & DevOps", "Future Skills"];

export function SkillsEditor() {
  const { data, updateData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const defaultSkill: Skill = {
    id: "",
    category: "Frontend",
    name: "",
    proficiency: 50,
    linkedProjectIds: [],
    linkedProofIds: [],
    notes: ""
  };

  const [formData, setFormData] = useState<Skill>(defaultSkill);

  const handleOpen = (skill?: Skill) => {
    if (skill) {
      setFormData(skill);
      setEditingSkill(skill);
    } else {
      setFormData({ ...defaultSkill, id: `s_${Date.now()}` });
      setEditingSkill(null);
    }
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }

    let newSkills = [...data.skills];
    if (editingSkill) {
      newSkills = newSkills.map(s => s.id === formData.id ? formData : s);
    } else {
      newSkills.push(formData);
    }

    updateData({ ...data, skills: newSkills });
    setIsOpen(false);
    toast({ title: "Skill saved successfully" });
  };

  const handleDelete = (id: string) => {
    updateData({ ...data, skills: data.skills.filter(s => s.id !== id) });
    toast({ title: "Skill deleted" });
  };

  const handleMove = (id: string, direction: 'up' | 'down', category: SkillCategory) => {
    const categorySkills = data.skills.filter(s => s.category === category);
    const index = categorySkills.findIndex(s => s.id === id);
    if (index < 0) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categorySkills.length - 1) return;

    const newCategorySkills = [...categorySkills];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategorySkills[index], newCategorySkills[swapIndex]] = [newCategorySkills[swapIndex], newCategorySkills[index]];

    const otherSkills = data.skills.filter(s => s.category !== category);
    updateData({ ...data, skills: [...otherSkills, ...newCategorySkills] });
  };

  const projectOptions = data.projects.map(p => ({ label: p.title, value: p.id }));
  const proofOptions = (data.proofs || []).map(p => ({ label: p.title, value: p.id }));

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(val: SkillCategory) => setFormData({...formData, category: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Proficiency ({formData.proficiency}%)</Label>
              <Slider 
                value={[formData.proficiency]} 
                min={0} max={100} step={5}
                onValueChange={(vals) => setFormData({...formData, proficiency: vals[0]})}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Linked Projects</Label>
              <MultiSelect 
                options={projectOptions} 
                selected={formData.linkedProjectIds} 
                onChange={(vals) => setFormData({...formData, linkedProjectIds: vals})} 
                placeholder="No projects available."
              />
            </div>

            <div className="space-y-2">
              <Label>Linked Proofs</Label>
              <MultiSelect 
                options={proofOptions} 
                selected={formData.linkedProofIds} 
                onChange={(vals) => setFormData({...formData, linkedProofIds: vals})}
                placeholder="No proofs available."
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {CATEGORIES.map(category => {
        const categorySkills = data.skills.filter(s => s.category === category);
        if (categorySkills.length === 0) return null;

        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">{category}</h3>
            <div className="space-y-2">
              {categorySkills.map((skill, index) => (
                <div key={skill.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                  <div className="flex-1">
                    <p className="font-bold">{skill.name}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{skill.notes}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-mono">
                      <span>Projects: {skill.linkedProjectIds.length}</span>
                      <span>Proofs: {skill.linkedProofIds.length}</span>
                      <span>Proficiency: {skill.proficiency}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleMove(skill.id, 'up', category)} disabled={index === 0}>
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleMove(skill.id, 'down', category)} disabled={index === categorySkills.length - 1}>
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(skill)}>
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
                          <AlertDialogTitle>Delete {skill.name}?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(skill.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      
      {data.skills.length === 0 && (
        <div className="text-center p-12 bg-card border border-dashed rounded-xl text-muted-foreground">
          No skills added yet.
        </div>
      )}
    </div>
  );
}