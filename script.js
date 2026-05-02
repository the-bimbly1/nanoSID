class NanoSIDProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.phase = 0;
    this.freq = 440;
    this.gate = 0;
    this.envLevel = 0;
    this.envState = 3;

    this.waveform = 1;
    this.pulsewidth = 0.5;
    this.ringmod = 0;
    this.attack = 0.01;
    this.decay = 0.3;
    this.sustain = 0.7;
    this.release = 0.10;        // Correct default
    this.cutoff = 3000;
    this.resonance = 0.4;

    this.dis = 5.0;
    this.crn = 5.0;

    this.filterLP1 = 0;
    this.filterLP2 = 0;

    this.port.onmessage = (e) => this._onMessage(e.data);
  }

  _onMessage(msg) {
    if (msg.type === "noteOn") {
      this.freq = msg.frequency || 440;
      this.gate = 1;
      this.envState = 0;
      this.envLevel = 0;
      this.phase = 0;
    } else if (msg.type === "noteOff") {
      this.gate = 0;
      this.envState = 3;
    } else if (msg.type === "param") {
      switch (msg.key) {
        case "waveform":   this.waveform = Math.round(msg.value); break;
        case "pulsewidth": this.pulsewidth = msg.value; break;
        case "ringmod":    this.ringmod = Math.round(msg.value); break;
        case "attack":     this.attack = msg.value; break;
        case "decay":      this.decay = msg.value; break;
        case "sustain":    this.sustain = msg.value; break;
        case "release":    this.release = msg.value; break;
        case "cutoff":     this.cutoff = msg.value; break;
        case "resonance":  this.resonance = msg.value; break;
        case "dis":        this.dis = msg.value; break;
        case "crn":        this.crn = msg.value; break;
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0][0];
    if (!output) return true;

    for (let i = 0; i < output.length; i++) {
      // Envelope first (core of the sound)
      let target = 0;
      let speed = 0.015;
      if (this.envState === 0) { target = 1; speed = 1 / (this.attack * sampleRate * 0.4 + 1); }
      else if (this.envState === 1) { target = this.sustain; speed = 1 / (this.decay * sampleRate * 0.4 + 1); }
      else if (this.envState === 2) { target = this.sustain; speed = 0; }
      else { target = 0; speed = 1 / (this.release * sampleRate * 0.12 + 1); } // aggressive release

      this.envLevel += (target - this.envLevel) * speed;

      if (this.envState === 0 && this.envLevel >= 0.97) this.envState = 1;
      if (this.envState === 1 && Math.abs(this.envLevel - this.sustain) < 0.03) this.envState = 2;
      if (this.envState === 3 && this.envLevel < 0.001) this.envLevel = 0;

      let sample = 0;

      if (this.envLevel > 0.001) {
        this.phase = (this.phase + this.freq / sampleRate) % 1;

        // Generate base waveforms
        let tri = this.phase < 0.5 ? this.phase * 4 - 1 : 3 - this.phase * 4;
        let saw = this.phase * 2 - 1;
        let pulse = this.phase < this.pulsewidth ? 1 : -1;

        let osc = 0;
        const w = this.waveform;

        if (w === 0) osc = tri;
        else if (w === 1) osc = saw;
        else if (w === 2) osc = pulse;
        else if (w === 3) {
          const speedFactor = Math.pow(this.freq / 261.63, 1.65);
          if (Math.random() < speedFactor * 0.25) this.noiseValue = (Math.random() * 2 - 1);
          sample = (this.noiseValue || (Math.random() * 2 - 1)) * this.envLevel * 0.93;
        } else if (w === 4) osc = (tri * 0.6) + (saw * 0.6);
        else if (w === 5) osc = (tri * 0.6) + (pulse * 0.6);
        else if (w === 6) osc = (saw * 0.6) + (pulse * 0.6);
        else if (w === 7) osc = (tri * 0.45) + (saw * 0.45) + (pulse * 0.45);

        if (this.waveform !== 3) {
          // Ring Mod (part of core oscillator sound)
          if (this.ringmod) {
            const ringMod = (this.phase < 0.5) ? 1 : -1;
            osc *= ringMod;
            if (this.waveform === 2) osc *= 0.85; // prevent clipping on Pulse
          }

          // Apply envelope to the core sound
          sample = osc * this.envLevel;

          // Now apply distortion + crunch to the enveloped signal
          let distortion = 1.0 + this.dis * 0.38;
          sample = Math.tanh(sample * distortion);
          sample += Math.sin(sample * 14) * (this.crn * 0.028);
        }
      }

      // Filter (last in chain)
      const f = Math.min(0.96, this.cutoff / (sampleRate * 0.5));
      const r = this.resonance * 2.8;
      this.filterLP1 = this.filterLP1 * (1 - f) + sample * f;
      this.filterLP2 = this.filterLP2 * (1 - f) + this.filterLP1 * f;
      sample = this.filterLP2 + this.filterLP2 * r * 0.16;

      const crushed = Math.round(sample * 26) / 26;
      output[i] = crushed * 0.74;
    }
    return true;
  }
}

registerProcessor("nanosid-processor", NanoSIDProcessor);