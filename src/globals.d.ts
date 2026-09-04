// Ambient declarations for the cross-module global surface.
//
// Every src/*.ts file here is bundled by esbuild into its own IIFE at
// build time (see scripts/build.mjs) and communicates with the others
// purely through `window` properties set at the bottom of each file via
// `Object.assign(window, {...})` / `Object.defineProperties(window, {...})`
// — there is no import/export wiring at runtime. This file is the single
// place that models that shared symbol table for the type checker, so
// every module type-checks against the same signatures it actually calls
// at runtime.
//
// Scope: the core data model (S, G, P, cfg, Unit/Building/Player-shaped
// return values) is typed precisely, using the interfaces in types.ts,
// since that's what a mistyped property access is most likely to be. The
// large tail of rendering/mesh-construction/audio helper functions is
// typed loosely (`(...args: any[]) => any`) rather than exhaustively —
// they're numeric-parameter geometry/DSP helpers whose call sites were
// already correct before this conversion, and precisely typing every
// parameter of e.g. a 7-argument triangle-pushing helper buys little
// safety for a lot of busywork.

import type {
  Unit,
  Building,
  GameEntity,
  Player,
  GameState,
  MapData,
  EntityDef,
  Vec2,
  Prop,
  GameConfig,
} from "./types";

type AnyFn = (...args: any[]) => any;

