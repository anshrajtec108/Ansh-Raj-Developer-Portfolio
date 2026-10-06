import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EngineeringNote, ApproachOption } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export function NotesEditor() {
  const { data, updateData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<EngineeringNote | null>(null);

  const defaultNote: EngineeringNote = {
    id: "",
    slug: "",
    title: "",
    summary: "",
    highlight: "",
    tags: [],
    thoughtProcess: "",
    approaches: [],
    finalApproach: "",
    tradeoffs: "",
    architectureNotes: "",
    realWorldApplicability: "",
    conclusion: "",
    visible: true,
    order: (data.engineeringNotes?.length || 0) + 1
  };

  const [formData, setFormData] = useState<EngineeringNote>(defaultNote);
  const [tagInput, setTagInput] = useState("");

  const handleOpen = (note?: EngineeringNote) => {
    if (note) {
      setFormData(note);
      setEditingNote(note);
    } else {
      setFormData({ ...defaultNote, id: `en_${Date.now()}`, order: (data.engineeringNotes?.length || 0) + 1 });
      setEditingNote(null);
    }
    setTagInput("");
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.summary) {
      toast({ title: "Validation Error", description: "Title and summary are required.", variant: "destructive" });
      return;
    }
    if (formData.approaches.length === 0) {
      toast({ title: "Validation Error", description: "At least one approach is required.", variant: "destructive" });
      return;
    }

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const noteToSave = { ...formData, slug };

    let newNotes = [...(data.engineeringNotes || [])];
    if (editingNote) {
      newNotes = newNotes.map(n => n.id === formData.id ? noteToSave : n);
    } else {
      newNotes.push(noteToSave);
    }

    updateData({ ...data, engineeringNotes: newNotes });
    setIsOpen(false);
    toast({ title: "Engineering note saved" });
  };

  const handleDelete = (id: string) => {
    updateData({ ...data, engineeringNotes: (data.engineeringNotes || []).filter(n => n.id !== id) });
    toast({ title: "Engineering note deleted" });
  };

  const toggleVisibility = (id: string, visible: boolean) => {
    const newNotes = (data.engineeringNotes || []).map(n => n.id === id ? { ...n, visible } : n);
    updateData({ ...data, engineeringNotes: newNotes });
  };

  const reorderNote = (id: string, direction: 'up' | 'down') => {
    const notes = [...(data.engineeringNotes || [])].sort((a, b) => a.order - b.order);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      const temp = notes[index].order;
      notes[index].order = notes[index - 1].order;
      notes[index - 1].order = temp;
    } else if (direction === 'down' && index < notes.length - 1) {
      const temp = notes[index].order;
      notes[index].order = notes[index + 1].order;
      notes[index + 1].order = temp;
    }
    updateData({ ...data, engineeringNotes: notes });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addApproach = () => {
    const newApproach: ApproachOption = {
      id: `app_${Date.now()}`,
      title: "New Approach",
      description: "",
      pros: [],
      cons: []
    };
    setFormData({ ...formData, approaches: [...formData.approaches, newApproach] });
  };

  const updateApproach = (id: string, field: keyof ApproachOption, value: any) => {
    setFormData({
      ...formData,
      approaches: formData.approaches.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const removeApproach = (id: string) => {
    setFormData({ ...formData, approaches: formData.approaches.filter(a => a.id !== id) });
  };

  const handleApproachItemAdd = (appId: string, field: 'pros' | 'cons', value: string, setValueFn: (v: string) => void) => {
    if (!value.trim()) return;
    const approach = formData.approaches.find(a => a.id === appId);
    if (approach && !approach[field].includes(value.trim())) {
      updateApproach(appId, field, [...approach[field], value.trim()]);
      setValueFn("");
    }
  };

  const handleApproachItemRemove = (appId: string, field: 'pros' | 'cons', value: string) => {
    const approach = formData.approaches.find(a => a.id === appId);
    if (approach) {
      updateApproach(appId, field, approach[field].filter(item => item !== value));
    }
  };

  const sortedNotes = [...(data.engineeringNotes || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" /> Add Note</Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto border-l border-border">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingNote ? "Edit Note" : "Add Engineering Note"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 pb-20">
            <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card">
              <Label className="flex-1 cursor-pointer" htmlFor="visible-toggle">Publish on homepage</Label>
              <Switch id="visible-toggle" checked={formData.visible} onCheckedChange={c => setFormData({...formData, visible: c})} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Distributed Caching..." />
              </div>
              <div className="space-y-2">
                <Label>Slug (auto-generated if empty)</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. distributed-caching" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="e.g. Backend..." 
                />
                <Button type="button" onClick={addTag} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag} <Trash2 className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary (Card Teaser)</Label>
              <Textarea 
                value={formData.summary} 
                onChange={e => setFormData({...formData, summary: e.target.value})} 
                rows={2}
                placeholder="2-3 line summary shown on the homepage card..."
              />
            </div>

            <div className="space-y-2">
              <Label>Highlight (Problem Statement)</Label>
              <Textarea 
                value={formData.highlight} 
                onChange={e => setFormData({...formData, highlight: e.target.value})} 
                rows={3}
                placeholder="The bold insight or main problem statement..."
              />
            </div>

            <div className="space-y-2">
              <Label>My Thought Process</Label>
              <Textarea 
                value={formData.thoughtProcess} 
                onChange={e => setFormData({...formData, thoughtProcess: e.target.value})} 
                rows={6}
                placeholder="How I approached this engineering problem..."
              />
            </div>

            {/* Approaches Section */}
            <div className="border-t border-border pt-6 mt-8">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-bold">Approaches Considered</Label>
                <Button size="sm" variant="outline" onClick={addApproach}><Plus className="mr-2 h-4 w-4" /> Add Approach</Button>
              </div>
              
              <div className="space-y-6">
                {formData.approaches.map((app, idx) => {
                  return (
                    <ApproachEditor 
                      key={app.id} 
                      approach={app} 
                      idx={idx} 
                      onUpdate={(f, v) => updateApproach(app.id, f, v)} 
                      onRemove={() => removeApproach(app.id)} 
                      onItemAdd={(f, v, s) => handleApproachItemAdd(app.id, f, v, s)}
                      onItemRemove={(f, v) => handleApproachItemRemove(app.id, f, v)}
                    />
                  );
                })}
                {formData.approaches.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Add at least one approach.</p>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-8 space-y-6">
              <div className="space-y-2">
                <Label>Final Chosen Approach</Label>
                <Textarea 
                  value={formData.finalApproach} 
                  onChange={e => setFormData({...formData, finalApproach: e.target.value})} 
                  rows={4}
                  placeholder="Which approach won and why..."
                />
              </div>

              <div className="space-y-2">
                <Label>Trade-offs</Label>
                <Textarea 
                  value={formData.tradeoffs} 
                  onChange={e => setFormData({...formData, tradeoffs: e.target.value})} 
                  rows={4}
                  placeholder="Analysis of trade-offs made..."
                />
              </div>

              <div className="space-y-2">
                <Label>Architecture Notes (Optional)</Label>
                <Textarea 
                  value={formData.architectureNotes || ''} 
                  onChange={e => setFormData({...formData, architectureNotes: e.target.value})} 
                  rows={4}
                  placeholder="Text description of the architecture..."
                />
              </div>

              <div className="space-y-2">
                <Label>Real-World Applicability</Label>
                <Textarea 
                  value={formData.realWorldApplicability} 
                  onChange={e => setFormData({...formData, realWorldApplicability: e.target.value})} 
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Conclusion / Learning</Label>
                <Textarea 
                  value={formData.conclusion} 
                  onChange={e => setFormData({...formData, conclusion: e.target.value})} 
                  rows={3}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-border mt-8">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Note</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-1 gap-4">
        {sortedNotes.map((note) => (
          <div key={note.id} className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${note.visible ? 'bg-card border-border' : 'bg-muted/50 border-dashed'}`}>
            <div className="flex flex-col gap-1 shrink-0 text-muted-foreground">
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-foreground" onClick={() => reorderNote(note.id, 'up')}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-foreground" onClick={() => reorderNote(note.id, 'down')}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground truncate">{note.title}</h3>
                {!note.visible && <Badge variant="secondary" className="text-[10px] h-5">Hidden</Badge>}
              </div>
              <div className="flex gap-1 overflow-hidden">
                {note.tags.slice(0, 3).map(t => <span key={t} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{t}</span>)}
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Switch checked={note.visible} onCheckedChange={(v) => toggleVisibility(note.id, v)} />
              </div>
              <div className="w-px h-8 bg-border" />
              <Button variant="ghost" size="icon" onClick={() => handleOpen(note)} className="h-8 w-8">
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
                    <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      
      {(!data.engineeringNotes || data.engineeringNotes.length === 0) && (
        <div className="text-center p-12 bg-card border border-dashed rounded-xl text-muted-foreground">
          No engineering notes yet — share how you think.
        </div>
      )}
    </div>
  );
}

// Sub-component for editing an approach
function ApproachEditor({ 
  approach, 
  idx, 
  onUpdate, 
  onRemove,
  onItemAdd,
  onItemRemove 
}: { 
  approach: ApproachOption; 
  idx: number; 
  onUpdate: (field: keyof ApproachOption, value: any) => void;
  onRemove: () => void;
  onItemAdd: (field: 'pros' | 'cons', value: string, setVal: (v: string) => void) => void;
  onItemRemove: (field: 'pros' | 'cons', value: string) => void;
}) {
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");

  return (
    <div className="p-4 border border-border rounded-xl bg-muted/30 relative space-y-4">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove}>
        <Trash2 className="h-3 w-3" />
      </Button>
      
      <div className="space-y-2 pr-8">
        <Label>Approach {idx + 1} Title</Label>
        <Input value={approach.title} onChange={e => onUpdate('title', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={approach.description} onChange={e => onUpdate('description', e.target.value)} rows={2} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-emerald-600 dark:text-emerald-500">Pros</Label>
          <div className="flex gap-2">
            <Input 
              value={proInput} 
              onChange={e => setProInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onItemAdd('pros', proInput, setProInput))}
              placeholder="Add pro..." 
              className="h-8 text-sm"
            />
            <Button type="button" size="sm" variant="secondary" onClick={() => onItemAdd('pros', proInput, setProInput)}>Add</Button>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {approach.pros.map(pro => (
              <div key={pro} className="flex items-center justify-between text-sm bg-background border border-border px-2 py-1 rounded">
                <span className="truncate">{pro}</span>
                <Trash2 className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => onItemRemove('pros', pro)} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-600 dark:text-amber-500">Cons</Label>
          <div className="flex gap-2">
            <Input 
              value={conInput} 
              onChange={e => setConInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onItemAdd('cons', conInput, setConInput))}
              placeholder="Add con..." 
              className="h-8 text-sm"
            />
            <Button type="button" size="sm" variant="secondary" onClick={() => onItemAdd('cons', conInput, setConInput)}>Add</Button>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {approach.cons.map(con => (
              <div key={con} className="flex items-center justify-between text-sm bg-background border border-border px-2 py-1 rounded">
                <span className="truncate">{con}</span>
                <Trash2 className="h-3 w-3 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => onItemRemove('cons', con)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}