import { useEffect, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface AuthWrapperProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const AuthWrapper = ({ children, requireAdmin = false }: AuthWrapperProps) => {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole(user?.id);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!session || !user) {
      navigate('/login');
      return;
    }

    // If admin required, check role from database
    if (requireAdmin && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setChecking(false);
  }, [session, user, userRole, requireAdmin, authLoading, roleLoading, navigate]);

  // Show nothing while checking auth
  if (authLoading || roleLoading || checking) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper;
