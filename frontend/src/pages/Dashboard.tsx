import { useEffect, useState } from "react";
import { api, DailySummary } from "@/services/api";
import { motion } from "framer-motion";
import { Activity, Brain, Target, Timer, AlertCircle, TrendingUp } from "lucide-react";

const MetricCard = ({
  label,
  value,
  unit,
  icon: Icon,
  color = "primary",
  delay = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  color?: "primary" | "success" | "warning" | "destructive";
  delay?: number;
}) => {
  const glowMap = {
    primary: "glow-primary",
    success: "glow-success",
    warning: "glow-warning",
    destructive: "glow-destructive",
  };
  const colorMap = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass rounded-xl p-5 ${glowMap[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{label}</span>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="stat-value">
        {value}
        {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
      </div>
    </motion.div>
  );
};

const ScoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "hsl(var(--success))" : score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold">{Math.round(score)}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDailySummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-warning mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">No Data Yet</h3>
        <p className="text-sm text-muted-foreground">
          Submit your first work log to see your productivity dashboard. Make sure your API is running.
        </p>
      </div>
    );
  }

  if (!summary) return null;

  const { isolation_metrics, time_metrics, task_metrics, productivity_score } = summary;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Daily Summary</h1>
        <p className="text-sm text-muted-foreground font-mono">{summary.date}</p>
      </div>

      {/* Productivity Score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 flex flex-col md:flex-row items-center gap-8"
      >
        <ScoreRing score={productivity_score.score} />
        <div className="flex-1 space-y-4 w-full">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Productivity Score Breakdown
          </h3>
          {Object.entries(productivity_score.breakdown || {}).map(([key, value]) => {
            const isNegative = key === "context_switch_penalty";
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                  <span className={`font-mono font-medium ${isNegative ? "text-destructive" : "text-foreground"}`}>
                    {isNegative ? "-" : "+"}{typeof value === 'number' ? value.toFixed(1) : value}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(Number(value)) * 2, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${isNegative ? "bg-destructive" : "bg-primary"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Tracked Time" value={(time_metrics.tracked_time / 60).toFixed(1)} unit="hrs" icon={Timer} delay={0.1} />
        <MetricCard label="Deep Work" value={(time_metrics.deep_work_time / 60).toFixed(1)} unit="hrs" icon={Brain} color="success" delay={0.2} />
        <MetricCard label="Tasks Done" value={task_metrics.completed} icon={Target} color="primary" delay={0.3} />
        <MetricCard label="Context Switches" value={task_metrics.context_switches} icon={Activity} color="warning" delay={0.4} />
      </div>

      {/* Isolation metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Idle / Isolation Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Episodes" value={isolation_metrics.count} icon={AlertCircle} color="warning" delay={0.1} />
          <MetricCard label="Total Idle" value={isolation_metrics.total_minutes.toFixed(0)} unit="min" icon={Timer} delay={0.2} />
          <MetricCard label="Avg Duration" value={isolation_metrics.average_minutes.toFixed(1)} unit="min" icon={Activity} delay={0.3} />
          <MetricCard label="Longest" value={isolation_metrics.longest_minutes.toFixed(0)} unit="min" icon={AlertCircle} color="destructive" delay={0.4} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
