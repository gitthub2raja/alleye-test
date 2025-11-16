import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Role, Profile, Organization } from "./types";
import { GoogleIcon, AzureIcon, OktaIcon } from "./constants";
import Card from "./components/common/Card";
import Button from "./components/common/Button";
import { supabase } from "./lib/supabaseClient";
import type { Session, Provider, User as SupabaseAuthUser } from "@supabase/supabase-js";

// Lazy load dashboards
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const LeadDashboard = lazy(() => import("./pages/lead/LeadDashboard"));
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const CisoDashboard = lazy(() => import("./pages/ciso/CisoDashboard"));

type Theme = "light" | "dark";

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [theme, setTheme] = useState<Theme>("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // -------------------------------------------
  // FETCH USER PROFILE
  // -------------------------------------------
  const fetchUserData = async (user: SupabaseAuthUser) => {
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Create missing profile
    if (profileError && profileError.code === "PGRST116") {
      const email = user.email!;
      const name =
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        email.split("@")[0];

      const company = email.endsWith("@lms.com") ? "LMS Corp" : "Personal Account";

      const newUser = {
        id: user.id,
        name,
        email,
        role: Role.USER,
        company,
        team: "General",
        avatar_url:
          user.user_metadata.avatar_url ||
          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
            name
          )}`,
        points: 0,
        badges: [],
        progress: {},
      };

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(newUser)
        .select()
        .single();

      if (insertError) throw insertError;

      profile = newProfile;
    }

    if (profile) {
      setCurrentUser(profile);

      if (profile.role === Role.ADMIN) {
        const { data } = await supabase.from("organizations").select("*");
        setOrganizations(data || []);
      } else if (profile.organization_id) {
        const { data } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profile.organization_id)
          .single();
        setOrganizations(data ? [data] : []);
      }
    }
  };

  // -------------------------------------------
  // CHROME/BRAVE FIX → RETRY RESTORE SESSION
  // -------------------------------------------
  async function tryRestoreSession() {
    for (let i = 0; i < 5; i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("✅ Session restored on retry:", i);
        setSession(session);
        await fetchUserData(session.user);
        setLoading(false);
        return;
      }
      console.log("Retrying session restore…", i);
      await new Promise((res) => setTimeout(res, 200));
    }

    console.warn("No session after retries → clearing sb- keys");

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    });

    setLoading(false);
  }

  // -------------------------------------------
  // MAIN AUTH HOOK
  // -------------------------------------------
  useEffect(() => {
    tryRestoreSession();

    const { data: { subscription }} = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setSession(session);
          await fetchUserData(session.user);
        } else {
          setSession(null);
          setCurrentUser(null);
          setOrganizations([]);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // -------------------------------------------
  // LOGOUT FIX
  // -------------------------------------------
  const handleLogout = async () => {
    console.log("Logging out…");

    await supabase.auth.signOut().catch(console.error);

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) localStorage.removeItem(key);
    });

    setSession(null);
    setCurrentUser(null);
    setOrganizations([]);

    window.location.href = "/";
  };

  // -------------------------------------------
  // SELECT DASHBOARD
  // -------------------------------------------
  const Dashboard = useMemo(() => {
    if (!currentUser) return null;

    const props: any = {
      currentUser,
      onLogout: handleLogout,
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
    };

    const org = organizations.find((o) => o.id === currentUser.organization_id);

    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard {...props} />;
      case Role.CISO:
        return <CisoDashboard {...props} organization={org} />;
      case Role.LEAD:
        return <LeadDashboard {...props} organization={org} />;
      case Role.USER:
        return <UserDashboard {...props} organization={org} />;
      default:
        return <div>Invalid role</div>;
    }
  }, [currentUser, organizations, theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main">
      {currentUser && session ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              Loading Dashboard…
            </div>
          }
        >
          <main>{Dashboard}</main>
        </Suspense>
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

//
// -------------------------------------------------------------
// LOGIN SCREEN
// -------------------------------------------------------------
//
const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const role = Role.USER;
      const company = "Personal Account";

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            company,
            points: 0,
            badges: [],
            team: "General",
            avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
              name
            )}`,
            progress: {},
          },
        },
      });

      if (error) alert(error.message);
      else alert("Sign up successful! Check your email to verify your account.");

      setIsSignUp(false);
      setName("");
      setEmail("");
      setPassword("");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }

    setLoading(false);
  };

  const handleAuthProviderClick = async (provider: Provider) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { skipBrowserRedirect: true },
    });

    if (error) {
      alert(error.message);
    } else if (data.url) {
      window.open(data.url, "_top");
    }

    setLoading(false);
  };

  const inputBase = "w-full bg-sidebar-accent border border-border rounded-lg py-3 pl-11 pr-4";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl glass-card animate-fade-in z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{isSignUp ? "Create Account" : "ALL EYE"}</h1>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-6 mb-6">
          {isSignUp && (
            <input
              type="text"
              autoComplete="name"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputBase}
              placeholder="Full Name"
            />
          )}

          <input
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="Email"
          />

          <input
            type="password"
            autoComplete="current-password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputBase}
            placeholder="Password"
          />

          <Button type="submit" className="w-full !py-3" disabled={loading}>
            {loading ? "Processing…" : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="text-sm text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-primary"
          >
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </button>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-border"></div>
          <span className="mx-4 text-xs uppercase text-text-secondary">
            Or continue with
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleAuthProviderClick("google" as Provider)}
            className="w-full py-2.5 bg-sidebar-accent border border-border rounded-md"
          >
            Google Workspace
          </button>

          <button
            onClick={() => handleAuthProviderClick("azure" as Provider)}
            className="w-full py-2.5 bg-sidebar-accent border border-border rounded-md"
          >
            Azure AD
          </button>
        </div>
      </Card>
    </div>
  );
};

export default App;
