/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  question: string;
  options: string[]; // Length must be exactly 4
  correctIndex: number; // 0, 1, 2, or 3
  explanation?: string;
  level: number; // 1 to 10
}

export interface ParseFileResponse {
  success: boolean;
  questions: Question[];
  message?: string;
}

export interface LifelineState {
  fiftyFifty: boolean;
  askAudience: boolean;
  phoneFriend: boolean;
  switchQuestion: boolean;
}

export type GameStatus = "MAIN_MENU" | "PREPARING" | "PLAYING" | "RESULT";

export interface FriendSuggestion {
  name: string;
  avatar: string;
  message: string;
  confidence: number;
}

export interface AudienceResult {
  poll: { [key: string]: number }; // e.g. { A: 45, B: 15, C: 30, D: 10 }
}

export interface LevelMilestone {
  level: number;
  prize: string;
  isSafePoint: boolean;
}
