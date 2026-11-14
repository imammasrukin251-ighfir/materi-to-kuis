/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  PhoneCall,
  RefreshCw,
  Timer,
  ChevronRight,
  Volume2,
  VolumeX,
  ShieldAlert,
  ArrowLeft,
  X,
  FileQuestion,
  Lightbulb,
  Check,
  Award
} from "lucide-react";
import { Question, LifelineState, FriendSuggestion } from "../types";
import { PRIZE_LEVELS, getSafePointPrize } from "../utils/defaultQuestions";
import { audioSystem } from "../utils/audioSystem";
import HostAI from "./HostAI";
import Confetti from "./Confetti";
import StatsPanel from "./StatsPanel";

interface MainQuizScreenProps {
  questions: Question[];
  onGameQuit: () => void;
  onGameOver: (levelAchieved: number, correctCount: number, prizeWon: string) => void;
}

export default function MainQuizScreen({ questions, onGameQuit, onGameOver }: MainQuizScreenProps) {
  const [currentLevel, setCurrentLevel] = useState(1); // 1 to 10
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Lifelines
  const [lifelines, setLifelines] = useState<LifelineState>({
    fiftyFifty: false,
    askAudience: false,
    phoneFriend: false,
    switchQuestion: false,
  });

  // Lifeline active output triggers
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [audiencePoll, setAudiencePoll] = useState<{ [key: string]: number } | null>(null);
  const [friendSuggestion, setFriendSuggestion] = useState<FriendSuggestion | null>(null);

  // Dynamic host parameters
  const [hostStatus, setHostStatus] = useState<"idle" | "asking" | "checking" | "correct" | "wrong" | "victory" | "intro">("intro");
  const [hostDialogue, setHostDialogue] = useState("Selamat datang di kursi panas Millionaire Indonesia! Sudahkah Anda siap mengejar mimpi Rp1 Miliar hari ini?");

  // Timer parameters
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds
  const [timerActive, setTimerActive] = useState(true);

  // Sound toggle state
  const [isMuted, setIsMuted] = useState(false);

  // Confetti trigger
  const [showConfetti, setShowConfetti] = useState(false);

  // Custom exit confirmation modal
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef<any>(null);

  // Level milestones reference
  const currentPrizeGoal = PRIZE_LEVELS.find((p) => p.level === currentLevel)?.prize || "Rp 0";

  // Initialize background drone when game loading
  useEffect(() => {
    audioSystem.init();
    audioSystem.setMute(isMuted);
    audioSystem.startBackgroundMusic(1);
    
    // Set intro dialogue
    setHostStatus("intro");
    setHostDialogue(`Kita mulai perjalanan kuis ini! Pertanyaan ke-1 bernilai ${PRIZE_LEVELS.find(p=>p.level===1)?.prize}. Luangkan waktu untuk berpikir tenang.`);
    
    return () => {
      audioSystem.stopBackgroundMusic();
    };
  }, []);

  // Update background drone theme as levels rise
  useEffect(() => {
    if (timerActive) {
      audioSystem.startBackgroundMusic(currentLevel);
    }
  }, [currentLevel, timerActive]);

  // Synchronize dynamic question switching
  useEffect(() => {
    const q = questions.find((q) => q.level === currentLevel);
    if (q) {
      setCurrentQuestion(q);
      setSelectedOption(null);
      setIsAnswerConfirmed(false);
      setIsCorrect(null);
      setEliminatedOptions([]);
      setAudiencePoll(null);
      setFriendSuggestion(null);
      setTimeLeft(45);
      setTimerActive(true);
      setHostStatus("asking");
      setHostDialogue(`Ini adalah pertanyaan Level ${currentLevel} bernilai ${PRIZE_LEVELS.find(p => p.level === currentLevel)?.prize}. Konsentrasi penuh!`);
      audioSystem.playWhoosh();
    } else {
      // If completed all 10 questions -> Level 11 -> user won the ultimate Rp 1 Miliar jackpot!
      handleVictoryJackpot();
    }
  }, [currentLevel]);

  // Countdown timer clock logic
  useEffect(() => {
    if (timerActive && !showExitConfirm && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 11 && prev > 1) {
            // Trigger alarm tick trigger
            audioSystem.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && !showExitConfirm) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, showExitConfirm]);

  const handleTimeout = () => {
    setTimerActive(false);
    setIsAnswerConfirmed(true);
    setHostStatus("wrong");
    setHostDialogue("Aduh! Sayang sekali waktu berpikir Anda telah habis. Detak jam panggung kuis telah mengunci langkah Anda.");
    setSelectedOption(null);
    setIsCorrect(false);
    audioSystem.playWrong();

    // End game after brief delay
    setTimeout(() => {
      const safePrize = getSafePointPrize(currentLevel - 1);
      onGameOver(currentLevel - 1, currentLevel - 1, safePrize);
    }, 4500);
  };

  const handleOptionClick = (optIdx: number) => {
    if (isAnswerConfirmed || eliminatedOptions.includes(optIdx)) return;
    audioSystem.playClick();
    setSelectedOption(optIdx);
    setHostStatus("checking");
    const letter = ["A", "B", "C", "D"][optIdx];
    setHostDialogue(`Pilihan ${letter}: "${currentQuestion.options[optIdx]}". Apakah ini jawaban final Anda? Masih ada waktu untuk merenung.`);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswerConfirmed) return;

    setTimerActive(false); // Stop clock
    setIsAnswerConfirmed(true);
    
    // Play checking dramatic click
    audioSystem.playTick();

    // Hold dramatic tension before scanning correctness
    setTimeout(() => {
      const correct = selectedOption === currentQuestion.correctIndex;
      setIsCorrect(correct);

      if (correct) {
        setHostStatus("correct");
        setShowConfetti(true);
        audioSystem.playCorrect();

        const optLetter = ["A", "B", "C", "D"][selectedOption];
        const nextLevelPrize = PRIZE_LEVELS.find((p) => p.level === currentLevel + 1)?.prize;
        
        let rewardFeedback = `Jawaban Anda ${optLetter} adalah BENAR SEKALI! Selamat, Anda mengamankan hadiah ${currentPrizeGoal}.`;
        if (currentLevel < 10) {
          rewardFeedback += ` Kita lanjut ke tantangan berikutnya bernilai ${nextLevelPrize}!`;
        }
        setHostDialogue(rewardFeedback);

        // Turn off confetti after 4 seconds
        setTimeout(() => setShowConfetti(false), 3500);
      } else {
        setHostStatus("wrong");
        audioSystem.playWrong();
        const correctLetter = ["A", "B", "C", "D"][currentQuestion.correctIndex];
        const safePrize = getSafePointPrize(currentLevel - 1);
        setHostDialogue(
          `Ah, sayang sekali... Jawaban Anda keliru. Pilihan yang benar adalah ${correctLetter}: "${
            currentQuestion.options[currentQuestion.correctIndex]
          }". Meskipun begitu, Anda berhak pulang dengan membawa ${safePrize}!`
        );

        // End game after 5 seconds to let them read the explanation
        setTimeout(() => {
          onGameOver(currentLevel - 1, currentLevel - 1, safePrize);
        }, 5500);
      }
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (!isCorrect) return;
    if (currentLevel === 10) {
      handleVictoryJackpot();
    } else {
      setCurrentLevel((prev) => prev + 1);
    }
  };

  const handleVictoryJackpot = () => {
    setTimerActive(false);
    setHostStatus("victory");
    setShowConfetti(true);
    audioSystem.stopBackgroundMusic();
    audioSystem.playCorrect();
    setHostDialogue("LUAR BIASA! SEJARAH BARU TELAH TERCIPTA! Anda berhasil menjawab semua 10 pertanyaan rumit dengan sempurna dan dinobatkan sebagai MILIONER INDONESIA SEJATI dengan hadiah Rp1 Miliar!");

    setTimeout(() => {
      onGameOver(10, 10, "Rp 1.000.000.000");
    }, 7000);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioSystem.setMute(nextMute);
    if (!nextMute && timerActive) {
      audioSystem.startBackgroundMusic(currentLevel);
    }
  };

  // LIFELINES IMPLEMENTATIONS
  const useFiftyFifty = () => {
    if (lifelines.fiftyFifty || isAnswerConfirmed) return;
    audioSystem.playLifeline();
    setLifelines((prev) => ({ ...prev, fiftyFifty: true }));
    setHostStatus("asking");
    setHostDialogue("Mengaktifkan bantuan 50:50! Dua jawaban salah akan dieliminasi dari hadapan Anda. Pikirkan matang-matang.");

    const correctIdx = currentQuestion.correctIndex;
    const pool = [0, 1, 2, 3].filter((idx) => idx !== correctIdx);
    
    // Pick 2 random incorrect indexes to eliminate
    const toEliminate: number[] = [];
    while (toEliminate.length < 2) {
      const randIdx = pool[Math.floor(Math.random() * pool.length)];
      if (!toEliminate.includes(randIdx)) {
        toEliminate.push(randIdx);
      }
    }
    setEliminatedOptions(toEliminate);
  };

  const useAskAudience = () => {
    if (lifelines.askAudience || isAnswerConfirmed) return;
    audioSystem.playLifeline();
    setLifelines((prev) => ({ ...prev, askAudience: true }));
    setHostStatus("asking");
    setHostDialogue("Mari tanyakan pendapat dari para penonton studio pintar Millionaire Indonesia. Penonton, silakan voting!");

    // Synthesize voting percentages
    const correctIdx = currentQuestion.correctIndex;
    let correctPercentage = 75 - currentLevel * 4; // Decreasing audience certainty on harder questions
    if (correctPercentage < 35) correctPercentage = 35; // Cap minimum probability of accuracy

    const remaining = 100 - correctPercentage;
    const remainingCount = 3 - (eliminatedOptions.includes(0) ? 1 : 0) - (eliminatedOptions.includes(1) ? 1 : 0) - (eliminatedOptions.includes(2) ? 1 : 0) - (eliminatedOptions.includes(3) ? 1 : 0);
    
    // Distribute remaining percentages to other active items
    const rawPoll = [0, 0, 0, 0];
    rawPoll[correctIdx] = correctPercentage;

    let distributed = 0;
    const wrongActiveOptions = [0, 1, 2, 3].filter(idx => idx !== correctIdx && !eliminatedOptions.includes(idx));
    
    wrongActiveOptions.forEach((idx, i) => {
      if (i === wrongActiveOptions.length - 1) {
        rawPoll[idx] = remaining - distributed;
      } else {
        const val = Math.floor(Math.random() * (remaining - distributed));
        rawPoll[idx] = val;
        distributed += val;
      }
    });

    const finalPoll: { [key: string]: number } = {
      A: rawPoll[0],
      B: rawPoll[1],
      C: rawPoll[2],
      D: rawPoll[3]
    };
    setAudiencePoll(finalPoll);
  };

  const usePhoneFriend = () => {
    if (lifelines.phoneFriend || isAnswerConfirmed) return;
    audioSystem.playLifeline();
    setLifelines((prev) => ({ ...prev, phoneFriend: true }));
    setHostStatus("asking");
    setHostDialogue("Menghubungi rekan terdekat Anda. Halo? Kita terhubung dengan teman cerdas Anda di ujung telepon!");

    const correctIdx = currentQuestion.correctIndex;
    const correctLetter = ["A", "B", "C", "D"][correctIdx];
    const confidence = Math.max(30, 95 - currentLevel * 6); // drops as question gets harder

    // Pick a virtual expert character
    const experts = [
      { name: "Profesor Bambang (Ilmuwan Trivia)", avatar: "👴" },
      { name: "Lestari (Juara Olimpiade Nasional)", avatar: "🧑‍🎓" },
      { name: "Andhika (Kolektor Trivia Saku)", avatar: "🧔" }
    ];
    const expert = experts[Math.floor(Math.random() * experts.length)];

    let message = "";
    if (confidence > 75) {
      message = `Halo! Ya ampun menegangkan sekali di sana! Menurut buku literatur yang baru saja kubaca, jawabannya pasti ${correctLetter}. Aku sangat yakin hingga ${confidence}%!`;
    } else if (confidence > 50) {
      message = `Aha! Pertanyaan tingkat sulit ya. Menurut dugaanku, jawabannya kemungkinan besar adalah ${correctLetter}, tapi hati-hati ya, jangan lupakan instingmu sendiri. Keyakinanku sekitar ${confidence}%.`;
    } else {
      message = `Waduh, level tinggi nih! Aku agak ragu, tapi instingku berbisik ke arah ${correctLetter}. Cobalah cocokkan dengan petunjuk panggung atau keyakinanmu sendiri. Sukses!`;
    }

    setFriendSuggestion({
      name: expert.name,
      avatar: expert.avatar,
      message,
      confidence
    });
  };

  const useSwitchQuestion = () => {
    if (lifelines.switchQuestion || isAnswerConfirmed) return;
    audioSystem.playLifeline();
    setLifelines((prev) => ({ ...prev, switchQuestion: true }));
    setHostStatus("asking");
    setHostDialogue("Mengganti pertanyaan dengan lembar soal baru yang setara kesulitannya!");

    // Search for a non-used default or backup question of the exact same level
    // We can swap with a generated alternative, or synthesize a dynamic replacement
    const randReplacements = [
      {
        question: "Bumi terbagi atas formasi lempeng tektonik yang terus bergerak. Benua raksasa purba sebelum terakumulasi adalah...",
        options: ["Pangaea", "Gondwana", "Laurasia", "Atlantis"],
        correctIndex: 0,
        explanation: "Pangaea adalah superbenua raksasa yang ada selama era akhir Paleozoikum dan awal Mesozoikum, terbentuk sekitar 300 juta tahun yang lalu.",
      },
      {
        question: "Ciri satelit alami terbesar milik planet Saturnus yang memiliki atmosfer tebal dan danau hidrokarbon cair adalah...",
        options: ["Europa", "Ganymede", "Titan", "Callisto"],
        correctIndex: 2,
        explanation: "Titan adalah satelit alami terbesar dari Saturnus dan satu-satunya satelit di tata surya yang memiliki awan tebal dan bukti cairan di permukaannya.",
      }
    ];

    const pick = randReplacements[Math.floor(Math.random() * randReplacements.length)];
    const replacementQuestion: Question = {
      id: `repl_${Date.now()}`,
      question: pick.question,
      options: pick.options,
      correctIndex: pick.correctIndex,
      explanation: pick.explanation,
      level: currentLevel
    };

    setCurrentQuestion(replacementQuestion);
    setSelectedOption(null);
    setEliminatedOptions([]);
    setAudiencePoll(null);
    setFriendSuggestion(null);
    setTimeLeft(45);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative max-w-7xl mx-auto px-4 pb-16">
      {showConfetti && <Confetti />}

      {/* Main interactive panel */}
      <div className="lg:col-span-8 space-y-6">
        {/* Stage HUD header */}
        <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => {
              audioSystem.playClick();
              setShowExitConfirm(true);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Keluar Kuis
          </button>

          {/* Current Milestone banner */}
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest font-mono">
              Hadiah Berjalan
            </span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {currentLevel > 1 ? PRIZE_LEVELS.find((p) => p.level === currentLevel - 1)?.prize : "Rp 0"}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-750 hover:bg-slate-700/80 transition-all text-slate-300"
            title={isMuted ? "Aktifkan Musik" : "Matikan Suara"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
          </button>
        </div>

        {/* HOST AI VIEW */}
        <HostAI
          status={hostStatus}
          levelName={currentPrizeGoal}
          feedbackText={hostDialogue}
        />

        {/* HOLOGRAM QUESTION & OPTIONS BOARD */}
        <div className="relative geometric-question-box p-6 md:p-8 shadow-2xl overflow-hidden px-10">
          {/* Neon grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e1e38_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-15" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-cyan-500/70 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

          <div className="relative z-10 space-y-8">
            {/* Header info table */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center">
                  <FileQuestion className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none">Pertanyaan {currentLevel} dari 10</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Panggung Edukasi Utama</span>
                </div>
              </div>

              {/* TIMER WATCH */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Berpikir:</span>
                <div className="relative flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800">
                  <Timer className={`w-4 h-4 ${timeLeft <= 10 ? "text-red-550 animate-pulse" : "text-cyan-400"}`} />
                  <span className={`font-mono text-sm font-bold ${timeLeft <= 10 ? "text-red-400 font-extrabold" : "text-slate-200"}`}>
                    {timeLeft}s
                  </span>
                  
                  {/* Visual progress arc bar */}
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-slate-850">
                    <div
                      className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-red-500" : "bg-cyan-500"}`}
                      style={{ width: `${(timeLeft / 45) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QUESTION DIALOG */}
            <div className="py-2">
              <motion.h3
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base md:text-lg text-slate-100 font-sans font-semibold text-center leading-relaxed tracking-wide"
              >
                {currentQuestion.question}
              </motion.h3>
            </div>

            {/* EXTRA EXPLANATION IF ANSWER IS WRONG/CORRECT */}
            <AnimatePresence>
              {isAnswerConfirmed && isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl text-xs leading-relaxed border ${
                    isCorrect
                      ? "bg-green-950/20 border-green-500/20 text-green-300"
                      : "bg-red-950/20 border-red-500/20 text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 font-bold">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Penjelasan Edukasi:</span>
                  </div>
                  <p>{currentQuestion.explanation || "Pertanyaan ini dirancang khusus untuk mengasah kompetensi kognitif dan logika kritis."}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* OPTIONS GRID 2x2 WITH GEOMETRIC BALANCE STYLING */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const letter = ["A", "B", "C", "D"][idx];
                const isSelected = selectedOption === idx;
                const isEliminated = eliminatedOptions.includes(idx);

                // Option styling transitions
                let btnStyle = "border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-amber-400/5 hover:border-amber-400/80";
                let badgeStyle = "bg-slate-950 text-amber-400 font-bold border-slate-700";

                if (isEliminated) {
                  btnStyle = "opacity-15 border-dashed border-slate-900 bg-transparent text-transparent pointer-events-none";
                  badgeStyle = "opacity-0";
                } else if (isAnswerConfirmed) {
                  // If correctness already revealed
                  if (idx === currentQuestion.correctIndex) {
                    btnStyle = "border-green-500 bg-green-950/30 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse";
                    badgeStyle = "bg-green-500 text-slate-950 font-bold border-green-400";
                  } else if (isSelected) {
                    btnStyle = "border-red-500 bg-red-950/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                    badgeStyle = "bg-red-500 text-slate-950 font-bold border-red-400";
                  } else {
                    btnStyle = "opacity-40 border-slate-900 bg-slate-950/80 text-slate-600 cursor-not-allowed";
                  }
                } else if (isSelected) {
                  // Selected but not confirmed yet
                  btnStyle = "border-yellow-500 bg-yellow-950/25 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.25)] ring-1 ring-yellow-500/50";
                  badgeStyle = "bg-yellow-500 text-slate-950 font-bold border-yellow-400";
                }

                return (
                  <motion.button
                    key={idx}
                    disabled={isAnswerConfirmed || isEliminated}
                    onClick={() => handleOptionClick(idx)}
                    whileHover={{ scale: isAnswerConfirmed || isEliminated ? 1 : 1.015 }}
                    whileTap={{ scale: isAnswerConfirmed || isEliminated ? 1 : 0.985 }}
                    className={`relative px-6 py-4 rounded-xl text-left border flex items-center gap-3 text-sm font-medium transition-all duration-300 ${btnStyle}`}
                  >
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md border text-xs font-mono font-bold transition-all ${badgeStyle}`}>
                      {letter}:
                    </span>
                    <span className="flex-1 select-none pr-4">{option}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* ACTION FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                {selectedOption !== null && !isAnswerConfirmed && (
                  <span className="text-yellow-400 animate-pulse flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
                    Kunci pilihan Anda saat Anda sudah matang.
                  </span>
                )}
              </div>

              {/* Navigation button trigger */}
              {selectedOption !== null && !isAnswerConfirmed && (
                <button
                  onClick={handleConfirmAnswer}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm font-extrabold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 cursor-pointer"
                >
                  KUNCI JAWABAN FINAL
                </button>
              )}

              {isAnswerConfirmed && isCorrect && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 text-sm font-extrabold tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {currentLevel === 10 ? "TERIMA HADIAH UTAMA 🏆" : "LANJUT SOAL BERIKUTNYA"}
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side tools panel (Lifelines & High scores list) */}
      <div className="lg:col-span-4 space-y-6">
        {/* LIFELINES GRID BOX */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-2 network-box space-y-4">
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-800">
            <Lightbulb className="w-4 h-4 text-yellow-450 animate-pulse" />
            <h3 className="font-bold tracking-wider text-sm text-slate-200 uppercase font-sans">
              Bantuan Lifelines Anda
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* 50:50 Lifeline */}
            <button
              onClick={useFiftyFifty}
              disabled={lifelines.fiftyFifty || isAnswerConfirmed}
              className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center gap-1 transition-all ${
                lifelines.fiftyFifty
                  ? "bg-slate-950 border-slate-900 text-slate-600 line-through cursor-not-allowed"
                  : isAnswerConfirmed
                  ? "opacity-40 border-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-slate-950/40 border-slate-800 text-slate-350 hover:bg-slate-900 hover:border-cyan-500/40 hover:text-cyan-400 cursor-pointer"
              }`}
              title="Mengeliminasi 2 Pilihan Jawaban Salah"
            >
              <span className="text-sm font-bold font-mono">50:50</span>
              <span className="text-[10px] text-slate-500 font-sans">Eliminasi Dua</span>
            </button>

            {/* Tanya Penonton Lifeline */}
            <button
              onClick={useAskAudience}
              disabled={lifelines.askAudience || isAnswerConfirmed}
              className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center gap-1 transition-all ${
                lifelines.askAudience
                  ? "bg-slate-950 border-slate-900 text-slate-600 line-through cursor-not-allowed"
                  : isAnswerConfirmed
                  ? "opacity-40 border-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-slate-950/40 border-slate-800 text-slate-350 hover:bg-slate-900 hover:border-cyan-500/40 hover:text-cyan-400 cursor-pointer"
              }`}
              title="Minta Polling Penonton Studio"
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] text-slate-500 font-sans">Tanya Penonton</span>
            </button>

            {/* Telepon Teman Lifeline */}
            <button
              onClick={usePhoneFriend}
              disabled={lifelines.phoneFriend || isAnswerConfirmed}
              className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center gap-1 transition-all ${
                lifelines.phoneFriend
                  ? "bg-slate-950 border-slate-900 text-slate-600 line-through cursor-not-allowed"
                  : isAnswerConfirmed
                  ? "opacity-40 border-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-slate-950/40 border-slate-800 text-slate-350 hover:bg-slate-900 hover:border-cyan-500/40 hover:text-cyan-400 cursor-pointer"
              }`}
              title="Telepon Rekan Trivia"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-[10px] text-slate-500 font-sans">Telepon Teman</span>
            </button>

            {/* Ganti Soal Lifeline */}
            <button
              onClick={useSwitchQuestion}
              disabled={lifelines.switchQuestion || isAnswerConfirmed}
              className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center gap-1 transition-all ${
                lifelines.switchQuestion
                  ? "bg-slate-950 border-slate-900 text-slate-600 line-through cursor-not-allowed"
                  : isAnswerConfirmed
                  ? "opacity-40 border-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-slate-950/40 border-slate-800 text-slate-350 hover:bg-slate-900 hover:border-cyan-500/40 hover:text-cyan-400 cursor-pointer"
              }`}
              title="Ganti Lembar Soal Setara"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] text-slate-500 font-sans">Ganti Soal</span>
            </button>
          </div>

          {/* ACTIVE LIFELINE RESULTS */}
          <AnimatePresence>
            {/* Ask the audience visual bar chart overlay */}
            {audiencePoll && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0 }}
                className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Hasil Polling Penonton
                  </span>
                  <button
                    onClick={() => setAudiencePoll(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-end justify-around h-24 pt-2 border-b border-slate-900">
                  {Object.entries(audiencePoll).map(([key, rawVal]) => {
                    const val = Number(rawVal);
                    return (
                      <div key={key} className="flex flex-col items-center w-10 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{val}%</span>
                        <div
                          className="w-4 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all duration-1000"
                          style={{ height: `${val * 0.7}px` }}
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-300">{key}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Phone a Friend dialogue dialog */}
            {friendSuggestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0 }}
                className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1">
                    {friendSuggestion.avatar} {friendSuggestion.name}
                  </span>
                  <button
                    onClick={() => setFriendSuggestion(null)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-slate-300 italic leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-905">
                  "{friendSuggestion.message}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Saran Jawaban Anda</span>
                  <span className="text-cyan-400 font-semibold">{friendSuggestion.confidence}% Percaya Diri</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STATS PRIZE sidebar ladder */}
        <div className="sticky top-4">
          <StatsPanel currentLevel={currentLevel} questionsCount={10} />
        </div>
      </div>

      {/* Custom Exit Confirmation Modal Overlay */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-100"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500" />
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Keluar Dari Game?</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest leading-none mt-1">Peringatan Kuis</p>
                </div>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed">
                Apakah Anda yakin ingin keluar dan menutup kuis ini? Semua akumulasi hadiah berjalan Anda <span className="text-cyan-400 font-bold">{currentLevel > 1 ? PRIZE_LEVELS.find((p) => p.level === currentLevel - 1)?.prize : "Rp 0"}</span> tidak akan tersimpan!
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    audioSystem.playClick();
                    setShowExitConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold select-none cursor-pointer transition-all"
                >
                  BATAL
                </button>
                <button
                  onClick={() => {
                    audioSystem.playClick();
                    onGameQuit();
                  }}
                  className="flex-1 px-4 py-2 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/10 select-none cursor-pointer transition-all"
                >
                  KELUAR KUIS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
