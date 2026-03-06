export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.buffers = new Map();
    this.isMuted = false;
    this.musicNode = null;
    this.baseVolume = 0.6;
  }

  async init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.baseVolume;
    this.masterGain.connect(this.ctx.destination);

    this.preload();
  }

  preload() {
    // Procedural synthesis keeps project copyright-clean and avoids network fetches.
    this.buffers.set('jump', this.createTone(680, 0.11, 'triangle', 0.12, true));
    this.buffers.set('slide', this.createTone(180, 0.16, 'sawtooth', 0.13, false));
    this.buffers.set('coin', this.createTone(1200, 0.08, 'square', 0.1, true));
    this.buffers.set('crash', this.createNoise(0.45, 0.22));
    this.buffers.set('music', this.createMusicLoop(2.6));
  }

  createTone(freq, duration, wave, gain, pitchUp) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-7 * t / duration);
      const hz = pitchUp ? freq * (1 + t * 0.5) : freq * (1 - t * 0.25);
      data[i] = this.oscSample(wave, hz * t) * env * gain;
    }
    return buffer;
  }

  oscSample(wave, phase) {
    if (wave === 'square') return Math.sin(phase * Math.PI * 2) > 0 ? 1 : -1;
    if (wave === 'sawtooth') return 2 * (phase - Math.floor(phase + 0.5));
    if (wave === 'triangle') return Math.asin(Math.sin(phase * Math.PI * 2)) * (2 / Math.PI);
    return Math.sin(phase * Math.PI * 2);
  }

  createNoise(duration, gain) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = Math.pow(1 - t, 2);
      data[i] = (Math.random() * 2 - 1) * env * gain;
    }
    return buffer;
  }

  createMusicLoop(duration) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    const notes = [220, 277.18, 329.63, 246.94];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const step = Math.floor((t / duration) * notes.length);
      const f = notes[step % notes.length];
      const bass = Math.sin(2 * Math.PI * f * 0.5 * t) * 0.12;
      const lead = Math.sin(2 * Math.PI * f * t) * 0.05;
      const hat = (Math.random() * 2 - 1) * (Math.sin(2 * Math.PI * 8 * t) > 0.96 ? 0.018 : 0);
      data[i] = bass + lead + hat;
    }
    return buffer;
  }

  play(name, options = {}) {
    if (!this.ctx || this.isMuted) return;
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = options.volume ?? 1;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
    return source;
  }

  startMusic() {
    if (!this.ctx || this.isMuted || this.musicNode) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.get('music');
    source.loop = true;
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.55;
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
    this.musicNode = source;
  }

  stopMusic() {
    if (!this.musicNode) return;
    this.musicNode.stop();
    this.musicNode = null;
  }

  setVolume(volume) {
    this.baseVolume = volume;
    if (this.masterGain) this.masterGain.gain.value = this.isMuted ? 0 : volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) this.masterGain.gain.value = this.isMuted ? 0 : this.baseVolume;
    return this.isMuted;
  }
}
