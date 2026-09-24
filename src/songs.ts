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
//  Synth parts: bass (1/16, bl + bk/bassKind "saw" | "reese"), arps (1/16,
//  ar), chords (1/16 supersaw chords, ss), lead kind lk "gtr" | "square" |
//  "saw"; section flags pump (sidechain), riser, impact, sweep [from, to] Hz.
// Battle tracks are heavy and driving; calm tracks carry the quieter moments.
// style (rock / synthrock / edm / synthpop) and fac tune the Auto picker to
// the player's faction: Legion leans rock, Vanguard synth rock + EDM,
// Syndicate synthpop + EDM.
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
      { bars: 8, r: "A", d: "march" },
      { bars: 8, r: "B", l: "A", d: "rock", st: "H", stk: "brass" },
      { bars: 8, r: "A", d: "drive" },
      { bars: 8, r: "B", l: "A", d: "rock" },
      { bars: 8, r: "C", l: "B", synth: true, d: "half", pd: "P" },
      { bars: 4, r: "D", d: "none", st: "H", stk: "choir" },
      { bars: 4, r: "A", d: "build" },
      { bars: 8, r: "B", l: "A", d: "drive", st: "H", stk: "brass" },
      { bars: 4, r: "D", d: "rock", fill: false },
    ],
  },
  {
    name: "Steel Rain", mood: "battle", bpm: 168, riffOct: -2,
    parts: {
      riffs: {
        A: "^F2^F2 A^F^F^F c2B2 A^G^F=E | ^F2^F2 A^F^F^F ^c2B2 A2^G2 |",
        B: "^F2^F^F ^F2^F^F D2DD E2EE | ^F2^F^F ^F2^F^F A2AA ^G2^G^G |",
        C: "D4 E4 ^F8 | D4 E4 B,8 |",
        D: "^F16 | ^F16 |",
      },
      leads: { A: "^f2 a2 ^g2 ^f2 | e2 ^f2 ^c4 | d2 e2 ^f2 a2 | ^g8 |", B: "^c'2 b2 a2 ^g2 | a2 ^g2 ^f4 | d'2 ^c'2 b2 a2 | ^g4 ^f4 |" },
    },
    form: [
      { bars: 4, r: "C", d: "drive" },
      { bars: 8, r: "A", gv: "single", d: "thrash" },
      { bars: 8, r: "B", l: "A", d: "gallop" },
      { bars: 4, r: "A", gv: "single", d: "blast" },
      { bars: 8, r: "B", l: "B", d: "thrash" },
      { bars: 4, r: "C", d: "half" },
      { bars: 4, r: "A", gv: "single", d: "build" },
      { bars: 8, r: "B", l: "A", d: "blast" },
      { bars: 4, r: "D", d: "thrash", fill: false },
    ],
  },
  {
    name: "Frontline", mood: "battle", bpm: 132, riffOct: -2, gtone: "crunch",
    parts: {
      riffs: {
        A: "D2z D2z3 F2z2 G2 _A2 | D2z D2z3 F2z2 C2 D2 |",
        B: "[DAdf]8 [_B,F_Bd]8 | [FAcf]8 [CGce]8 |",
        C: "._B,._B,._B,._B, ._B,._B, C2 .D.D.D.D .D.D E2",
      },
      leads: { A: "d2 f g a2 c'2 | _b2 a g f4 | a2 _b c' d'2 c'2 | a8 |", B: "f'2 e' d' c'2 a2 | _b2 c' d' e'4 | f'2 e' d' c'2 _b2 | a8 |" },
      stabs: { H: "[DFA]4 z4 [CEG]4 z4" },
    },
    form: [
      { bars: 4, r: "B", d: "rock", fill: false },
      { bars: 8, r: "A", d: "funk" },
      { bars: 8, r: "B", l: "A", d: "drive", st: "H" },
      { bars: 8, r: "A", l: "B", d: "funk" },
      { bars: 4, r: "C", d: "half" },
      { bars: 8, r: "B", l: "A", d: "drive", st: "H" },
      { bars: 4, r: "A", d: "funk" },
    ],
  },
  {
    name: "Red Horizon", mood: "battle", bpm: 118, riffOct: -2, stabKind: "choir",
    parts: {
      riffs: { A: "A6 A2 z2 A2 G4 | F6 F2 z2 F2 E4 |", B: "A4 F4 E4 ^G4", C: "D4 F4 E4 E4" },
      leads: { A: "a3 b c'2 b2 | a2 ^g2 e4 | f3 e d2 c2 | B2 ^G2 E4 |", B: "e4 f4 | e2 d2 c4 | d4 e4 | a8 |" },
      stabs: { H: "[Ace]8 [Ace]4 [^GBe]4", H2: "[Ace]4 z4 [FAc]4 [E^GB]4" },
      pads: { P: "[Ace]4 [FAc]4 [Ace]4 [E^GB]4" },
    },
    form: [
      { bars: 4, st: "H", d: "tribal", pd: "P" },
      { bars: 8, r: "A", st: "H", d: "tribal" },
      { bars: 8, r: "A", d: "rock" },
      { bars: 8, r: "B", l: "A", st: "H2", d: "drive" },
      { bars: 8, r: "A", d: "march" },
      { bars: 8, r: "B", l: "A", st: "H2", d: "drive" },
      { bars: 8, r: "C", l: "B", d: "half", pd: "P" },
      { bars: 4, st: "H", d: "none", pd: "P" },
      { bars: 8, r: "B", l: "A", st: "H2", d: "drive" },
      { bars: 4, r: "A", d: "march" },
    ],
  },
  {
    name: "Mind Siege", mood: "battle", bpm: 108, riffOct: -2, stabKind: "hit", gtone: "fuzz",
    parts: {
      riffs: { A: "^C2^C2 D2^C2 =C2^C2 B,4 | ^C2^C2 D2^C2 E2D2 ^C4 |", B: "^C4 z2 ^C2 A,4 B,4 | ^C4 z2 ^C2 E4 ^D4 |", C: ".^C.^C z2 .^C.^C z2 .^C.^C z2 D2 E2" },
      leads: { A: "^c'4 d'4 | ^c'2 b2 a4 | ^g2 a2 b2 a2 | ^g8 |", B: "e2 d2 ^c4 | d2 e2 ^f4 | e2 d2 ^c2 B2 | ^c8 |" },
      stabs: { H: "[^C^G^c]4 z12" },
      pads: { P: "[^CE^G]4 [D^FA]4" },
    },
    form: [
      { bars: 4, st: "H", pd: "P", d: "none" },
      { bars: 4, r: "C", pd: "P", d: "pulse" },
      { bars: 4, r: "A", gv: "single", d: "funk" },
      { bars: 4, r: "B", l: "A", st: "H", d: "rock" },
      { bars: 4, r: "A", gv: "single", l: "B", d: "funk" },
      { bars: 4, r: "B", l: "A", d: "drive" },
      { bars: 4, r: "C", l: "B", pd: "P", d: "tribal" },
      { bars: 4, r: "B", l: "A", st: "H", d: "drive" },
      { bars: 4, r: "A", gv: "single", d: "half" },
    ],
  },
  {
    name: "Blitz Protocol", mood: "battle", bpm: 150, riffOct: -2, gtone: "crunch",
    parts: {
      riffs: {
        A: "G,2G2 G,2F2 G,2_E2 G,2D2 | G,2G2 G,2F2 G,2_B,2 C2D2 |",
        B: "G4 _E4 _B,4 F4 | G4 _E4 C4 D4 |",
        C: "_E8 F8 | G16 |",
      },
      leads: { A: "g/2_b/2d'/2g'/2 d'/2_b/2g/2_b/2 f/2a/2c'/2f'/2 c'/2a/2f/2a/2 | _e/2g/2_b/2_e'/2 _b/2g/2_e/2g/2 d/2^f/2a/2d'/2 a/2^f/2d/2^f/2 |", B: "d'2 c'2 _b2 a2 | g2 a2 _b4 | c'2 _b2 a2 g2 | ^f4 d4 |" },
      stabs: { H: "[G_Bd]2 z2 [G_Bd]2 z10 | [_EG_B]2 z2 [FAc]2 z10 |" },
    },
    form: [
      { bars: 4, l: "A", synth: true, d: "pulse" },
      { bars: 8, r: "A", gv: "single", d: "punk" },
      { bars: 8, r: "B", l: "B", d: "drive" },
      { bars: 8, r: "A", gv: "single", l: "A", synth: true, st: "H", d: "punk" },
      { bars: 4, r: "C", d: "half" },
      { bars: 4, r: "A", gv: "single", d: "build" },
      { bars: 8, r: "B", l: "B", st: "H", d: "drive" },
      { bars: 4, r: "C", d: "punk", fill: false },
    ],
  },
  {
    name: "Scorched Earth", mood: "battle", bpm: 96, riffOct: -2, stabKind: "hit", gtone: "fuzz",
    parts: {
      riffs: {
        A: "D8 z2 D2 F2 _E2 | D12 C4 |",
        B: "_B,8 A,8 | D8 C4 _B,4 |",
        C: ".D.D.D.D D4 .D.D F2 _E2 D2 | .D.D.D.D D4 .D.D A,2 C2 D2 |",
      },
      leads: { A: "d4 f4 | e2 d2 c4 | d4 a4 | g2 f2 e4 |", B: "a4 g4 | f2 g2 a4 | _b4 a4 | d'8 |" },
      stabs: { H: "[DA]2 z14 | [DA]2 z6 [C_E]2 z6 |" },
    },
    form: [
      { bars: 4, r: "A", d: "none" },
      { bars: 4, r: "A", d: "doom" },
      { bars: 4, r: "B", l: "A", d: "doom" },
      { bars: 4, r: "C", st: "H", d: "half" },
      { bars: 4, r: "A", l: "A", st: "H", d: "doom" },
      { bars: 4, r: "B", l: "B", d: "half" },
      { bars: 4, r: "C", d: "drive" },
      { bars: 4, r: "A", l: "B", st: "H", d: "doom" },
    ],
  },
  {
    name: "Overdrive", mood: "battle", bpm: 160, riffOct: -2, gtone: "crunch", swing: .5,
    parts: {
      riffs: {
        A: "[B,^F]2[B,^F]2[B,^G]2[B,^G]2[B,^F]2[B,^F]2[B,A]2[B,^G]2 | [B,^F]2[B,^F]2[B,^G]2[B,^G]2[B,^F]2[B,^F]2[B,A]2[B,^G]2 | [EB]2[EB]2[E^c]2[E^c]2[EB]2[EB]2[Ed]2[E^c]2 | [B,^F]2[B,^F]2[B,^G]2[B,^G]2[B,^F]2[B,^F]2[B,A]2[B,^G]2 |",
        B: "[^F^c]2[^F^c]2[^F^d]2[^F^d]2[^F^c]2[^F^c]2[^Fe]2[^F^d]2 | [EB]2[EB]2[E^c]2[E^c]2[EB]2[EB]2[Ed]2[E^c]2 | [B,^F]2[B,^F]2[B,^G]2[B,^G]2[B,^F]2[B,^F]2[B,A]2[B,^G]2 | [^F^c]2[^F^c]2[^F^d]2[^F^d]2[^F^c]2[^F^c]2[^Fe]2[^F^d]2 |",
        C: "B4 A4 ^F4 E4 | B16 |",
      },
      leads: { A: "b2 d'2 e'2 ^f'2 | e'2 d'2 b4 | a2 b2 d'2 b2 | a4 ^f4 |", B: "^f'4 e'2 d'2 | e'2 d'2 b4 | d'2 b2 a2 ^f2 | b8 |" },
    },
    form: [
      { bars: 4, r: "C", d: "drive" },
      { bars: 8, r: "A", d: "shuffle" },
      { bars: 8, r: "B", l: "A", d: "shuffle" },
      { bars: 8, r: "A", l: "B", d: "drive" },
      { bars: 4, r: "C", d: "half" },
      { bars: 8, r: "B", l: "A", d: "shuffle" },
      { bars: 8, r: "A", l: "B", d: "drive" },
      { bars: 4, r: "C", d: "shuffle", fill: false },
    ],
  },
  {
    name: "Radio Silence", mood: "calm", bpm: 88, riffOct: -2,
    parts: {
      riffs: { A: "A,2[ce]2E2[ce]2A,2[ce]2E2[ce]2 | F,2[Ac]2C2[Ac]2F,2[Ac]2C2[Ac]2 | C2[eg]2G,2[eg]2C2[eg]2G,2[eg]2 | E,2[^GB]2B,2[^GB]2E,2[^GB]2B,2[e^G]2 |", D: "A16 F16 C16 E16" },
      leads: { A: "e4 c2 d2 | c4 A4 | G4 A2 c2 | B8 |", B: "a4 g2 e2 | f4 c4 | e4 g2 c'2 | b8 |" },
      pads: { P: "[Ace]4 [FAc]4 [CEG]4 [E^GB]4" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", d: "none", pd: "P" },
      { bars: 4, r: "A", g: "clean", d: "light", l: "A" },
      { bars: 4, r: "A", g: "clean", d: "ride", l: "B", pd: "P" },
      { bars: 4, r: "D", d: "half", l: "A" },
      { bars: 4, r: "A", g: "clean", d: "light", l: "B" },
      { bars: 4, r: "D", d: "rock", l: "B", pd: "P" },
      { bars: 4, r: "A", g: "clean", d: "none", pd: "P" },
    ],
  },
  {
    name: "Command Post", mood: "calm", bpm: 96, riffOct: -2, bassOct: -2,
    parts: {
      riffs: {
        A: "z2[GBd]2z2[GBd]2z2[GBd]2z2[GBd]2 | z2[CEG]2z2[CEG]2z2[CEG]2z2[CEG]2 | z2[D^FA]2z2[D^FA]2z2[D^FA]2z2[D^FA]2 | z2[GBd]2z2[GBd]2z2[GBd]2z2[GBd]2 |",
        B: "z2[EGB]2z2[EGB]2z2[EGB]2z2[EGB]2 | z2[CEG]2z2[CEG]2z2[CEG]2z2[CEG]2 | z2[D^FA]2z2[D^FA]2z2[D^FA]2z2[D^FA]2 | z2[D^FA]2z2[D^FA]2z2[D^Fc]2z2[D^Fc]2 |",
      },
      bass: { A: "G4 z2 G2 B4 d4 | C4 z2 C2 E4 G4 | D4 z2 D2 ^F4 A4 | G4 z2 G2 D4 B,4 |", B: "E4 z2 E2 G4 B4 | C4 z2 C2 E4 G4 | D4 z2 D2 ^F4 A4 | D4 ^F4 A4 c4 |" },
      leads: { A: "d2 B2 G2 A2 | B4 c4 | A2 ^F2 D2 E2 | G8 |", B: "b4 a2 g2 | e4 g4 | a2 ^f2 d2 ^f2 | a8 |" },
      pads: { P: "[GBd]4 | [CEG]4 | [D^FA]4 | [GBd]4 |" },
    },
    form: [
      { bars: 4, pd: "P", bl: "A", d: "none" },
      { bars: 4, r: "A", g: "clean", bass: false, bl: "A", d: "onedrop" },
      { bars: 4, r: "A", g: "clean", bass: false, bl: "A", l: "A", lk: "square", d: "onedrop" },
      { bars: 4, r: "B", g: "clean", bass: false, bl: "B", l: "B", d: "ride" },
      { bars: 4, r: "A", g: "clean", bass: false, bl: "A", l: "A", lk: "square", d: "onedrop" },
      { bars: 4, r: "B", g: "clean", bass: false, bl: "B", l: "B", pd: "P", d: "rock" },
      { bars: 4, r: "A", g: "clean", bass: false, bl: "A", d: "onedrop" },
      { bars: 4, pd: "P", bl: "A", d: "none" },
    ],
  },
  {
    name: "Night Recon", mood: "calm", bpm: 116, riffOct: -2,
    parts: {
      riffs: {
        A: "D2DE F2E2 D2A,2 C2^C2 | D2DE F2A2 _B2A2 G2E2 |",
        B: "[DFA]4 z4 [DFA]2z2[DFA]4 | [_B,DF]4 z4 [_B,DF]2z2[A,^CE]4 |",
      },
      leads: { A: "a4 f2 g2 | a4 d4 | _b2 a2 g2 f2 | e8 |", B: "d'4 c'2 a2 | _b4 f4 | g2 a2 _b2 c'2 | a8 |" },
      pads: { P: "[DFA]4 | [DFA]4 | [_B,DF]4 | [A,^CE]4 |" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", d: "none" },
      { bars: 8, r: "A", g: "clean", d: "ride" },
      { bars: 8, r: "B", g: "clean", l: "A", d: "shuffle", swing: .5 },
      { bars: 8, r: "A", g: "clean", pd: "P", d: "ride" },
      { bars: 8, r: "B", l: "B", d: "rock" },
      { bars: 4, r: "A", g: "clean", pd: "P", d: "none" },
    ],
  },
  {
    name: "Last Light", mood: "calm", bpm: 80, riffOct: -2,
    parts: {
      riffs: {
        A: "C2G2e4 G2e2g4 | A,2E2c4 E2c2e4 | F,2C2A4 C2A2c4 | G,2D2B4 D2B2d4 |",
        B: "c16 | A16 | F16 | G16 |",
      },
      leads: { A: "e4 d2 c2 | c4 A4 | A4 c2 d2 | d8 |", B: "g4 f2 e2 | e4 c4 | a4 g2 f2 | g8 |" },
      pads: { P: "[CEG]4 | [A,CE]4 | [F,A,C]4 | [G,B,D]4 |" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", d: "none" },
      { bars: 4, r: "A", g: "clean", l: "A", d: "light" },
      { bars: 4, r: "B", l: "B", pd: "P", d: "half" },
      { bars: 4, r: "A", g: "clean", l: "A", pd: "P", d: "ride" },
      { bars: 4, r: "B", l: "B", pd: "P", d: "rock" },
      { bars: 4, r: "A", g: "clean", pd: "P", d: "none" },
    ],
  },
  // ======================================================= Vanguard: synth rock / EDM
  {
    name: "Blue Protocol", mood: "battle", style: "edm", fac: "allied", bpm: 128, riffOct: -2, bassKind: "saw", lk: "saw",
    parts: {
      riffs: { R: ".A.A.A.A.A.A.A.A | .F.F.F.F.F.F.F.F | .C.C.C.C.C.C.C.C | .G.G.G.G.G.G.G.G |" },
      bass: { A: "z2A2z2A2z2A2z2A2 | z2F2z2F2z2F2z2F2 | z2c2z2c2z2c2z2c2 | z2G2z2G2z2G2z2G2 |" },
      arps: { A: "A a e' a A a e' a A a e' a A a e' a | F f c' f F f c' f F f c' f F f c' f | C c g c C c g c C c g c C c g c | G, G d G G, G d G G, G d G G, G d G |" },
      chords: { S: "[Ace]3[Ace]3[Ace]2 z2[Ace]2 [Ace]2z2 | [FAc]3[FAc]3[FAc]2 z2[FAc]2 [FAc]2z2 | [EGc]3[EGc]3[EGc]2 z2[EGc]2 [EGc]2z2 | [DGB]3[DGB]3[DGB]2 z2[DGB]2 [DGB]2z2 |" },
      leads: { A: "a2 g a e2 c2 | f2 e f c4 | e2 d e g2 c'2 | b2 a g d4 |", B: "c'2 b c' e'2 a2 | a2 g a f4 | g2 f g c'2 e'2 | d'4 b4 |" },
      pads: { P: "[Ace]4 | [FAc]4 | [EGc]4 | [DGB]4 |" },
    },
    form: [
      { bars: 8, ar: "A", d: "hats", sweep: [300, 3000] },
      { bars: 8, ar: "A", bl: "A", ss: "S", l: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, ar: "A", pd: "P", l: "B", lk: "square", d: "none" },
      { bars: 4, ar: "A", bl: "A", d: "roll", riser: 1, sweep: [500, 6000] },
      { bars: 8, r: "R", ar: "A", bl: "A", ss: "S", l: "B", d: "edm", pump: 1, impact: 1 },
      { bars: 8, ar: "A", pd: "P", d: "house" },
      { bars: 8, r: "R", ar: "A", bl: "A", ss: "S", l: "A", d: "edm", pump: 1 },
      { bars: 8, ar: "A", pd: "P", d: "hats", sweep: [4000, 300] },
    ],
  },
  {
    name: "Chrono Shift", mood: "battle", style: "synthrock", fac: "allied", bpm: 140, riffOct: -2, gtone: "crunch",
    parts: {
      riffs: {
        A: "A3A3A2 A3A3G2 | F3F3F2 F3F3E2 | D3D3D2 D3D3E2 | E3E3E2 E3E3B,2 |",
        B: "A8 A4 c4 | F8 F4 A4 | D8 D4 F4 | E8 E8 |",
        D: "A16 | F16 | D16 | E16 |",
      },
      arps: { A: "A e a e c' a e a A e a e c' a e a | F c f c a f c f F c f c a f c f | D A d A f d A d D A d A f d A d | E B e B ^g e B e E B e B ^g e B e |" },
      leads: { A: "e2 a2 c'2 b2 | a2 f2 c4 | d2 f2 a2 g2 | ^g4 e4 |", B: "c'2 b2 a2 e2 | f4 c4 | d2 e2 f2 a2 | ^g4 e4 |" },
      pads: { P: "[Ace]4 | [FAc]4 | [DFA]4 | [E^GB]4 |" },
    },
    form: [
      { bars: 4, ar: "A", d: "none", sweep: [400, 5000] },
      { bars: 8, r: "A", ar: "A", d: "rock" },
      { bars: 8, r: "A", l: "A", synth: true, d: "disco" },
      { bars: 8, r: "B", l: "B", ar: "A", d: "drive" },
      { bars: 8, ar: "A", pd: "P", l: "A", synth: true, d: "half" },
      { bars: 4, r: "A", d: "build", riser: 1 },
      { bars: 8, r: "B", l: "B", ar: "A", d: "drive" },
      { bars: 4, r: "D", pd: "P", d: "rock", fill: false },
    ],
  },
  {
    name: "Skyline Intercept", mood: "battle", style: "synthrock", fac: "allied", bpm: 156, riffOct: -2,
    parts: {
      riffs: {
        A: "D2D2D2D2 D2D2C2C2 | _B,2_B,2_B,2_B,2 _B,2_B,2C2C2 | F2F2F2F2 F2F2G2G2 | C2C2C2C2 C2C2D2E2 |",
        B: "D4 D4 D2 F2 D4 | _B,4 _B,4 _B,2 D2 _B,4 | F4 F4 F2 A2 F4 | C4 C4 C2 E2 C4 |",
        D: "D16 | _B,16 | F16 | C16 |",
      },
      arps: { A: "D d D d F f F f A a A a F f F f | _B, _B _B, _B D d D d F f F f D d D d | F f F f A a A a c c' c c' A a A a | C c C c E e E e G g G g E e E e |" },
      chords: { S: "[DFA]16 | [_B,DF]16 | [CFA]16 | [CEG]16 |" },
      leads: { A: "a2 a g f2 d2 | f2 f e d4 | c2 c d f2 a2 | g4 e4 |", B: "d'2 c' _b a2 f2 | _b2 a g f4 | a2 g f c'2 a2 | g8 |" },
      pads: { P: "[DFA]4 | [_B,DF]4 | [CFA]4 | [CEG]4 |" },
    },
    form: [
      { bars: 8, ar: "A", d: "none", sweep: [300, 4000] },
      { bars: 8, r: "A", l: "A", synth: true, d: "punk" },
      { bars: 8, r: "B", ar: "A", d: "rock" },
      { bars: 8, r: "B", ss: "S", l: "B", lk: "saw", ar: "A", d: "drive" },
      { bars: 8, ar: "A", pd: "P", d: "half" },
      { bars: 4, r: "A", d: "build", riser: 1 },
      { bars: 8, r: "B", ss: "S", l: "B", lk: "saw", ar: "A", d: "drive" },
      { bars: 4, r: "D", pd: "P", d: "rock", fill: false },
    ],
  },
  {
    name: "Overclock", mood: "battle", style: "edm", fac: "allied", bpm: 132, bassOct: -2, bassKind: "saw", lk: "saw",
    parts: {
      bass: {
        A: "z2C2z2C2z2C2z2C2 | z2_A,2z2_A,2z2_A,2z2_A,2 | z2_E2z2_E2z2_E2z2_E2 | z2_B,2z2_B,2z2_B,2z2_B,2 |",
        B: "CCcC CCcC CCcC CCcC | _A,_A,_A_A, _A,_A,_A_A, _A,_A,_A_A, _A,_A,_A_A, | _E_E_e_E _E_E_e_E _E_E_e_E _E_E_e_E | _B,_B,_B_B, _B,_B,_B_B, _B,_B,_B_B, _B,_B,_B_B, |",
      },
      arps: { A: "c3g3c'2_e'3c'3g2 | _A3_e3_a2c'3_a3_e2 | _e3_b3_e'2g'3_e'3_b2 | _B3f3_b2d'3_b3f2 |" },
      chords: { S: "[C_EG]3[C_EG]3[C_EG]2 z2[C_EG]2 [C_EG]2z2 | [C_E_A]3[C_E_A]3[C_E_A]2 z2[C_E_A]2 [C_E_A]2z2 | [_B,_EG]3[_B,_EG]3[_B,_EG]2 z2[_B,_EG]2 [_B,_EG]2z2 | [_B,DF]3[_B,DF]3[_B,DF]2 z2[_B,DF]2 [_B,DF]2z2 |" },
      leads: { A: "g2 _e c g2 _a2 | _a2 g _e c4 | _e2 f g _b2 g2 | f4 d4 |", B: "c'4 _b2 g2 | _a4 _e4 | g2 _a2 _b2 _e'2 | d'8 |" },
      pads: { P: "[C_EG]4 | [C_E_A]4 | [_B,_EG]4 | [_B,DF]4 |" },
    },
    form: [
      { bars: 8, ar: "A", pd: "P", d: "hats", sweep: [300, 3000] },
      { bars: 8, ar: "A", bl: "A", d: "house", riser: 1 },
      { bars: 8, ss: "S", bl: "B", ar: "A", l: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, pd: "P", ar: "A", l: "B", lk: "square", d: "none" },
      { bars: 4, bl: "A", ar: "A", d: "roll", riser: 1, sweep: [400, 6000] },
      { bars: 8, ss: "S", bl: "B", ar: "A", l: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, pd: "P", ar: "A", l: "B", lk: "square", d: "house" },
      { bars: 8, ar: "A", pd: "P", d: "hats", sweep: [3000, 300] },
    ],
  },
  {
    name: "Clear Skies", mood: "calm", style: "synthrock", fac: "allied", bpm: 100, riffOct: -2, bassOct: -2, bassKind: "saw",
    parts: {
      riffs: { A: "[GBdg]3[GBdg]3[GBdg]2 [GBdg]3[GBdg]3[GBdg]2 | [D^FAd]3[D^FAd]3[D^FAd]2 [D^FAd]3[D^FAd]3[D^FAd]2 | [EGBe]3[EGBe]3[EGBe]2 [EGBe]3[EGBe]3[EGBe]2 | [CEGc]3[CEGc]3[CEGc]2 [CEGc]3[CEGc]3[CEGc]2 |" },
      bass: { A: "G4z2G2G4D4 | D4z2D2D4A,4 | E4z2E2E4B,4 | C4z2C2C4G,4 |" },
      arps: { A: "b g d B b g d B b g d B b g d B | a ^f d A a ^f d A a ^f d A a ^f d A | b g e B b g e B b g e B b g e B | g e c G g e c G g e c G g e c G |" },
      leads: { A: "d4 B2 G2 | A4 ^F4 | G2 A2 B2 e2 | d8 |", B: "g4 ^f2 e2 | ^f4 d4 | e2 ^f2 g2 b2 | a8 |" },
      pads: { P: "[GBd]4 | [D^FA]4 | [EGB]4 | [CEG]4 |" },
    },
    form: [
      { bars: 4, r: "A", g: "clean", pd: "P", d: "none" },
      { bars: 4, r: "A", g: "clean", bass: false, bl: "A", l: "A", synth: true, d: "light" },
      { bars: 4, ar: "A", pd: "P", bl: "A", l: "B", d: "ride" },
      { bars: 4, r: "A", g: "clean", pd: "P", d: "none" },
      { bars: 4, r: "A", g: "clean", bass: false, ar: "A", bl: "A", l: "A", synth: true, d: "light" },
      { bars: 4, ar: "A", pd: "P", bl: "A", l: "B", d: "ride" },
      { bars: 4, r: "A", g: "clean", pd: "P", d: "none" },
    ],
  },
  // ======================================================= Syndicate: synthpop / EDM
  {
    name: "Hive Mind", mood: "battle", style: "edm", fac: "yuri", bpm: 126, bassOct: -2, bassKind: "reese", stabKind: "choir",
    parts: {
      bass: {
        A: "F6 F2 F4 F4 | _D6 _D2 _D4 _D4 | _E6 _E2 _E4 _E4 | C6 C2 C4 C4 |",
        B: "F3F3F2F3F3F2 | _D3_D3_D2_D3_D3_D2 | _E3_E3_E2_E3_E3_E2 | C3C3C2C3C3C2 |",
      },
      arps: { A: "F c _d c F c _d c F c _d c F c _d c | _D _A _B _A _D _A _B _A _D _A _B _A _D _A _B _A | _E _B c _B _E _B c _B _E _B c _B _E _B c _B | C G _A G C G _A G C G _A G C G _A G |" },
      chords: { S: "[F_Ac]2z2[F_Ac]2z2[F_Ac]2z2[F_Ac]2[F_Ac]2 | [F_A_d]2z2[F_A_d]2z2[F_A_d]2z2[F_A_d]2[F_A_d]2 | [G_B_e]2z2[G_B_e]2z2[G_B_e]2z2[G_B_e]2[G_B_e]2 | [EGc]2z2[EGc]2z2[EGc]2z2[EGc]2[EGc]2 |" },
      stabs: { H: "[F_Ac]8 z8 | [F_A_d]8 z8 | [G_B_e]8 z8 | [EGc]8 z8 |" },
      leads: { A: "c'2 _a f c'2 _d'2 | c'4 _a4 | _b2 g _e _b2 c'2 | e4 c4 |", B: "f'4 _e'2 c'2 | _d'4 _a4 | _b2 c'2 _d'2 _e'2 | e'8 |" },
      pads: { P: "[F_Ac]4 | [F_A_d]4 | [G_B_e]4 | [EGc]4 |" },
    },
    form: [
      { bars: 8, pd: "P", st: "H", d: "none", sweep: [300, 2500] },
      { bars: 8, bl: "A", ar: "A", d: "breaks" },
      { bars: 4, ar: "A", d: "roll", riser: 1 },
      { bars: 8, ss: "S", bl: "B", bk: "saw", l: "A", lk: "square", ar: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, st: "H", pd: "P", l: "B", lk: "saw", d: "none" },
      { bars: 4, bl: "A", d: "roll", riser: 1 },
      { bars: 8, ss: "S", bl: "B", bk: "saw", l: "B", lk: "saw", ar: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, bl: "A", pd: "P", d: "hats", sweep: [3000, 300] },
    ],
  },
  {
    name: "Neon Cult", mood: "battle", style: "synthpop", fac: "yuri", bpm: 118, bassOct: -2, bassKind: "saw", lk: "square",
    parts: {
      bass: { A: "A,2A2A,2A2A,2A2A,2A2 | F,2F2F,2F2F,2F2F,2F2 | G,2G2G,2G2G,2G2G,2G2 | E,2E2E,2E2E,2E2E,2E2 |" },
      arps: { A: "a e c e a e c e a e c e a e c e | a f c f a f c f a f c f a f c f | b g d g b g d g b g d g b g d g | b g e g b g e g b g e g b g e g |" },
      chords: { S: "[Ace]16 | [FAc]16 | [GBd]16 | [EGB]16 |" },
      leads: { A: "e2 e2 d c B2 | c4 A4 | B2 B2 c d e2 | B8 |", B: "a4 g2 e2 | f2 e2 c4 | d2 e2 g2 b2 | e'8 |" },
      pads: { P: "[Ace]4 | [FAc]4 | [GBd]4 | [EGB]4 |" },
    },
    form: [
      { bars: 8, ar: "A", pd: "P", d: "none" },
      { bars: 8, bl: "A", ar: "A", l: "A", d: "pop" },
      { bars: 8, bl: "A", ss: "S", l: "B", d: "popdrive" },
      { bars: 8, pd: "P", ar: "A", d: "half" },
      { bars: 8, bl: "A", ar: "A", l: "A", d: "pop" },
      { bars: 8, bl: "A", ss: "S", l: "B", ar: "A", d: "popdrive" },
      { bars: 8, ar: "A", pd: "P", d: "none" },
    ],
  },
  {
    name: "Psychic Dominion", mood: "battle", style: "edm", fac: "yuri", bpm: 140, bassOct: -2, bassKind: "saw", stabKind: "hit", lk: "saw",
    parts: {
      bass: { A: "EEeE EEeE EEeE EEeE | FFfF FFfF FFfF FFfF | EEeE EEeE EEeE EEeE | DDdD DDdD DDdD DDdD |" },
      arps: { A: "e b g e b g e b g e b g e b g e | f c' a f c' a f c' a f c' a f c' a f | e b g e b g e b g e b g e b g e | d a ^f d a ^f d a ^f d a ^f d a ^f d |" },
      chords: { S: "[EGB]4 z4 [EGB]2 z2 [EGB]4 | [FAc]4 z4 [FAc]2 z2 [FAc]4 | [EGB]4 z4 [EGB]2 z2 [EGB]4 | [D^FA]4 z4 [D^FA]2 z2 [D^FA]4 |" },
      stabs: { H: "[EB]2 z14 | [FA]2 z14 | [EB]2 z14 | [DA]2 z14 |" },
      leads: { A: "b2 c' b g2 e2 | f2 g a c'4 | b2 a g e2 g2 | ^f8 |", B: "e'4 f'4 | e'2 c'2 a4 | b4 g4 | a2 ^f2 d4 |" },
      pads: { P: "[EGB]4 | [FAc]4 | [EGB]4 | [D^FA]4 |" },
    },
    form: [
      { bars: 4, st: "H", pd: "P", d: "none" },
      { bars: 4, bl: "A", ar: "A", d: "roll", riser: 1 },
      { bars: 8, bl: "A", ss: "S", l: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, bl: "A", ar: "A", st: "H", l: "B", lk: "square", d: "breaks" },
      { bars: 4, ar: "A", d: "roll", riser: 1 },
      { bars: 8, bl: "A", ss: "S", ar: "A", l: "A", d: "edm", pump: 1, impact: 1 },
      { bars: 8, pd: "P", st: "H", stk: "choir", d: "none" },
      { bars: 8, bl: "A", ss: "S", l: "B", lk: "square", d: "edm", pump: 1 },
      { bars: 4, st: "H", d: "none" },
    ],
  },
  {
    name: "Glass Garden", mood: "calm", style: "synthpop", fac: "yuri", bpm: 96, bassOct: -2, bassKind: "saw", lk: "square", padOct: 0,
    parts: {
      bass: { A: "B,4z4B,4z2B,2 | G,4z4G,4z2G,2 | D4z4D4z2D2 | A,4z4A,4z2A,2 |" },
      arps: { A: "B2^f2d'2^f2b2^f2d'2^f2 | G2d2b2d2g2d2b2d2 | D2A2^f2A2d2A2^f2A2 | A,2E2^c2E2A2E2^c2E2 |" },
      leads: { A: "^f4 e2 d2 | d4 B4 | A2 B2 d2 ^f2 | e8 |", B: "b4 a2 ^f2 | g4 d4 | ^f2 g2 a2 d'2 | ^c'8 |" },
      pads: { P: "[B,D^F]4 | [G,B,D]4 | [D^FA]4 | [A,^CE]4 |" },
    },
    form: [
      { bars: 4, ar: "A", pd: "P", d: "none", sweep: [500, 4000] },
      { bars: 4, ar: "A", pd: "P", bl: "A", l: "A", d: "light" },
      { bars: 4, ar: "A", pd: "P", bl: "A", l: "B", d: "pop" },
      { bars: 4, pd: "P", l: "A", d: "none" },
      { bars: 4, ar: "A", pd: "P", bl: "A", l: "B", d: "pop" },
      { bars: 4, ar: "A", pd: "P", d: "none", sweep: [4000, 400] },
    ],
  },
  {
    name: "Velvet Signal", mood: "calm", style: "synthpop", fac: "yuri", bpm: 108, bassOct: -2, bassKind: "saw", lk: "square",
    parts: {
      bass: { A: "F2f2z2f2F2f2z2f2 | C2c2z2c2C2c2z2c2 | D2d2z2d2D2d2z2d2 | _B,2_B2z2_B2_B,2_B2z2_B2 |" },
      arps: { A: "zczazczfzczazczf | zGzezGzczGzezGzc | zAzfzAzdzAzfzAzd | zFzdzFz_BzFzdzFz_B |" },
      chords: { S: "[FAc]16 | [EGc]16 | [DFA]16 | [DF_B]16 |" },
      leads: { A: "a4 g2 f2 | g4 e4 | f2 e2 d2 f2 | d8 |", B: "c'4 _b2 a2 | g4 c'4 | a2 g2 f2 a2 | _b8 |" },
      pads: { P: "[FAc]4 | [EGc]4 | [DFA]4 | [DF_B]4 |" },
    },
    form: [
      { bars: 4, ar: "A", pd: "P", d: "none" },
      { bars: 4, ar: "A", pd: "P", bl: "A", l: "A", d: "pop" },
      { bars: 4, ss: "S", bl: "A", ar: "A", l: "B", d: "popdrive", pump: 1 },
      { bars: 4, pd: "P", ar: "A", d: "none" },
      { bars: 4, bl: "A", ar: "A", l: "A", d: "pop" },
      { bars: 4, ss: "S", bl: "A", l: "B", d: "popdrive", pump: 1 },
      { bars: 4, ar: "A", pd: "P", d: "none", sweep: [4000, 400] },
    ],
  },
  // ======================================================= Legion: march / chant rock
  //  chants: 1/8 units at sung pitch, n = notes, v = one syllable per note.
  {
    name: "Iron Legion", mood: "battle", style: "rock", fac: "soviet", bpm: 112, riffOct: -2,
    parts: {
      riffs: {
        A: "D4 D2D2 D4 D2D2 | _B,4 _B,2_B,2 C4 C2C2 | D4 D2D2 F4 F2F2 | A,4 A,2A,2 A,8 |",
        B: "D8 D4 F4 | _B,8 _B,4 C4 | F8 F4 E4 | A,8 A,8 |",
        D: "D16 | _B,16 | C16 | D16 |",
      },
      chants: {
        A: { n: "D,2 D,2 F,2 A,2 | G,3 F, E,2 D,2 | D,2 D,2 F,2 A,2 | C4 A,4 |", v: "ha ha ho ha | le gi o na | ha ha ho ha | u ra" },
        B: { n: "A,2 z A, A,2 z2 | D2 D2 C2 A,2 | A,2 z A, A,2 z2 | E,4 ^C,4 |", v: "hey hey ho | le gi o na | hey hey ho | u ra" },
      },
      leads: { A: "d2 f2 a2 d'2 | c'2 _b a g2 f2 | _b2 a g f2 d2 | ^c4 e4 |" },
      stabs: { H: "[DFA]2z6[DFA]2z6 | [DFA]2z6[DFA]2z6 | [_B,DF]2z6[_B,DF]2z6 | [CEG]2z6[A,^CE]2z6 |" },
      pads: { P: "[DFA]4 | [DFA]4 | [_B,DF]4 | [A,^CE]4 |" },
    },
    form: [
      { bars: 4, ch: "A", d: "stomp" },
      { bars: 4, r: "A", st: "H", d: "march" },
      { bars: 8, r: "A", ch: "A", d: "marchrock" },
      { bars: 8, r: "B", ch: "B", st: "H", d: "drive" },
      { bars: 4, r: "A", l: "A", d: "rock" },
      { bars: 4, ch: "A", pd: "P", d: "stomp" },
      { bars: 4, r: "A", d: "build" },
      { bars: 8, r: "B", ch: "B", l: "A", st: "H", d: "shout" },
      { bars: 4, r: "D", st: "H", stk: "choir", d: "march", fill: false },
    ],
  },
  {
    name: "Red Anthem", mood: "battle", style: "rock", fac: "soviet", bpm: 88, riffOct: -2, stabKind: "choir",
    parts: {
      riffs: {
        A: "A8 .A.A.A.A G4 | F8 .F.F.F.F E4 | D8 .D.D.D.D E4 | A8 A8 |",
        B: "A4 .A.A.A.A A4 .A.A.A.A | F4 .F.F.F.F F4 .F.F.F.F | G4 .G.G.G.G G4 .G.G.G.G | E4 .E.E.E.E E4 .E.E.E.E |",
      },
      chants: {
        A: { n: "A,4 C4 | E4 D2 C2 | B,4 A,2 G,2 | A,8 |", v: "o o | o a o | o a o | o" },
        B: { n: "E4 E2 D2 | C4 A,4 | D4 C2 B,2 | ^G,8 |", v: "u ra ra | le gi | o na ha | hey" },
      },
      leads: { B: "e'4 c'2 a2 | c'4 f4 | d'2 c'2 b2 g2 | ^g8 |" },
      stabs: { H: "[Ace]16 | [FAc]16 | [GBd]16 | [E^GB]16 |" },
      pads: { P: "[Ace]4 | [FAc]4 | [GBd]4 | [E^GB]4 |", Q: "[Ace]4 | [FAc]4 | [DFA]4 | [Ace]4 |" },
    },
    form: [
      { bars: 4, ch: "A", pd: "Q", d: "none" },
      { bars: 4, r: "A", ch: "A", d: "half" },
      { bars: 4, r: "B", ch: "B", st: "H", d: "anthem" },
      { bars: 4, r: "B", l: "B", d: "rock" },
      { bars: 4, ch: "A", pd: "Q", d: "stomp" },
      { bars: 4, r: "B", ch: "B", st: "H", d: "anthem" },
      { bars: 4, r: "B", ch: "B", l: "B", d: "rock" },
      { bars: 4, r: "A", pd: "Q", d: "half", fill: false },
    ],
  },
  {
    name: "Forward March", mood: "battle", style: "rock", fac: "soviet", bpm: 150, riffOct: -2,
    parts: {
      riffs: {
        A: "E2E2E2G2 A2A2A2G2 | E2E2E2G2 B2B2A2G2 |",
        B: "E6 G2 A4 G4 | C6 B,2 A,4 B,4 | E6 G2 A4 B4 | D4 C4 B,8 |",
        D: "E16 | C16 | D16 | E16 |",
      },
      chants: {
        A: { n: "E,2 E,2 G,2 E,2 | A,2 G,2 E,4 | E,2 E,2 G,2 B,2 | A,4 G,4 |", v: "ho ha ho ha | fo ward on | ho ha ho ha | ma ah" },
        B: { n: "B,2 z2 B,2 z2 | E4 E4 | B,2 z2 B,2 z2 | ^D4 B,4 |", v: "hey hey | fo ward | hey hey | ma arch" },
      },
      leads: { A: "e2 g2 b2 e'2 | d'2 c' b a4 | g2 a2 b2 g2 | ^f4 ^d4 |" },
      stabs: { H: "[EGB]2z2[EGB]2z10 | [CEG]2z2[CEG]2z10 | [EGB]2z2[EGB]2z10 | [D^FA]2z2[B,^D^F]2z10 |" },
    },
    form: [
      { bars: 4, ch: "B", d: "march" },
      { bars: 4, r: "A", d: "punk" },
      { bars: 8, r: "A", ch: "A", d: "marchrock" },
      { bars: 8, r: "B", ch: "B", st: "H", d: "shout" },
      { bars: 8, r: "A", l: "A", d: "punk" },
      { bars: 4, ch: "A", d: "stomp" },
      { bars: 4, r: "A", d: "build" },
      { bars: 8, r: "B", ch: "B", st: "H", l: "A", d: "shout" },
      { bars: 4, r: "D", st: "H", d: "march", fill: false },
    ],
  },
];
Object.assign(window, { MUSIC_SONGS });
