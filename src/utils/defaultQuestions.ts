/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, LevelMilestone } from "../types";

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "def_1",
    question: "Siapakah komponis berbakat yang menciptakan lagu kebangsaan negara kita, 'Indonesia Raya'?",
    options: [
      "W.R. Supratman",
      "Ismail Marzuki",
      "Ibu Sud",
      "Kusbini"
    ],
    correctIndex: 0,
    explanation: "Lagu kebangsaan 'Indonesia Raya' digubah oleh Wage Rudolf Supratman dan pertama kali dikumandangkan secara instrumental pada Kongres Pemuda II tanggal 28 Oktober 1928.",
    level: 1
  },
  {
    id: "def_2",
    question: "Kota manakah di Jawa Barat yang sangat ikonik dengan julukan sejarah 'Kota Kembang'?",
    options: [
      "Bogor",
      "Cirebon",
      "Bandung",
      "Sukabumi"
    ],
    correctIndex: 2,
    explanation: "Bandung dijuluki Kota Kembang karena pada masa kolonial Belanda, wilayah ini dipenuhi oleh pemandangan pohon-pohon hias dan kebun bunga yang indah merekah.",
    level: 2
  },
  {
    id: "def_3",
    question: "Suku adat lokal yang sangat menjaga kemurnian budaya tradisional di pedalaman Provinsi Banten dikenal dengan nama...",
    options: [
      "Suku Asmat",
      "Suku Baduy",
      "Suku Dayak",
      "Suku Toraja"
    ],
    correctIndex: 1,
    explanation: "Suku Baduy (Urung Kanekes) merupakan kelompok masyarakat adat sub-suku Sunda asli yang sangat kukuh menutup pengaruh modernisasi dan memegang erat pikukuh karuhun jawa-sunda.",
    level: 3
  },
  {
    id: "def_4",
    question: "Candi bercorak Buddha termegah dan terbesar di dunia yang diakui sebagai Warisan Budaya Dunia UNESCO adalah...",
    options: [
      "Candi Prambanan",
      "Candi Mendut",
      "Candi Borobudur",
      "Candi Kalasan"
    ],
    correctIndex: 2,
    explanation: "Candi Borobudur yang megah terletak di Magelang, Jawa Tengah, didirikan pada abad ke-8 di bawah masa pemerintahan dinasti Syailendra bercorak Buddha Mahayana.",
    level: 4
  },
  {
    id: "def_5",
    question: "Samudra manakah yang membatasi wilayah kepulauan Indonesia secara geografis di bagian barat dan selatan?",
    options: [
      "Samudra Pasifik",
      "Samudra Hindia",
      "Samudra Atlantik",
      "Samudra Arktik"
    ],
    correctIndex: 1,
    explanation: "Secara geografis, kepulauan Indonesia diapit oleh dua samudra besar yaitu Samudra Pasifik di timur laut, dan Samudra Hindia di sebelah barat dan selatan.",
    level: 5
  },
  {
    id: "def_6",
    question: "Danau vulkanik purba terbesar di dunia yang terbentuk akibat super-erupsi dahsyat ribuan tahun lalu di Sumatera Utara adalah...",
    options: [
      "Danau Singkarak",
      "Danau Maninjau",
      "Danau Toba",
      "Danau Sentani"
    ],
    correctIndex: 2,
    explanation: "Danau Toba terbentuk akibat letusan dahsyat gunung supervulkan Toba sekitar 74.000 tahun yang lalu, meninggalkan kaldera raksasa yang kini menjadi daya tarik wisata dunia.",
    level: 6
  },
  {
    id: "def_7",
    question: "Siapakah tokoh proklamator terhormat yang mendampingi Bung Karno sebagai Wakil Presiden Republik Indonesia pertama?",
    options: [
      "Drs. Mohammad Hatta",
      "Sutan Sjahrir",
      "Tan Malaka",
      "Ki Hajar Dewantara"
    ],
    correctIndex: 0,
    explanation: "Drs. Mohammad Hatta (Bung Hatta) adalah bapak proklamator, pejuang negarawan sejati, ekonom unggul, sekaligus menjabat sebagai Wakil Presiden RI pertama yang berdedikasi tinggi.",
    level: 7
  },
  {
    id: "def_8",
    question: "Provinsi termuda di Indonesia (provinsi ke-38) yang diresmikan pada bulan November 2022 adalah...",
    options: [
      "Papua Selatan",
      "Papua Tengah",
      "Papua Pegunungan",
      "Papua Barat Daya"
    ],
    correctIndex: 3,
    explanation: "Provinsi Papua Barat Daya dibentuk secara resmi pada 17 November 2022 berdasarkan UU Nomor 29 Tahun 2022, menjadikannya provinsi ke-38 sekaligus termuda di Indonesia.",
    level: 8
  },
  {
    id: "def_9",
    question: "Burung Cendrawasih yang luar biasa indah bulunya secara alami dapat ditemukan di lanskap alam pulau...",
    options: [
      "Sulawesi",
      "Kalimantan",
      "Sumatera",
      "Papua"
    ],
    correctIndex: 3,
    explanation: "Cendrawasih merupakan burung endemik keluarga Paradisaeidae yang banyak ditemukan di belantara hutan belantara Papua, Papua Nugini, dan kepulauan Selat Torres.",
    level: 9
  },
  {
    id: "def_10",
    question: "Konferensi Asia-Afrika (KAA) yang bersejarah pertama kali diselenggarakan di Gedung Merdeka Bandung pada tahun...",
    options: [
      "1945",
      "1950",
      "1955",
      "1960"
    ],
    correctIndex: 2,
    explanation: "Konferensi Asia-Afrika diselenggarakan mulai tanggal 18-24 April 1955 di Gedung Merdeka, Bandung, mengumpulkan pemimpin-pemimpin negara yang baru merdeka untuk menyuarakan Dasasila Bandung.",
    level: 10
  }
];

export const PRIZE_LEVELS: LevelMilestone[] = [
  { level: 10, prize: "Rp 1.000.000.000", isSafePoint: true },
  { level: 9, prize: "Rp 500.000.000", isSafePoint: false },
  { level: 8, prize: "Rp 250.000.000", isSafePoint: true },
  { level: 7, prize: "Rp 100.000.000", isSafePoint: false },
  { level: 6, prize: "Rp 50.000.000", isSafePoint: false },
  { level: 5, prize: "Rp 25.000.000", isSafePoint: false },
  { level: 4, prize: "Rp 10.000.000", isSafePoint: true },
  { level: 3, prize: "Rp 5.000.000", isSafePoint: false },
  { level: 2, prize: "Rp 2.000.000", isSafePoint: false },
  { level: 1, prize: "Rp 1.000.000", isSafePoint: false }
];

export const getSafePointPrize = (completedLevel: number): string => {
  if (completedLevel >= 10) return "Rp 1.000.000.000";
  if (completedLevel >= 8) return "Rp 250.000.000";
  if (completedLevel >= 4) return "Rp 10.000.000";
  return "Rp 0";
};
