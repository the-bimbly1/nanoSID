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

    this.dis = 5.0;   // Distortion 0-10
    this.crn = 5.0;   // Crunch 0-10

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
      // Envelope with sharp dirt cutoff on release
      let target = 0;
      let speed = 0.015;
      let dirtSpeed = 0.015;

      if (this.envState === 0) { 
        target = 1; 
        speed = 1 / (this.attack * sampleRate * 0.4 + 1); 
      } else if (this.envState === 1) { 
        target = this.sustain; 
        speed = 1 / (this.decay * sampleRate * 0.4 + 1); 
      } else if (this.envState === 2) { 
        target = this.sustain; 
        speed = 0; 
      } else { 
        target = 0; 
        speed = 1 / (this.release * sampleRate * 0.18 + 1); 
        dirtSpeed = 1 / (this.release * sampleRate * 0.08 + 1); // sharper for dirt
      }

      this.envLevel += (target - this.envLevel) * speed;

      if (this.envState === 0 && this.envLevel >= 0.97) this.envState = 1;
      if (this.envState === 1 && Math.abs(this.envLevel - this.sustain) < 0.03) this.envState = 2;
      if (this.envState === 3 && this.envLevel < 0.001) this.envLevel = 0;

      let sample = 0;

      if (this.envLevel > 0.001) {
        this.phase = (this.phase + this.freq / sampleRate) % 1;

        let osc = 0;
        switch (this.waveform) {
          case 0: osc = this.phase < 0.5 ? this.phase * 4 - 1 : 3 - this.phase * 4; break;
          case 1: osc = this.phase * 2 - 1; break;
          case 2: osc = this.phase < this.pulsewidth ? 1 : -1; break;
          case 3: // Pure Noise
            sample = (Math.random() * 2 - 1) * this.envLevel * 0.95;
            break;
        }

        if (this.waveform !== 3) {
          // Crunch controlled by DIS and CRN
          let distortion = 1.0 + this.dis * 0.38;
          osc = Math.tanh(osc * distortion);
          osc += Math.sin(osc * 14) * (this.crn * 0.028);

          // Sharp dirt cutoff during release
          let dirtLevel = this.envLevel;
          if (this.envState === 3) dirtLevel = Math.pow(this.envLevel, 2.5); // much faster drop

          sample = osc * dirtLevel * 0.48;
        }
      }

      // Filter
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