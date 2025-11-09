import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  coin_reward: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  quest_date: string;
}

export const useQuests = (userId: string | undefined) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuests = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("quests")
        .select("*")
        .eq("user_id", userId)
        .eq("quest_date", today)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQuests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load quests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();

    // Subscribe to quest changes
    const channel = supabase
      .channel("quest-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quests",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchQuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createQuest = async (quest: {
    title: string;
    description?: string;
    xp_reward?: number;
    coin_reward?: number;
  }) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from("quests").insert({
        user_id: userId,
        title: quest.title,
        description: quest.description || null,
        xp_reward: quest.xp_reward || 10,
        coin_reward: quest.coin_reward || 5,
        quest_date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      toast({
        title: "Quest Created!",
        description: "A new challenge awaits you",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create quest",
        variant: "destructive",
      });
    }
  };

  const completeQuest = async (questId: string, xpReward: number, coinReward: number) => {
    if (!userId) return;

    try {
      // Mark quest as completed
      const { error: questError } = await supabase
        .from("quests")
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", questId);

      if (questError) throw questError;

      // Get current profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      const newXp = profile.xp + xpReward;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newCoins = profile.coins + coinReward;

      // Update profile with new XP, level, and coins
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          xp: newXp,
          level: newLevel,
          coins: newCoins,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast({
        title: "Quest Complete! 🎉",
        description: `+${xpReward} XP, +${coinReward} coins earned!`,
      });

      // Show level up animation if leveled up
      if (newLevel > profile.level) {
        toast({
          title: `Level Up! You're now Level ${newLevel}! 🎊`,
          description: "Your power grows stronger!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to complete quest",
        variant: "destructive",
      });
    }
  };

  const deleteQuest = async (questId: string) => {
    try {
      const { error } = await supabase.from("quests").delete().eq("id", questId);

      if (error) throw error;

      toast({
        title: "Quest Removed",
        description: "Quest has been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete quest",
        variant: "destructive",
      });
    }
  };

  return { quests, loading, createQuest, completeQuest, deleteQuest, refetch: fetchQuests };
};
