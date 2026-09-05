// Core data-model types for Frontier Command.
//
// This codebase predates TypeScript: every object here has been built up
// over many sessions by attaching fields to plain objects at the point of
// use, not from a single declared shape. These interfaces describe the
// fields actually read/written across src/*.js as of this conversion,
// with an index signature on the two largest ones (Unit/Building) as an
// explicit, intentional escape hatch for the long tail of ad-hoc fields a
// exhaustive listing would be brittle to maintain. Treat a missing named
// field as "not modeled yet", not "doesn't exist" — grep before assuming.

export interface Vec2 {
  x: number;
  y: number;
}

// The static per-kind definition looked up via UNITS[key] / BLD[key]
// (see src/gamedata.js). Unit and Building share this shape loosely;
// fields only one side uses are still listed here rather than split,
// since both sides read through the same `.d` property.
export interface EntityDef {
  key?: string;
  name?: string;
  kind?: string;
  role?: string;
  hp?: number;
  cost?: number;
  radius?: number;
  speed?: number;
  rof?: number;
  dmg?: number;
  vsInf?: number;
  vsVeh?: number;
  vsBldg?: number;
  armor?: string;
  proj?: string;
  range?: number;
  minRange?: number;
  sight?: number;
  turn?: number;
  turret?: boolean;
  fly?: boolean;
  naval?: boolean;
  sub?: boolean;
  aa?: boolean;
  airOnly?: boolean;
  transport?: boolean;
  cargoSlots?: number;
  vehSlots?: number;
  deploy?: boolean | string;
  ammo?: number;
  civ?: boolean;
  roof?: boolean;
  size?: number;
  power?: number;
  drain?: number;
  weapon2?: EntityDef | null;
  weapon?: EntityDef | null;
  weapons?: Record<string, EntityDef>;
  limit?: number;
  garrison?: number | boolean;
  mobileRefine?: boolean | number;
  vehCost?: number;
  charge?: number;
  siegeMul?: number;
  spawnRate?: number;
  teleport?: boolean;
  c4?: boolean;
  push?: number;
  econIncome?: number;
  alt?: number;
  prereq?: string[];
  from?: string;
  build?: number;
  req?: string;
  tab?: string;
  [field: string]: unknown;
}

export type EntityKind = "u" | "b" | "p";

/** A live unit instance, as created by addUnit() in src/sim.js. */
export interface Unit {
  id: number;
  e: "u";
  key: string;
  d: EntityDef;
  owner: number;
  x: number;
  y: number;
  hp: number;
  maxhp: number;
  ang: number;
  tang: number;
  tang2?: number;
  order: string;
  tx: number;
  ty: number;
  path: unknown;
  pi: number;
  target: Unit | Building | null;
  target2?: Unit | Building | null;
  repath: number;
  cool: number;
  cool2?: number;
  // A miner's ore load (number) or a transport's loaded passengers
  // (Unit[]) depending on role - genuinely two different runtime shapes
  // behind one field, so `any` here reflects the real duck-typing rather
  // than fighting it with a union that would need narrowing everywhere.
  cargo: any;
  // A miner's claimed ore tile ({tx,ty}-shaped) once it has one, else null.
  ore: any;
  ref: Building | null;
  unload: number;
  dead: boolean;
  vx: number;
  vy: number;
  moving: boolean;
  stuck: number;
  ctrl: number;
  ctrlBy: unknown;
  origOwner: number;
  slaves: unknown[];
  recoil: number;
  muzzle: number;
  deployed: boolean;
  guard: unknown;
  xp: number;
  vet: number;
  alt: number;
  ammo: number;
  inside: Building | null;
  host: Unit | null;
  drone: Unit | null;
  attached?: boolean;
  erase: number;
  frozen: number;
  state: unknown;
  home: unknown;
  fac?: string;
  rally?: Vec2 | null;
  rot?: number;
  spin?: number;
  fps?: number;
  blue?: number;
  animT?: number;
  trackT?: number;
  hitT?: number;
  hitFlashT?: number;
  slowT?: number;
  abilityCD?: number;
  w?: EntityDef | null;
  w2?: EntityDef | null;
  cool_?: number;
  isAI?: boolean;
  retreatT?: number;
  [field: string]: unknown;
}

