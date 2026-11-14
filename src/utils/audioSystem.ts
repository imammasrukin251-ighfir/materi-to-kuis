/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSystem {
  private ctx: AudioContext | null = null;
  private backgroundDroneInterval: any = null;
  private isMuted: boolean = false;
  private currentDroneNode: OscillatorNode | null = null;
  private currentDroneGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    this.resume();
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopBackgroundMusic();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  private createGain(duration: number, startVal = 0.1, endVal = 0.0001): GainNode | null {
    if (!this.ctx || this.isMuted) return null;
    this.resume();
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(startVal, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(endVal, this.ctx.currentTime + duration);
    gainNode.connect(this.ctx.destination);
    return gainNode;
  }

  // SOUND EFECTS
  playWhoosh() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const duration = 0.6;
    const gain = this.createGain(duration, 0.15, 0.001);
    if (!gain) return;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + duration - 0.1);

    noise.connect(filter);
    filter.connect(gain);
    noise.start();
  }

  playTick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const gain = this.createGain(0.08, 0.12, 0.001);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // High pitch woodblock block tick
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playHeartbeat(urgencyMultiplier = 1.0) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    // double beat
    const now = this.ctx.currentTime;
    const playBeat = (timeDelay: number, f: number) => {
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.35, now + timeDelay);
      g.gain.exponentialRampToValueAtTime(0.001, now + timeDelay + 0.15);
      g.connect(this.ctx!.destination);

      const o = this.ctx!.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, now + timeDelay);
      o.frequency.exponentialRampToValueAtTime(30, now + timeDelay + 0.12);
      o.connect(g);
      o.start(now + timeDelay);
      o.stop(now + timeDelay + 0.2);
    };

    playBeat(0, 52 * urgencyMultiplier);
    playBeat(0.14, 48 * urgencyMultiplier);
  }

  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const gain = this.createGain(0.12, 0.15, 0.001);
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playCorrect() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C-E-G-C-E-G-C majestic lift
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.12;
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.setValueAtTime(0.15, startTime);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      g.connect(this.ctx!.destination);

      const o = this.ctx!.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, startTime);
      o.connect(g);
      o.start(startTime);
      o.stop(startTime + 0.7);
    });

    // Add extra triumphant fanfare chords
    const finalG = this.ctx.createGain();
    finalG.gain.setValueAtTime(0, now);
    finalG.gain.setValueAtTime(0.1, now + 0.85);
    finalG.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    finalG.connect(this.ctx.destination);

    [523.25, 659.25, 783.99, 1318.51].forEach((f) => {
      const o = this.ctx!.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, now + 0.85);
      o.connect(finalG);
      o.start(now + 0.85);
      o.stop(now + 2.6);
    });
  }

  playWrong() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Orchestral suspense crash down (dissonant semitones)
    const g = this.createGain(2.0, 0.25, 0.001);
    if (!g) return;

    const baseFreqs = [180.0, 172.0, 110.0, 115.0]; // muddy dissonant drop
    baseFreqs.forEach((freq) => {
      const o = this.ctx!.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, now);
      o.frequency.linearRampToValueAtTime(freq * 0.45, now + 1.2);
      o.connect(g);
      o.start(now);
      o.stop(now + 2.0);
    });
  }

  playLifeline() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 987.77, 1318.51]; // Cmaj9 sparkly digital chime
    freqs.forEach((f, idx) => {
      const s = now + idx * 0.07;
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.12, s);
      g.gain.exponentialRampToValueAtTime(0.001, s + 0.4);
      g.connect(this.ctx!.destination);

      const o = this.ctx!.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, s);
      o.connect(g);
      o.start(s);
      o.stop(s + 0.45);
    });
  }

  // BACKGROUND SUSPENSE DRONE
  startBackgroundMusic(level = 1) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.stopBackgroundMusic();

    const now = this.ctx.currentTime;
    this.currentDroneGain = this.ctx.createGain();
    this.currentDroneGain.gain.setValueAtTime(0.01, now);
    this.currentDroneGain.gain.linearRampToValueAtTime(0.12, now + 1.5);
    this.currentDroneGain.connect(this.ctx.destination);

    // Deep suspense sine wave drone
    const baseFreq = 65.41; // C2 deep base
    const frequencyMultiplier = 1 + (level - 1) * 0.04;

    this.currentDroneNode = this.ctx.createOscillator();
    this.currentDroneNode.type = "sawtooth";
    this.currentDroneNode.frequency.setValueAtTime(baseFreq * frequencyMultiplier, now);

    // Warm filter to make it analog synth style rather than sharp buzz
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(140 + level * 10, now);
    lowpass.Q.setValueAtTime(4.0, now);

    this.currentDroneNode.connect(lowpass);
    lowpass.connect(this.currentDroneGain);
    this.currentDroneNode.start(now);

    // Setup rhythmic pulsing heart rate based on current game kuis level
    const pulseIntervalMs = Math.max(400, 1200 - (level * 100)); // levels 1..10 heartbeats match levels
    this.backgroundDroneInterval = setInterval(() => {
      this.playHeartbeat(1.0 + (level * 0.08));
    }, pulseIntervalMs);
  }

  stopBackgroundMusic() {
    if (this.backgroundDroneInterval) {
      clearInterval(this.backgroundDroneInterval);
      this.backgroundDroneInterval = null;
    }
    if (this.currentDroneNode) {
      try {
        this.currentDroneNode.stop();
      } catch (e) {}
      this.currentDroneNode = null;
    }
    if (this.currentDroneGain) {
      this.currentDroneGain = null;
    }
  }

  // SPEAKER TEXT TO SPEECH
  speak(text: string) {
    if (this.isMuted) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      // Cancel previous speaking to prevent queue overlap
      window.speechSynthesis.cancel();

      // Clean the text from emojis and extra symbols to make speech smoother
      let cleanText = text
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "") // Emojis
        .replace(/["'“”«»]/g, "") // Quotes
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "id-ID"; // Set indonesian language default
      
      // Find Indonesian voice if possible
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(voice => voice.lang.includes("id") || voice.lang.includes("ID") || voice.lang.toLowerCase().includes("indonesia"));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      
      utterance.rate = 1.02; // Slightly upbeat host rate
      utterance.pitch = 1.0; // Neutral host pitch

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }
}

export const audioSystem = new AudioSystem();
