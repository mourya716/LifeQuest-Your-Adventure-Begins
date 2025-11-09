import { Achievement } from "@/hooks/useAchievements";
import { Card } from "@/components/ui/card";
import { Award, Star } from "lucide-react";

interface AchievementsListProps {
  achievements: Achievement[];
}

export const AchievementsList = ({ achievements }: AchievementsListProps) => {
  if (achievements.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed shadow-md">
        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">
          🏆 Complete quests and level up to unlock achievements!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <Card
          key={achievement.id}
          className="p-4 border-gold/40 bg-gradient-to-br from-gold/20 to-gold/10 glow-gold shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gold/30 rounded-2xl shadow-sm">
              <Star className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">🎉 {achievement.achievement_name}</h4>
              <p className="text-sm text-muted-foreground">
                {achievement.achievement_description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ✨ Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
