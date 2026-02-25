import { useState } from "react";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const WorkLogs = () => {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    total_tracked_time: "",
    active_time: "",
    deep_work_time: "",
    tasks_completed: "",
    tasks_started: "",
    context_switches: "",
    breaks_taken: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createWorkLog({
        date: form.date,
        total_tracked_time: Number(form.total_tracked_time),
        active_time: Number(form.active_time),
        deep_work_time: Number(form.deep_work_time),
        tasks_completed: Number(form.tasks_completed),
        tasks_started: Number(form.tasks_started),
        context_switches: Number(form.context_switches),
        breaks_taken: Number(form.breaks_taken),
        notes: form.notes || undefined,
      });
      toast.success("Work log submitted successfully!");
      setForm((f) => ({
        ...f,
        total_tracked_time: "",
        active_time: "",
        deep_work_time: "",
        tasks_completed: "",
        tasks_started: "",
        context_switches: "",
        breaks_taken: "",
        notes: "",
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to submit work log");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "total_tracked_time", label: "Total Tracked (min)", type: "number" },
    { name: "active_time", label: "Active Time (min)", type: "number" },
    { name: "deep_work_time", label: "Deep Work (min)", type: "number" },
    { name: "tasks_completed", label: "Tasks Completed", type: "number" },
    { name: "tasks_started", label: "Tasks Started", type: "number" },
    { name: "context_switches", label: "Context Switches", type: "number" },
    { name: "breaks_taken", label: "Breaks Taken", type: "number" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Submit Work Log</h1>
          <p className="text-sm text-muted-foreground">Record your daily work metrics</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="bg-muted/50 border-border/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  min="0"
                  value={(form as any)[f.name]}
                  onChange={handleChange}
                  placeholder="0"
                  className="bg-muted/50 border-border/50 font-mono"
                  required
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any observations about the day..."
              className="bg-muted/50 border-border/50 min-h-[80px]"
            />
          </div>

          <Button type="submit" className="w-full glow-primary" disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Work Log"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default WorkLogs;
