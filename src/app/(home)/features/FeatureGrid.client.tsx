"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, Globe, Clock, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Generate high-quality content, code, and designs using advanced AI models.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get results in seconds, not hours. Our infrastructure is optimized for speed.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared. Enterprise-grade security built-in.",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Deployed across 200+ edge locations for minimal latency worldwide.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "99.99% uptime guarantee with automatic failover and redundancy.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with real-time collaboration features.",
  },
];

export const FeatureGrid = () => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
          Powerful Features
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Everything you need to build amazing products, all in one place.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors"
          >
            <feature.icon className="w-10 h-10 text-teal-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-white/60">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;
