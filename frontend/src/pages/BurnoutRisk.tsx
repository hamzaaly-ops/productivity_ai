import { useEffect, useState } from "react";
import { api, BurnoutRisk as BurnoutRiskType } from "@/services/api";
import { motion } from "framer-motion";
import { HeartPulse, AlertCircle, Moon, Calendar, Brain, Coffee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const riskColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
  critical: "text-destructive",
};

const riskGlows: Record<string, string> = {
  low: "glow-success",
  medium: "glow-warning",
  high: "glow-destructive",
  critical: "glow-destructive",
};

const factorIcons: Record<string, React.ElementType> = {
  late_night_load: Moon,
  weekend_work: Calendar,
  high_engagement_low_breaks: Coffee,
  declining_deep_work_trend: Brain,
};

const BurnoutRiskPage = () => {
  const [data, setData] = useState<BurnoutRiskType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lookback, setLookback] = useState(14);

  const fetchData = (days: number) => {
    setLoading(true);
    setError("");
    api
      .getBurnoutRisk(days)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(lookback);
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
        <h3 className="text-lg font-semibold mb-1">Unable to Assess</h3>
        <p className="text-sm text-muted-foreground">Not enough data for burnout analysis. Keep logging your work!</p>
      </div>
    );
  }

  if (!data) return null;

  const riskLevel = data.risk_level.toLowerCase();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <HeartPulse className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Burnout Risk Assessment</h1>
          <p className="text-sm text-muted-foreground">Monitor your wellbeing signals</p>
        </div>
      </div>

      {/* Lookback control */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Lookback:</span>
        <Input
          type="number"
          min={3}
          max={90}
          value={lookback}
          onChange={(e) => setLookback(Number(e.target.value))}
          className="w-20 bg-muted/50 border-border/50 font-mono"
        />
        <span className="text-sm text-muted-foreground">days</span>
        <Button variant="outline" size="sm" onClick={() => fetchData(lookback)}>
          Refresh
        </Button>
      </div>

      {/* Risk score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass rounded-xl p-6 ${riskGlows[riskLevel] || ""}`}
      >
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className={`font-mono text-5xl font-bold ${riskColors[riskLevel]}`}>
              {(data.risk_score * 100).toFixed(0)}
            </div>
            <div className="stat-label mt-1">Risk Score</div>
          </div>
          <div className="flex-1">
            <div className={`text-xl font-semibold capitalize ${riskColors[riskLevel]}`}>{data.risk_level} Risk</div>
            <p className="text-sm text-muted-foreground mt-1">{data.recommendation}</p>
          </div>
        </div>
      </motion.div>

      {/* Factors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(data.factors).map(([key, value], i) => {
          const Icon = factorIcons[key] || AlertCircle;
          const pct = (Number(value) * 100).toFixed(0);
          const severity = Number(value) > 0.7 ? "destructive" : Number(value) > 0.4 ? "warning" : "success";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-4 w-4 text-${severity}`} />
                <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
              </div>
              <div className="font-mono text-2xl font-bold mb-2">{pct}%</div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full bg-${severity}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BurnoutRiskPage;
