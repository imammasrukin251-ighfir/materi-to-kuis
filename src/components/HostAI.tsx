/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Eye, Sparkles } from "lucide-react";
import { audioSystem } from "../utils/audioSystem";

interface HostAIProps {
  status: "idle" | "asking" | "checking" | "correct" | "wrong" | "victory" | "intro";
  levelName?: string;
  feedbackText: string;
  hostName?: string;
}

export default function HostAI({
  status,
  levelName = "Rp 1.000.000",
  feedbackText,
  hostName = "Edo Jati AI"
}: HostAIProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isMouthMoving, setIsMouthMoving] = useState(false);

  // Trigger text-to-speech automatically when feedback changes
  useEffect(() => {
    if (feedbackText) {
      // Small timeout to let other sound effects play first
      const t = setTimeout(() => {
        audioSystem.speak(feedbackText);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [feedbackText]);

  // Periodic Blink Animation Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync Mouth Movement when commenting or asking questions (simulated)
  useEffect(() => {
    if (status === "asking" || status === "checking" || status === "intro" || status === "correct" || status === "wrong") {
      setIsMouthMoving(true);
      const timer = setTimeout(() => {
        setIsMouthMoving(false);
      }, 4000); // talk for a brief duration then pause
      return () => clearTimeout(timer);
    } else {
      setIsMouthMoving(false);
    }
  }, [status, feedbackText]);

  // Repeated quick bounce animation on mouth when speaking
  const [mouthYScale, setMouthYScale] = useState(1);
  useEffect(() => {
    let speakInterval: any;
    if (isMouthMoving) {
      speakInterval = setInterval(() => {
        setMouthYScale(Math.random() * 0.7 + 0.4);
      }, 100);
    } else {
      setMouthYScale(1);
    }
    return () => clearInterval(speakInterval);
  }, [isMouthMoving]);

  // Map status themes to neon colors
  const getThemeColor = () => {
    switch (status) {
      case "checking":
        return {
          glow: "shadow-[0_0_30px_rgba(234,179,8,0.35)] border-yellow-500/50",
          bg: "bg-yellow-500/10",
          text: "text-yellow-400",
          pulse: "animate-pulse",
          avatarBg: "from-yellow-900/40 to-slate-900",
        };
      case "correct":
        return {
          glow: "shadow-[0_0_30px_rgba(34,197,94,0.35)] border-green-500/50",
          bg: "bg-green-500/10",
          text: "text-green-400",
          pulse: "",
          avatarBg: "from-green-950/40 to-slate-900",
        };
      case "wrong":
        return {
          glow: "shadow-[0_0_30px_rgba(239,68,68,0.35)] border-red-500/50",
          bg: "bg-red-500/10",
          text: "text-red-400",
          pulse: "",
          avatarBg: "from-red-950/40 to-slate-900",
        };
      case "victory":
        return {
          glow: "shadow-[0_0_40px_rgba(234,179,8,0.5)] border-yellow-400 border-2",
          bg: "bg-yellow-500/20 backdrop-blur-md",
          text: "text-yellow-300 font-bold",
          pulse: "animate-bounce",
          avatarBg: "from-amber-800/40 to-slate-900",
        };
      default:
        return {
          glow: "shadow-[0_0_30px_rgba(59,130,246,0.35)] border-cyan-500/50",
          bg: "bg-cyan-950/20 backdrop-blur-sm",
          text: "text-cyan-400",
          pulse: "",
          avatarBg: "from-cyan-950/30 to-slate-900",
        };
    }
  };

  const theme = getThemeColor();

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 shadow-xl backdrop-blur-lg">
      {/* 3D Visual Mesh Style host avatar */}
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border border-slate-600 shadow-md flex-shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-t ${theme.avatarBg} transition-colors duration-500`} />

        {/* Matrix style cyber grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:10px_10px] opacity-35" />

        {/* Vector Host Graphic */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-slate-100 fill-current"
          id="host-ai-avatar"
        >
          {/* Neon lights in eyes and background */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-15" />

          {/* Hair/Head Silhouette */}
          <path
            d="M50 15 C34 15 30 25 30 38 C30 45 32 58 50 58 C68 58 70 45 70 38 C70 25 66 15 50 15 Z"
            fill="#0f172a"
          />

          {/* Face */}
          <path d="M35 38 C35 52 42 58 50 58 C58 58 65 52 65 38" fill="#e2e8f0" />

          {/* Cool Host Sunglasses */}
          <path d="M31 34 C31 34 38 28 48 33 M69 34 C69 34 62 28 52 33" stroke="#475569" strokeWidth="2" fill="none" />
          <path d="M31 34 L47 35 L47 41 L31 40 Z" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
          <path d="M69 34 L53 35 L53 41 L69 40 Z" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
          <path d="M47 35 L53 35" stroke="#3b82f6" strokeWidth="2.5" />

          {/* Ears */}
          <circle cx="34" cy="40" r="4" fill="#cbd5e1" />
          <circle cx="66" cy="40" r="4" fill="#cbd5e1" />

          {/* Cybernetic temples/lines on eyes */}
          <path d="M69 37 L75 37" stroke="#3b82f6" strokeWidth="1" className="animate-pulse" />
          <path d="M31 37 L25 37" stroke="#3b82f6" strokeWidth="1" className="animate-pulse" />

          {/* Mouth */}
          {status === "wrong" ? (
            // Sad/nervous line
            <path d="M44 48 C44 48 50 51 56 48" stroke="#1e293b" strokeWidth="1.5" fill="none" />
          ) : (
            // Animated smiling or talking circle
            <ellipse
              cx="50"
              cy="49"
              rx="4"
              ry={mouthYScale * 2.5}
              fill="#ef4444"
              stroke="#1e293b"
              strokeWidth="1"
            />
          )}

          {/* Suit & Neon Tie */}
          <path d="M30 58 L50 90 L70 58" fill="#1e293b" />
          <path d="M38 58 L50 78 L62 58" fill="#ffffff" />
          {/* Glowing blue tie */}
          <path d="M48 62 L52 62 L51 86 L49 86 Z" fill="#06b6d4" className="animate-pulse" />
        </svg>

        {/* Aura ambient ring */}
        <div className={`absolute inset-0 rounded-full border border-cyan-500/30 ${theme.pulse}`} />
      </div>

       {/* Host Speech bubble */}
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-1.5 justify-between">
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs tracking-wider uppercase font-semibold text-cyan-300">
              Host Kuis Utama
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioSystem.playClick();
                audioSystem.speak(feedbackText);
                setIsMouthMoving(true);
                setTimeout(() => setIsMouthMoving(false), 4000);
              }}
              title="Dengarkan Ulang Suara Host"
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 flex items-center gap-1 cursor-pointer select-none transition-all active:scale-95"
            >
              <Volume2 className="w-3 h-3 animate-pulse" />
              Syuara Speak
            </button>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {hostName}
            </span>
          </div>
        </div>

        <motion.div
          layout
          className={`relative border p-3 rounded-xl ${theme.bg} ${theme.glow} transition-all duration-300`}
        >
          {/* Little arrow */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rotate-45 border-l border-b border-inherit bg-slate-900 hidden md:block" />

          <p className="text-sm text-slate-100 leading-relaxed min-h-[40px] font-medium italic">
            "{feedbackText}"
          </p>
        </motion.div>
      </div>
    </div>
  );
}
