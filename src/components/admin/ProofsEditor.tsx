import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, ExternalLink, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Proof, ProofType } from "@/types";
import { MultiSelect } from "@/components/ui/multi-select";
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

const PROOF_TYPES: {value: ProofType, label: string}[] = [
  {value: 'document', label: 'Document'},
  {value: 'certificate', label: 'Certificate'},
  {value: 'code', label: 'Code Snippet'},
  {value: 'screenshot', label: 'Screenshot'},
  {value: 'link', label: 'External Link'},
  {value: 'video', label: 'Video'},
  {value: 'article', label: 'Article'},
];

export function ProofsEditor() {
  const { data, updateData } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProof, setEditingProof] = useState<Proof | null>(null);

  const defaultProof: Proof = {
    id: "",
    title: "",
    slug: "",
    type: "document",
    shortDescription: "",
    description: "",
    tags: [],
    date: "",
    linkedProjectIds: []
  };

  const [formData, setFormData] = useState<Proof>(defaultProof);

  const handleOpen = (proof?: Proof) => {
    if (proof) {
      setFormData(proof);
      setEditingProof(proof);
    } else {
      setFormData({ ...defaultProof, id: `prf_${Date.now()}` });
      setEditingProof(null);
    }
    setIsOpen(true);
  };

  const handleTitleChange = (val: string) => {
    if (!editingProof) {
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
    
    const proofs = data.proofs || [];
    if (!editingProof && proofs.some(p => p.slug === formData.slug)) {
      toast({ title: "Validation Error", description: "Slug must be unique.", variant: "destructive" });
      return;
    }

    let newProofs = [...proofs];
    if (editingProof) {
      newProofs = newProofs.map(p => p.id === formData.id ? formData : p);
    } else {
      newProofs.push(formData);
    }

    updateData({ ...data, proofs: newProofs });
    setIsOpen(false);
    toast({ title: "Proof saved successfully" });
  };

  const handleDelete = (id: string) => {
    const proofs = data.proofs || [];
    updateData({ ...data, proofs: proofs.filter(p => p.id !== id) });
    toast({ title: "Proof deleted" });
  };

  const projectOptions = data.projects.map(p => ({ label: p.title, value: p.id }));
  const proofs = data.proofs || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => handleOpen()}><Plus className="mr-2 h-4 w-4" /> Add Proof</Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[700px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingProof ? "Edit Proof" : "Add Proof"}</SheetTitle>
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val: ProofType) => setFormData({...formData, type: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROOF_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} placeholder="e.g. 2024-03" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label>Long Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
            </div>

            {/* Conditional fields based on type */}
            {(formData.type === 'certificate' || formData.type === 'screenshot' || formData.type === 'document' || formData.type === 'article') && (
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="Preview image or screenshot" />
              </div>
            )}

            {(formData.type === 'certificate' || formData.type === 'document') && (
              <div className="space-y-2">
                <Label>Issuer / Source</Label>
                <Input value={formData.issuer || ''} onChange={e => setFormData({...formData, issuer: e.target.value})} />
              </div>
            )}

            {formData.type === 'document' && (
              <div className="space-y-2">
                <Label>Document URL</Label>
                <Input value={formData.documentUrl || ''} onChange={e => setFormData({...formData, documentUrl: e.target.value})} placeholder="Link to PDF or Docs" />
              </div>
            )}

            {formData.type === 'video' && (
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input value={formData.videoUrl || ''} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="YouTube or Vimeo URL" />
              </div>
            )}

            {(formData.type === 'link' || formData.type === 'article') && (
              <div className="space-y-2">
                <Label>External URL</Label>
                <Input value={formData.externalUrl || ''} onChange={e => setFormData({...formData, externalUrl: e.target.value})} placeholder="Link to live demo, article, etc." />
              </div>
            )}

            {formData.type === 'code' && (
              <>
                <div className="space-y-2">
                  <Label>Code Language</Label>
                  <Input value={formData.codeLanguage || ''} onChange={e => setFormData({...formData, codeLanguage: e.target.value})} placeholder="e.g. typescript, python" />
                </div>
                <div className="space-y-2">
                  <Label>Code Snippet</Label>
                  <Textarea value={formData.codeSnippet || ''} onChange={e => setFormData({...formData, codeSnippet: e.target.value})} rows={8} className="font-mono text-sm" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput tags={formData.tags} onChange={tags => setFormData({...formData, tags})} />
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

            <div className="pt-4 flex justify-end gap-2 pb-8">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-4">
        {proofs.map((proof) => (
          <div key={proof.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-card border border-border rounded-xl items-start sm:items-center">
            {proof.imageUrl && proof.type !== 'code' && (
              <div className="w-full sm:w-24 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
                <img src={proof.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{proof.title}</h3>
                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full uppercase">{proof.type}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">{proof.shortDescription}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
              <Button asChild variant="outline" size="sm">
                <Link href={`/proofs/${proof.slug}`}>
                  <ExternalLink className="mr-2 h-4 w-4" /> View
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleOpen(proof)}>
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
                    <AlertDialogTitle>Delete {proof.title}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(proof.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
      
      {proofs.length === 0 && (
        <div className="text-center p-12 bg-card border border-dashed rounded-xl text-muted-foreground">
          No proofs added yet.
        </div>
      )}
    </div>
  );
}