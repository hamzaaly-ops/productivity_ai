import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Activity, Brain, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 glass">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold">PulseTrack</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="glow-primary">
              Get Started <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-5xl py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-medium mb-6 glow-primary">
            AI-POWERED PRODUCTIVITY
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[0.95]">
            Track. Analyze.
            <br />
            <span className="text-gradient">Thrive.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Deep productivity analytics for remote teams — burnout detection, anomaly alerts, and actionable insights powered by machine learning.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="glow-primary text-base px-8">
                Start Tracking <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Activity, title: "Real-time Metrics", desc: "Track work hours, deep focus, tasks, and context switches with precision." },
            { icon: Brain, title: "Burnout Detection", desc: "AI monitors late nights, weekend overwork, and declining deep-work trends." },
            { icon: Shield, title: "Anomaly Alerts", desc: "Isolation Forest + z-score analysis detects unusual patterns automatically." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="glass rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
