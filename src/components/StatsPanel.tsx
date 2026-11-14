/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Award, Zap, ShieldCheck } from "lucide-react";
import { LevelMilestone } from "../types";
import { PRIZE_LEVELS } from "../utils/defaultQuestions";

interface StatsPanelProps {
  currentLevel: number; // 1 to 10
  questionsCount: number;
}

export default function StatsPanel({ currentLevel, questionsCount }: StatsPanelProps) {
  // We reverse the list for visual hierarchy (with Rp 1 Miliar at the top)
  const displayLevels = [...PRIZE_LEVELS];

  return (
    <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-cyan-500/20">
        <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
        <h3 className="font-bold tracking-wider text-sm text-slate-100 uppercase font-sans">
          Tingkat Hadiah Kuis
        </h3>
      </div>

      <div className="space-y-1.5 font-mono">
        {displayLevels.map((milestone) => {
          const isCurrent = milestone.level === currentLevel;
          const isPassed = milestone.level < currentLevel;
          const isLocked = milestone.level > currentLevel;

          // styling mappings to fit "Geometric Balance"
          let rowBg = "bg-slate-950/25 border border-slate-900";
          let numColor = "text-slate-500";
          let prizeColor = "text-slate-400";

          if (isCurrent) {
            rowBg = "bg-amber-400/10 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.2)]";
            numColor = "text-yellow-400 font-bold";
            prizeColor = "text-yellow-400 font-extrabold";
          } else if (isPassed) {
            rowBg = "bg-slate-900/40 border border-slate-950 opacity-60";
            numColor = "text-slate-600";
            prizeColor = "text-slate-500/80 line-through";
          } else if (milestone.isSafePoint) {
            rowBg = "bg-cyan-950/15 border border-cyan-500/20";
            numColor = "text-cyan-400 font-medium";
            prizeColor = "text-cyan-300 font-semibold";
          }

          return (
            <motion.div
              key={milestone.level}
              whileHover={{ x: isLocked ? 0 : 4 }}
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-300 ${rowBg}`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs ${numColor} min-w-[20px] text-right`}>
                  {milestone.level}.
                </span>

                {milestone.isSafePoint && (
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${
                      isPassed ? "text-slate-500" : isCurrent ? "text-yellow-400" : "text-cyan-400"
                    }`}
                    title="Titik Aman Kuis"
                  />
                )}

                {isCurrent && <Zap className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />}
              </div>

              <div className="text-right">
                <span className={`text-sm md:text-xs xl:text-sm tracking-wide ${prizeColor}`}>
                  {milestone.prize}
                </span>

                {milestone.isSafePoint && !isPassed && !isCurrent && (
                  <span className="block text-[8px] text-cyan-400/70 font-sans font-medium uppercase tracking-tight">
                    Titik Aman
                  </span>
                )}
                {isCurrent && (
                  <span className="block text-[8px] text-yellow-400 font-sans font-bold uppercase tracking-tight animate-pulse">
                    Target Anda
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
        <p className="font-semibold text-slate-300 mb-1">💡 Aturan Titik Aman (Safe Point)</p>
        Jika Anda salah menjawab di tingkat mana pun, Anda dipastikan membawa pulang nominal dari <span className="text-cyan-400 font-semibold">Titik Aman terakhir</span> yang berhasil Anda capai.
      </div>
    </div>
  );
}
