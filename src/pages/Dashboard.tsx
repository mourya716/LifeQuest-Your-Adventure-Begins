import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { QuestList } from "@/components/dashboard/QuestList";
import { CreateQuestDialog } from "@/components/dashboard/CreateQuestDialog";
import { AchievementsList } from "@/components/dashboard/AchievementsList";
import { useProfile } from "@/hooks/useProfile";
import { useQuests } from "@/hooks/useQuests";
import { useAchievements } from "@/hooks/useAchievements";
import { LogOut, ScrollText, Award } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { quests, loading: questsLoading, createQuest, completeQuest, deleteQuest } = useQuests(user?.id);
  const { achievements, loading: achievementsLoading } = useAchievements(user?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LifeQuest
          </h1>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <ProfileHeader profile={profile} />

        <Tabs defaultValue="quests" className="space-y-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="quests" className="gap-2">
              <ScrollText className="w-4 h-4" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Daily Quests</h2>
              <CreateQuestDialog onCreateQuest={createQuest} />
            </div>

            {questsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : (
              <QuestList quests={quests} onComplete={completeQuest} onDelete={deleteQuest} />
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <h2 className="text-2xl font-bold">Your Achievements</h2>
            {achievementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : (
              <AchievementsList achievements={achievements} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
