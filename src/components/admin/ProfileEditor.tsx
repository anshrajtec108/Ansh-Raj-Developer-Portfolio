import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export function ProfileEditor() {
  const { data, updateData } = usePortfolio();
  const { toast } = useToast();
  const [profile, setProfile] = useState(data.profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateData({ ...data, profile });
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-8">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={profile.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input id="headline" name="headline" value={profile.headline} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" rows={5} value={profile.summary} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" value={profile.location} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={profile.email} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" name="linkedin" value={profile.linkedin} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input id="github" name="github" value={profile.github} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resumeUrl">Resume URL</Label>
            <Input id="resumeUrl" name="resumeUrl" value={profile.resumeUrl} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profilePhotoUrl">Profile Photo URL</Label>
          <Input id="profilePhotoUrl" name="profilePhotoUrl" value={profile.profilePhotoUrl} onChange={handleChange} />
        </div>

        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" /> Save Profile
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Preview</h3>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="aspect-square w-32 rounded-full overflow-hidden mb-4 border border-border mx-auto">
            <img src={profile.profilePhotoUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h4 className="text-xl font-bold text-center mb-1">{profile.name || 'Your Name'}</h4>
          <p className="text-sm text-primary text-center font-medium mb-4">{profile.headline || 'Your Headline'}</p>
          <p className="text-sm text-muted-foreground text-center line-clamp-4">{profile.summary || 'Your Summary'}</p>
        </div>
      </div>
    </div>
  );
}