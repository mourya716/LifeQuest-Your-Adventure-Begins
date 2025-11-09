import { Profile } from "@/hooks/useProfile";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Coins, Flame, Trophy } from "lucide-react";

interface ProfileHeaderProps {
  profile: Profile;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const xpProgress = (profile.xp % 100);
  const xpForNextLevel = 100;

  return (
    <Card className="p-6 border-primary/30 glow-primary shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">✨ {profile.username}</h2>
          <div className="flex items-center gap-4 text-sm mb-4">
            <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-semibold">Level {profile.level}</span>
            </div>
            <div className="flex items-center gap-1 bg-gold/20 px-2 py-1 rounded-full">
              <Coins className="w-4 h-4 text-gold" />
              <span className="font-semibold">{profile.coins} coins</span>
            </div>
            <div className="flex items-center gap-1 bg-destructive/20 px-2 py-1 rounded-full">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-semibold">{profile.current_streak} 🔥</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>💫 XP Progress</span>
              <span className="text-primary font-semibold">
                {xpProgress} / {xpForNextLevel}
              </span>
            </div>
            <div className="relative">
              <Progress value={xpProgress} className="h-4" />
              <div className="absolute inset-0 h-4 xp-gradient rounded-full shadow-sm" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl border-2 border-primary/40 min-w-[120px] shadow-md glow-primary">
          <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-level-up">
            {profile.level}
          </div>
          <div className="text-sm font-semibold mt-1">🏆 Level</div>
        </div>
      </div>
    </Card>
  );
};
