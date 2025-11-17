import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'user';

export const useUserRole = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user' as UserRole;
      }

      return data?.role as UserRole || 'user';
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
