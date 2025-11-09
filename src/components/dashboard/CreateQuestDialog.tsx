import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface CreateQuestDialogProps {
  onCreateQuest: (quest: {
    title: string;
    description?: string;
    xp_reward?: number;
    coin_reward?: number;
  }) => void;
}

export const CreateQuestDialog = ({ onCreateQuest }: CreateQuestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState("10");
  const [coinReward, setCoinReward] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateQuest({
      title,
      description: description || undefined,
      xp_reward: parseInt(xpReward) || 10,
      coin_reward: parseInt(coinReward) || 5,
    });
    setTitle("");
    setDescription("");
    setXpReward("10");
    setCoinReward("5");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 glow-primary">
          <Plus className="w-5 h-5" />
          New Quest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Quest</DialogTitle>
            <DialogDescription>
              Add a new daily quest to complete and earn rewards
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Quest Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., Morning Workout"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Add details about your quest..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="xp" className="text-sm font-medium">
                  XP Reward
                </label>
                <Input
                  id="xp"
                  type="number"
                  min="1"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="coins" className="text-sm font-medium">
                  Coin Reward
                </label>
                <Input
                  id="coins"
                  type="number"
                  min="1"
                  value={coinReward}
                  onChange={(e) => setCoinReward(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Quest</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
