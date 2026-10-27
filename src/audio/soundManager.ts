/**
 * Procedural Web Audio Synthesizer for Neon Runner: Cyber Escape.
 * Generates all dynamic sound effects and looping cyberpunk synth music
 * in real-time with zero external audio assets (0% 404 risk).
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isMusicPlaying: boolean = false;
  private musicStep: number = 0;
  private musicIntervalId: number | null = null;
  
  private musicVolume: number = 0.65;
  private sfxVolume: number = 0.85;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    const t = this.ctx.currentTime;
    
    // Low punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.18);
    
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);

    // Thruster hiss / air jet
    this.playNoise(0.18, 1200, 400, 0.25);
  }

  public playSlide() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    // Metallic road scrape
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.35);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);

    this.playNoise(0.35, 2400, 600, 0.3);
  }

  public playLaneSwitch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(3, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playCrystal(comboIndex: number = 0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    const t = this.ctx.currentTime;
    // Scale notes: C5, D5, E5, G5, A5, C6
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const freq = freqs[comboIndex % freqs.length];

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  public playNearMiss() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    const t = this.ctx.currentTime;
    // Sub-bass sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.5);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.6);

    // High shimmer
    this.playNoise(0.4, 3000, 900, 0.25);
  }

  public playCrash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    const t = this.ctx.currentTime;
    // Massive bass blast
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.8);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.85);

    // Noise explosion
    this.playNoise(0.9, 1500, 200, 0.6);
  }

  public playButtonClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.sfxVolume <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  private playNoise(duration: number, startFilterFreq: number, endFilterFreq: number, vol: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const t = this.ctx.currentTime;
    filter.frequency.setValueAtTime(startFilterFreq, t);
    filter.frequency.exponentialRampToValueAtTime(endFilterFreq, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);
  }

  // --- Procedural Looping Cyberpunk Synthwave Music ---

  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.musicStep = 0;

    // 130 BPM = 16th note step is (60 / 130 / 4) ≈ 0.115s
    const stepTimeMs = (60 / 130 / 4) * 1000;
    
    this.musicIntervalId = window.setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain || this.musicVolume <= 0) return;
      this.playMusicStep(this.musicStep);
      this.musicStep = (this.musicStep + 1) % 64; // 4 bar loop
    }, stepTimeMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  private playMusicStep(step: number) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    // 1. Kick on beats 0, 4, 8, 12, etc. (four on the floor)
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, t);
      kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      kickGain.gain.setValueAtTime(0.4, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.15);
    }

    // 2. Off-beat Synth Hi-Hat on step 2, 6, 10, 14
    if (step % 4 === 2) {
      const hatOsc = this.ctx.createOscillator();
      const hatGain = this.ctx.createGain();
      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(7000, t);
      hatGain.gain.setValueAtTime(0.06, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      hatOsc.connect(hatGain);
      hatGain.connect(this.musicGain);
      hatOsc.start(t);
      hatOsc.stop(t + 0.05);
    }

    // 3. Cyber Bass Arpeggio on every 16th step!
    // Chords: Dm -> Bb -> C -> Am (Classic cyberpunk minor progression)
    const bar = Math.floor(step / 16);
    const rootNotes = [73.42, 58.27, 65.41, 55.00]; // D2, Bb1, C2, A1
    const root = rootNotes[bar % 4];

    // Rolling 16th bassline pattern (root, octave, fifth, octave)
    const arpOffsets = [1, 2, 1.5, 2];
    const bassFreq = root * arpOffsets[step % 4];

    const bassOsc = this.ctx.createOscillator();
    const bassFilter = this.ctx.createBiquadFilter();
    const bassGain = this.ctx.createGain();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(bassFreq, t);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(700, t);
    bassFilter.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    bassFilter.Q.setValueAtTime(4, t);

    bassGain.gain.setValueAtTime(0.25, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);

    bassOsc.start(t);
    bassOsc.stop(t + 0.1);

    // 4. Synth Arp Melody / Pad stabs on selected steps
    if (step % 8 === 0 || step % 8 === 6) {
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sawtooth';
      
      const leadNotes = [293.66, 349.23, 440.0, 523.25]; // D4, F4, A4, C5
      const note = leadNotes[(step / 2) % leadNotes.length];
      leadOsc.frequency.setValueAtTime(note, t);

      leadGain.gain.setValueAtTime(0.08, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);

      leadOsc.start(t);
      leadOsc.stop(t + 0.28);
    }
  }
}

export const soundManager = new SoundManager();
