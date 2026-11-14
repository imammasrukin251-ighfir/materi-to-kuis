/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  UploadCloud,
  FileCheck2,
  Sparkles,
  Play,
  Clipboard,
  HelpCircle,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Question, ParseFileResponse } from "../types";
import { audioSystem } from "../utils/audioSystem";

interface UploadWizardProps {
  onQuestionsLoaded: (questions: Question[]) => void;
  onLaunchDefault: () => void;
}

export default function UploadWizard({ onQuestionsLoaded, onLaunchDefault }: UploadWizardProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMassage, setErrorMassage] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    "Mengunggah berkas ke server aman...",
    "Edo Jati AI membaca struktur dokumen Anda...",
    "Meramu pertanyaan dan pilihan ganda (A, B, C, D)...",
    "Melakukan verifikasi kunci jawaban dan tingkat kesulitan...",
    "Mempersiapkan panggung kuis Millionaire megah..."
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMassage(null);
    const mime = selectedFile.type;
    const size = selectedFile.size;

    // Check size < 15MB
    if (size > 15 * 1024 * 1024) {
      setErrorMassage("Ukuran file terlalu besar! Silakan unggah berkas di bawah 15 MB.");
      return;
    }

    // Supported PDF or TXT
    const isPDF = mime === "application/pdf" || selectedFile.name.endsWith(".pdf");
    const isTXT = mime === "text/plain" || selectedFile.name.endsWith(".txt");
    const isWord = mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || selectedFile.name.endsWith(".docx");

    if (isPDF || isTXT || isWord) {
      setFile(selectedFile);
      audioSystem.playClick();
    } else {
      setErrorMassage(
        "Format file tidak didukung! Mohon unggah berkas berformat PDF atau TXT. Untuk dokumen Word (.docx), Anda dapat meng-copy paste isinya di kolom di bawah."
      );
    }
  };

  const triggerLoadingAnimation = () => {
    setIsLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);
    return interval;
  };

  const handleParseDocument = async () => {
    if (!file && !pastedText.trim()) {
      setErrorMassage("Silakan lampirkan dokumen PDF/TXT atau tempel materi kuis terlebih dahulu.");
      return;
    }

    const intervalId = triggerLoadingAnimation();
    setErrorMassage(null);

    try {
      let base64File = "";
      let fileMimeType = "";
      let fileName = "";

      if (file) {
        fileName = file.name;
        fileMimeType = file.type || "application/octet-stream";
        
        // Convert to base64
        base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      // API Post Call
      const response = await fetch("/api/gemini/parse-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: pastedText,
          base64File,
          fileMimeType,
          fileName,
        }),
      });

      const data: ParseFileResponse = await response.json() as any;

      clearInterval(intervalId);
      setIsLoading(false);

      if (data.success && data.questions && data.questions.length > 0) {
        setParsedQuestions(data.questions);
        audioSystem.playCorrect();
      } else {
        setErrorMassage((data as any).error || "Gagal memproses soal berkas. Pastikan isi berkas mempunyai kuis yang dapat dibaca.");
        audioSystem.playWrong();
      }
    } catch (err: any) {
      clearInterval(intervalId);
      setIsLoading(false);
      setErrorMassage("Terjadi hambatan jaringan. Pastikan kunci API Gemini terkonfigurasi dengan benar di menu Secrets.");
      audioSystem.playWrong();
    }
  };

  const handleStartGame = () => {
    if (parsedQuestions && parsedQuestions.length > 0) {
      audioSystem.playClick();
      onQuestionsLoaded(parsedQuestions);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Upper Glowing Card with AI Info */}
      <div className="relative overflow-hidden bg-slate-900/45 border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 self-start md:self-center">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-2 flex-1">
            <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              Transformasikan Materi Anda Menjadi Kuis Premium 🌟
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Cukup unggah file tugas sekolah, rangkuman, modul digital (PDF/TXT), atau tulis naskah materi. Edo Jati AI otomatis menyusunnya menjadi game tegang kuis Millionaire dengan level kesulitan presisi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 pb-2 border-b border-slate-800">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              Langkah 1: Unggah atau Tulis Soal
            </h3>

            {/* File Drag active window */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center flex flex-col items-center justify-center cursor-pointer min-h-[160px] ${
                dragActive
                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  : file
                  ? "border-green-500/50 bg-green-950/10"
                  : "border-slate-700 hover:border-slate-600 bg-slate-950/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
              />

              {file ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                    <FileCheck2 className="w-6 h-6 text-green-400 animate-bounce" />
                  </div>
                  <p className="text-sm text-green-400 font-semibold mb-1 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk ganti file
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">
                    Seret & letakkan file soal di sini
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    Mendukung berkas PDF atau TXT (Maks. 15MB)
                  </p>
                  <button
                    type="button"
                    className="text-xs text-cyan-400 font-bold px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/50"
                  >
                    Pilih File Komputer
                  </button>
                </>
              )}
            </div>

            {/* Paste content Section */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                  Atau tempel teks pelajaran / daftar pertanyaan di sini:
                </span>
                <span className="text-[10px] text-slate-500">Opsional</span>
              </label>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Contoh: Bab I Pancasila Sebagai Ideologi Negara. Kuis tentang amandemen UUD, Pancasila, sejarah sumpah pemuda..."
                rows={4}
                className="w-full text-sm font-sans p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 transition-colors"
              />
            </div>

            {/* Error notifications */}
            {errorMassage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400 leading-normal">{errorMassage}</p>
              </motion.div>
            )}

            {/* Action buttons */}
            <button
              onClick={handleParseDocument}
              disabled={isLoading || (!file && !pastedText.trim())}
              className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 tracking-wide transition-all ${
                isLoading
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : !file && !pastedText.trim()
                  ? "bg-slate-800/40 text-slate-500 border border-slate-800/80 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/10 cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Memproses Materi...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Konversi Teks & Berkas Ke Game
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option play default Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Playground option */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 pb-2 border-b border-slate-800">
              <BookOpen className="w-5 h-5 text-yellow-500" />
              Game Instan Siap Pakai
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ingin langsung mengadu wawasan tanpa mengupload modul pelajaran? Edo Jati AI telah menyediakan naskah kuis sejarah, budaya, nusantara, dan logika terstandar tingkat tinggi.
            </p>

            <button
              onClick={() => {
                audioSystem.playClick();
                onLaunchDefault();
              }}
              className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-lg shadow-yellow-500/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <Flame className="w-5 h-5 text-slate-900 animate-pulse" />
              <span className="font-extrabold uppercase tracking-wider text-sm">
                Mainkan Deck Default
              </span>
              <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick FAQ / Guide */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-400">
            <h4 className="font-semibold text-slate-200 uppercase flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> PANDUAN CEPAT GURU:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Lagu, ringkasan materi, skrip kuis diproses otomatis oleh model.</li>
              <li>Suku, kosakata, sejarah terdeteksi otomatis untuk bobot soal.</li>
              <li>Edo Jati AI akan memastikan tepat 10 soal unik berbobot dari mudah ke sulit.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading Steps screen block */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-28 h-28 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-cyan-500 rounded-full animate-spin" />
              <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 tracking-wide font-sans animate-pulse">
              Sedang Meracik Pertanyaan Kuis...
            </h3>

            <p className="text-sm font-mono text-cyan-400 max-w-md h-6">
              {loadingSteps[loadingStep]}
            </p>

            {/* Little progress markers */}
            <div className="flex gap-2.5 mt-8">
              {loadingSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-1.5 rounded-full transition-colors duration-300 ${
                    idx <= loadingStep ? "bg-cyan-400" : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview parsed Questions overlay layout */}
      <AnimatePresence>
        {parsedQuestions && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative"
          >
            <div className="absolute top-0 left-12 transform -translate-y-1/2 bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              10 Soal Kuis Berhasil Dibuat!
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2 mb-6">
              <div>
                <h3 className="font-bold text-lg text-white">Pratinjau Kuis Edukasi Baru Anda</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Soal telah diurutkan dari Level 1 (paling mudah) sampai Level 10 (puncak hadiah Rp1 Miliar).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  {previewOpen ? (
                    <>Tutup Rincian <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Lihat Rincian <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>

                <button
                  onClick={handleStartGame}
                  className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Mulai Bermain Sekarang!
                </button>
              </div>
            </div>

            {/* Mini Scroll or Detail area */}
            {previewOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {parsedQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400">Soal Level {q.level}</span>
                        <span className="text-[10px] bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded">
                          Kunci: {["A", "B", "C", "D"][q.correctIndex]}
                        </span>
                      </div>

                      <p className="text-slate-200 font-sans font-medium">{q.question}</p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded border truncate ${
                              oIdx === q.correctIndex
                                ? "bg-green-950/20 border-green-500/30 text-green-400 font-medium"
                                : "bg-slate-900 border-slate-800"
                            }`}
                          >
                            {["A", "B", "C", "D"][oIdx]}. {opt}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-900 pt-2 italic">
                          💡 Penjelasan: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/65 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Daftar pertanyaan sudah disiapkan. Siap menguji pemahaman Anda di panggung kuis jutawan?</span>
                </div>
                <button
                  onClick={handleStartGame}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Mulai Main →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
