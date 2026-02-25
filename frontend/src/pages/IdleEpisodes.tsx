import { useState } from "react";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const IdleEpisodes = () => {
  const [form, setForm] = useState({
    start_time: "",
    end_time: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createIdleEpisode({
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        reason: form.reason || undefined,
      });
      toast.success("Idle episode recorded!");
      setForm({ start_time: "", end_time: "", reason: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-warning/10">
          <Clock className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Log Idle Episode</h1>
          <p className="text-sm text-muted-foreground">Record periods of inactivity</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              value={form.start_time}
              onChange={handleChange}
              className="bg-muted/50 border-border/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              name="end_time"
              type="datetime-local"
              value={form.end_time}
              onChange={handleChange}
              className="bg-muted/50 border-border/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="e.g., lunch break, meeting..."
              className="bg-muted/50 border-border/50"
            />
          </div>

          <Button type="submit" className="w-full glow-primary" disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Recording..." : "Record Episode"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default IdleEpisodes;