declare global {
  // === Vendor (hand-bundled in index.html, not an npm dependency) ===
  const THREE: any;

  // === Shared prelude (still inline in index.template.html, ahead of
  //     the first module marker) ===
  const TILE: number;
  const MAPW: number;
  const MAPH: number;
  const WORLDW: number;
  const WORLDH: number;
  function clamp(v: number, lo: number, hi: number): number;
  function dist(x0: number, y0: number, x1: number, y1: number): number;
  function dist2(x0: number, y0: number, x1: number, y1: number): number;
  function rnd(lo: number, hi: number): number;
  function irnd(lo: number, hi: number): number;
  function pick<T>(arr: T[]): T;
  function angLerp(a: number, b: number, t: number): number;
  function hint(msg: string): void;
  var hintT: number;
  // Used as inputs, selects, divs, canvases, buttons... throughout - `any`
  // return avoids an element-type cast at every call site.
  const $: (sel: string) => any;
  const elCards: any;
  const elCred: any;
  const elPwr: any;
  const elPwrBar: any;

  // === gamedata.js ===
  const BLD: Record<string, EntityDef>;
  const UNITS: Record<string, EntityDef>;
  const FACTIONS: Record<string, any>;
  const DIFFS: Record<string, any>;
  function uname(key: string, fac?: string): string;
  function bname(key: string, fac: string): string;
  function unitRoleTag(key: string): { short: string; label: string; desc: string; color: string } | null;
  function bweapon(key: string, fac: string): EntityDef | null;

  // === sim.js (core simulation) ===
  var S: GameState;
  var G: MapData;
  function P(): Player;
  var FOG_ON: boolean;
  function idx(tx: number, ty: number): number;
  function inMap(tx: number, ty: number): boolean;
  const MAPS: { k: string; n: string; mp?: number }[];
  var mmPings: { x: number; y: number; spawnTime: number }[];
  function angDiff(a: number, b: number): number;

  function walkable(tx: number, ty: number): boolean;
  function walkableW(tx: number, ty: number): boolean;
  function walkableTeam(team: number): AnyFn;
  function walkableWIgnore(...args: any[]): boolean;
  const hash2: AnyFn;
  const noise2: AnyFn;
  const vnoise: AnyFn;
  const fbm: AnyFn;
  const baseTerrain: AnyFn;
  const ridge: AnyFn;
  const bridge: AnyFn;
  const clearArea: AnyFn;
  function genMap(seed: number, mapKey: string): void;
  const freeTile: AnyFn;
  const addDeathProp: AnyFn;
  const addProp: AnyFn;
  const scatterScenery: AnyFn;
  const buildCities: AnyFn;
  const spawnTrafficLane: AnyFn;
  function tickTraffic(dt: number): void;
  const buildCityscape: AnyFn;
  const blob: AnyFn;
  const oreField: AnyFn;
  const heapClear: AnyFn;
  const heapPush: AnyFn;
  const heapPop: AnyFn;
  function findPath(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    ignoreOcc?: boolean,
    naval?: boolean,
    team?: number
  ): [number, number][] | null;
  const simplify: AnyFn;
  function nearestFree(tx: number, ty: number, pred: AnyFn): [number, number] | null;
  function newPlayer(
    id: number,
    fac: string,
    isAI: boolean,
    diff: string,
    team?: number,
    colorSet?: any
  ): Player;
  function addBuilding(owner: number, key: string, tx: number, ty: number, instant?: boolean): Building;
  function evict(b: Building): void;
  function unstick(u: Unit): void;
  function nearWater(tx: number, ty: number, size: number, margin: number): boolean;
  function canPlace(key: string, tx: number, ty: number, owner: number): boolean;
  function canDeploy(key: string, tx: number, ty: number, unit: Unit): boolean;
  function addUnit(owner: number, key: string, x: number, y: number): Unit | null;
  function killUnit(u: Unit, ...args: any[]): void;
  function killBld(b: Building): void;
  function recalcPower(owner: number): void;
  function boom(x: number, y: number, scale: number, color: string): void;
  function spark(x: number, y: number, color: string): void;
  function textFx(x: number, y: number, text: string, color?: string): void;
  function hasBld(owner: number, key: string): boolean;
  function hasActiveBld(owner: number, key: string): boolean;
  const unitFacOwner: AnyFn;
  function countBld(owner: number, key: string): number;
  function canBuildBld(owner: Player, key: string, inProgress?: number): boolean;
  const bldKind: AnyFn;
  const siloBonus: AnyFn;
  function canBuildUnit(owner: Player, key: string, inProgress?: number): boolean;
  const qCount: AnyFn;
  const startBuild: AnyFn;
  const cancelBuild: AnyFn;
  const activeSourceOk: AnyFn;
  function tickProduction(p: Player, dt: number): void;
  const spawnUnit: AnyFn;
  const placeReady: AnyFn;
  function cmdMove(units: Unit[], x: number, y: number, amove?: boolean): void;
  function cmdAttack(units: Unit[], target: GameEntity): void;
  function cmdHarvest(units: Unit[], tx: number, ty: number): void;
  const repath: AnyFn;
  const dmgMult: AnyFn;
  const alertCheck: AnyFn;
  function damage(target: GameEntity, amount: number, owner: number, source?: GameEntity | null): void;
  const targetsOf: AnyFn;
  const effRange: AnyFn;
  const acquire: AnyFn;
  const inRange: AnyFn;
  function fire(shooter: GameEntity, target: GameEntity, weapon: EntityDef, secondary?: boolean): void;
  function tickProjectiles(dt: number): void;
  function tickUnit(u: Unit, dt: number): void;
  const faceAndShoot: AnyFn;
  const mindTick: AnyFn;
  const moveAlong: AnyFn;
  function passableAt(x: number, y: number, self: Unit): boolean;
  const findOre: AnyFn;
  const nearestRef: AnyFn;
  const refDock: AnyFn;
  function tickMiner(u: Unit, dt: number): void;
  function tickRepairBay(b: Building, dt: number): void;
  function tickNavalRepair(b: Building, dt: number): void;
  function tickHive(b: Building, dt: number): void;
  function tickSuper(b: Building, dt: number): void;
  const superReady: AnyFn;
  function fireSuper(owner: number, x: number, y: number): boolean;
  const superBlast: AnyFn;
  const superPsi: AnyFn;
  const rocketArc: AnyFn;
  function tickRockets(dt: number): void;
  const buildRocketMesh3D: AnyFn;
  const sightOf: AnyFn;
  function updateFog(dt: number): void;
  function visibleToTeam(x: number, y: number, team: number): boolean;
  const visAt: AnyFn;
  function subRevealed(u: Unit): boolean;
  function seen(e: GameEntity): boolean;
  function tickBld(b: Building, dt: number): void;

  // === ai.js ===
  const aiBaseCenter: AnyFn;
  function tickAI(p: Player, dt: number): void;
  function aiMicro(p: Player, dt: number): void;

  // === models.js (3D model library + shared camera/canvas state) ===
  const cv: HTMLCanvasElement;
  const mm: HTMLCanvasElement;
  var cam: { x: number; y: number; z: number };
  const ctx: CanvasRenderingContext2D;
  const mctx: CanvasRenderingContext2D;
  const CYL: AnyFn;
  const CONE: AnyFn;
  function isoX(x: number, y: number): number;
  function isoY(x: number, y: number): number;
  function faceAng(idx: number): number;
  const PI2: number;
  const ZH: number;
  const MINE_TOOL: any;
  const MINE_DEFAULT: any;
  const roundRectProfile: AnyFn;
  const circleProfile: AnyFn;
  const polyProfile: AnyFn;
  const triN: AnyFn;
  const pushTri: AnyFn;
  const fanCap: AnyFn;
  const nrm3: AnyFn;
  const wallMeshSG: AnyFn;
  const wallMesh: AnyFn;
  const boxMesh: AnyFn;
  const cylMesh: AnyFn;
  const coneMesh: AnyFn;
  const domeMesh: AnyFn;
  const slabMesh: AnyFn;
  const wedgeMesh: AnyFn;
  const taperSlabMesh: AnyFn;
  const hexProfile: AnyFn;
  const filletPoly: AnyFn;
  const hullProfile: AnyFn;
  const meshOf: AnyFn;
  const P_: AnyFn;
  const B_: AnyFn;
  // Some call sites pass a 3rd (z) argument that the implementation
  // ignores - matching that real usage rather than the narrower signature.
  function w2sx(x: number, y: number, z?: number): number;
  function w2sy(x: number, y: number, z?: number): number;
  function s2w(sx: number, sy: number): Vec2;
  function setQuality(level: number): void;
  function resize(): void;
  function clampCam(): void;
  const shade: AnyFn;
  const sh: AnyFn;
  function palette(owner: number): any;
  const colOf: AnyFn;
  const projX: AnyFn;
  const projY: AnyFn;
  const boxCorners: AnyFn;
  const boxCentre: AnyFn;
  const shadeNormal: AnyFn;
  const rgbOf: AnyFn;
  const gritN: AnyFn;
  const buildTris: AnyFn;
  const triRasterG: AnyFn;
  const creaseAO: AnyFn;
  const buildShadowTris: AnyFn;
  const makeShadow: AnyFn;
  const makeSprite: AnyFn;
  const sprite: AnyFn;
  const blit: AnyFn;
  const rows: AnyFn;
  const oreDrillModel: AnyFn;
  const crystalModel: AnyFn;
  const blossomModel: AnyFn;
  const trackUnit: AnyFn;
  const drig: AnyFn;
  const wheelUnit: AnyFn;
  const strut3: AnyFn;
  const legWalker: AnyFn;
  const deployedOutriggers: AnyFn;
  const deployedPillar: AnyFn;
  const factionHullDetail: AnyFn;
  const longbowModel: AnyFn;
  const longbowTurret: AnyFn;
  const riftModel: AnyFn;
  const riftTurret: AnyFn;
  const boatHull: AnyFn;
  const transportHeli: AnyFn;
  const subHull: AnyFn;
  const tankHull: AnyFn;
  const turretProfile: AnyFn;
  const tankTurret: AnyFn;
  const harvesterSoviet: AnyFn;
  const harvesterAllied: AnyFn;
  const harvesterYuri: AnyFn;
  const harvesterModel: AnyFn;
  const harvesterAugerModel: AnyFn;
  const harvesterDrumModel: AnyFn;
  const droneLaserModel: AnyFn;
  const droneModel: AnyFn;
  const bastionModel: AnyFn;
  const mcvModel: AnyFn;
  const weaponRig: AnyFn;
  const infantry: AnyFn;
  const jet: AnyFn;
  const UMODEL_: AnyFn;
  const UTURRET_: AnyFn;
  const muzzleDist: AnyFn;
  function hasTurret(key: string): boolean;
  function hasBTurret(key: string, fac: string): boolean;
  function hasStagedBuild(key: string): boolean;
  const treeModel: AnyFn;
  const rockModel: AnyFn;
  const scrubModel: AnyFn;
  const stoneModel: AnyFn;
  const fallModel: AnyFn;
  const lampModel: AnyFn;
  const towerModel: AnyFn;
  const carModel: AnyFn;
  const PROPMODEL: AnyFn;
  const craterModel: AnyFn;
  const wreckModel: AnyFn;
  const rubbleModel: AnyFn;
  const crane: AnyFn;
  const containerBox: AnyFn;
  const blockM: AnyFn;
  const bandLights: AnyFn;
  const glassBand: AnyFn;
  const railing: AnyFn;
  const stack: AnyFn;
  const dish: AnyFn;
  const fan: AnyFn;
  const drum: AnyFn;
  const spine: AnyFn;
  const sandbagRing: AnyFn;
  const ribs: AnyFn;
  const ladder: AnyFn;
  const pipeRun: AnyFn;
  const vent: AnyFn;
  const acUnit: AnyFn;
  const floodlight: AnyFn;
  const railPosts: AnyFn;
  const hazard: AnyFn;
  const bolts: AnyFn;
  const boltRing: AnyFn;
  const seams: AnyFn;
  const catwalk: AnyFn;
  const crate: AnyFn;
  const barrel: AnyFn;
  const detailPass: AnyFn;
  const barrelRoofMesh: AnyFn;
  const tier: AnyFn;
  const windows: AnyFn;
  const lattice: AnyFn;
  const coolTower: AnyFn;
  const silo: AnyFn;
  const gantry: AnyFn;
  const solarPanels: AnyFn;
  const roofFarm: AnyFn;
  const stairs: AnyFn;
  const veins: AnyFn;
  const plates: AnyFn;
  const hive: AnyFn;
  const def1Bits: AnyFn;
  const aaBits: AnyFn;
  const triGunHead: AnyFn;
  const triAAHead: AnyFn;
  const BMODEL_: AnyFn;
  const BTURRET_: AnyFn;
  function UMODEL(key: string, frame?: number, extra?: any): any;
  const UTURRET: AnyFn;
  function BMODEL(key: string, fac: string, deployed?: number | boolean, colorName?: string, rot?: number): any;
  const BTURRET: AnyFn;
  function faceIdx(ang: number): number;
  const SPRITES: Map<string, any>;
  const SHADOWS: Map<string, any>;
  const MAT: Record<string, string>;
  const PILLAR_H: Record<string, number>;
  const TURRET_RISE: Record<string, number>;
  function registerModelAsset(key: string, url: string, scale?: number): void;
  function unregisterModelAsset(key: string): void;
  function getAssetModel(key: string): any[] | null;
  const MODEL_ASSETS: Record<string, string>;
  var camZTarget: number;
  var zoomPivot: { sx: number; sy: number } | null;
  var QUALITY: number;
  var CW: number;
  var CH: number;
  var DPR: number;

  // === render2d.js (2D top-down renderer + a few sim-adjacent ticks) ===
  const diamond: AnyFn;
  const th2: AnyFn;
  const tnoise: AnyFn;
  const tfbm: AnyFn;
  const paintGround: AnyFn;
  const makeTile: AnyFn;
  const makeOre: AnyFn;
  const makeTint: AnyFn;
  const makeEdge: AnyFn;
  function buildTiles(zoom: number): void;
  function drawTerrain(): void;
  function groundShadow(x: number, y: number, r: number, alpha?: number): void;
  function trimSprites(): void;
  const cachedSprite: AnyFn;
  function castShadow(e: GameEntity | Prop): void;
  const cachedShadowM: AnyFn;
  function unitFrame(u: Unit): number;
  const turretFrame: AnyFn;
  function drawProp(p: Prop): void;
  function drawUnit(u: Unit): void;
  const spriteTop: AnyFn;
  const drawRank: AnyFn;
  const namePlate: AnyFn;
  const hpBar: AnyFn;
  function drawBld(b: Building): void;
  const footprintPath: AnyFn;
  function drawProj(p: any): void;
  function drawFx(fx: any): void;
  function drawGhost(): void;
  function drawBox(): void;
  function drawMarker(): void;
  function buildMMCache(): void;
  function drawMM(): void;
  function viewInsets(): { l: number; r: number; t: number; b: number };
  function fc(owner: number): string;
  const iconFor: AnyFn;
  function drawRads(): void;
  function drawLightning(): void;
  function drawVignette(): void;
  function render(): void;
  const fpsHUD: AnyFn;
  function drawOverlay(): void;
  const unitHUD: AnyFn;
  const bldHUD: AnyFn;
  function render2D(): void;
  function nearestEnemy(e: GameEntity, range?: number): GameEntity | null;
  function addXp(u: Unit, amount: number): void;
  function canTarget(shooter: GameEntity, target: GameEntity): boolean;
  function spawnCivs(): void;
  function spawnSpecials(): void;
  const garrisonCap: AnyFn;
  function garrisonable(b: Building): boolean;
  function fpsEnterable(b: Building): boolean;
  function enterGarrison(u: Unit, b: Building): void;
  function evacuate(b: Building): void;
  function tickGarrison(b: Building, dt: number): void;
  function tickRogueDen(b: Building, dt: number): void;
  function captureBld(u: Unit, b: Building): void;
  function tickRads(dt: number): void;
  function tickEngineer(u: Unit, dt: number): void;
  function killUnitSilent(u: Unit): void;
  function deployMCV(u: Unit): void;
  function packUpBld(b: Building): void;
  function deployHive(u: Unit): void;
  function deployBastion(u: Unit): void;
  function undeployHive(b: Building): void;
  function startDeployPlacement(u: Unit, key: string): void;
  function finishDeploy(u: Unit, key: string, tx: number, ty: number): void;
  function tickTerror(u: Unit, dt: number): void;
  function tickChrono(u: Unit, dt: number): void;
  const acquireFor: AnyFn;
  function toggleDeploy(u: Unit): void;
  function homePad(u: Unit): Building | null;
  function tickAir(u: Unit, dt: number): void;
  const flyTo: AnyFn;
  const cargoUsed: AnyFn;
  function canLoad(transport: Unit, cargo: Unit): boolean;
  function smartOrder(units: Unit[], target: GameEntity): boolean;
  function tickLoadMove(u: Unit, dt: number): void;
  function unloadCargo(u: Unit): void;
  function tickGarrisonMove(u: Unit, dt: number): void;
  function tickTiberium(dt: number): void;
  // Always called with (x, y, owner, source) at call sites even though
  // the current implementation ignores its arguments and returns false
  // unconditionally - matching real call-site usage here rather than
  // the (equally real) current implementation's arity.
  function tibBlast(...args: any[]): boolean;
  const GRASS: string[];
  const DIRT: string[];
  const ROCK: string[];
  const WATER: string[];
  const TIBPAL: { body: string; dark: string; trim: string };
  const vDmg: AnyFn;
  const vRof: AnyFn;
  const ORE_MAX: number;
  function teamOf(owner: number): number;
  var tileSprites: any;
  var mmCache: HTMLCanvasElement | null;
  var NEUTRAL: number;

  // === render.js (Three.js engine bootstrap) ===
  const initGL: AnyFn;
  function resizeGL(): void;
  const onFogUpdated: AnyFn;
  const setFogUniform: AnyFn;
  const heightAt: AnyFn;
  function rebuildTerrainGL(): void;
  function renderGL(): void;
  var GL: any;

  // === fps.js (first-person mode) ===
  const projModel: AnyFn;
  function fpsEyeH(u: Unit): number;
  function enterFPS(u: Unit): boolean;
  function exitFPS(): void;
  function fpsTick(dt: number): void;
  function leaveGarrison(u: Unit): void;
  function fpsInteract(): void;
  const fpsAimTarget: AnyFn;
  function fpsUpdateAim(u: Unit, dt: number): void;
  function fpsShoot(u: Unit): void;
  const fpsAbilityInfo: AnyFn;
  function throwGrenade(u: Unit): void;
  function flameNova(u: Unit): void;
  function fpsAbility(): void;
  const buildViewmodel: AnyFn;
  const ensureViewmodel: AnyFn;
  const unitViewmodelKind: AnyFn;
  function interiorHalf(b: Building): number;
  const panelWall: AnyFn;
  const furnishInterior: AnyFn;
  function ensureInterior(b: Building): any;
  const interiorSlotPos: AnyFn;
  const interiorFigurePos: AnyFn;
  const humanFigure: AnyFn;
  function syncInteriorFigures(b: Building): void;
  function fpsRender(): any;
  var FPS: {
    on: boolean;
    u: Unit | null;
    yaw: number;
    pitch: number;
    cam: any;
    mv: { f: number; s: number };
    firing: boolean;
    aiming: boolean;
    look: any;
    stick: any;
    vm: any;
    interact: Building | null;
    entering: any;
    viewKick: number;
    hitFlashT: number;
    aimTarget: GameEntity | null;
    aimLockT: number;
    [k: string]: unknown;
  };
  const FLOOR_Z: number;
  var fpsPromptTarget: Unit | null;
  var rotateTarget: Building | null;

  // === audio.js ===
  function audio(): void;
  function sfx(name: string): void;
  function sfxHit(kind?: string): void;
  function setMuted(v: boolean): void;
  function setMasterVol(v: number): void;
  function setSfxVol(v: number): void;
  function setMusicVol(v: number): void;
  function setTrackSel(v: number): void;
  function setRainAmbience(on: boolean): void;
  function startMusic(): void;
  const MUSIC_TRACKS: { name: string; step: number; [k: string]: unknown }[];
  var lightningT: number;
  var sfxBudget: number;
  var muted: boolean;
  var masterVol: number;
  var sfxVol: number;
  var musicVol: number;
  var trackSel: number;

  // === cards.js (build menu) ===
  function buildCards(): void;
  function updateCards(): void;
  function doDeploy(): void;

  // === ui.js (input, game-setup/pause/settings menus, startGame) ===
  const endPtr: AnyFn;
  const updateGhost: AnyFn;
  const tryPlace: AnyFn;
  function entAt(x: number, y: number, sx?: number, sy?: number): GameEntity | null;
  function tap(x: number, y: number): void;
  const boxSelect: AnyFn;
  function colorSet(k: string): any;
  function nextDefaultFac(): string;
  function nextDefaultSpawn(mapMax?: number): number;
  function mapMax(key: string): number;
  function nextDefaultTeam(): number;
  function mapSpots(key: string): number[][];
  function mapPreviewSVG(key: string, mp?: number): string;
  function fillSelect(id: string, opts: { k: unknown; n: string }[], val: unknown, cb: AnyFn): void;
  function refreshMenu(): void;
  function openMenu(which: string | null): void;
  function gameOver(win: boolean): void;
  function pickWeather(): string;
  function startGame(): void;
  var cfg: GameConfig;

  // === saveload.js ===
  function serializeGame(): any;
  function loadSlot(n: number): void;
  function saveMeta(n: number): { fac: string; map: string; time: number; mission: unknown } | null;

  // === campaigns.js ===
  const FAC_NAME: Record<string, string>;
  const CAMPAIGNS: Record<string, { title: string; missions: any[] }>;
  function launchMission(fac: string, idx: number): void;
  function checkMissionOutcome(): "win" | "lose" | null;
  function campaignUnlocked(fac: string): number;
  function unlockNext(fac: string, idx: number): void;
  function applyPendingMission(): void;
  const pendingMission: { noBuild?: boolean; [k: string]: unknown } | null;

  // === loop.js (main loop, wall/gate mechanics, remaining menu screens) ===
  const showCampaign: AnyFn;
  const showMissionList: AnyFn;
  const showBriefing: AnyFn;
  const showSaveLoad: AnyFn;
  const showSetup: AnyFn;
  const wireSetup: AnyFn;
  const wallNeighborMask: AnyFn;
  function tickGates(dt: number): void;
  function quietKillBld(b: Building): void;
  function placeGatePair(g: Building): void;
  function relinkGatePair(g: Building): void;
  function wallTileOk(tx: number, ty: number): boolean;
  const autoLinkWall: AnyFn;
  function canPlaceRaw(key: string, tx: number, ty: number): boolean;
  function frame(now: number): void;
  function tickFpsEntry(dt: number): void;
  function beginFpsEntry(u: Unit): void;
  function step(dt: number): void;
  const SECBTN: string;
  const RDT: number;

  // === abilities.js ===
  const ABILITIES: Record<string, any>;
  function spyStrike(owner: number, x: number, y: number): void;
  function paradropStrike(owner: number, x: number, y: number): void;
  function fireEmp(owner: number, x: number, y: number): void;
  const abilityClick: AnyFn;
  function updateSuperPanel(): void;
  var superAim: boolean;
  var spyAim: boolean;
  var paradropAim: boolean;
  var empAim: boolean;
}

export {};
