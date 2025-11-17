import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { loginSchema } from "@/lib/authSchemas";
import kyureusLogo from "@/assets/kyureeus-logo-login.jpeg";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      const validated = loginSchema.parse({ email, password });
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;

      if (data.session) {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (roleData?.role === 'admin') {
          toast({
            title: "Admin access granted",
            description: "Welcome to the admin panel",
          });
          navigate("/admin", { replace: true });
        } else {
          // Not an admin, sign them out
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: "This portal is for administrators only",
            variant: "destructive",
          });
          navigate("/admin-login", { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials or access denied",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
      <Card className="w-full max-w-md border-accent/20">
        <CardHeader className="text-center">
          <img src={kyureusLogo} alt="Kyureeus Logo" className="mx-auto mb-4 h-20" />
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>Administrative access only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" variant="default" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Admin Panel'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Administrator credentials required
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
