"use client";

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, ReactNode } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import PromptInput from "./prompt-input";

const COLORS_TOP = ["#14b8a6", "#8b5cf6", "#06b6d4", "#a855f7"];

interface AuroraHeroProps {
  children?: ReactNode;
}

export const AuroraHero = ({ children }: AuroraHeroProps) => {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #030303 50%, ${color})`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-[#030303] px-4 py-24 text-white"
    >
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/70 mb-6 drop-shadow-sm">
          A PORTAL TO EVERYTHING YOU WANT TO BUILD.
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl mx-auto font-light tracking-wide">
          Build production-ready websites
        </p>

        <div className="w-full relative z-20">
          
        </div>

        <div className="mt-12">
          {children}
        </div>
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </motion.section>
  );
};
