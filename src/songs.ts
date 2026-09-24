export {};
// Soundtrack, written in ABC notation (see the music engine in audio.ts).
//  riffs:  1/16 note units, root notes an octave or two above where they
//          sound (riffOct shifts them); the engine voices distorted power
//          chords, "." = palm-muted chug. In "clean" sections the notes are
//          played as written (arpeggios).
//  leads:  1/8 note units — lead guitar, or synth when the section sets synth.
//  stabs:  1/16 units, chords (brass / choir / orchestral hit).
//  pads:   1/4 units, chords.
//  form:   sections {bars, r riff, g guitar mode, l lead, st stab, stk stab
//          kind, pd pad, d drum kit, fill, noCrash}.
// Battle tracks are heavy and driving; calm tracks carry the quieter moments.
const MUSIC_SONGS = [
  {
    name: "Hammer Down", mood: "battle", bpm: 128, riffOct: -2,
    parts: {
      riffs: { A: ".E.E.E.E G2.E.E ^F2.E.E D2E2", B: "G4 ^F4 E4 D2E2", C: ".E.E.E.E.E.E.E.E .c.c.c.c d2d2", D: "E8 z8" },
      leads: { A: "e3 ^f g2 a2 | b4 a2 g2 | ^f3 g a2 g2 | e8 |", B: "B2 e2 g2 e2 | c2 e2 a2 e2 | d2 ^f2 a2 ^f2 | B2 ^d2 ^f2 b2 |" },
      stabs: { H: "[EGB]2 z6 [EGB]2 z2 [D^FA]2 z2" },
      pads: { P: "[EGB]4 [CEG]4 [DGB]4 [B,^D^F]4" },
    },
    form: [
      { bars: 4, st: "H", stk: "choir", d: "march", pd: "P" },
      { bars: 16, r: "A", d: "march" },
      { bars: 8, r: "B", l: "A", d: "rock", st: "H", stk: "brass" },
      { bars: 8, r: "A", d: "drive" },
      { bars: 8, r: "B", l: "A", d: "rock" },
      { bars: 8, r: "C", l: "B", synth: true, d: "half", pd: "P" },
      { bars: 4, r: "D", d: "none", st: "H", stk: "choir" },
      { bars: 4, r: "A", d: "build" },
      { bars: 16, r: "B", l: "A", d: "drive", st: "H", stk: "brass" },
      { bars: 4, r: "D", d: "rock", fill: false },
    ],
  },
  {
    name: "Steel Rain", mood: "battle", bpm: 168, riffOct: -2,
    parts: {
      riffs: { A: ".E.E.E.E .E.E.G.E .E.E.E.E .E.E.^A.G", B: ".E.E.F.E .E.E.G.E .E.E.^F.E .E.E.D.E", C: "E4 G4 A4 ^A2 A2", D: "c4 B4 A4 G2 ^F2" },
      leads: { A: "b2 a g a2 e2 | g2 ^f e ^f2 B2 | e2 ^f g a2 b2 | e'4 b4 |", B: "e/2^f/2g/2a/2 b2 a/2g/2^f/2e/2 d2 | e/2g/2b/2e'/2 d'2 b4 | c'2 b2 a2 g2 | ^f2 g2 ^f2 e2 |" },
    },
    form: [
      { bars: 4, r: "C", d: "drive" },
      { bars: 16, r: "A", d: "thrash" },
      { bars: 8, r: "B", d: "thrash" },
      { bars: 8, r: "C", l: "A", d: "punk" },
      { bars: 16, r: "A", d: "thrash" },
      { bars: 8, r: "D", l: "B", d: "gallop" },
      { bars: 8, r: "B", d: "half" },
      { bars: 4, r: "A", d: "build" },
      { bars: 16, r: "C", l: "A", d: "punk" },
      { bars: 4, r: "D", d: "thrash" },
    ],
  },
  {
    name: "Frontline", mood: "battle", bpm: 140, riffOct: -2,
    parts: {
      riffs: { A: ".D.D.D.D F2.D.D .D.D.D.D C2D2", B: "F4 G4 A4 G2 F2", C: "_B4 A4 G4 A4" },
      leads: { A: "d2 f2 a3 g | f2 e2 d4 | c2 d2 e3 f | d8 |", B: "a2 _b2 a2 g2 | f2 g2 a4 | _b2 c'2 d'2 c'2 | a8 |" },
      stabs: { H: "[DFA]4 z4 [CEG]4 z4" },
    },
    form: [
      { bars: 4, st: "H", d: "light" },
      { bars: 8, r: "A", d: "drive" },
      { bars: 16, r: "A", d: "rock" },
      { bars: 8, r: "B", l: "A", d: "drive", st: "H" },
      { bars: 8, r: "A", d: "rock" },
      { bars: 8, r: "B", l: "A", d: "drive" },
      { bars: 8, r: "C", l: "B", d: "half" },
      { bars: 16, r: "B", l: "A", d: "drive", st: "H" },
      { bars: 4, r: "A", d: "rock" },
    ],
  },
  {
    name: "Red Horizon", mood: "battle", bpm: 118, riffOct: -2, stabKind: "choir",
    parts: {
      riffs: { A: ".A.A.A.A .A.A^G2 .A.A.A.A F2E2", B: "A4 F4 E4 ^G4", C: "D4 F4 E4 E4" },
      leads: { A: "a3 b c'2 b2 | a2 ^g2 e4 | f3 e d2 c2 | B2 ^G2 E4 |", B: "e4 f4 | e2 d2 c4 | d4 e4 | a8 |" },
      stabs: { H: "[Ace]8 [Ace]4 [^GBe]4", H2: "[Ace]4 z4 [FAc]4 [E^GB]4" },
      pads: { P: "[Ace]4 [FAc]4 [Ace]4 [E^GB]4" },
    },
    form: [
      { bars: 4, st: "H", d: "march", pd: "P" },
      { bars: 8, r: "A", st: "H", d: "march" },
      { bars: 8, r: "A", d: "rock" },
      { bars: 8, r: "B", l: "A", st: "H2", d: "drive" },
      { bars: 8, r: "A", d: "march" },
      { bars: 8, r: "B", l: "A", st: "H2", d: "drive" },
      { bars: 8, r: "C", l: "B", d: "half", pd: "P" },
      { bars: 4, st: "H", d: "none", pd: "P" },
      { bars: 12, r: "B", l: "A", st: "H2", d: "drive" },
      { bars: 4, r: "A", d: "march" },
    ],
  },
  {
    name: "Mind Siege", mood: "battle", bpm: 108, riffOct: -2, stabKind: "hit",
    parts: {
      riffs: { A: ".^C.^C.^C.^C D2.^C.^C .^C.^C.^C.^C E2D2", B: "^C6 D2 ^C4 B,4", C: ".^C.^C z2 .^C.^C z2 .^C.^C z2 D2 E2" },
      leads: { A: "^c'4 d'4 | ^c'2 b2 a4 | ^g2 a2 b2 a2 | ^g8 |", B: "e2 d2 ^c4 | d2 e2 ^f4 | e2 d2 ^c2 B2 | ^c8 |" },
      stabs: { H: "[^C^G^c]4 z12" },
      pads: { P: "[^CE^G]4 [D^FA]4" },
    },
    form: [
      { bars: 4, pd: "P", d: "none", st: "H" },
      { bars: 8, r: "C", d: "pulse", pd: "P" },
      { bars: 8, r: "A", d: "half" },
      { bars: 8, r: "B", l: "A", synth: true, d: "rock", pd: "P" },
      { bars: 8, r: "A", d: "groove" },
      { bars: 8, r: "B", l: "A", synth: true, d: "rock", st: "H" },
      { bars: 8, r: "C", l: "B", synth: true, d: "pulse", pd: "P" },
      { bars: 8, r: "B", l: "A", d: "drive" },
      { bars: 4, r: "A", d: "half" },
    ],
  },
  {
    name: "Blitz Protocol", mood: "battle", bpm: 150, riffOct: -2,
    parts: {
      riffs: { A: ".E.E.e.E .E.E.d.E .E.E.c.E .E.E.B.E", B: "E2.E.E G2.E.E A2.E.E G2^F2", C: "C4 D4 E8" },
      leads: { A: "e/2g/2b/2e'/2 b/2g/2e/2g/2 d/2^f/2a/2d'/2 a/2^f/2d/2^f/2 | c/2e/2g/2c'/2 g/2e/2c/2e/2 B/2^d/2^f/2b/2 ^f/2^d/2B/2^d/2 |", B: "b2 a2 g2 ^f2 | e2 ^f2 g4 | a2 g2 ^f2 e2 | ^d4 B4 |" },
      stabs: { H: "[EGB]2 z2 [EGB]2 z2 [DGB]2 z2 [D^FA]2 z2" },
    },
    form: [
      { bars: 4, l: "A", synth: true, d: "pulse" },
      { bars: 8, r: "A", l: "A", synth: true, d: "drive" },
      { bars: 16, r: "B", d: "punk" },
      { bars: 8, r: "C", l: "B", d: "drive", st: "H" },
      { bars: 8, r: "A", l: "A", synth: true, d: "drive" },
      { bars: 16, r: "B", l: "B", d: "punk" },
      { bars: 8, r: "C", l: "A", synth: true, d: "half" },
      { bars: 4, r: "A", d: "build" },
      { bars: 12, r: "C", l: "B", d: "drive", st: "H" },
      { bars: 4, r: "A", d: "drive" },
    ],
  },
  {
    name: "Scorched Earth", mood: "battle", bpm: 96, riffOct: -2, stabKind: "hit",
    parts: {
      riffs: { A: "D6 .D.D F4 E2 D2", B: "_B,4 C4 D8", C: ".D.D.D.D .D.D.D.D F2 G2 A2 C2" },
      leads: { A: "d4 f4 | e2 d2 c4 | d4 a4 | g2 f2 e4 |", B: "a4 g4 | f2 g2 a4 | _b4 a4 | d'8 |" },
      stabs: { H: "[DFA]16" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", d: "none" },
      { bars: 8, r: "A", d: "half" },
      { bars: 8, r: "B", l: "A", d: "half" },
      { bars: 8, r: "C", d: "groove" },
      { bars: 8, r: "A", l: "A", d: "half", st: "H" },
      { bars: 8, r: "B", l: "B", d: "groove" },
      { bars: 8, r: "C", d: "drive" },
      { bars: 8, r: "A", l: "B", d: "half", st: "H" },
    ],
  },
  {
    name: "Overdrive", mood: "battle", bpm: 176, riffOct: -2,
    parts: {
      riffs: { A: ".E.E G2 .E.E A2 .E.E ^A2 A2 G2", B: "E2 E2 G2 E2 A2 E2 G2 ^F2", C: "B4 A4 G4 ^F4" },
      leads: { A: "e2 g2 a2 b2 | d'2 b2 a4 | g2 a2 b2 g2 | e8 |", B: "b2 b2 a2 g2 | a2 a2 g2 ^f2 | g2 g2 ^f2 e2 | ^f4 B4 |" },
    },
    form: [
      { bars: 4, r: "B", d: "drive" },
      { bars: 16, r: "A", d: "punk" },
      { bars: 8, r: "B", l: "A", d: "drive" },
      { bars: 16, r: "A", d: "thrash" },
      { bars: 8, r: "B", l: "A", d: "drive" },
      { bars: 8, r: "C", l: "B", d: "gallop" },
      { bars: 8, r: "C", l: "B", d: "thrash" },
      { bars: 4, r: "A", d: "build" },
      { bars: 16, r: "B", l: "A", d: "drive" },
      { bars: 8, r: "A", d: "punk" },
      { bars: 4, r: "C", d: "drive" },
    ],
  },
  {
    name: "Radio Silence", mood: "calm", bpm: 88, riffOct: -2,
    parts: {
      riffs: { A: "A2c2e2a2e2c2A2E2 | F2A2c2f2c2A2F2C2 | C2E2G2c2G2E2C2G,2 | E2^G2B2e2B2^G2E2B,2 |", D: "A16 F16 C16 E16" },
      leads: { A: "e4 c2 d2 | c4 A4 | G4 A2 c2 | B8 |", B: "a4 g2 e2 | f4 c4 | e4 g2 c'2 | b8 |" },
      pads: { P: "[Ace]4 [FAc]4 [CEG]4 [E^GB]4" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", d: "none", pd: "P" },
      { bars: 8, r: "A", g: "clean", d: "light", l: "A" },
      { bars: 8, r: "A", g: "clean", d: "ride", l: "B", pd: "P" },
      { bars: 8, r: "D", d: "half", l: "A" },
      { bars: 8, r: "A", g: "clean", d: "light", l: "B" },
      { bars: 8, r: "D", d: "rock", l: "B", pd: "P" },
      { bars: 8, r: "A", g: "clean", d: "none", pd: "P" },
    ],
  },
  {
    name: "Command Post", mood: "calm", bpm: 104, riffOct: -2,
    parts: {
      riffs: { A: ".E.E z2 .E.E z2 .G.G z2 .A.A z2", B: "E8 C8" },
      leads: { A: "B2 e2 ^f2 g2 | ^f4 e4 | d2 e2 ^f2 a2 | g8 |", B: "g2 a2 b2 a2 | g4 e4 | c'2 b2 a2 g2 | ^f8 |" },
      pads: { P: "[EGB]4 [CEG]4 [DGB]4 [D^FA]4" },
    },
    form: [
      { bars: 4, pd: "P", d: "pulse" },
      { bars: 8, r: "A", g: "mute", d: "light", pd: "P" },
      { bars: 8, r: "A", g: "mute", l: "A", synth: true, d: "rock" },
      { bars: 8, r: "B", l: "B", d: "rock", pd: "P" },
      { bars: 8, r: "A", g: "mute", l: "A", synth: true, d: "ride" },
      { bars: 8, r: "B", l: "B", d: "drive" },
      { bars: 8, r: "A", g: "clean", pd: "P", d: "light" },
      { bars: 8, r: "B", l: "A", d: "rock", pd: "P" },
      { bars: 4, pd: "P", d: "none" },
    ],
  },
  {
    name: "Night Recon", mood: "calm", bpm: 92, riffOct: -2,
    parts: {
      riffs: { A: "D2F2A2d2A2F2D2A,2 | _B,2D2F2_B2F2D2_B,2F,2 |", B: "D8 C8 | _B,8 A,8 |" },
      leads: { A: "a4 f2 g2 | a4 d4 | _b2 a2 g2 f2 | e8 |", B: "d'4 c'2 a2 | _b4 f4 | g2 a2 _b2 c'2 | a8 |" },
      pads: { P: "[DFA]4 [_B,DF]4" },
    },
    form: [
      { bars: 4, pd: "P", d: "none" },
      { bars: 8, r: "A", g: "clean", d: "none", pd: "P" },
      { bars: 8, r: "A", g: "clean", d: "light", l: "A" },
      { bars: 8, r: "B", l: "B", d: "half", pd: "P" },
      { bars: 8, r: "A", g: "clean", d: "ride", l: "A" },
      { bars: 8, r: "B", l: "B", d: "half" },
      { bars: 8, r: "A", g: "clean", d: "none", pd: "P" },
    ],
  },
  {
    name: "Last Light", mood: "calm", bpm: 80, riffOct: -2,
    parts: {
      riffs: { A: "E2G2B2e2B2G2E2B,2 | C2E2G2c2G2E2C2G,2 | G2B2d2g2d2B2G2D2 | D2^F2A2d2A2^F2D2A,2 |", B: "E16 C16 G16 D16" },
      leads: { A: "g4 ^f2 e2 | e4 G4 | d4 e2 ^f2 | ^f8 |", B: "b4 a2 g2 | g4 e4 | d'4 c'2 b2 | a8 |" },
      pads: { P: "[EGB]4 [CEG]4 [GBd]4 [D^FA]4" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", d: "none" },
      { bars: 8, r: "A", g: "clean", d: "light", l: "A" },
      { bars: 8, r: "B", d: "half", l: "B", pd: "P" },
      { bars: 8, r: "A", g: "clean", d: "ride", l: "A", pd: "P" },
      { bars: 8, r: "B", d: "rock", l: "B", pd: "P" },
      { bars: 8, r: "B", d: "half", l: "A" },
      { bars: 4, r: "A", g: "clean", d: "none", pd: "P" },
    ],
  },
];
Object.assign(window, { MUSIC_SONGS });
