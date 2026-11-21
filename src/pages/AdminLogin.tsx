import { useState } from "react";
import { useLocation } from "wouter";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast({
        title: "Access granted",
        description: "Welcome to the admin dashboard.",
      });
      setLocation("/admin");
    } else {
      toast({
        title: "Access denied",
        description: "Invalid password.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 mix-blend-overlay pointer-events-none" />
      </div>

      <Card className="w-full max-w-md border-border shadow-2xl bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Admin Area</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enter password to access the content manager.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background border-border"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 font-medium text-md">
              Unlock Dashboard
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center pt-4">
          <Button variant="link" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-primary">
            &larr; Back to Portfolio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
