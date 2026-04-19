# nanoSID

**A raw, nasty 6581 SID emulator for nanoTracker.**

This is a simple single-voice Commodore 64 SID instrument. No fluff, no overcomplicated features — just the core nasty character of the real 6581 chip.

### Features

- Four classic waveforms: Triangle, Saw, Pulse, Noise
- Real 6581-style crunch and distortion
- Independent Noise channel (pure white noise, no tonal artifacts)
- User-controllable nastiness:
  - **DIS** – Distortion amount
  - **CRN** – Extra harmonic crunch and filter dirt
- Simple, focused interface

### Parameters

| Knob     | Label | Range      | What it does |
|----------|-------|------------|--------------|
| WAVE     | WAVE  | 0–3        | 0 = Triangle, 1 = Saw, 2 = Pulse, 3 = Noise |
| PW       | PW    | 0–1        | Pulse width (affects Pulse only)            |
| ATT      | ATT   | 0–2s       | Attack time                                 |
| DEC      | DEC   | 0–3s       | Decay time                                  |
| SUS      | SUS   | 0–1        | Sustain level                               |
| REL      | REL   | 0–4s       | Release time                                |
| CUT      | CUT   | 100–12k Hz | Filter cutoff                               |
| RES      | RES   | 0–0.95     | Filter resonance                            |
| DIS      | DIS   | 0–10       | Distortion / waveshaping intensity          |
| CRN      | CRN   | 0–10       | Extra harmonic crunch & filter dirt         |

### How to use

1. Download the latest `nanoSID.ntins` from the [Releases](https://github.com/the-bimbly1/nanoSID/releases) page.
2. Drag it into nanoTracker.
3. Assign it to a track and play.

**Pro tip:**  
Crank **DIS** and **CRN** for maximum 6581 nastiness. Turn them down if you want a cleaner sound.

### Philosophy

This plugin is intentionally minimal. The real SID was never "perfect" — it was raw, unstable, and full of character. That’s what I aimed for.

Noise is completely independent and uses pure white noise. The other waveforms get the classic SID crunch and distortion.

### Credits

- Built with love by the-bimbly1 with debugging assistance from xAI SuperGrok
- Inspired by the legendary Commodore 64 SID 6581
- Made for nanoTracker by Savannah (savannah-i-g)

---

## Version History
### v0.9.1 (Current)

- Noise channel (Waveform 3) now properly responds to played note frequency
- Low notes are dark/rumbling, high notes are bright/hissy with a smooth, usable spread across the keyboard
- Noise is fully independent from oscillator by using Math.random() for clean generation
- Minor envelope and filter tweaks for better overall response

### v0.9

- Added user-controllable crunch parameters: DIS (Distortion) and CRN (Crunch)
- Improved release behavior with sharper dirt cutoff to reduce unwanted trailing echo tail
- General stability and sound quality improvements

### v0.8

- Simplified to 4 core waveforms (Triangle, Saw, Pulse, Noise)
- Clean single-voice layout
- Basic envelope, filter, and pulse width controls

### v0.7 and earlier

- Initial per-voice experiments, unison mode, monophonic glide, and early crunch attempts

---

**Licensed under the [MIT License](LICENSE).**

Made for the chiptune community.  
If you make something cool with it, I’d love to hear it.
