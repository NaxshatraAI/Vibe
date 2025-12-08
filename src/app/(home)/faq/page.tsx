"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Trikon?",
    answer:
      "Trikon is an AI-powered platform that helps you build stunning web applications in minutes. Simply describe what you want, and our AI will generate the code for you.",
  },
  {
    question: "Do I need coding experience?",
    answer:
      "No! Trikon is designed for everyone. Whether you're a seasoned developer or just starting out, our intuitive interface and AI assistance make building apps accessible to all.",
  },
  {
    question: "Can I export my projects?",
    answer:
      "Yes, you can export your projects at any time. All code is yours to keep, and you can deploy it anywhere you like.",
  },
  {
    question: "What technologies does Trikon use?",
    answer:
      "Trikon generates modern, production-ready code using React, TypeScript, Tailwind CSS, and other best-in-class technologies.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Our Starter plan is completely free and lets you create up to 5 projects. No credit card required to get started.",
  },
  {
    question: "How does billing work?",
    answer:
      "We offer monthly and annual billing options. Annual plans come with a 20% discount. You can upgrade, downgrade, or cancel at any time.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-white/40">
            Everything you need to know about Trikon
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-white hover:text-teal-400 transition-colors py-4 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/50 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
