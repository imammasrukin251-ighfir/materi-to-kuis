/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup body parsers with limits for PDF base64 handling
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API endpoint to check service health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasAi: !!ai });
  });

  // API endpoint: Parse uploaded file or text using Gemini
  app.post("/api/gemini/parse-file", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({
          success: false,
          error: "Gemini API client is not initialized. Please configure GEMINI_API_KEY in Secrets.",
        });
      }

      const { textContent, base64File, fileMimeType, fileName } = req.body;

      if (!textContent && !base64File) {
        return res.status(400).json({
          success: false,
          error: "Mohon sediakan teks soal atau file dokumen kuis yang valid untuk diproses.",
        });
      }

      let contents: any[] = [];
      let prompt = `
Anda adalah Host AI profesional untuk game show kuis bergengsi "MATERI to KUIS MILLIONAIRE".
Tugas Anda adalah memproses dokumen/teks input dari Guru dan mengekaskadenya menjadi tepat 10 pertanyaan pilihan ganda yang sangat mendidik, seru, dan berkualitas tinggi.

Petunjuk Pembuatan Kuis:
1. Baca dan pahami analisis dokumen atau teks yang diupload.
2. Buat tepat 10 pertanyaan menarik yang diurutkan berdasarkan tingkat kesulitan (Level 1 sampai Level 10). Level 1 adalah kuis termudah (hadiah terkecil) dan Level 10 adalah tantangan pamungkas (hadiah tertinggi Rp1 Miliar).
3. Setiap kuis wajib memiliki tepat 4 opsi jawaban (pilihan A, B, C, dan D). Posisikan jawaban benar secara acak di antara opsi tersebut.
4. Jika materi yang diupload sangat singkat, sedikit, atau tidak berisi 10 pertanyaan, gunakan materi tersebut sebagai tema utama, lalu elaborasikan pengetahuan tambahan terkait tema tersebut untuk melengkapi kuis sehingga menjadi tepat 10 soal yang mendidik.
5. Sediakan penjelasan edukatif singkat tentang mengapa jawaban tersebut benar untuk ditampilkan kepada pemain nanti.
6. Semua kuis dan teks wajib dalam Bahasa Indonesia yang baik, seru, dramatis, dan komunikatif.

Kembalikan data dalam format JSON yang terstruktur.
`;

      if (base64File && fileMimeType) {
        contents.push({
          inlineData: {
            mimeType: fileMimeType,
            data: base64File,
          },
        });
        prompt += `\nDokumen terlampir berkas: ${fileName || "document"}. Silakan baca isinya dan ekstrak materi di dalamnya.`;
      }

      if (textContent) {
        prompt += `\nTeks input tambahnya:/n"""\n${textContent}\n"""`;
      }

      contents.push({ text: prompt });

      // Call Gemini API-3.5-flash for processing
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: {
                      type: Type.STRING,
                      description: "Pertanyaan kuis interaktif yang seru dan menantang dalam Bahasa Indonesia.",
                    },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Empat opsi jawaban kuis (A, B, C, D). Panjang array HARUS persis 4.",
                    },
                    correctIndex: {
                      type: Type.INTEGER,
                      description: "Indeks jawaban yang benar (0 untuk pilihan pertama [A], 1 untuk [B], 2 untuk [C], 3 untuk [D]).",
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "Penjelasan mengapa jawaban tersebut benar, ringkas dan mencerahkan.",
                    },
                    level: {
                      type: Type.INTEGER,
                      description: "Tingkat level nominal hadiah (1 sampai 10). Urutkan dari tingkat kesulitan termudah (1) sampai terberat (10).",
                    },
                  },
                  required: ["question", "options", "correctIndex", "explanation", "level"],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini API tidak memberikan respons teks yang valid.");
      }

      const parsedData = JSON.parse(responseText.trim());

      // Validate & Sort questions by level
      let questions = parsedData.questions || [];
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Gagal menyusun format pertanyaan kuis.");
      }

      // Map questions to standard structure with auto IDs
      questions = questions.map((q: any, index: number) => {
        const correctIndex = Number(q.correctIndex) >= 0 && Number(q.correctIndex) <= 3 ? Number(q.correctIndex) : 0;
        const correctOptions = Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Opsi A", "Opsi B", "Opsi C", "Opsi D"];
        return {
          id: `q_${index + 1}_${Date.now()}`,
          question: q.question || "Pertanyaan kuis kosong?",
          options: correctOptions,
          correctIndex,
          explanation: q.explanation || "Semua pilihan dipikirkan matang-matang.",
          level: q.level || (index + 1),
        };
      });

      // Sort by level ascending
      questions.sort((a: any, b: any) => a.level - b.level);

      // Force level mapping from 1 to 10
      questions.forEach((q: any, index: number) => {
        q.level = index + 1;
      });

      return res.json({
        success: true,
        questions,
      });
    } catch (error: any) {
      console.error("Error processing file with Gemini:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Terjadi kesalahan internal saat memproses soal kuis.",
      });
    }
  });

  // Vite Integration in Express
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Millionaire Indonesia Server running on http://localhost:${PORT}`);
  });
}

startServer();
