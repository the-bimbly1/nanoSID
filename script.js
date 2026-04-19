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
    this.attack = 0.01;
    this.decay = 0.3;
    this.sustain = 0.7;
    this.release = 0.5;
    this.cutoff = 3000;
    this.resonance = 0.4;

    this.filterLP = 0;

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
        case "attack":     this.attack = msg.value; break;
        case "decay":      this.decay = msg.value; break;
        case "sustain":    this.sustain = msg.value; break;
        case "release":    this.release = msg.value; break;
        case "cutoff":     this.cutoff = msg.value; break;
        case "resonance":  this.resonance = msg.value; break;
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0][0];
    if (!output) return true;

    for (let i = 0; i < output.length; i++) {
      let target = 0;
      let speed = 0.015;
      if (this.envState === 0) { target = 1; speed = 1 / (this.attack * sampleRate * 0.4 + 1); }
      else if (this.envState === 1) { target = this.sustain; speed = 1 / (this.decay * sampleRate * 0.4 + 1); }
      else if (this.envState === 2) { target = this.sustain; speed = 0; }
      else { target = 0; speed = 1 / (this.release * sampleRate * 0.18 + 1); }

      this.envLevel += (target - this.envLevel) * speed;

      if (this.envState === 0 && this.envLevel >= 0.97) this.envState = 1;
      if (this.envState === 1 && Math.abs(this.envLevel - this.sustain) < 0.03) this.envState = 2;
      if (this.envState === 3 && this.envLevel < 0.001) this.envLevel = 0;

      let sample = 0;

      if (this.envLevel > 0.001) {
        if (this.waveform === 3) {
          // Strong exponential scaling stretched from old C2→C0 to old C7→C9
          const oldLow = 65.41;   // old C2
          const oldHigh = 2093.0; // old C7
          const newLow = 16.35;   // target C0
          const newHigh = 8372.0; // target C9

          let normalized = Math.log(this.freq / oldLow) / Math.log(oldHigh / oldLow);
          normalized = Math.max(0, Math.min(1, normalized));

          const targetSpeed = newLow * Math.pow(newHigh / newLow, normalized);

          // Use targetSpeed to control how often we update the random value
          const updateRate = targetSpeed / 440; // normalize

          if (Math.random() < updateRate * 0.3) {
            this.noiseValue = (Math.random() * 2 - 1);
          }

          sample = (this.noiseValue || (Math.random() * 2 - 1)) * this.envLevel * 0.93;
        } else {
          this.phase = (this.phase + this.freq / sampleRate) % 1;

          let osc = 0;
          switch (this.waveform) {
            case 0: osc = this.phase < 0.5 ? this.phase * 4 - 1 : 3 - this.phase * 4; break;
            case 1: osc = this.phase * 2 - 1; break;
            case 2: osc = this.phase < this.pulsewidth ? 1 : -1; break;
          }
          sample = osc * this.envLevel * 0.35;
        }
      }

      const f = Math.min(0.96, this.cutoff / (sampleRate * 0.5));
      this.filterLP = this.filterLP * (1 - f) + sample * f;

      output[i] = this.filterLP * 0.78;
    }
    return true;
  }
}

registerProcessor("nanosid-processor", NanoSIDProcessor);