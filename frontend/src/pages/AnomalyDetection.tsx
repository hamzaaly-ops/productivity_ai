import { useEffect, useState } from "react";
import { api, AnomalyDetection as AnomalyType } from "@/services/api";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, AlertCircle } from "lucide-react";

const severityConfig: Record<string, { color: string; bg: string; glow: string }> = {
  high: { color: "text-destructive", bg: "bg-destructive/10", glow: "glow-destructive" },
  medium: { color: "text-warning", bg: "bg-warning/10", glow: "glow-warning" },
  low: { color: "text-primary", bg: "bg-primary/10", glow: "glow-primary" },
};

const AnomalyDetectionPage = () => {
  const [data, setData] = useState<AnomalyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAnomalyDetection()
      .then(setData)
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
        <h3 className="text-lg font-semibold mb-1">No Anomaly Data</h3>
        <p className="text-sm text-muted-foreground">More data needed for behavior pattern analysis.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Anomaly Detection</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered behavior pattern analysis · <span className="font-mono text-xs">{data.method}</span>
          </p>
        </div>
      </div>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass rounded-xl p-6 ${data.anomalies_detected ? "glow-warning" : "glow-success"}`}
      >
        <div className="flex items-center gap-4">
          {data.anomalies_detected ? (
            <AlertTriangle className="h-8 w-8 text-warning" />
          ) : (
            <Shield className="h-8 w-8 text-success" />
          )}
          <div>
            <h3 className="text-lg font-semibold">
              {data.anomalies_detected
                ? `${data.anomalies.length} Anomal${data.anomalies.length === 1 ? "y" : "ies"} Detected`
                : "All Clear"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {data.anomalies_detected
                ? "Unusual patterns found in your recent behavior"
                : "Your behavior patterns are within normal ranges"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Anomaly cards */}
      {data.anomalies.length > 0 && (
        <div className="space-y-4">
          {data.anomalies.map((anomaly, i) => {
            const config = severityConfig[anomaly.severity] || severityConfig.low;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass rounded-xl p-5 ${config.glow}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold capitalize">{anomaly.metric.replace(/_/g, " ")}</h4>
                    <span className={`text-xs font-mono uppercase ${config.color}`}>{anomaly.severity} severity</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-mono ${config.bg} ${config.color}`}>
                    {anomaly.value.toFixed(1)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Expected range:{" "}
                  <span className="font-mono text-foreground">
                    {anomaly.expected_range[0].toFixed(1)} — {anomaly.expected_range[1].toFixed(1)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnomalyDetectionPage;
