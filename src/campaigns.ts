export {};
const FAC_NAME={allied:"Vanguard",soviet:"Legion",yuri:"Syndicate"};
function otherFacs(fac){return["allied","soviet","yuri"].filter(f=>f!==fac)}
const CAMPAIGNS={allied:{title:"Operation Clean Slate",missions:[
{name:"First Strike",map:"dust",briefing:"Vanguard command has traced a hostile outpost to this sector. Move in, break their defenses, and secure the field before they can dig in.",diffs:["easy"],objective:{type:"elim"}},
{name:"Precision Strike",map:"high",briefing:"Intelligence has pinpointed the enemy command structure. Take it down and their war effort collapses — you don't need to finish off the rest of their base.",diffs:["normal"],objective:{type:"destroyTarget",key:"conyard"}},
{name:"Hold the Line",map:"ring",briefing:"A Brutal-tier warlord is mustering an all-out assault on our forward position. Dig in and hold for ten minutes until reinforcements arrive.",diffs:["hard"],objective:{type:"survive",duration:600}},
{name:"Behind Enemy Lines",map:"dust",briefing:"No time to build a base on this one — command has dropped in a small strike team, and that is all you get. Cripple the enemy war effort by destroying or capturing their Barracks and War Factory before their defenses regroup.",diffs:["normal"],objective:{type:"raid",targets:["barracks","factory"]},noBuild:!0},
{name:"Liberation",map:"basin",briefing:"Two hostile factions occupy this territory, and a civilian block near the center is worth liberating. Send an engineer to capture it — that alone will break their hold on the region.",diffs:["normal","normal"],objective:{type:"capture"}},
{name:"Reclamation",map:"lakes",briefing:"Both remaining warlords have joined forces against the Vanguard. Break them completely — this is the final battle for the region.",diffs:["hard","hard"],objective:{type:"elim"}}
]},soviet:{title:"Iron Reclamation",missions:[
{name:"Opening Barrage",map:"dust",briefing:"A weak outpost stands between Legion forces and this sector's resources. Crush it and claim the ground.",diffs:["easy"],objective:{type:"elim"}},
{name:"Silence the Signal",map:"high",briefing:"Their command center is coordinating resistance across the region. Level it and the resistance falls apart on its own — the rest of their base is not worth Legion blood.",diffs:["normal"],objective:{type:"destroyTarget",key:"conyard"}},
{name:"Siege Works",map:"ring",briefing:"We have seized a valuable refinery, and the enemy wants it back. Hold this ground for ten minutes — Legion does not retreat.",diffs:["hard"],objective:{type:"survive",duration:600}},
{name:"Deep Strike",map:"basin",briefing:"A full assault would take too long. A small sabotage cell is being dropped behind enemy lines instead — destroy or seize their Barracks and War Factory before they can respond.",diffs:["normal"],objective:{type:"raid",targets:["barracks","factory"]},noBuild:!0},
{name:"Requisition",map:"high",briefing:"A fortified settlement near the center of this territory holds resources Legion needs. Send an engineer to seize it intact rather than reduce it to rubble.",diffs:["normal","normal"],objective:{type:"capture"}},
{name:"Iron Fist",map:"lakes",briefing:"Two rival powers stand between Legion and total control of this region. Crush them both — nothing short of annihilation is acceptable.",diffs:["hard","hard"],objective:{type:"elim"}}
]},yuri:{title:"The Harvest",missions:[
{name:"First Contact",map:"dust",briefing:"A small enclave of unconverted holdouts occupies this sector. Overwhelm them — their minds and materiel belong to the Hive now.",diffs:["easy"],objective:{type:"elim"}},
{name:"Cut the Head",map:"high",briefing:"Their command structure anchors what little resistance remains. Tear it down and the rest will fall into the Hive without a fight.",diffs:["normal"],objective:{type:"destroyTarget",key:"conyard"}},
{name:"The Swarm Endures",map:"ring",briefing:"The enemy senses what we are building here and means to purge it before it spreads. Endure their assault for ten minutes — the Hive does not simply die.",diffs:["hard"],objective:{type:"survive",duration:600}},
{name:"Whispers in the Dark",map:"basin",briefing:"A full swarm would be seen coming. A small infiltration cell moves quieter — destroy or claim their Barracks and War Factory before the alarm spreads.",diffs:["normal"],objective:{type:"raid",targets:["barracks","factory"]},noBuild:!0},
{name:"The Gathering",map:"ring",briefing:"A settlement at the heart of this territory has not yet been claimed. Send a convert to bring it into the Hive rather than destroy what could still serve it.",diffs:["normal","normal"],objective:{type:"capture"}},
{name:"Ascendance",map:"lakes",briefing:"Two rival powers still resist the Hive's reach. Absorb them both — nothing outside the Hive is permitted to remain.",diffs:["hard","hard"],objective:{type:"elim"}}
]}};
let pendingMission=null;
function launchMission(fac,idx){const camp=CAMPAIGNS[fac],m=camp&&camp.missions[idx];if(!m)return;const foes=otherFacs(fac);cfg.fac=fac,cfg.map=m.map,cfg.fog="on",cfg.slots=m.diffs.map((d,i)=>({fac:foes[i%foes.length],team:2+i,color:"def",spawn:i+1,diff:d})),pendingMission={fac,idx,objective:JSON.parse(JSON.stringify(m.objective)),noBuild:!!m.noBuild},startGame()}
function applyPendingMission(){if(!pendingMission)return void(S.mission=null);S.mission={fac:pendingMission.fac,idx:pendingMission.idx,objective:pendingMission.objective,noBuild:pendingMission.noBuild};if("capture"===S.mission.objective.type){const cx=1472,cy=1152;let best=null,bd=1e18;for(const b of S.blds)if(!b.dead&&b.d.civ&&b.owner===NEUTRAL){const dd=dist2(b.x,b.y,cx,cy);dd<bd&&(bd=dd,best=b)}if(!best)for(const b of S.blds)if(!b.dead&&b.owner===NEUTRAL){const dd=dist2(b.x,b.y,cx,cy);dd<bd&&(bd=dd,best=b)}best?(S.mission.objective.tx=best.tx,S.mission.objective.ty=best.ty):(S.mission.objective.type="elim")}pendingMission=null}
function checkMissionOutcome(){const obj=S.mission.objective;if(S.players[0].defeated)return"lose";if("elim"===obj.type){let allDead=!0;for(let t=1;t<NEUTRAL;t++)teamOf(t)!==teamOf(0)&&!S.players[t].defeated&&(allDead=!1);return allDead?"win":null}if("destroyTarget"===obj.type)return S.blds.some(b=>!b.dead&&b.owner!==NEUTRAL&&teamOf(b.owner)!==teamOf(0)&&b.key===obj.key)?null:"win";if("survive"===obj.type)return S.time>=obj.duration?"win":null;if("raid"===obj.type){obj.seen=obj.seen||{};const enemyHas=k=>S.blds.some(b=>!b.dead&&b.owner!==NEUTRAL&&teamOf(b.owner)!==teamOf(0)&&b.key===k);for(const k of obj.targets)enemyHas(k)&&(obj.seen[k]=!0);return obj.targets.every(k=>obj.seen[k]&&!enemyHas(k))?"win":null}if("capture"===obj.type){if(null==obj.tx)return null;const b=S.blds.find(x=>!x.dead&&x.tx===obj.tx&&x.ty===obj.ty);return b&&teamOf(b.owner)===teamOf(0)?"win":null}return null}
function campaignUnlocked(fac){try{return+localStorage.getItem("ifr_campaign_"+fac)||1}catch(e){return 1}}
function unlockNext(fac,idx){try{const u=campaignUnlocked(fac);idx+2>u&&localStorage.setItem("ifr_campaign_"+fac,""+(idx+2))}catch(e){}}
Object.assign(window, {
  FAC_NAME, CAMPAIGNS, launchMission, checkMissionOutcome, campaignUnlocked, unlockNext, applyPendingMission
});

Object.defineProperties(window, {
  pendingMission: { get: () => pendingMission, configurable: true },
});
