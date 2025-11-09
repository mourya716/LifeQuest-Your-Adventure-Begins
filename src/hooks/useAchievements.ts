import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description: string | null;
  unlocked_at: string;
}

export const useAchievements = (userId: string | undefined) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAchievements = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();

    // Subscribe to achievement changes
    const channel = supabase
      .channel("achievement-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "achievements",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newAchievement = payload.new as Achievement;
          setAchievements((prev) => [newAchievement, ...prev]);
          
          // Show achievement notification
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${newAchievement.achievement_name}: ${newAchievement.achievement_description}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { achievements, loading, refetch: fetchAchievements };
};
