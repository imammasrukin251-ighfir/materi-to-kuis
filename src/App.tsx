/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameStatus, Question } from "./types";
import { DEFAULT_QUESTIONS, PRIZE_LEVELS } from "./utils/defaultQuestions";
import { audioSystem } from "./utils/audioSystem";
import UploadWizard from "./components/UploadWizard";
import MainQuizScreen from "./components/MainQuizScreen";
import { Award, Zap, HelpCircle, RefreshCw, Trophy, Play, Home, Sparkles, Volume2, VolumeX } from "lucide-react";

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("MAIN_MENU");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [isMuted, setIsMuted] = useState(false);

  // Result stats caching
  const [gameStats, setGameStats] = useState({
    levelAchieved: 0,
    correctCount: 0,
    prizeWon: "Rp 0"
  });

  const handleLaunchDefaultDeck = () => {
    setActiveQuestions(DEFAULT_QUESTIONS);
    audioSystem.playClick();
    setGameStatus("PLAYING");
  };

  const handleQuestionsLoaded = (loadedQuestions: Question[]) => {
    setActiveQuestions(loadedQuestions);
    setGameStatus("PLAYING");
  };

  const handleGameOver = (levelAchieved: number, correctCount: number, prizeWon: string) => {
    setGameStats({
      levelAchieved,
      correctCount,
      prizeWon
    });
    setGameStatus("RESULT");
  };

  const handlePlayAgain = () => {
    audioSystem.playClick();
    setGameStatus("MAIN_MENU");
  };

  const toggleSound = () => {
    setIsMuted(!isMuted);
    audioSystem.setMute(!isMuted);
  };

  return (
    <div className="min-h-screen geometric-bg text-slate-100 flex flex-col relative overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Geometric Balance Studio Theme Backdrops */}
      <div className="stage-beam-left" />
      <div className="stage-beam-right" />
      <div className="timer-ring-outer" />
      <div className="timer-ring-inner" />
      
      {/* 3D Visual Mesh - Stage backdrops & Grid matrix lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-25 z-0 pointer-events-none" />

      {/* Decorative Top header logo */}
      <header className="relative w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-slate-800 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Trophy className="w-5 h-5 text-cyan-300 animate-bounce" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-wider logo-glowing-text leading-none font-sans">
              MATERI to KUIS MILLIONAIRE
            </h1>
            <span className="text-[10px] text-cyan-400 font-sans tracking-widest font-semibold uppercase block mt-0.5">EDISI PENDIDIKAN</span>
          </div>
        </div>

        {/* Global Sound Toggles in Main Menu */}
        {gameStatus === "MAIN_MENU" && (
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 transition-all cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                Suara: Muted
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Suara: On
              </>
            )}
          </button>
        )}
      </header>

      {/* Primary state contents router with AnimatePresence */}
      <main className="flex-grow flex flex-col justify-center relative z-10 py-8 lg:py-12">
        <AnimatePresence mode="wait">
          {gameStatus === "MAIN_MENU" && (
            <motion.div
              key="main_menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4 px-6 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/40 rounded-full text-[10px] font-bold text-cyan-400 tracking-wider uppercase mb-2 animate-pulse">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Kuis Show Ter-Modern 2026
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-indigo-100 font-sans leading-none filter drop-shadow-lg">
                  MATERI to KUIS MILLIONAIRE
                </h1>
                
                <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Belajar jadi menegangkan dan seru! Rasakan gemuruh lampu studio, musik panggung kuis megah, hadiah menggiurkan, dan host cerdas Edo Jati AI.
                </p>
              </div>

              {/* UploadWizard dashboard setup inside Menu */}
              <UploadWizard
                onQuestionsLoaded={handleQuestionsLoaded}
                onLaunchDefault={handleLaunchDefaultDeck}
              />
            </motion.div>
          )}

          {gameStatus === "PLAYING" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <MainQuizScreen
                questions={activeQuestions}
                onGameQuit={() => setGameStatus("MAIN_MENU")}
                onGameOver={handleGameOver}
              />
            </motion.div>
          )}

          {gameStatus === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto px-6 text-center space-y-8"
            >
              {/* Grand Win or Loss Trophy card view */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1.5px] bg-yellow-500" />
                
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-yellow-500/5">
                  <Trophy className="w-10 h-10 text-yellow-500 animate-pulse" />
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                    Hasil Permainan
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Permainan Selesai!
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                    Kombinasi taktik bantuan lifelines dan penguasaan materi membawa Anda melaju tinggi di panggung kuis.
                  </p>
                </div>

                {/* Score Stats Board Grid */}
                <div className="grid grid-cols-3 gap-4 border border-slate-800 p-4 bg-slate-950/80 rounded-2xl max-w-md mx-auto font-mono text-center">
                  <div className="space-y-1">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-tight">Level</span>
                    <span className="text-base font-bold text-cyan-400">{gameStats.levelAchieved}</span>
                  </div>
                  <div className="space-y-1 border-x border-slate-850">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-tight">Benar</span>
                    <span className="text-base font-bold text-green-400">{gameStats.correctCount}/10</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[9px] text-slate-500 uppercase tracking-tight">Poin/Hadiah</span>
                    <span className="text-xs font-bold text-yellow-400 truncate block px-0.5" title={gameStats.prizeWon}>
                      {gameStats.prizeWon}
                    </span>
                  </div>
                </div>

                {/* Motivational Commentary */}
                <div className="mt-6 p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-xs text-slate-300 italic max-w-md mx-auto leading-relaxed">
                  {gameStats.levelAchieved === 10 ? (
                    <span>"Luar biasa! Pencapaian mahkota juara kuis tertinggi ini membuktikan wawasan Anda setingkat legenda ilmuwan!"</span>
                  ) : gameStats.levelAchieved >= 8 ? (
                    <span>"Langkah yang fantastis! Anda hampir menguasai panggung Millionaire sepenuhnya. Sedikit polesan lagi dan Rp1 Miliar ada di tangan Anda!"</span>
                  ) : gameStats.levelAchieved >= 4 ? (
                    <span>"Bagus sekali! Anda berhasil melewati titik aman dasar dan membawa pulang puluhan juta Rupiah. Pertahankan belajar Anda!"</span>
                  ) : (
                    <span>"Awal perjuangan yang bagus! Panggung kuis Millionaire menuntut ketenangan tinggi. Jangan menyerah, ayo evaluasi materi dan coba lagi!"</span>
                  )}
                </div>

                {/* Nav buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4.5 justify-center mt-8">
                  <button
                    onClick={handlePlayAgain}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 font-sans"
                  >
                    <RefreshCw className="w-4 h-4" />
                    MAIN LAGI
                  </button>

                  <button
                    onClick={() => {
                      audioSystem.playClick();
                      setGameStatus("MAIN_MENU");
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer font-sans"
                  >
                    <Home className="w-4 h-4" />
                    KEMBALI KE MENU
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Styled Human Footer inside margins */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-5 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 bg-slate-950 z-10">
        <div>
          <span>&copy; 2026 Game Kuis Edukasi MATERI to KUIS MILLIONAIRE.</span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-sans">
          <span>Struktur Soal Edukatif powered by Gemini AI</span>
          <span className="text-cyan-600 font-semibold uppercase font-mono">Cerdas • Edukatif • Menegangkan</span>
        </div>
      </footer>
    </div>
  );
}
