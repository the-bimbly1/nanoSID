# nanoSID

**A raw, nasty 6581 SID emulator for nanoTracker.**

This is a simple but faithful single-voice Commodore 64 SID instrument. No fluff — just the core nasty character of the real 6581 chip.

### Features

- **8 waveforms** (0–7): Triangle, Saw, Pulse, Noise, **Tri+Saw**, **Tri+Pulse**, **Saw+Pulse**, **All**
- Real 6581-style crunch and distortion with user control
- Independent Noise channel (frequency-responsive broadband noise)
- **Ring Modulation** (classic metallic/robotic SID effect)
- Controllable nastiness:
  - **DIS** – Distortion amount (0–10)
  - **CRN** – Extra harmonic crunch & filter dirt (0–10)
- Hardware-correct signal chain (Envelope → Distortion → Filter)

### Parameters

| Knob     | Label | Range      | What it does |
|----------|-------|------------|--------------|
| WAVE     | WAVE  | 0–7        | 0=Triangle, 1=Saw, 2=Pulse, 3=Noise, 4=Tri+Saw, 5=Tri+Pulse, 6=Saw+Pulse, 7=All |
| PW       | PW    | 0–1        | Pulse width |
| RING     | RING  | Off / On   | Ring Modulation (metallic SID effect) |
| ATT      | ATT   | 0–2s       | Attack time |
| DEC      | DEC   | 0–3s       | Decay time |
| SUS      | SUS   | 0–1        | Sustain level |
| REL      | REL   | 0–4s       | Release time (default: 0.10) |
| CUT      | CUT   | 100–12000 Hz | Filter cutoff |
| RES      | RES   | 0–0.95     | Filter resonance |
| DIS      | DIS   | 0–10       | Distortion intensity |
| CRN      | CRN   | 0–10       | Extra harmonic crunch & filter dirt |

### Known Quirk (Authentic to Real 6581)

When **Ring Modulation** is enabled and **Pulse Width (PW)** is set to exactly **0.5**, the output becomes a constant full-scale static tone. This is **not a bug** — it is authentic SID behavior. Any other PW value produces normal ring-modulated tone.

### How to use

1. Download the latest `nanoSID.ntins` from the [Releases](https://github.com/the-bimbly1/nanoSID/releases) page.
2. Drag it into nanoTracker.
3. Assign it to a track and play.

**Pro tip:**  
Crank **DIS** and **CRN** for maximum 6581 nastiness. Turn them down for a cleaner sound.

### Credits

- Built with love by the-bimbly1 with debugging assistance from xAI SuperGrok
- Inspired by the Commodore 64 SID 6581
- Made for nanoTracker by Savannah (savannah-i-g)

---

### Version History

**v0.9.3** (Current)
- Added **Ring Modulation** with hardware-correct placement in the signal chain
- Proper ADSR envelope applied immediately after oscillator (before distortion/filter)
- Eliminated all release tail artifacts
- Documented authentic Pulse + Ring Mod quirk at 50% duty cycle

**v0.9.2**
- Added combined waveforms (0–7): Tri+Saw, Tri+Pulse, Saw+Pulse, All
- Improved noise channel with better frequency response

**v0.9.1**
- Noise channel now properly responds to played note frequency

**v0.9**
- Added user-controllable crunch: **DIS** (Distortion) and **CRN** (Crunch)

**v0.8**
- Core 4 waveforms + basic envelope and filter

---

**Licensed under the [MIT License](LICENSE).**

Made for the chiptune community.  
If you make something cool with it, I’d love to hear it.
