export class AudioManager {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
    this.thrustGain = null;
    this.thrustOsc = null;
  }

  init() {
    if (this.context || typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.context = new AudioCtx();
    this.master = this.context.createGain();
    this.master.gain.value = 0.2;
    this.master.connect(this.context.destination);
  }

  ensureContext() {
    if (!this.context) {
      this.init();
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) {
      this.master.gain.value = this.muted ? 0 : 0.2;
    }
  }

  isMuted() {
    return this.muted;
  }

  playShoot() {
    if (this.muted || !this.ensureContext()) return;
    const osc = this.context.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 900;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.18, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(this.context.currentTime + 0.18);
  }

  playExplosion() {
    if (this.muted || !this.ensureContext()) return;
    const bufferSize = this.context.sampleRate * 0.4;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.35, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
    noise.connect(filter).connect(gain).connect(this.master);
    noise.start();
    noise.stop(this.context.currentTime + 0.5);
  }

  setThrusting(active) {
    if (!this.ensureContext()) return;
    if (active) {
      if (this.thrustOsc) return;
      const osc = this.context.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 110;
      const gain = this.context.createGain();
      gain.gain.value = this.muted ? 0 : 0.08;
      osc.connect(gain).connect(this.master);
      osc.start();
      this.thrustOsc = osc;
      this.thrustGain = gain;
    } else if (this.thrustOsc) {
      this.thrustOsc.stop(this.context.currentTime + 0.05);
      this.thrustOsc.disconnect();
      this.thrustOsc = null;
      this.thrustGain = null;
    }
  }
}
