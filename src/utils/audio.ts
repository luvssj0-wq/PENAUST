// Audio engine using Web Audio API for authentic Peanuts style jazz & ambiance

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  constructor() {
    // Start muted state from storage if exists
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('peanuts_audio_muted');
      this.isMuted = storedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('peanuts_audio_muted', String(this.isMuted));
    }
    if (this.isMuted && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play piano notes (Schroeder's toy piano)
  public playPianoNote(freq: number, duration = 0.6) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Schroeder toy piano timbre: slightly bright square/triangle combo
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Peanuts signature chord sequence (Linus & Lucy opening motif snippet)
  public playPeanutsJingle() {
    if (this.isMuted) return;
    const notes = [
      { f: 523.25, d: 0.2, del: 0 },    // C5
      { f: 659.25, d: 0.2, del: 0.12 }, // E5
      { f: 783.99, d: 0.25, del: 0.24 },// G5
      { f: 880.00, d: 0.35, del: 0.38 },// A5
      { f: 783.99, d: 0.45, del: 0.54 } // G5
    ];
    notes.forEach((n) => {
      setTimeout(() => {
        this.playPianoNote(n.f, n.d);
      }, n.del * 1000);
    });
  }

  // Typewriter key click (for notebook & dialogue)
  public playTypewriterClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + Math.random() * 400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // Footstep sound
  public playFootstep(surface: 'grass' | 'wood' | 'ice' = 'grass') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (surface === 'ice') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900 + Math.random() * 100, t);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    } else if (surface === 'wood') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 30, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 + Math.random() * 40, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Thought inspiration chime
  public playInspireChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPianoNote(freq, 0.7);
      }, idx * 110);
    });
  }

  // Door enter/exit chime
  public playDoor() {
    if (this.isMuted) return;
    this.playPianoNote(392.00, 0.2);
    setTimeout(() => this.playPianoNote(523.25, 0.35), 90);
  }

  // Baseball bat hit sound
  public playBatHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Save game chime (pleasant, reassuring arpeggio)
  public playSaveGame() {
    if (this.isMuted) return;
    const notes = [
      { f: 523.25, d: 0.15, del: 0 },    // C5
      { f: 659.25, d: 0.15, del: 0.08 }, // E5
      { f: 783.99, d: 0.18, del: 0.16 }, // G5
      { f: 1046.50, d: 0.35, del: 0.24 } // C6
    ];
    notes.forEach((n) => {
      setTimeout(() => this.playPianoNote(n.f, n.d), n.del * 1000);
    });
  }

  // Load game chime
  public playLoadGame() {
    if (this.isMuted) return;
    const notes = [
      { f: 783.99, d: 0.15, del: 0 },    // G5
      { f: 659.25, d: 0.15, del: 0.09 }, // E5
      { f: 523.25, d: 0.3, del: 0.18 },  // C5
      { f: 659.25, d: 0.35, del: 0.28 }  // E5
    ];
    notes.forEach((n) => {
      setTimeout(() => this.playPianoNote(n.f, n.d), n.del * 1000);
    });
  }

  // Sleep into a new day
  public playSleepChime() {
    if (this.isMuted) return;
    const notes = [
      { f: 440.00, d: 0.3, del: 0 },
      { f: 554.37, d: 0.3, del: 0.2 },
      { f: 659.25, d: 0.4, del: 0.4 },
      { f: 880.00, d: 0.6, del: 0.65 }
    ];
    notes.forEach((n) => {
      setTimeout(() => this.playPianoNote(n.f, n.d), n.del * 1000);
    });
  }
}

export const sound = new SoundEngine();
