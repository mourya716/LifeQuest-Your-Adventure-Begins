import { Quest } from "@/hooks/useQuests";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Coins, Trophy, Trash2 } from "lucide-react";

interface QuestListProps {
  quests: Quest[];
  onComplete: (questId: string, xpReward: number, coinReward: number) => void;
  onDelete: (questId: string) => void;
}

export const QuestList = ({ quests, onComplete, onDelete }: QuestListProps) => {
  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  const QuestCard = ({ quest }: { quest: Quest }) => (
    <Card
      className={`p-4 transition-all duration-300 ${
        quest.completed
          ? "bg-success/10 border-success/30 opacity-60"
          : "border-primary/20 hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {quest.completed ? (
            <CheckCircle2 className="w-6 h-6 text-success mt-1 flex-shrink-0" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className={`font-semibold mb-1 ${quest.completed ? "line-through" : ""}`}>
              {quest.title}
            </h3>
            {quest.description && (
              <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="w-4 h-4" />
                <span>+{quest.xp_reward} XP</span>
              </div>
              <div className="flex items-center gap-1 text-gold">
                <Coins className="w-4 h-4" />
                <span>+{quest.coin_reward}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!quest.completed && (
            <Button
              size="sm"
              onClick={() => onComplete(quest.id, quest.xp_reward, quest.coin_reward)}
              className="glow-success"
            >
              Complete
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(quest.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {activeQuests.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Circle className="w-5 h-5 text-primary" />
            Active Quests ({activeQuests.length})
          </h3>
          <div className="space-y-3">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {completedQuests.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Completed Today ({completedQuests.length})
          </h3>
          <div className="space-y-3">
            {completedQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground">No quests yet. Create your first quest to begin!</p>
        </Card>
      )}
    </div>
  );
};
