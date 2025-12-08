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
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-[#030303] px-4 py-24 text-white"
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* <span className="mb-1.5 inline-block rounded-full bg-white/[0.05] border border-white/[0.1] px-3 py-1.5 text-sm text-white/60">
          AI-Powered Builder
        </span> */}
        <h1 className="mid-w-2xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          Build Something with Trikon
        </h1>
        {/* <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed text-white/40">
          Transform your ideas into reality with our AI-powered platform. 
          Create stunning applications in minutes, not months.
        </p> */}
        {children}
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </motion.section>
  );
};