/** A live building instance, as created by addBuilding() in src/sim.js. */
export interface Building {
  id: number;
  e: "b";
  key: string;
  d: EntityDef;
  owner: number;
  tx: number;
  ty: number;
  size: number;
  x: number;
  y: number;
  hp: number;
  maxhp: number;
  name: string;
  cool: number;
  target: Unit | Building | null;
  dead: boolean;
  rally: Vec2 | null;
  sellT: number;
  repair: boolean;
  chargeT: number;
  rise: number;
  w: EntityDef | null;
  w2: EntityDef | null;
  spin: number;
  rot: number;
  tang?: number;
  deployed?: boolean;
  blackoutT?: number;
  capturedFac?: string;
  charge?: number;
  garrison?: Unit[];
  pairId?: number | null;
  gateT?: number;
  open?: boolean;
  furnCols?: unknown[];
  interior?: unknown;
  cargo?: Unit[];
  [field: string]: unknown;
}

/** A death/decoration prop (trees, rocks, wrecks, ...). */
export interface Prop {
  id?: number;
  e: "p";
  x: number;
  y: number;
  tree: { type: number };
  dead?: boolean;
}

export type GameEntity = Unit | Building;

export interface Player {
  id: number;
  fac: string;
  // The faction definition (FACTIONS[fac] in gamedata.ts): name, unit
  // roster, starting units, colors, etc. - not modeled field-by-field here.
  f: any;
  isAI: boolean;
  diff: string;
  team: number;
  color: string | null;
  dark: string | null;
  tint: string | null;
  credits: number;
  power: number;
  drain: number;
  // Production-queue and AI-brain state: internal scheduling structures
  // mutated in many shapes by tickProduction/tickAI - `any` rather than
  // modeling every queue-entry/AI-state shape here.
  queues: any;
  ready: any;
  ai: any;
  defeated: boolean;
  kills: number;
  lost: number;
  neutral?: boolean;
  spawnX?: number;
  spawnY?: number;
  spyCD?: number;
  paradropCD?: number;
  empCD?: number;
  [field: string]: unknown;
}

/** The map/terrain data, one flat Uint8Array/Float32Array per channel over 92x72 tiles. */
export interface MapData {
  terr: Uint8Array;
  ore: Float32Array;
  tib: Uint8Array;
  occ: Int32Array;
  tint: Uint8Array;
  blk: Uint8Array;
  pave: Uint8Array;
  vis: Uint8Array;
  elev: Float32Array;
  mtn: Float32Array;
  // Per-map decoration/spawn records (props, trees, ore-drill spots, ...)
  // are built as ad-hoc object literals by genMap(), not through a shared
  // constructor - `any[]` here for the same reason as GameState's
  // projs/fx/rockets above.
  fall: any[];
  spots?: number[][];
  oreSpots?: any[];
  props?: any[];
  trees?: any[];
  special?: any[];
  civ?: any[];
  map?: string;
  seed?: number;
  [field: string]: unknown;
}

/** The global mutable game-state singleton (S). */
export interface GameState {
  units: Unit[];
  blds: Building[];
  bldById: Map<number, Building>;
  players: Player[];
  // Projectiles/FX/rockets are short-lived, shape-varies-by-kind records
  // (bullet vs. shell vs. superweapon-strike vs. spark, ...) built as
  // object literals at the point of creation, not through a constructor
  // like Unit/Building — `any` here is intentional, not an oversight.
  projs: any[];
  fx: any[];
  rockets: any[];
  sel: GameEntity[];
  time: number;
  over: boolean;
  running: boolean;
  placing: string | null;
  tab: string;
  nextId: number;
  // The rest are only populated once startGame() actually starts a
  // match, not at S's initial module-load literal - optional reflects
  // that real lifecycle rather than forcing a premature initializer.
  box?: { x0: number; y0: number; x1: number; y1: number } | null;
  marker?: { x: number; y: number; t: number; c?: string } | null;
  ghost?: { tx: number; ty: number } | null;
  deployUnit?: Unit | null;
  mission?: any;
  weather?: string;
  rads?: any[];
  aiVis?: Map<number, Uint8Array>;
  knownEnemy?: Map<number, Set<number>>;
  selMode?: boolean;
  spyReveals?: { t: number; [k: string]: unknown }[];
  thunderT?: number;
  traffic?: any[];
  [field: string]: unknown;
}

/** Skirmish setup: local player + AI opponent slots, chosen before startGame(). */
export interface GameConfig {
  fac: string;
  map: string;
  fog: string;
  team: number;
  color: string;
  spawn: number;
  diff?: string;
  slots: { fac: string; team: number; color: string; spawn: number; diff?: string }[];
  [field: string]: unknown;
}

export {};
