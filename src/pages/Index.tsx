import { Play, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import kyureusLogo from "@/assets/kyureeus-logo-home.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <img src={kyureusLogo} alt="Kyureeus Logo" className="h-24" />
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground">
              Unlocking the Power of Cyber Awareness
            </h1>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="cyber-glow">
                <Link to="/login">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/admin-login">Admin Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-center transition-all hover:border-primary">
            <Play className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Video Learning</h3>
            <p className="text-muted-foreground">
              Stream high-quality cybersecurity training videos anytime, anywhere
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center transition-all hover:border-accent">
            <Award className="mx-auto mb-4 h-12 w-12 text-accent" />
            <h3 className="mb-2 text-xl font-semibold">Interactive Quizzes</h3>
            <p className="text-muted-foreground">
              Test your knowledge with quizzes after each video to reinforce learning
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center transition-all hover:border-primary">
            <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Team Management</h3>
            <p className="text-muted-foreground">
              Track progress and assign content to teams with admin controls
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
