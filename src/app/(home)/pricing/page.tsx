"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";


const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out Trikon",
    features: [
      "5 projects",
      "Basic AI assistance",
      "Community support",
      "1GB storage",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Best for professionals",
    features: [
      "Unlimited projects",
      "Advanced AI features",
      "Priority support",
      "50GB storage",
      "Custom domains",
      "Analytics dashboard",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "SSO & SAML",
      "Unlimited storage",
      "Custom integrations",
      "SLA guarantee",
    ],
    popular: false,
  },
];

export default function PricingCards() {
  
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ------------------ HEADER ------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </motion.div>

        {/* ------------------ PRICING GRID ------------------ */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              // onClick={() => navigate(`/pricing/${plan.name.toLowerCase()}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 cursor-pointer
                ${
                  plan.popular
                    ? "bg-gradient-to-b from-teal-500/20 to-violet-500/20 border-2 border-teal-500/50"
                    : "bg-white/[0.03] border border-white/[0.08]"
                }
                hover:scale-[1.03] hover:bg-white/[0.06] hover:border-white/20
                transition-all duration-300
              `}
            >
              {/* POPULAR BADGE */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full text-xs font-medium text-white">
                  Most Popular
                </div>
              )}

              {/* TITLE */}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>

              {/* PRICE */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-white/40">{plan.period}</span>}
              </div>

              <p className="text-white/40 text-sm mb-6">{plan.description}</p>

              {/* FEATURES */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-teal-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* BUTTON — separate click action */}
              <Button
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click
                  console.log(`${plan.name} button clicked!`);
                }}
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-600 hover:to-violet-600 text-white border-0"
                    : "bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]"
                }`}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
