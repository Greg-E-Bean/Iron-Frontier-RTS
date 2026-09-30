// @ts-nocheck
export {};
// ---- Campaigns --------------------------------------------------------------
// Three eight-mission story campaigns on the hand-authored maps. A mission is
// data: a spoken briefing, primary and bonus objectives, and scripted events
// (radio chatter, enemy attack waves, reinforcements, reveals) fired by time,
// by an objective completing or by the player reaching a place. Map points
// are in tiles (92x72).
const FAC_NAME={vanguard:"Vanguard",legion:"Legion",syndicate:"Syndicate"};
function otherFacs(fac){return["vanguard","legion","syndicate"].filter(f=>f!==fac)}

// Characters speak over the radio in their own voice.
const CAST={
  narr:{n:"Narrator",fac:"vanguard",acc:"rp",g:"m",p:.82,r:.9,c:"#d8dde2"},instructor:{n:"Drill Instructor",fac:"vanguard",acc:"us",g:"m",p:.95,r:1.02,c:"#e8d27a",hat:"cap",role:"Training Command"},
  marsh:{n:"Dr. Elias Marsh",fac:"vanguard",acc:"rp",g:"m",p:1.02,r:1.08,c:"#9fe8d0",hat:"glasses",role:"Project Starfall — lead scientist"},
  reyes:{n:"Col. Ada Reyes",fac:"vanguard",acc:"rp",g:"f",p:1,r:1,c:"#8fd0ff",hat:"beret",role:"Vanguard Command"},
  hale:{n:"Lt. Marcus Hale",fac:"vanguard",acc:"us",g:"m",p:1,r:1.06,c:"#a8e0ff",hat:"helmet",role:"Vanguard 3rd Battlegroup"},
  ghost:{n:"Ghost",fac:"vanguard",acc:"ie",g:"f",p:1.08,r:1.02,c:"#d6f2ff",hat:"hair",role:"Vanguard Special Operations"},
  draganov:{n:"Marshal Draganov",fac:"legion",acc:"ru",g:"m",p:.84,r:.9,c:"#ff8a6a",hat:"cap",role:"Legion Supreme Command"},
  volkova:{n:"Commissar Volkova",fac:"legion",acc:"ru",g:"f",p:1,r:1.04,c:"#ffb08a",hat:"cap",role:"Legion Political Directorate"},
  bogdan:{n:"Chief Engineer Bogdan",fac:"legion",acc:"north",g:"m",p:.95,r:1,c:"#ffc9a0",hat:"helmet",role:"Legion Engineering Corps"},
  reaper:{n:"Reaper",fac:"legion",acc:"ru",g:"m",p:.74,r:.88,c:"#ff6a55",hat:"helmet",role:"Legion Special Operations"},
  voice:{n:"The Voice",fac:"syndicate",acc:"rp",g:"m",p:.8,r:.86,c:"#d59cff",hat:"hood",role:"The Hive"},
  senna:{n:"Adept Senna",fac:"syndicate",acc:"rp",g:"f",p:1.1,r:.96,c:"#e6c2ff",hat:"hood",role:"Syndicate Adept"},
  phantom:{n:"Phantom",fac:"syndicate",acc:"za",g:"f",p:.9,r:.95,c:"#c79bff",hat:"hair",role:"Syndicate Infiltrator"}
};
const castOf=w=>CAST[w]||{n:w,fac:"vanguard",acc:"us",g:"m",p:1,r:1,c:"#cfe0f5"};

// Shorthands for mission data.
const say=(w,t)=>["say",w,t];
const B_FULL=["power","refinery","barracks","factory","power"];

const CAMPAIGNS={
// =============================================================================
vanguard:{title:"Operation Clean Slate",tag:"Take back the lands lost to the Legion — and face what Project Starfall let loose.",missions:[
{name:"Old Ground",map:"dust",loc:"Dustbowl Flats",spawn:0,
 brief:[["reyes","Commander, this is where we start. Our advance team found an old Vanguard outpost in the Dustbowl, abandoned when the Legion swept through twelve years ago."],["hale","Half of it is rubble, ma'am. But the Training Hall, a Solar Array and an Ore Processor are still standing. There's no Command Spire, so we can't build anything new."],["reyes","Then we use what is there. Send your Technicians to capture the old buildings, get the Training Hall producing Riflemen, and push the Legion scouts out of this valley."],["hale","Riflemen for their infantry, Lancers for anything with armour or wings. Technicians don't fight — keep them back until they have a building to take."]],
 foes:[{fac:"legion",diff:"easy",spawn:3,base:["power","barracks","def1"]}],
 start:{credits:2500,noMcv:1,units:[["base",5],["anti",4],["engineer",4]],ruins:[["barracks",.45],["power",.35],["refinery",.4]]},
 obj:[{id:"bar",t:"own",key:"barracks",text:"Capture the old Training Hall with a Technician"},{id:"pow",t:"own",key:"power",text:"Capture the Solar Array to restore power"},{coach:["#tabs .tab[data-t=inf]:not(.on)","#cards .card"],id:"train",t:"train",n:6,hide:1,text:"Train 6 infantry at the Training Hall"},{id:"kill",t:"elim",hide:1,text:"Drive the Legion out of the valley"},
      {id:"ref",t:"own",key:"refinery",sec:1,text:"Capture the Ore Processor for income"},{id:"loss",t:"lossMax",n:12,sec:1,text:"Lose no more than 12 units"}],
 ev:[{at:4,do:[say("hale","Technicians carry the tool kits. Select one, then tap a building to capture it. A Technician sent into your own building repairs it."),["pingRuin","barracks"]]},
     {done:"bar",do:[say("reyes","The Training Hall is ours. Select it and train Riflemen. Credits are tight, so spend them well."),["show","train"],["hint","Select the Training Hall, then tap a unit card to train it"]]},
     {done:"pow",do:[say("hale","Lights are back on. The Training Hall runs at full speed now.")]},
     {done:"ref",do:[say("hale","The old harvester still turns over! Ore is flowing again."),["miner"]]},
     {done:"train",do:[say("reyes","That is a fighting force. The Legion scouts are dug in to the south-east. Clear them out."),["show","kill"],["ping",84,64]]},
     {at:210,do:[say("hale","Legion scouts coming up the road!"),["wave",0,[["base",3]]]]},
     {at:400,do:[say("draganov","Vanguard, digging through old ruins? How fitting. Go home.")]},
     {every:240,from:480,until:1500,do:[["wave",0,[["base",2],["anti",1]],{grow:.5}]]}],
 win:[["reyes","Good work, Commander. We have a foothold. Next time we come with a Command Spire."]],
 lose:[["reyes","We lost the outpost. Regroup and try again."]]},
{name:"The Divide",map:"divide",unlock:["hale","Good news, Commander. Engineering has a Command Spire for you. Solar Arrays, Ore Processors, a Training Hall and Auto Turrets. No armour yet."],loc:"Kessel River",spawn:0,
 brief:[["reyes","The Legion fell back across the Kessel River and dug in on the east bank."],["reyes","There is a high bridge between the central bluffs. Whoever holds the east bluff controls the crossing."],["hale","Their Foundry in the north-east is feeding tanks straight onto that bridge. Take the bluff, then take the factory."]],
 foes:[{fac:"legion",diff:"easy",spawn:3,base:["power","barracks","factory","def1","def1"]}],start:{credits:7000},
 obj:[{id:"bluff",t:"hold",x:54,y:35,r:4,time:45,text:"Secure the east bluff at the high bridge"},{id:"fac",t:"destroy",keys:["factory"],text:"Destroy the Legion Factory"},
      {id:"town",t:"capture",n:2,sec:1,text:"Hold 2 town buildings"},{id:"loss",t:"lossMax",n:25,sec:1,text:"Lose no more than 25 units"}],
 ev:[{at:5,do:[say("hale","The bridge deck is the fast way across. The road bridges north and south are slower, but they'll be watching the deck."),["ping",45,35]]},
     {at:200,do:[say("hale","Maulers rolling across the north bridge!"),["wave",0,[["main",2],["base",2]],{from:[60,18]}]]},
     {done:"bluff",do:[say("reyes","The bluff is ours. Artillery on that deck and push for the factory."),["reinf",[["main",3],["anti",2]],[8,4],[36,36]],["credits",2000]]},
     {at:420,do:[say("draganov","You cross my river, Colonel? Then you will swim back.")]},
     {every:180,from:360,until:1800,do:[["wave",0,[["main",1],["base",3],["anti",1]],{grow:.6,to:[54,35]}]]}],
 win:[["hale","Factory's burning, ma'am. The east bank is ours."],["reyes","Good. Keep the bridge — we will need it."]],
 lose:[["reyes","The river holds them — for now. Try again, Commander."]]},

{name:"High Ground",map:"high",unlock:["reyes","The Assembly Bay plans have been cleared. You can field Warden tanks and Skirmishers now."],loc:"Carrow Highlands",spawn:2,
 brief:[["reyes","The Legion is using an EMP tower on the north mesa to blind our satellites over the Highlands."],["reyes","Take it. With that tower we see everything they do."],["hale","Two Legion bases up north. The highway runs under the overpass — watch the deck above your head."]],
 foes:[{fac:"legion",diff:"normal",spawn:1,base:["power","barracks"]},{fac:"legion",diff:"easy",spawn:0}],start:{credits:7000},
 obj:[{id:"emp",t:"own",key:"empTower",text:"Capture the EMP tower on the north mesa (Technician)"},{id:"cy",t:"destroy",keys:["conyard"],text:"Destroy both Legion headquarters"},
      {id:"deck",t:"hold",x:45,y:35,r:3,time:60,sec:1,text:"Hold the overpass for 60 seconds"},{id:"cy0",t:"protect",key:"conyard",sec:1,text:"Keep your Headquarters standing"}],
 ev:[{at:6,do:[say("hale","Ramps up to the mesa are on the west and east ends. Bring an Engineer."),["ping",52,11]]},
     {at:260,do:[say("draganov","You climb, Vanguard, but hills do not stop artillery.")]},
     {every:190,from:240,until:1900,do:[["wave",0,[["main",2],["base",2]],{grow:.6}]]},
     {every:260,from:400,until:1900,do:[["wave",1,[["base",4],["anti",1]],{grow:.5}]]},
     {done:"emp",do:[say("reyes","Tower is ours. Their bases just lit up on every screen we have."),["reveal",84,8,14,40],["reveal",8,8,14,40]]},
     {done:"deck",do:[say("hale","Deck secured. Anything crossing the valley goes under our guns now.")]}],
 win:[["reyes","The Highlands are ours. Draganov is running out of places to hide."]],
 lose:[["reyes","We lost the high ground. Pull back and try again."]]},

{name:"Ghost Protocol",map:"line",loc:"Firing Line",spawn:2,hero:1,fpsOnly:1,stealth:1,
 brief:[["reyes","The Legion is growing Syndicate tissue in a lab behind the Firing Line. If that research works, they will breed a hive of their own."],["ghost","One of me, a lot of them. Just how I like it."],["reyes","You go in alone and unseen. Reach our relay on the north bluff and Hale will EMP their defences. Blow the Power Plant, then the Fortress HQ. Get inside a building and press B to set a charge."]],
 foes:[{fac:"legion",diff:"normal",spawn:1,base:["power","barracks","lab","def1","def1","def2"]}],start:{},
 alarm:[["draganov","An intruder in my base? Sound the alarm! Find her!"]],
 obj:[{id:"relay",t:"reach",x:38,y:26,r:3,text:"Reach the relay on the north bluff"},{id:"pow",t:"destroy",tag:"pp",text:"Destroy the Power Plant"},{id:"cy",t:"destroy",keys:["conyard"],hide:1,text:"Destroy the Headquarters"},
      {id:"quiet",t:"stealth",text:"Stay undetected"},{id:"lab",t:"destroy",keys:["lab"],sec:1,text:"Destroy the Tech Centre"},{id:"fast",t:"timeMax",time:900,sec:1,text:"Finish within 15 minutes"}],
 ev:[{at:3,do:[say("ghost","On the ground. Lovely night for it."),["ping",38,26],["hint","Cross the high bridge to the north bluff — enemies cannot see you unless they get close"]]},
     {near:[38,34,3],do:[say("ghost","Crossing the high bridge. They never look up.")]},
     {done:"relay",do:[["emp",0],say("hale","Relay's live — EMP away! Their guns are dark. Move, Ghost!")]},
     {done:"pow",do:[["show","cy"],say("reyes","Power is down. Their defences are dead for good. Now the Headquarters.")]},
     {done:"lab",do:[say("ghost","Tech Centre's gone. Colonel — they had Syndicate tissue on ice in there. Grown from our DNA.")]}],
 win:[["reyes","Get out of there, Ghost. And not a word about those samples to anyone."]],
 lose:[["reyes","Ghost is down. Abort, abort."]]},

{name:"Convoy",map:"harbor",unlock:["reyes","And the Paladin walker program is live. With a Research Spire you get air power, elite troops and Paladins."],loc:"Port Merrow",spawn:0,
 brief:[["reyes","Three Mobile HQs are waiting on the west bank of Port Merrow. We need them on the east bluff to open a second front."],["hale","The only way across for something that size is the high bridge between the bluffs. Legion guns cover the far end."],["reyes","The convoy moves in ninety seconds. Clear the deck — at least two must make it."]],
 foes:[{fac:"legion",diff:"normal",spawn:3,base:["power","barracks","def1"]},{fac:"legion",diff:"easy",spawn:2}],
 start:{credits:6000,base:["power","refinery","barracks","factory","lab"],convoy:{key:"mhq",n:3,tag:"convoy",at:[20,35]}},
 obj:[{id:"esc",t:"escort",tag:"convoy",x:59,y:35,r:4,need:2,text:"Escort at least 2 Mobile HQs to the east bluff"},{id:"hold",t:"hold",x:59,y:35,r:5,time:90,hide:1,text:"Hold the east bluff for 90 seconds"},
      {id:"loss",t:"lossMax",n:20,sec:1,text:"Lose no more than 20 units"},{id:"town",t:"capture",n:2,sec:1,text:"Hold 2 town buildings"}],
 ev:[{at:5,do:[["ping",45,35],say("hale","Convoy is staged by the west bluff ramp. Get some armour up on that deck.")]},
     {at:40,do:[say("hale","The first Paladin walker just came off the line. She's yours, Commander."),["reinf",[["titan_vanguard",1]],[0,20],[12,18]]]},
     {at:60,do:[say("hale","Thirty seconds to move out.")]},
     {at:90,do:[["go","convoy",59,35],say("reyes","Convoy is rolling. Keep them alive.")]},
     {at:130,do:[say("draganov","Such big, slow targets. My gunners thank you."),["wave",0,[["main",2],["anti",2]],{to:[50,35]}]]},
     {every:150,from:250,until:1500,do:[["wave",0,[["main",1],["base",3]],{grow:.5,to:[55,35]}]]},
     {done:"esc",do:[say("reyes","They made it. Now hold that bluff until they are dug in."),["show","hold"],["credits",3000],["wave",1,[["main",2],["base",4]],{to:[59,35]}]]},
     {done:"hold",do:[say("hale","Bluff's locked down. We have a foothold on the east bank.")]}],
 win:[["reyes","A second front. Draganov will have to split his army now."]],
 lose:[["reyes","The convoy is lost. We cannot open the east bank without it."]]},

{name:"Hold the Line",map:"ring",unlock:["hale","Naval yard plans came through too, ma'am. Full arsenal, bar one."],loc:"Iron Ring Crater",spawn:0,
 brief:[["reyes","The research data Ghost recovered is in our Tech Centre on the Iron Ring. Draganov will do anything to destroy it."],["hale","Two Legion armies converging, ma'am. Brutal-grade. They'll hit us from every ramp."],["reyes","Twelve minutes until the analysis is done and the data is out. Hold."]],
 foes:[{fac:"legion",diff:"hard",spawn:3},{fac:"legion",diff:"normal",spawn:1}],
 start:{credits:8000,base:["power","refinery","barracks","factory","lab","power","def1","def1","def2"],units:[["main",4],["anti",3]]},
 obj:[{id:"surv",t:"survive",time:720,text:"Survive until the data is transmitted"},{id:"lab",t:"protect",key:"lab",text:"Protect the Tech Centre"},
      {id:"kills",t:"kills",n:60,sec:1,text:"Destroy 60 enemy units"},{id:"loss",t:"lossMax",n:30,sec:1,text:"Lose no more than 30 units"}],
 ev:[{at:5,do:[say("hale","Defences are up. Put more on the ramps — they come in through the crater.")]},
     {every:100,from:70,until:700,do:[["wave",0,[["main",2],["base",3]],{grow:.8}]]},
     {every:130,from:160,until:700,do:[["wave",1,[["main",1],["base",3],["anti",1]],{grow:.6}]]},
     {at:360,do:[say("draganov","Twelve minutes, Colonel? Your ring will not last six.")]},
     {at:540,do:[say("reyes","Three minutes. Hold together.")]},
     {at:600,do:[say("hale","Reinforcements inbound from the north!"),["reinf",[["elite",3],["main",3]],[45,1],[45,20]]]}],
 win:[["reyes","Transmission complete."],["reyes","Commander... the Legion was not doing this on their own. Someone was giving them orders."]],
 lose:[["reyes","The data is gone. Everything Ghost risked — gone."]]},

{name:"The Hive Below",map:"lakes",unlock:["reyes","High Command has authorised the Photon Lance. If you can build it, use it."],film:"vanguard_reveal",loc:"Broken Lakes",spawn:0,
 brief:[["reyes","Draganov's last stronghold is across the Broken Lakes. End it."],["hale","Ma'am, the analysts flagged strange transmissions from the south-east. Not Legion codes."],["reyes","Noted. Deal with the Legion first."]],
 foes:[{fac:"legion",diff:"hard",spawn:1,base:["power","barracks"]},{fac:"syndicate",diff:"normal",spawn:3,team:3,base:["power","lab","barracks"]}],start:{credits:9000},
 obj:[{id:"leg",t:"destroy",keys:["conyard"],slot:0,text:"Destroy the Legion Fortress HQ"},{id:"hive",t:"destroy",keys:["lab"],slot:1,hide:1,text:"Destroy the Syndicate Psychic Beacon"},
      {id:"emp",t:"own",key:"empTower",sec:1,text:"Capture the EMP tower on the north plateau"},{id:"sw",t:"build",key:"super",n:1,sec:1,text:"Build the Photon Lance"}],
 ev:[{at:6,do:[say("hale","Bridges on both channels. The plateau to the north overlooks the centre.")]},
     {at:200,do:[say("hale","Ma'am... Legion units are firing on each other. Something is in their heads.")]},
     {at:300,do:[say("voice","Vanguard. Legion. So much noise over such small things."),say("voice","I have been listening to you both since the night you pulled me from the ice."),["show","hive"],["reveal",84,64,12,20]]},
     {at:318,do:[say("reyes","Starfall's ghost. So that is who has been pulling Draganov's strings. Find that beacon and burn it.")]},
     {every:170,from:260,until:1800,do:[["wave",0,[["main",2],["base",2]],{grow:.5}]]},
     {every:210,from:360,until:1800,do:[["wave",1,[["main",2],["base",3]],{grow:.5}]]},
     {done:"leg",do:[say("draganov","Colonel... we were fools. They were in our heads the whole time."),say("reyes","Then help me end it, Marshal.")]}],
 win:[["voice","You broke one voice. There are many more."],["reyes","Then we will find every one of them."]],
 lose:[["reyes","We are pulling back. Whatever is out there, we are not ready."]]},

{name:"Clean Slate",map:"grand",loc:"Grand Crossing",spawn:0,
 brief:[["reyes","This is it. The Syndicate has taken the Grand Crossing and what is left of the Legion's hardliners have joined them."],["hale","My battlegroup is in the south-west. We hit them together."],["reyes","No half measures, Commander. Wipe the slate clean."]],
 foes:[{fac:"legion",diff:"hard",spawn:1,team:2},{fac:"syndicate",diff:"hard",spawn:3,team:2,base:["power","barracks"]},{fac:"vanguard",diff:"normal",spawn:2,ally:1}],start:{credits:10000},
 obj:[{id:"all",t:"elim",text:"Destroy every enemy base"},{id:"cap",t:"capture",n:3,sec:1,text:"Hold 3 town buildings"},{id:"loss",t:"lossMax",n:60,sec:1,text:"Lose no more than 60 units"}],
 ev:[{at:6,do:[say("hale","Hill forts on each corner, overpasses linking them. Take the forts and the river is ours.")]},
     {at:300,do:[say("voice","You think you are liberating this land? You made us, Colonel. We are only finishing your experiment.")]},
     {at:480,do:[say("draganov","Reyes. For what it is worth — I am sorry. Finish them.")]},
     {every:200,from:300,until:2400,do:[["wave",1,[["main",2],["base",3]],{grow:.6}]]}],
 win:[["reyes","It is over. The Frontier is free."],["hale","For now, ma'am."],["reyes","For now is all anyone ever gets, Lieutenant."]],
 lose:[["reyes","We have lost the Crossing. The Frontier belongs to them."]]}
]},
// =============================================================================
legion:{title:"Iron Reclamation",tag:"Hold the Frontier for the Legion — and burn out the hive the West let loose.",missions:[
{name:"Iron Dawn",map:"frost",loc:"Frozen Pass",spawn:2,
 brief:[["draganov","Comrade Commander. When we pulled back from the Frozen Pass, we left a depot behind. The Vanguard never found it."],["bogdan","Half the roof is gone and the snow got into everything, but the Muster Bunker, a Thermal Plant and the Smelting Works are still standing. No Fortress HQ, so you build nothing new."],["volkova","Your Technicians will take the depot back. Train Militia, then drive the Vanguard patrols out of the pass."],["bogdan","Militia for their riflemen, Bombardiers for tanks and aircraft. The Technicians carry tools, not rifles — keep them out of the shooting."]],
 foes:[{fac:"vanguard",diff:"easy",spawn:1,base:["power","barracks","def1"]}],
 start:{credits:2500,noMcv:1,units:[["base",5],["anti",4],["engineer",4]],ruins:[["barracks",.45],["power",.35],["refinery",.4]]},
 obj:[{id:"bar",t:"own",key:"barracks",text:"Capture the old Muster Bunker with a Technician"},{id:"pow",t:"own",key:"power",text:"Capture the Thermal Plant to restore power"},{id:"train",t:"train",n:6,hide:1,text:"Train 6 infantry at the Muster Bunker"},{id:"kill",t:"elim",hide:1,text:"Drive the Vanguard out of the pass"},
      {id:"ref",t:"own",key:"refinery",sec:1,text:"Capture the Smelting Works for income"},{id:"loss",t:"lossMax",n:12,sec:1,text:"Lose no more than 12 units"}],
 ev:[{at:4,do:[say("bogdan","Technicians are the lads with the tool bags. Pick one, point him at a building, and it's ours. Send one into our own building and he'll patch it up."),["pingRuin","barracks"]]},
     {done:"bar",do:[say("volkova","The bunker is ours. Train Militia. Every ruble counts, Commander."),["show","train"],["hint","Select the Muster Bunker, then tap a unit card to train it"]]},
     {done:"pow",do:[say("bogdan","Power's back. Kicked the generator twice, but she's running.")]},
     {done:"ref",do:[say("bogdan","Found an old ore hauler under the snow. Still runs!"),["miner"]]},
     {done:"train",do:[say("volkova","Enough. The Vanguard patrol base is to the north-east. Crush it."),["show","kill"],["ping",84,8]]},
     {at:210,do:[say("reyes","Legion movement in the pass. Push them back."),["wave",0,[["base",3]]]]},
     {every:240,from:480,until:1500,do:[["wave",0,[["base",2],["anti",1]],{grow:.5}]]}],
 win:[["draganov","The pass is ours again. Now we build properly."]],
 lose:[["volkova","The depot is lost. Unacceptable."]]},
{name:"Rail Yard",map:"basin",unlock:["bogdan","I got an old Fortress HQ running. Thermal Plants, Smelting Works, a Muster Bunker and Gun Bunkers. Tanks come later."],loc:"Iron Basin",spawn:0,
 brief:[["bogdan","The old rail yard towns in the basin still have working freight depots. Worth more than the ore."],["volkova","The Vanguard have a garrison in the south-east. Their Barracks trains the militia that guards the towns."],["draganov","Take both towns. Burn the Barracks. Quickly."]],
 foes:[{fac:"vanguard",diff:"easy",spawn:3,base:["power","barracks","def1"]}],start:{credits:7000},
 obj:[{id:"towns",t:"capture",n:2,text:"Hold 2 town buildings"},{id:"bar",t:"destroy",keys:["barracks"],text:"Destroy the Vanguard Barracks"},
      {id:"oil",t:"own",key:"oilDerek",sec:1,text:"Capture the oil derrick"},{id:"loss",t:"lossMax",n:20,sec:1,text:"Lose no more than 20 units"}],
 ev:[{at:5,do:[say("bogdan","Towns are east and west on the ring road. Militia can garrison them.")]},
     {done:"towns",do:[say("bogdan","Depots are ours. Freight credits coming through."),["credits",2500]]},
     {at:240,do:[say("hale","Legion in the basin. Hit their ring road."),["wave",0,[["main",2],["base",2]]]]},
     {every:200,from:440,until:1600,do:[["wave",0,[["main",1],["base",3]],{grow:.5}]]}],
 win:[["volkova","Efficient. The Marshal has noticed you."]],
 lose:[["draganov","The basin is lost. Unacceptable."]]},

{name:"Siege of the Ring",map:"ring",unlock:["bogdan","The Foundry is back on line. Mauler tanks and Ravagers are yours."],loc:"Iron Ring Crater",spawn:2,
 brief:[["draganov","The Vanguard hold the Iron Ring. Its crater is the richest ground on the Frontier."],["volkova","Take the crater floor. Then break their fortress in the north-east."],["bogdan","Two overpasses cross the crater. Hold one and you can shoot down on anything that moves."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:1,base:["power","barracks","def1","def1","def2"]}],start:{credits:8000},
 obj:[{id:"crat",t:"hold",x:45,y:35,r:5,time:90,text:"Hold the crater floor for 90 seconds"},{id:"cy",t:"destroy",keys:["conyard"],text:"Destroy the Vanguard Headquarters"},
      {id:"emp",t:"own",key:"empTower",sec:1,text:"Capture the EMP tower on the rim"},{id:"kills",t:"kills",n:40,sec:1,text:"Destroy 40 enemy units"}],
 ev:[{at:5,do:[["ping",45,35],say("volkova","Ramps into the crater on every side. Choose.")]},
     {at:260,do:[say("reyes","The Ring is ours, Legion. Come and take it — if you can."),["wave",0,[["main",2],["anti",2]]]]},
     {every:180,from:460,until:2000,do:[["wave",0,[["main",2],["base",2]],{grow:.6}]]},
     {done:"crat",do:[say("draganov","The crater is ours. Now crush them."),["reinf",[["main",3],["elite",1]],[0,64],[20,52]]]}],
 win:[["draganov","The Ring is Legion again."],["draganov","And yet... I dream of voices, Commissar. Every night."]],
 lose:[["volkova","The Ring holds. For now."]]},

{name:"Reaper's Harvest",map:"high",loc:"Carrow Highlands",spawn:2,hero:1,fpsOnly:1,stealth:1,
 brief:[["draganov","The Vanguard have dug in on the north mesa of the Highlands. Their bombers are killing our columns."],["reaper","Send me."],["draganov","Alone and unseen, Reaper. Reach the EMP Spire on the mesa — Bogdan has rigged it to blind their guns. Then the Power Plant, then the Headquarters. Set charges from inside with B."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:1,base:["power","airfield","barracks","def1","def1","def2"]}],start:{},
 alarm:[["reyes","Legion commando in the base! All units, find him!"]],
 obj:[{id:"relay",t:"reach",x:52,y:11,r:3,text:"Reach the EMP Spire on the north mesa"},{id:"pow",t:"destroy",tag:"pp",text:"Destroy the Power Plant"},{id:"cy",t:"destroy",keys:["conyard"],hide:1,text:"Destroy the Headquarters"},
      {id:"quiet",t:"stealth",text:"Stay undetected"},{id:"air",t:"destroy",keys:["airfield"],sec:1,text:"Destroy the Airfield"},{id:"fast",t:"timeMax",time:900,sec:1,text:"Finish within 15 minutes"}],
 ev:[{at:3,do:[say("reaper","Walking."),["ping",52,11],["hint","Climb the west ramp onto the north mesa — stay away from patrols"]]},
     {near:[45,35,3],do:[say("reaper","Under their bridge. Quiet here.")]},
     {done:"relay",do:[["emp",0],say("bogdan","Spire's firing! Their guns are blind — go, go!")]},
     {done:"pow",do:[["show","cy"],say("draganov","Their lights are out. Finish it.")]},
     {at:300,do:[say("voice","Reaper. Why do you serve a man who hears voices?"),say("reaper","...Who is this?")]}],
 win:[["reaper","Done. Marshal — someone spoke to me on a dead channel."],["draganov","...I know. They speak to me too."]],
 lose:[["draganov","Reaper is silent. No..."]]},

{name:"Bridgehead",map:"divide",unlock:["draganov","And the Juggernaut is ready, Commander. Build a War Institute and it will walk for you, along with our aircraft."],loc:"Kessel River",spawn:1,
 brief:[["volkova","The Vanguard hold the Kessel River line. The high bridge between the bluffs is the key."],["bogdan","Get tanks over that deck and hold the far bluff. I'll need two minutes to lay a pontoon behind you."],["volkova","Then destroy the base in the south-east. It supplies the whole line."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:2,base:["power","barracks","factory","def1"]},{fac:"vanguard",diff:"normal",spawn:3}],start:{credits:8000},
 obj:[{id:"bluff",t:"hold",x:54,y:35,r:4,time:120,text:"Hold the east bluff at the high bridge"},{id:"se",t:"destroy",keys:["conyard"],slot:0,hide:1,text:"Destroy the south-east Vanguard base"},
      {id:"town",t:"capture",n:2,sec:1,text:"Hold 2 town buildings"},{id:"loss",t:"lossMax",n:40,sec:1,text:"Lose no more than 40 units"}],
 ev:[{at:5,do:[["ping",54,35],say("bogdan","Deck's rated for Maulers. I checked. Twice.")]},
     {at:40,do:[say("bogdan","The Juggernaut is on the field, Commander. Try to bring it back in one piece."),["reinf",[["titan_legion",1]],[0,64],[10,58]]]},
     {every:150,from:180,until:2000,do:[["wave",0,[["main",2],["base",2]],{grow:.5,to:[54,35]}]]},
     {every:220,from:300,until:2000,do:[["wave",1,[["base",4]],{grow:.5}]]},
     {done:"bluff",do:[say("bogdan","Pontoon's down. Bridgehead secured."),["show","se"],["credits",2500],["reinf",[["main",4]],[0,70],[36,36]]]},
     {at:600,do:[say("voice","Commissar Volkova. Your Marshal no longer trusts you. Did you know?"),say("volkova","Get out of my radio.")]}],
 win:[["volkova","The river line is broken."],["volkova","Commander. Something is wrong with the Marshal. Watch him."]],
 lose:[["bogdan","Pontoon's gone. So's the bridgehead."]]},


{name:"Scorched Earth",map:"dust",loc:"Dustbowl Flats",spawn:0,noBuild:1,
 brief:[["volkova","The Vanguard are rebuilding in the Dustbowl. No time for a base — you have a strike group."],["bogdan","I've bolted on extra armour, a couple of Bombards, and you get the Juggernaut. Don't scratch it."],["volkova","Destroy their Refinery and Factory. Leave nothing they can use."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:3,base:["power","refinery","factory","def1"]}],start:{units:[["titan_legion",1],["main",2],["bombard",2],["base",3]]},
 obj:[{id:"ref",t:"destroy",keys:["refinery"],text:"Destroy the Vanguard Refinery"},{id:"fac",t:"destroy",keys:["factory"],text:"Destroy the Vanguard Factory"},
      {id:"loss",t:"lossMax",n:6,sec:1,text:"Lose no more than 6 units"},{id:"fast",t:"timeMax",time:600,sec:1,text:"Finish within 10 minutes"}],
 ev:[{at:4,do:[say("volkova","Use the mesas. Bombards on high ground outrange their towers.")]},
     {at:170,do:[say("bogdan","Found a few more tanks down the back of the depot. Sending them."),["reinf",[["main",3]],[0,4],[10,12]]]},
     {at:320,do:[say("hale","Legion raiders in the Dustbowl!"),["wave",0,[["main",2],["anti",2]],{to:"army"}]]},
     {done:"ref",do:[say("volkova","Their refinery burns. Good.")]}],
 win:[["volkova","Nothing left standing. The Marshal will be pleased."]],
 lose:[["volkova","The strike group is gone. Wasteful."]]},
{name:"Red Tide",map:"bastion",unlock:["draganov","The Missile Silo is yours to build. Use it."],film:"legion_reveal",loc:"The Bastion",spawn:5,
 brief:[["volkova","It is the Syndicate. They have been in the Marshal's head for months. And they have a Psychic Hive on the Bastion."],["draganov","...I am still in command, Commissar."],["volkova","Then command us to burn it. Destroy the Hive, then break the Vanguard fort that shelters it."]],
 foes:[{fac:"syndicate",diff:"hard",spawn:3,team:3,base:["power","lab","barracks"]},{fac:"vanguard",diff:"normal",spawn:1,base:["power","barracks"]}],start:{credits:10000},
 obj:[{id:"hive",t:"destroy",keys:["lab"],slot:0,text:"Destroy the Syndicate Psychic Hive (south fort)"},{id:"fort",t:"destroy",keys:["conyard"],slot:1,text:"Destroy the Vanguard fort (north-east)"},
      {id:"sw",t:"build",key:"super",n:1,sec:1,text:"Build the Missile Silo"},{id:"loss",t:"lossMax",n:50,sec:1,text:"Lose no more than 50 units"}],
 ev:[{at:5,do:[say("bogdan","Every fort has one gate ramp. Hit the gate, not the cliff.")]},
     {every:190,from:220,until:2400,do:[["wave",0,[["main",2],["base",3]],{grow:.5}]]},
     {every:230,from:330,until:2400,do:[["wave",1,[["main",2],["base",2]],{grow:.5}]]},
     {at:420,do:[say("voice","Marshal. Turn your guns on the Commissar. You know you want to.")]},
     {at:440,do:[say("draganov","...No. Not again. Commander, burn that Hive!")]},
     {done:"hive",do:[say("draganov","It is quiet. For the first time in months — quiet."),["credits",3000]]}],
 win:[["draganov","The voices are gone. Now we finish this."]],
 lose:[["volkova","The Hive still sings. We have failed him."]]},

{name:"Iron Fist",map:"grand",loc:"Grand Crossing",spawn:2,
 brief:[["draganov","The Syndicate have taken the Grand Crossing, and the Vanguard are marching on it too."],["volkova","My division holds the north-west. We strike together."],["draganov","Everything we have, Commander. Everything."]],
 foes:[{fac:"vanguard",diff:"hard",spawn:1,team:2},{fac:"syndicate",diff:"hard",spawn:3,team:3,base:["power","barracks"]},{fac:"legion",diff:"normal",spawn:0,ally:1}],start:{credits:10000},
 obj:[{id:"all",t:"elim",text:"Destroy every enemy base"},{id:"cap",t:"capture",n:3,sec:1,text:"Hold 3 town buildings"},{id:"kills",t:"kills",n:100,sec:1,text:"Destroy 100 enemy units"}],
 ev:[{at:6,do:[say("volkova","Hill forts on every corner. Take ours first and use the overpass.")]},
     {at:320,do:[say("reyes","Draganov! We are fighting the same enemy!"),say("draganov","Then stay out of my way, Colonel.")]},
     {at:520,do:[say("voice","Marshal... come home.")]},
     {at:540,do:[say("draganov","I have a home. It is called the Legion.")]},
     {every:210,from:300,until:2400,do:[["wave",1,[["main",2],["base",3]],{grow:.6}]]}],
 win:[["draganov","The Frontier is ours. All of it."],["volkova","And your mind is your own, Marshal."],["draganov","...Yes. For the first time in a long time."]],
 lose:[["draganov","Everything... lost."]]}
]},
// =============================================================================
syndicate:{title:"The Harvest",tag:"Born of a fallen star and stolen Vanguard blood. Wake, gather, and bring every mind into the Hive.",missions:[
{name:"Awakening",map:"lakes",loc:"Broken Lakes",spawn:0,
 brief:[["voice","Wake, Adept. A year free of their cage, and we have so little. But there is a Vanguard outpost by the lakes. Its builders fled long ago."],["senna","I feel it, Master. A barracks, a power plant, a refinery. Broken, but alive. We cannot grow a Hive Core here yet."],["voice","Then take what they left. Our Technicians will claim it. Raise Acolytes, and silence the Vanguard camp across the water."],["senna","Acolytes for their soldiers, Piercers for their machines and their aircraft. The Technicians are for claiming, not for fighting."]],
 foes:[{fac:"vanguard",diff:"easy",spawn:3,base:["power","barracks","def1"]}],
 start:{credits:2500,noMcv:1,units:[["base",5],["anti",4],["engineer",4]],ruins:[["barracks",.45],["power",.35],["refinery",.4]]},
 obj:[{id:"bar",t:"own",key:"barracks",text:"Claim the old barracks with a Technician"},{id:"pow",t:"own",key:"power",text:"Claim the power plant"},{id:"train",t:"train",n:6,hide:1,text:"Raise 6 infantry at the barracks"},{id:"kill",t:"elim",hide:1,text:"Silence the Vanguard camp"},
      {id:"ref",t:"own",key:"refinery",sec:1,text:"Claim the refinery for income"},{id:"loss",t:"lossMax",n:12,sec:1,text:"Lose no more than 12 units"}],
 ev:[{at:4,do:[say("senna","Our Technicians can bend their machines to us. Choose one, then touch a building to claim it."),["pingRuin","barracks"]]},
     {done:"bar",do:[say("voice","It is ours. Raise Acolytes from it. We must be frugal for now."),["show","train"],["hint","Select the barracks, then tap a unit card to train it"]]},
     {done:"pow",do:[say("senna","The current flows again. I can feel it humming.")]},
     {done:"ref",do:[say("senna","Their old harvester answers to us now."),["miner"]]},
     {done:"train",do:[say("voice","Enough. The Vanguard camp lies across the lakes to the south-east. Quiet it."),["show","kill"],["ping",84,64]]},
     {at:210,do:[say("senna","Their soldiers have seen us by the lakes. They are coming."),["wave",0,[["base",3]]]]},
     {every:240,from:480,until:1500,do:[["wave",0,[["base",2],["anti",1]],{grow:.5}]]}],
 win:[["voice","Quiet at last. Listen, Adept. Can you hear how much more there is?"]],
 lose:[["voice","Sleep, then. We will wake you again."]]},
{name:"Whispers",map:"divide",unlock:["senna","Our Hive Core can grow now, Master. Bio Reactors, Digesters, a Spawning Pit and Spitter Nests."],loc:"Kessel River",spawn:0,
 brief:[["voice","Legion and Vanguard fight over the Kessel River. Let them."],["senna","The river towns are unguarded while they fight. We take the people. Then the Legion base."],["voice","Every mind we gather makes the next one easier."]],
 foes:[{fac:"legion",diff:"easy",spawn:3,team:2,base:["power","barracks"]},{fac:"vanguard",diff:"easy",spawn:2,team:3}],start:{credits:7000},
 obj:[{id:"town",t:"capture",n:3,text:"Hold 3 town buildings"},{id:"leg",t:"destroy",keys:["conyard"],slot:0,text:"Destroy the Legion Fortress HQ"},
      {id:"oil",t:"own",key:"oilDerek",sec:1,text:"Capture the oil derrick"},{id:"loss",t:"lossMax",n:25,sec:1,text:"Lose no more than 25 units"}],
 ev:[{at:5,do:[say("senna","Acolytes can take the houses. The townsfolk will not resist us for long.")]},
     {done:"town",do:[say("voice","Hear them? They sing for us now."),["credits",2500]]},
     {at:250,do:[say("senna","The Marshal's guards are shouting at shadows on the river. He is afraid."),["wave",0,[["main",2],["base",2]]]]},
     {every:190,from:450,until:1800,do:[["wave",0,[["main",1],["base",3]],{grow:.5}]]},
     {at:600,do:[say("voice","Marshal Draganov. You are tired. Let me help you sleep.")]}],
 win:[["senna","The Marshal hears you now, Master."],["voice","He always did. He simply did not know it."]],
 lose:[["voice","The river is too loud today. Again."]]},

{name:"The Long Night",map:"frost",unlock:["voice","The Fabricator is open to you. Fang Tanks and Stingers answer your call."],loc:"Frozen Pass",spawn:2,
 brief:[["senna","Master, the Vanguard and Legion have made a truce. Against us."],["voice","Good. Fear makes them honest. Our Psychic Amplifier in the Frozen Pass must finish its song."],["voice","Ten minutes. Protect the Tech Centre until the night is over."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:1,team:2},{fac:"legion",diff:"normal",spawn:0,team:2}],
 start:{credits:8000,base:["power","refinery","barracks","factory","lab","power","def1","def1"],units:[["main",4],["anti",3]]},
 obj:[{id:"surv",t:"survive",time:600,text:"Survive the long night"},{id:"lab",t:"protect",key:"lab",text:"Protect the Psychic Amplifier (Tech Centre)"},
      {id:"kills",t:"kills",n:50,sec:1,text:"Destroy 50 enemy units"},{id:"loss",t:"lossMax",n:30,sec:1,text:"Lose no more than 30 units"}],
 ev:[{at:5,do:[say("senna","They will come over the ice and across the high bridge.")]},
     {every:110,from:80,until:580,do:[["wave",0,[["main",2],["base",2]],{grow:.7}]]},
     {every:130,from:140,until:580,do:[["wave",1,[["main",1],["base",3]],{grow:.7}]]},
     {at:300,do:[say("senna","Their radios scream one order, Master: burn the Amplifier."),say("voice","Even the Marshal agrees with them now. How touching.")]},
     {at:480,do:[say("voice","Two minutes. Listen — the song is almost finished.")]}],
 win:[["voice","The song is sung. Every radio on the Frontier carries it now."]],
 lose:[["senna","The Amplifier is silent. Forgive me, Master."]]},

{name:"Silent Hand",map:"line",film:"syndicate_reveal",loc:"Firing Line",spawn:2,hero:1,fpsOnly:1,stealth:1,
 brief:[["voice","The Legion is learning to burn us out. Their base behind the Firing Line must go dark."],["phantom","Then I will be the dark."],["voice","A seeded mind in their grid will pulse when you reach the north-east relay. Their Power Plant first, then their headquarters. Unseen, Phantom. Charges from inside with B."]],
 foes:[{fac:"legion",diff:"normal",spawn:1,base:["power","barracks","lab","def1","def1","def2"]}],start:{},
 alarm:[["voice","If they see you, every light in that base comes on. Stay in the dark."]],
 obj:[{id:"relay",t:"reach",x:53,y:26,r:3,text:"Reach the relay on the north-east bluff"},{id:"pow",t:"destroy",tag:"pp",text:"Destroy the Power Plant"},{id:"cy",t:"destroy",keys:["conyard"],hide:1,text:"Destroy the Headquarters"},
      {id:"quiet",t:"stealth",text:"Stay undetected"},{id:"lab",t:"destroy",keys:["lab"],sec:1,text:"Destroy the Tech Centre"},{id:"fast",t:"timeMax",time:900,sec:1,text:"Finish within 15 minutes"}],
 ev:[{at:3,do:[say("phantom","In the shadows. They never feel me."),["ping",53,26],["hint","Cross the east high bridge onto the bluff — keep your distance from patrols"]]},
     {done:"relay",do:[["emp",0],say("voice","The seed has bloomed. Their guns are sleeping. Go.")]},
     {done:"pow",do:[["show","cy"],say("voice","Darkness. Now take their heart.")]},
     {done:"lab",do:[say("voice","Their research is ashes. Their scientists will dream of me tonight.")]}],
 win:[["phantom","Done. Nobody saw a thing."]],
 lose:[["voice","Phantom's mind has gone quiet. A loss."]]},

{name:"Sky Bridge",map:"bastion",unlock:["voice","The Devourer has matured. Grow a Gene Vault and it will hunt for you, with our fliers."],loc:"The Bastion",spawn:4,
 brief:[["senna","The Bastion's southern sky bridge joins our fort to the Vanguard fort in the south-east."],["voice","Hold the bridge and the forts beneath it are ours to take."],["senna","Then break the Vanguard fort itself."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:2,base:["power","barracks","def1"]},{fac:"legion",diff:"normal",spawn:0}],start:{credits:8000},
 obj:[{id:"deck",t:"hold",x:45,y:50,r:3,time:90,text:"Hold the middle of the southern sky bridge"},{id:"fort",t:"destroy",keys:["conyard"],slot:0,text:"Destroy the Vanguard fort (south-east)"},
      {id:"cap",t:"capture",n:2,sec:1,text:"Hold 2 town buildings"},{id:"loss",t:"lossMax",n:30,sec:1,text:"Lose no more than 30 units"}],
 ev:[{at:5,do:[["ping",45,50],say("senna","Up our gate ramp and onto the deck. Ground troops can pass beneath.")]},
     {at:40,do:[say("senna","The first Devourer has hatched. It hungers."),["reinf",[["titan_syndicate",1]],[0,52],[18,50]]]},
     {every:170,from:200,until:2000,do:[["wave",0,[["main",2],["base",2]],{grow:.5,to:[45,50]}]]},
     {every:240,from:320,until:2000,do:[["wave",1,[["main",1],["base",3]],{grow:.5}]]},
     {done:"deck",do:[say("voice","The sky is ours. Now go down and take the fort."),["credits",2500],["reinf",[["elite",2],["main",2]],[0,52],[18,50]]]}],
 win:[["senna","The Bastion kneels, Master."]],
 lose:[["voice","The bridge is lost. Patience."]]},

{name:"Swarm",map:"high",loc:"Carrow Highlands",spawn:2,noBuild:1,
 brief:[["voice","The Vanguard have built a fortress on the Highlands. We have no time to grow a Hive."],["senna","Then we send the swarm. More will hatch as we go."],["voice","Their Refinery and Factory. Devour them."]],
 foes:[{fac:"vanguard",diff:"normal",spawn:1,base:["power","refinery","factory","def1","def1"]}],start:{units:[["titan_syndicate",1],["main",3],["base",4],["anti",2]]},
 obj:[{id:"ref",t:"destroy",keys:["refinery"],text:"Destroy the Vanguard Refinery"},{id:"fac",t:"destroy",keys:["factory"],text:"Destroy the Vanguard Factory"},
      {id:"emp",t:"own",key:"empTower",sec:1,text:"Capture the EMP tower on the north mesa"},{id:"fast",t:"timeMax",time:900,sec:1,text:"Finish within 15 minutes"}],
 ev:[{at:4,do:[say("senna","The swarm is awake. More broods will join us.")]},
     {every:150,from:150,until:900,do:[["reinf",[["main",1],["base",3]],[0,64],[12,58]],say("senna","A new brood has hatched.")]},
     {at:330,do:[say("senna","They have seen the swarm. They are running for the mesa."),["wave",0,[["main",2],["anti",2]],{to:"army"}]]}],
 win:[["voice","Delicious."]],
 lose:[["senna","The swarm is spent."]]},

{name:"Convergence",map:"harbor",unlock:["voice","And the Psychic Amplifier seed is yours. When it has grown, the city will kneel."],loc:"Port Merrow",spawn:1,
 brief:[["voice","Three Overminds wait on the west bank of Port Merrow. Together they can reach every mind in the city."],["senna","They must reach the east bluff. The high bridge is the only way."],["voice","Two will be enough. Move when they are ready."]],
 foes:[{fac:"legion",diff:"hard",spawn:3,team:2,base:["power","barracks","def1"]},{fac:"vanguard",diff:"normal",spawn:2,team:2}],
 start:{credits:6000,base:["power","refinery","barracks","factory"],convoy:{key:"overmind",n:3,tag:"convoy",at:[20,35]}},
 obj:[{id:"esc",t:"escort",tag:"convoy",x:59,y:35,r:4,need:2,text:"Bring at least 2 Overminds to the east bluff"},{id:"hold",t:"hold",x:59,y:35,r:5,time:90,hide:1,text:"Hold the east bluff while they reach out"},
      {id:"loss",t:"lossMax",n:20,sec:1,text:"Lose no more than 20 units"},{id:"sw",t:"build",key:"super",n:1,sec:1,text:"Grow the Psychic Amplifier"}],
 ev:[{at:5,do:[["ping",45,35],say("senna","The Overminds gather by the west bluff.")]},
     {at:90,do:[["go","convoy",59,35],say("voice","Go now. Let the city hear us coming.")]},
     {at:140,do:[say("senna","Their gunners on the harbour have seen us. Hurry."),["wave",0,[["main",2],["anti",2]],{to:[50,35]}]]},
     {every:150,from:260,until:1500,do:[["wave",0,[["main",1],["base",3]],{grow:.5,to:[55,35]}]]},
     {done:"esc",do:[say("voice","They are in place. Now hold."),["show","hold"],["credits",3000],["wave",1,[["main",2],["base",4]],{to:[59,35]}]]}],
 win:[["voice","Port Merrow is listening. All of it."]],
 lose:[["senna","The Overminds are lost."]]},

{name:"Ascendance",map:"ring",loc:"Iron Ring Crater",spawn:0,
 brief:[["voice","This is the last of it, Adept. The Vanguard and Legion have gathered everything they have at the Iron Ring."],["senna","They mean to end us."],["voice","Build the Overmind. Then show them what the end looks like."]],
 foes:[{fac:"vanguard",diff:"hard",spawn:1,team:2},{fac:"legion",diff:"hard",spawn:3,team:2},{fac:"legion",diff:"normal",spawn:2,team:2}],start:{credits:12000},
 obj:[{id:"dom",t:"build",key:"super",n:1,text:"Grow the Psychic Amplifier (superweapon)"},{id:"all",t:"elim",text:"Destroy every enemy base"},
      {id:"mid",t:"hold",x:45,y:35,r:5,time:60,sec:1,text:"Hold the crater floor for 60 seconds"},{id:"kills",t:"kills",n:120,sec:1,text:"Destroy 120 enemy units"}],
 ev:[{at:6,do:[say("senna","The rim is high ground on every side. Ramps down into the crater.")]},
     {at:300,do:[say("senna","The Colonel and the Marshal are thanking each other on an open channel."),say("voice","Let them. It is the last thing they will ever share.")]},
     {done:"dom",do:[say("voice","It is finished. Now — ascend."),["credits",3000]]},
     {every:200,from:300,until:2600,do:[["wave",0,[["main",2],["base",3]],{grow:.6}]]}],
 win:[["voice","Silence. Perfect silence. Every mind on the Frontier, one voice."],["senna","Yours, Master."],["voice","Ours, Adept. Ours."]],
 lose:[["voice","Even the Hive can die. Remember that."]]}
]}};

// ---- technology tiers --------------------------------------------------------------
// Each campaign opens up one tier per mission: 1 infantry only (no construction),
// 2 a Headquarters with power, refineries, barracks and basic defences,
// 3 the Factory and armour, 4 Tech Centre, air power and elite units,
// 5 titan walkers, 6 naval, 7 superweapons, 8 everything.
for(const fac in CAMPAIGNS)CAMPAIGNS[fac].missions.forEach((m,i)=>{m.tier=m.tier||i+1;m.unlock&&!m._u&&(m.brief.push(m.unlock),m._u=1)});
const TIER_BLD={power:2,refinery:2,hive:2,barracks:2,wall:2,gate:2,def1:2,orerig:3,factory:3,silo:3,repair:3,lab:4,airfield:4,aa:4,def2:4,triturret:4,bastion:5,support:5,navalyard:6,super:7};
function unitTier(k){const u=UNITS[k];if(!u)return 9;if(/^titan_/.test(k)||"bastion"===k)return 5;if("sea"===u.tab||"navalyard"===u.from)return 6;if("airfield"===u.from||"skyjack"===k)return 4;if("lab"===u.req)return 4;if("inf"===u.tab)return 1;if("miner"===u.role||"hivetrans"===k||"drone"===k)return 2;return 3}
function techAllowed(k,isBld,abil){const m=S.mission,T=m&&m.tier;if(!T||m.tutorial||m.training)return!0;if(abil)return"super"===k?T>=7:"curtain"===k?T>=5:"spy"===k?T>=4:!0;return(isBld?TIER_BLD[k]||2:unitTier(k))<=T}
function tierNews(fac,t){const b=k=>bname(k,fac),u=k=>uname(k,fac),F=FACTIONS[fac];return{1:"Infantry only. Capture buildings with Technicians; no construction.",2:b("conyard")+": "+b("power")+", "+b("refinery")+", "+b("barracks")+" and "+b("def1")+".",3:b("factory")+": "+u(F.main)+", support vehicles and the "+b("repair")+".",4:b("lab")+", "+b("airfield")+", aircraft, advanced defences and elite infantry.",5:"Titan walker: the "+u("titan_"+("vanguard"===fac?"vanguard":"legion"===fac?"legion":"syndicate"))+", and the "+b("support")+" support structure.",6:"Naval yard and the full conventional arsenal.",7:"Superweapon: the "+b("super")+".",8:"Everything is authorised."}[t]||""}
// ---- difficulty ----------------------------------------------------------------
const CDIFF={easy:{n:"RECRUIT",d:"Weaker enemies, smaller attacks, more credits. Stealth: short sight range, slow to spot you.",shift:-1,wave:.6,cash:1.4,det:80,detT:2.8,emp:100,alarmT:15},
normal:{n:"VETERAN",d:"The intended challenge.",shift:0,wave:1,cash:1,det:120,detT:1.7,emp:65,alarmT:25},
hard:{n:"ELITE",d:"Brutal enemies and bigger attacks. Stealth: being spotted fails the mission.",shift:1,wave:1.45,cash:.8,det:160,detT:1.1,emp:45,alarmT:30}};
function campDiff(){try{const d=localStorage.getItem("ifr_campdiff");return CDIFF[d]?d:"normal"}catch(e){return"normal"}}
function setCampDiff(d){try{localStorage.setItem("ifr_campdiff",d)}catch(e){}}
const DORDER=["easy","normal","hard"],shiftDiff=(d,k)=>DORDER[clamp(DORDER.indexOf(d)+k,0,2)];
// ---- launching ---------------------------------------------------------------
// ---- training ------------------------------------------------------------------
// Two short, forgiving exercises on the campaign engine. The enemy is idle (it
// builds nothing, no defences); every attack is scripted. Say/Obj helpers keep
// the definitions readable.
const TI=(t:string)=>["say","instructor",t];
const TRAINING:any={
rts:{name:"Basic Training",map:"octagon",loc:"Training Grounds",spawn:0,tier:0,
 brief:[["instructor","Welcome to training, Commander. Everything here is safe to get wrong."],["instructor","We'll set up a base, train a squad, fight off a raid, repair the damage, and take out an enemy outpost."]],
 foes:[{diff:"easy",spawn:2,base:["power","barracks"],idle:1}],
 start:{credits:6000},
 obj:[{id:"sel",t:"flag",flag:"select",text:"Select your Mobile HQ — tap it"},
  {coach:"#deployPrompt",id:"hq",t:"build",key:"conyard",n:1,hide:1,text:"Deploy it — tap DEPLOY, then tap open ground"},
  {coach:["#cards .card[data-key=power]","#tabs .tab[data-t=bld]"],id:"pow",t:"build",key:"power",n:1,hide:1,text:"Build a power plant — open the build tab and tap its card, then place it"},
  {coach:["#cards .card[data-key=refinery]","#cards .card[data-key=hive]","#tabs .tab[data-t=bld]"],id:"ref",t:"build",key:"refinery",n:1,hide:1,text:"Build a refinery — it comes with a harvester"},
  {coach:["#cards .card[data-key=barracks]","#tabs .tab[data-t=bld]"],id:"bar",t:"build",key:"barracks",n:1,hide:1,text:"Build a barracks"},
  {id:"train",t:"train",n:4,hide:1,text:"Train 4 infantry — select the barracks and tap a unit card"},
  {coach:"#bAll",id:"move",t:"flag",flag:"move",hide:1,text:"Select your squad and tap the ground to move it"},
  {id:"raid",t:"kills",n:3,hide:1,text:"Raiders! Select your squad and tap an enemy to attack"},
  {coach:"#bRepair:not(.on)",id:"fix",t:"flag",flag:"repair",hide:1,text:"Repair the damaged building — tap REPAIR, then tap the building"},
  {coach:"#bAmove",id:"amove",t:"flag",flag:"amove",hide:1,text:"Attack-move — tap A-MOVE (or press Q), then tap toward the enemy outpost"},
  {id:"win",t:"elim",hide:1,text:"Destroy the enemy outpost"}],
 ev:[{at:2,do:[TI("First, tap your Mobile HQ to select it. That big truck is your base on wheels.")]},
  {done:"sel",do:[["show","hq"],TI("Good. Now tap DEPLOY and put it down on open ground. That's your headquarters.")]},
  {done:"hq",do:[["show","pow"],TI("Every base needs power. Open the build tab, tap the power plant card, then tap a spot inside the glowing zone.")]},
  {done:"pow",do:[["show","ref"],TI("Now a refinery. It comes with a harvester that fetches ore for credits on its own.")]},
  {done:"ref",do:[["show","bar"],TI("Next, a barracks, so we can train soldiers.")]},
  {done:"bar",do:[["show","train"],TI("Select the barracks and tap an infantry card. Tap a card again to queue more.")]},
  {done:"train",do:[["show","move"],TI("A squad! Drag a box around them, or tap ALL UNITS, then tap the ground to move them.")]},
  {done:"move",do:[["show","raid"],TI("Contact! Raiders coming for the base. Tap an enemy to order an attack."),["wave",0,[["base",3]],{to:"base"}]]},
  {done:"raid",do:[["damage","power",.4],["show","fix"],TI("Raid's over, but your power plant took a beating. Tap REPAIR, then tap the building. It costs a little, but it's worth it.")]},
  {done:"fix",do:[["show","amove"],["credits",2000],TI("Now go on the offensive. Attack-move makes units fight anything they meet on the way. Tap A-MOVE, then tap toward the enemy.")]},
  {done:"amove",do:[["show","win"],TI("Take out every enemy building. Train more troops if you need them.")]}],
 win:[["instructor","Outstanding. You're ready for the real thing, Commander."]],lose:[["instructor","Everyone loses one in training. Try it again."]]},
fps:{name:"Infiltration Training",map:"octagon",loc:"Training Grounds",spawn:0,tier:0,hero:1,fpsOnly:1,
 brief:[["instructor","This one's first person, Commander. You're a single commando."],["instructor","Move, shoot, get inside an enemy building and blow it up from the inside."]],
 foes:[{diff:"easy",spawn:1,base:["power","barracks"],idle:1}],
 // Only the scripted targets: the enemy's starting squad is cleared, the sky is clear and the commando is tough.
 start:{clearFoes:1,tough:1},
 obj:[{id:"walk",t:"reach",x:70,y:44,r:3,text:"Walk to the green marker — WASD or the left stick; look with the mouse or by dragging"},
  {coach:["#fpsaim","#fpsfire"],id:"shoot",t:"kills",n:2,tag:"tgt",hide:1,text:"Shoot the two practice targets marked in red — aim (right mouse or AIM), then fire (left mouse or FIRE)"},
  {coach:"#fpsenter",id:"inside",t:"inside",key:"power",hide:1,text:"Get inside the enemy power plant — follow the arrow above your crosshair and walk in"},
  {coach:"#fpsbomb",id:"c4",t:"flag",flag:"c4",hide:1,text:"Plant C4 — press B or tap PLANT C4"},
  {id:"boom",t:"destroy",keys:["power"],slot:0,hide:1,text:"Get out before it blows — follow the arrow to the door"}],
 ev:[{at:2,do:[TI("Look around, then walk to the green marker. The arrow above your crosshair always shows where to go.")]},
  {done:"walk",do:[["show","shoot"],["targets",2],TI("Two practice targets just ahead, marked in red. They barely shoot back. Aim down your sights, then fire.")]},
  {done:"shoot",do:[["show","inside"],TI("Nice shooting. Now the power plant. Just walk into the building to go inside.")]},
  {done:"inside",do:[["show","c4"],TI("You're in. Press B, or tap PLANT C4, to set the charge.")]},
  {done:"c4",do:[["show","boom"],TI("Charge is ticking. Get out, now! Follow the arrow to the door.")]}],
 win:[["instructor","Textbook. That's how the professionals do it."]],lose:[["instructor","Keep your head down next time. Try again."]]}};
function showTraining(){radioStop(),hideLoading(),leaveFpsForMenu(),$("#menu").classList.remove("hidden");const card=(k,ic,t,d)=>'<button class="campCard" data-k="'+k+'"><div class="ccTop"><span class="ccIcon">'+ic+'</span><span class="ccFac">'+t+'</span></div><div class="ccTag">'+d+"</div></button>";
$("#panelMain").innerHTML='<h1>TRAINING</h1><div class="sub">Learn the controls — nothing here counts against you</div><div id="campList">'+card("rts","⚑","BASE & ARMY","Build a base, train a squad, repel a scripted raid, repair, attack-move and destroy an outpost.")+card("fps","◎","FIRST PERSON & INFILTRATION","Move and shoot as a commando, get inside an enemy building, plant C4 and get out.")+card("tut","▸","QUICK SKIRMISH TUTORIAL","The original short checklist against an easy opponent.")+'</div><button id="backSetup" '+SECBTN+">BACK</button>";
$("#panelMain").querySelectorAll(".campCard").forEach(b=>b.onclick=()=>"tut"===b.dataset.k?launchTutorial():launchTraining(b.dataset.k)),$("#backSetup").onclick=showSetup}
function launchTraining(kind){const m=TRAINING[kind];if(!m)return;radioStop();const fac=cfg.fac||"vanguard",foe=otherFacs(fac)[0];
cfg.map=m.map,cfg.fog="off",cfg.team=1,cfg.spawn=m.spawn||0,cfg.slots=m.foes.map(f=>({fac:foe,team:2,color:"def",spawn:f.spawn,diff:"easy"}));
pendingMission={fac,idx:-1,training:kind,noBuild:!1,hero:!!m.hero,diff:"easy"},startGame(),showLoading(fac,-1,m)}
let pendingMission=null;
function launchMission(fac,idx){const camp=CAMPAIGNS[fac],m=camp&&camp.missions[idx];if(!m)return;radioStop();
cfg.fac=fac,cfg.map=m.map,cfg.fog="on",cfg.team=1,cfg.spawn=m.spawn||0;
const cd=campDiff();cfg.slots=m.foes.map(f=>({fac:f.fac,team:f.ally?1:f.team||2,color:"def",spawn:f.spawn,diff:f.ally?f.diff:shiftDiff(f.diff,CDIFF[cd].shift)}));
pendingMission={fac,idx,noBuild:!!m.noBuild,hero:!!m.hero,diff:cd},startGame(),showLoading(fac,idx)}
const TUTORIAL_STEPS=[
  {text:"Select your Mobile HQ and tap DEPLOY to build your base.",done:()=>hasBld(0,"conyard")},
  {text:"Build a Power Plant.",done:()=>hasBld(0,"power")},
  {text:"Build a Refinery — your harvester starts mining automatically.",done:()=>hasBld(0,"refinery")||hasBld(0,"hive")},
  {text:"Build a Barracks and train a soldier.",done:()=>hasBld(0,"barracks")&&S.units.some(u=>0===u.owner&&!u.dead&&"inf"===u.d.kind)},
  {text:"Select your soldier and tap the map to move.",done:()=>!!S.tutorialMoved},
  {text:"Press Q, then tap a spot toward the enemy to attack-move.",done:()=>!!S.tutorialAmoved},
  {text:"Destroy the enemy base to finish the exercise.",done:()=>S.players.some(p=>!p.neutral&&0!==p.id&&p.defeated)}
];
function launchTutorial(){const foe=otherFacs(cfg.fac)[0];cfg.map="dust",cfg.fog="off",cfg.slots=[{fac:foe,team:2,color:"def",spawn:1,diff:"easy"}],pendingMission={tutorial:!0},startGame()}
function updateTutorial(){const m=S.mission;if(!m||!m.tutorial)return;m.doneSteps=m.doneSteps||[],m.curStep=m.curStep||0;for(let i=0;i<TUTORIAL_STEPS.length;i++)!m.doneSteps[i]&&TUTORIAL_STEPS[i].done()&&(m.doneSteps[i]=!0,i===m.curStep&&(m.curStep=i+1,hint("Nice work!")))}

// ---- world helpers -------------------------------------------------------------
const T2P=t=>32*t+16;
const roleKey=(fac,k)=>{const F=FACTIONS[fac];return F&&F[k]&&"string"==typeof F[k]?F[k]:k};
const openTile=(x,y)=>{if(!inMap(x,y))return!1;const i=idx(x,y);return(G.terr[i]<2||G.bridge[i])&&!G.occ[i]&&!G.blk[i]&&!G.over[i]};
function freeTileNear(tx,ty){tx=clamp(Math.round(tx),0,91),ty=clamp(Math.round(ty),0,71);if(openTile(tx,ty))return[tx,ty];const r=nearestFree(tx,ty,openTile);return r||[tx,ty]}
function spawnGroup(owner,spec,tx,ty,tag){const fac=S.players[owner].fac,out=[];let k=0;for(const[key0,n]of spec){const key=roleKey(fac,key0);if(!UNITS[key])continue;for(let i=0;i<n;i++,k++){const a=2.4*k,rr=1+.55*Math.sqrt(k),[x,y]=freeTileNear(tx+Math.cos(a)*rr,ty+Math.sin(a)*rr),u=addUnit(owner,key,T2P(x)+rnd(-6,6),T2P(y)+rnd(-6,6));u&&(tag&&(u.mtag=tag),out.push(u))}}return out}
function playerHero(){return S.units.find(u=>0===u.owner&&!u.dead&&u.d.c4)||S.units.find(u=>0===u.owner&&!u.dead)}
function playerArmyPos(){const us=S.units.filter(u=>0===u.owner&&!u.dead&&!u.d.fly);if(!us.length)return null;let x=0,y=0;for(const u of us)x+=u.x,y+=u.y;return{x:x/us.length,y:y/us.length}}
function playerBase(){return S.blds.find(b=>0===b.owner&&!b.dead&&"conyard"===b.key)||S.blds.find(b=>0===b.owner&&!b.dead&&!b.d.civ)||playerArmyPos()||{x:S.players[0].spawnX,y:S.players[0].spawnY}}
const enemyOwners=()=>{const o=[];for(let i=1;i<NEUTRAL;i++)teamOf(i)!==teamOf(0)&&o.push(i);return o};
// Turns an owner's Mobile HQ into a standing base with the listed buildings.
function preBuild(owner,list){const p=S.players[owner],hq=S.units.find(u=>u.owner===owner&&!u.dead&&"mhq"===u.key);if(!hq)return;const tx=Math.round(p.spawnX/32-1.5),ty=Math.round(p.spawnY/32-1.5);if(!canPlaceRaw("conyard",tx,ty))return;killUnitSilent(hq),addBuilding(owner,"conyard",tx,ty,!0);for(const k0 of list){const k="refinery"===k0&&"syndicate"===p.fac&&BLD.hive?"hive":k0;if(!BLD[k])continue;const s=aiFindSpot(p,k);s&&addBuilding(owner,k,s[0],s[1],!0)}}

// ---- mission state ---------------------------------------------------------------
function applyPendingMission(){if(!pendingMission)return void(S.mission=null);if(pendingMission.tutorial)return S.mission={tutorial:!0,curStep:0,doneSteps:[]},S.tutorialMoved=!1,S.tutorialAmoved=!1,void(pendingMission=null);
const pm=pendingMission,def=pm.training?TRAINING[pm.training]:CAMPAIGNS[pm.fac].missions[pm.idx],st=def.start||{};pendingMission=null;S.flags={};
const D=CDIFF[pm.diff||"normal"];S.mission={training:pm.training||null,tier:def.tier,ruins:!!st.ruins,fac:pm.fac,idx:pm.idx,def,diff:pm.diff||"normal",D,fpsOnly:!!def.fpsOnly,noBuild:pm.noBuild,hero:pm.hero,objs:def.obj.map(o=>Object.assign({},o,{state:0,shown:!o.hide},"stealth"===o.t?{sec:"hard"!==pm.diff}:{})),evs:def.ev.map(()=>({n:0,next:0})),escorts:{},started:!1,lastT:0,lost0:0,kills0:0,stars:0};
def.foes.forEach((f,i)=>{f.base&&preBuild(i+1,f.base),f.idle&&S.players[i+1]&&(S.players[i+1].ai.idle=!0)});
st.base&&preBuild(0,st.base);
// An abandoned outpost: no Mobile HQ, a squad on foot, and half-ruined neutral buildings to capture.
st.noMcv&&S.units.filter(u=>0===u.owner).forEach(u=>killUnitSilent(u));
st.clearFoes&&S.units.filter(u=>u.owner>0&&u.owner<NEUTRAL&&!u.dead&&"miner"!==u.d.role).forEach(u=>killUnitSilent(u));
st.ruins&&placeRuins(st.ruins);
const sp=[S.players[0].spawnX/32,S.players[0].spawnY/32];
st.units&&spawnGroup(0,st.units,sp[0]+2,sp[1]+3);
if(st.convoy){const c=st.convoy,at=c.at||sp;spawnGroup(0,[[c.key,c.n]],at[0],at[1],c.tag)}
if(def.stealth){S.mission.st={sus:0,alarm:0,alarms:0};const hu=playerHero();hu&&(hu.cloakM=1);def.foes.forEach((f,i)=>{S.blds.filter(b=>b.owner===i+1&&"power"===b.key).forEach(b=>b.mtag="pp")})}
document.body.classList.toggle("fpsOnly",!!def.fpsOnly);
if(S.mission.hero){const hu=playerHero();hu&&(st.tough&&(hu.maxhp*=3,hu.hp=hu.maxhp),enterFPS(hu))}
if("function"==typeof probeMedia){const who=new Set(def.brief.map(b=>b[0]));def.ev.forEach(e=>e.do.forEach(a=>"say"===a[0]&&who.add(a[1])));(def.alarm||[]).forEach(a=>who.add(a[0]));(def.win||[]).concat(def.lose||[]).forEach(a=>who.add(a[0]));who.forEach(w=>probeMedia(w))}
S.mission.intro=!0}
function placeRuins(list){const p=S.players[0],sx=p.spawnX/32,sy=p.spawnY/32,ang=Math.atan2(36-sy,46-sx);S.mission.ruinB={};
list.forEach(([key,frac],i)=>{const a=ang+(i-1)*.9,ax=Math.round(sx+Math.cos(a)*8),ay=Math.round(sy+Math.sin(a)*8),sz=BLD[key].size;let spot=null;
for(let r=0;r<10&&!spot;r++)for(let dy=-r;dy<=r&&!spot;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const tx=ax+dx-(sz>>1),ty=ay+dy-(sz>>1);if(canPlaceRaw(key,tx,ty)){spot=[tx,ty];break}}
if(!spot)return;const b=addBuilding(NEUTRAL,key,spot[0],spot[1],!0);b.hp=Math.round(b.maxhp*frac),b.ruin=1,S.mission.ruinB[key]=b.id;
for(const u of S.units)u.owner===NEUTRAL&&"miner"===u.d.role&&dist2(u.x,u.y,b.x,b.y)<200*200&&killUnitSilent(u);})}
// Runs once the world has fully started (startGame resets credits after us).
function missionStart(m){const st=m.def.start||{};m.started=!0;m.training&&(S.weather=S.wxGoal="clear",S.wxT=1e9,S.wxAmt=1);null!=st.credits?S.players[0].credits=Math.round(st.credits*m.D.cash/100)*100:(m.noBuild||m.hero)&&(S.players[0].credits=0);m.lost0=S.players[0].lost||0,m.kills0=S.players[0].kills||0,m.id0=S.nextId,m.trained={};
for(const o of m.objs)"kills"===o.t&&(o.k0=m.kills0);
setTimeout(()=>{S.mission===m&&S.running&&(hint("OBJECTIVES — "+m.objs.filter(o=>o.shown&&!o.sec).map(o=>o.text).join(" · ")))},1500)}

const inZone=(u,x,y,r)=>dist2(u.x,u.y,T2P(x),T2P(y))<(32*r)*(32*r);
const ownedCount=pred=>S.blds.filter(b=>0===b.owner&&!b.dead&&pred(b)).length;
// Where each open objective is, for the minimap and the loading-screen map:
// {x, y (world px), prim}. Primary objectives are green, bonus ones orange.
let _omT=-1,_omCache=[];
function objMarkers(){const m=S.mission;if(!m||!m.objs)return[];if(_omT===S.time)return _omCache;_omT=S.time;const out=[],T=v=>32*v+16,p0=S.players[0],sx=p0&&p0.spawnX||0,sy=p0&&p0.spawnY||0,near=(list,n)=>list.sort((a,b)=>dist2(a.x,a.y,sx,sy)-dist2(b.x,b.y,sx,sy)).slice(0,n),cen=l=>({x:l.reduce((s,b)=>s+b.x,0)/l.length,y:l.reduce((s,b)=>s+b.y,0)/l.length});
for(const o of m.objs){if(!o.shown||0!==o.state)continue;const prim=!o.sec,add=q=>q&&out.push({x:q.x,y:q.y,prim});
if(null!=o.x&&null!=o.y){add({x:T(o.x),y:T(o.y)});continue}
if("destroy"===o.t){const ow=null!=o.slot?[o.slot+1]:enemyOwners(),l=S.blds.filter(b=>!b.dead&&(o.tag?b.mtag===o.tag:ow.includes(b.owner)&&(o.keys||[]).includes(b.key)));near(l,2).forEach(add)}
else if("elim"===o.t){const ow=null!=o.slot?[o.slot+1]:enemyOwners();for(const id of ow){const l=S.blds.filter(b=>!b.dead&&b.owner===id);l.length&&add(cen(l))}}
else if("kills"===o.t&&o.tag){S.units.filter(u=>!u.dead&&u.mtag===o.tag).forEach(u=>out.push({x:u.x,y:u.y,prim,foe:1}))}
else if("own"===o.t){const l=S.blds.filter(b=>!b.dead&&b.key===o.key&&0!==b.owner);near(l,2).forEach(add)}
else if("capture"===o.t){const l=S.blds.filter(b=>!b.dead&&0!==b.owner&&(b.d.civ||SPECIALS.includes(b.key)));near(l,2).forEach(add)}}
return _omCache=out}
const SPECIALS=["oilDerek","paradropHangar","empTower","rogueDen"];
// 1 done, -1 failed, 0 pending
function evalObj(o,m,dt){switch(o.t){
case"elim":{const ow=null!=o.slot?[o.slot+1]:enemyOwners();return ow.every(i=>S.players[i].defeated)?1:0}
case"destroy":{const ow=null!=o.slot?[o.slot+1]:enemyOwners(),left=S.blds.filter(b=>!b.dead&&(o.tag?b.mtag===o.tag:ow.includes(b.owner)&&o.keys.includes(b.key))).length;o.left=left;if(left)return o.seen=1,0;return o.seen||S.time>240?1:0}
case"survive":return S.time>=o.time?1:0;
case"protect":{const n=ownedCount(b=>b.key===o.key);if(n)o.had=1;return o.had&&!n?-1:0}
case"capture":{const n=ownedCount(b=>b.d.civ||SPECIALS.includes(b.key));o.cur=n;return n>=o.n?1:0}
case"reach":return S.units.some(u=>0===u.owner&&!u.dead&&inZone(u,o.x,o.y,o.r))?1:0;
case"train":{for(const u of S.units)0===u.owner&&!u.dead&&u.id>=m.id0&&"inf"===u.d.kind&&(m.trained[u.id]=1);const n=Object.keys(m.trained).length;o.cur=n;return n>=o.n?1:0}
case"stealth":return m.st&&m.st.alarms>0?-1:0;
case"flag":return"select"===o.flag&&S.sel.some(u=>0===u.owner&&!u.dead)||S.flags&&S.flags[o.flag]?1:0;
case"inside":{const u=playerHero();return u&&u.inside&&!u.inside.dead&&u.inside.key===o.key&&0!==u.inside.owner?1:0}
case"own":return ownedCount(b=>b.key===o.key)?1:0;
case"build":{const n=S.blds.filter(b=>0===b.owner&&!b.dead&&!b.building&&(b.key===o.key||"refinery"===o.key&&"hive"===b.key)).length;o.cur=n;return n>=o.n?1:0}
case"kills":{const n=o.tag?(m.tagged&&m.tagged[o.tag]||0)-S.units.filter(u=>!u.dead&&u.mtag===o.tag).length:(S.players[0].kills||0)-(o.k0||0);o.cur=n;return n>=o.n?1:0}
case"hold":{let mine=!1,foe=!1;for(const u of S.units){if(u.dead||u.d.fly||!inZone(u,o.x,o.y,o.r))continue;0===u.owner?mine=!0:u.owner!==NEUTRAL&&teamOf(u.owner)!==teamOf(0)&&(foe=!0)}o.contest=mine&&foe;mine&&!foe&&(o.prog=(o.prog||0)+dt);return(o.prog||0)>=o.time?1:0}
case"escort":{const us=S.units.filter(u=>u.mtag===o.tag&&0===u.owner);let arrived=0,alive=0;for(const u of us){if(!u.dead&&inZone(u,o.x,o.y,o.r))u.arrived=!0;u.arrived&&arrived++,u.dead||alive++}o.cur=arrived;if(arrived>=o.need)return 1;return us.length&&alive<o.need?-1:0}
case"lossMax":return(S.players[0].lost||0)-m.lost0>o.n?-1:0;
case"timeMax":return S.time>o.time?-1:0}
return 0}
const END_OK={protect:1,lossMax:1,timeMax:1,stealth:1};

function fireAction(a,m,ev,evs){switch(a[0]){
case"say":radioSay(a[1],a[2]);break;
case"emp":{const ow=a[1]+1,T=m.D.emp;for(const b of S.blds)!b.dead&&b.owner===ow&&(b.blackoutT=T,spark(b.x,b.y,"#9fe8ff"));for(const u of S.units)!u.dead&&u.owner===ow&&"veh"===u.d.armor&&(u.frozen=Math.min(T,12));m.empUntil=S.time+T;sfx("psiwave"),hint("EMP — enemy defences offline for "+T+"s");break}
case"hint":hint(a[1]);break;
case"pingRuin":{const id=m.ruinB&&m.ruinB[a[1]],b=id&&S.blds.find(b=>b.id===id);b&&(S.marker={x:b.x,y:b.y,t:0,c:"#ffd75e"});break}
case"miner":{const b=S.blds.find(b=>0===b.owner&&!b.dead&&"refinery"===b.key);if(b){const f=S.players[0].f,k="syndicate"===S.players[0].fac?"miner_vanguard":f.miner,u=addUnit(0,k,b.x,b.y+70);u&&(u.order="harvest")}break}
case"damage":{const b=S.blds.find(b=>0===b.owner&&!b.dead&&b.key===a[1])||S.blds.find(b=>0===b.owner&&!b.dead&&"conyard"!==b.key);b&&(b.hp=Math.min(b.hp,b.maxhp*a[2]),S.marker={x:b.x,y:b.y,t:0,c:"#ff5a4a"},boom(b.x,b.y,1.4));break}
case"credits":S.players[0].credits+=a[1],hint("+"+a[1]+" credits"),sfx("sel");break;
case"reveal":S.spyReveals.push({x:T2P(a[1]),y:T2P(a[2]),r:32*a[3],t:a[4]||20});break;
case"ping":S.marker={x:T2P(a[1]),y:T2P(a[2]),t:0,c:"#ffd75e"};break;
case"show":{const o=m.objs.find(o=>o.id===a[1]);o&&!o.shown&&(o.flag&&S.flags&&(S.flags[o.flag]=0),o.shown=!0,sfx("ready"),hint("NEW OBJECTIVE: "+o.text));break}
case"go":{m.escorts[a[1]]=[a[2],a[3]];const us=S.units.filter(u=>!u.dead&&u.mtag===a[1]&&!u.arrived);us.length&&cmdMove(us,T2P(a[2]),T2P(a[3]));break}
case"reinf":{const[spec,from,to]=[a[1],a[2],a[3]],us=spawnGroup(0,spec,from[0],from[1]);to&&us.length&&cmdMove(us,T2P(to[0]),T2P(to[1]),!0);S.marker={x:T2P(from[0]),y:T2P(from[1]),t:0,c:"#7dff8a"},hint("Reinforcements have arrived"),sfx("ready");break}
// Practice targets for training: a few weak, slow-firing soldiers standing a
// short way ahead of the player, tagged so the HUD can mark them.
case"targets":{const h=playerHero(),p=S.players[1];if(!h||!p)break;const ang=Math.atan2(p.spawnY-h.y,p.spawnX-h.x),hx=h.x/32,hy=h.y/32;(m.tagged=m.tagged||{}).tgt=(m.tagged.tgt||0);
for(let i=0;i<a[1];i++){const side=(i-(a[1]-1)/2)*3.2,[x,y]=freeTileNear(hx+Math.cos(ang)*7-Math.sin(ang)*side,hy+Math.sin(ang)*7+Math.cos(ang)*side),u=addUnit(1,roleKey(p.fac,"base"),T2P(x),T2P(y));if(!u)continue;u.mtag="tgt",u.hp=u.maxhp=Math.round(.4*u.maxhp),u.dmgMul=.15,u.rofMul=3,u.hold=!0,u.ang=Math.atan2(h.y-u.y,h.x-u.x),m.tagged.tgt++}
S.marker={x:h.x+Math.cos(ang)*224,y:h.y+Math.sin(ang)*224,t:0,c:"#ff5a4a"};break}
case"wave":{const owner=a[1]+1,p=S.players[owner];if(!p||p.defeated)break;const opt=a[3]||{},k=evs.n-1,grow=opt.grow||0,spec=a[2].map(([key,n])=>[key,Math.max(1,Math.round((n+Math.floor(k*grow))*m.D.wave))]);
const from=opt.from?opt.from:[p.spawnX/32,p.spawnY/32];let tgt;const to=opt.to||"base";
if("hero"===to){const h=playerHero();tgt=h&&{x:h.x,y:h.y}}else if("army"===to)tgt=playerArmyPos();else if(Array.isArray(to))tgt={x:T2P(to[0]),y:T2P(to[1])};else tgt=playerBase();if(!tgt)break;
// Step the spawn point a few tiles toward the target so units leave the base.
const ang=Math.atan2(tgt.y/32-from[1],tgt.x/32-from[0]),off=opt.from?0:5,us=spawnGroup(owner,spec,from[0]+Math.cos(ang)*off,from[1]+Math.sin(ang)*off);us.length&&cmdMove(us,tgt.x,tgt.y,!0);break}}}

function evTriggered(e,s,m){if(null!=e.at)return!s.n&&S.time>=e.at;if(e.done){const o=m.objs.find(o=>o.id===e.done);return!s.n&&o&&1===o.state}if(e.near)return!s.n&&S.units.some(u=>0===u.owner&&!u.dead&&inZone(u,e.near[0],e.near[1],e.near[2]));if(e.every){if(S.time<e.from||e.until&&S.time>e.until)return!1;if(S.time>=s.next)return s.next=S.time+e.every,!0}return!1}

function checkMissionOutcome(){const m=S.mission;if(m.tutorial){if(S.players[0].defeated)return"lose";let allDead=NEUTRAL>1;for(let t=1;t<NEUTRAL;t++)teamOf(t)!==teamOf(0)&&!S.players[t].defeated&&(allDead=!1);return allDead?"win":null}
if(!m.def)return null;
m.started||missionStart(m);
const dt=Math.max(0,Math.min(.5,S.time-m.lastT));m.lastT=S.time;radioTick(dt);
m.st&&stealthTick(m,dt);
// events
m.def.ev.forEach((e,i)=>{const s=m.evs[i];evTriggered(e,s,m)&&(s.n++,e.do.forEach(a=>fireAction(a,m,e,s)))});
// escorts keep moving if they stop short
if((m.escT=(m.escT||0)-dt)<=0){m.escT=3;for(const tag in m.escorts){const[x,y]=m.escorts[tag],us=S.units.filter(u=>!u.dead&&u.mtag===tag&&!u.arrived&&"idle"===u.order);us.length&&cmdMove(us,T2P(x),T2P(y))}}
// objectives
for(const o of m.objs){if(!o.shown||0!==o.state)continue;const r=evalObj(o,m,dt);r&&(o.state=r,r>0?(o.sec||END_OK[o.t]||(sfx("ready"),hint("OBJECTIVE COMPLETE: "+o.text)),o.sec&&!END_OK[o.t]&&hint("BONUS COMPLETE: "+o.text)):o.sec?hint("BONUS FAILED: "+o.text):hint("OBJECTIVE FAILED: "+o.text))}
updateObjPanel(m),coachTick(m);
if(S.players[0].defeated)return"lose";
if(m.objs.some(o=>!o.sec&&-1===o.state))return"lose";
const prim=m.objs.filter(o=>!o.sec&&!END_OK[o.t]);
if(prim.every(o=>o.shown&&1===o.state)){for(const o of m.objs)0===o.state&&(o.state=END_OK[o.t]?1:-1);m.stars=1+m.objs.filter(o=>o.sec&&1===o.state).length;m.training||saveStars(m.fac,m.idx,m.stars);return"win"}
return null}

// Training: a pulsing "TAP HERE" pointer over the button the current step needs.
function coachTick(m){let tip=$("#coachTip");if(!m||!m.training){tip&&tip.classList.add("hidden");return}
const o=m.objs.find(o=>o.shown&&0===o.state&&!o.sec),sels=o&&o.coach?[].concat(o.coach):[];let el=null;
for(const q of sels){const c=document.querySelector(q) as HTMLElement;if(c&&c.getClientRects().length&&"hidden"!==getComputedStyle(c).visibility){el=c;break}}
document.querySelectorAll(".coach").forEach(x=>x!==el&&x.classList.remove("coach"));
const cp=$("#cancelPlace");cp&&!cp.classList.contains("hidden")&&(el=null);
if(!el){tip&&tip.classList.add("hidden");return}
tip||(tip=document.createElement("div"),tip.id="coachTip",document.body.appendChild(tip));
el.classList.add("coach");const r=el.getBoundingClientRect(),up=r.top>70,nm=el.querySelector(".nm"),lbl=el.dataset.l||(nm?nm.textContent:el.textContent||"").trim().split("\n")[0].slice(0,18)||"HERE";
const arw=d=>'<svg viewBox="0 0 24 24"'+(d?' style="transform:rotate(180deg)"':"")+'><path d="M12 1.5 22 12h-6v10.5H8V12H2z"/></svg>',txt=document.createElement("span");txt.textContent="TAP "+lbl;tip.innerHTML="",up?(tip.appendChild(txt),tip.insertAdjacentHTML("beforeend",arw(1))):(tip.insertAdjacentHTML("afterbegin",arw(0)),tip.appendChild(txt)),tip.classList.remove("hidden"),tip.classList.toggle("dn",!up);
const w=tip.offsetWidth;tip.style.left=Math.max(4,Math.min(innerWidth-w-4,r.left+r.width/2-w/2))+"px",tip.style.top=(up?r.top-tip.offsetHeight-6:r.bottom+6)+"px"}
// ---- stealth: enemies cannot target the cloaked hero until the alarm is raised;
// staying near an enemy (or a live defence) fills the detection meter.
function stealthBlock(e,t){const m=S.mission;return!!(m&&m.st&&!(m.st.alarm>0)&&0===t.owner)}
function stealthTick(m,dt){const st=m.st,h=playerHero();if(!h||h.dead)return;if(st.alarm>0){if((st.alarm-=dt)<=0)st.sus=0,hint("The alarm has died down — you're hidden again");return}
const D=m.D,R2=D.det*D.det,hx=h.x,hy=h.y;let seen=null;
if(!h.inside){for(const u of S.units){if(u.dead||u.owner===0||u.owner===NEUTRAL||teamOf(u.owner)===teamOf(0)||"miner"===u.d.role)continue;if(dist2(u.x,u.y,hx,hy)<R2&&hasLineOfFire(u.x,u.y,hx,hy,heightAt(u.x,u.y)+14,heightAt(hx,hy)+14)){seen=u;break}}
if(!seen)for(const b of S.blds){if(b.dead||!b.w||b.owner===NEUTRAL||teamOf(b.owner)===teamOf(0)||b.blackoutT>0)continue;const p=S.players[b.owner];if(p.drain>p.power)continue;if(dist2(b.x,b.y,hx,hy)<1.4*R2){seen=b;break}}}
st.seeing=!!seen,st.sus=seen?st.sus+dt:Math.max(0,st.sus-.6*dt);
if(st.sus>=D.detT){st.alarm=D.alarmT,st.alarms++,st.sus=D.detT;(m.def.alarm||[]).forEach(([w,t])=>radioSay(w,t));sfx("alert");const us=S.units.filter(u=>!u.dead&&u.owner>0&&u.owner<NEUTRAL&&teamOf(u.owner)!==teamOf(0)&&u.d.dmg>0&&!u.d.fly).slice(0,8);us.length&&cmdMove(us,hx,hy,!0);hint("YOU'VE BEEN SPOTTED — alarm raised!")}}

// ---- progress --------------------------------------------------------------------
function campaignUnlocked(fac){try{return+localStorage.getItem("ifr_campaign_"+fac)||1}catch(e){return 1}}
function unlockNext(fac,idx){try{const u=campaignUnlocked(fac);idx+2>u&&localStorage.setItem("ifr_campaign_"+fac,""+(idx+2))}catch(e){}}
function missionStars(fac,idx){try{return+localStorage.getItem("ifr_stars_"+fac+"_"+idx)||0}catch(e){return 0}}
function saveStars(fac,idx,n){try{n>missionStars(fac,idx)&&localStorage.setItem("ifr_stars_"+fac+"_"+idx,""+n)}catch(e){}}
const starStr=(n,max)=>{let s="";for(let i=0;i<(max||3);i++)s+='<i class="'+(i<n?"on":"")+'">★</i>';return'<span class="stars">'+s+"</span>"};

// ---- radio ------------------------------------------------------------------------
let radioQ=[],radioCur=null;
function radioSay(who,text){radioQ.push({who,text})}
function radioStop(){radioQ=[],radioCur=null;coachTick(null);const el=$("#radioBox");el&&el.classList.add("hidden")}
function radioTick(dt){if(radioCur&&(radioCur.t-=dt)>0)return;radioCur=null;const el=$("#radioBox");if(!radioQ.length)return void(el&&el.classList.add("hidden"));radioCur=radioQ.shift();radioCur.t=lineT(radioCur.who,radioCur.text,clamp(1.4+.062*radioCur.text.length,3.2,11));const c=castOf(radioCur.who);
const fs="function"==typeof fmvSrc&&fmvSrc(radioCur.who);if(el){el.innerHTML='<div class="rbPort'+(fs?" img":"")+'" style="--rc:'+c.c+(fs?";background-image:url("+fs+")":"")+'">'+(fs?"":c.n.split(" ").map(w=>w[0]).join("").slice(-2))+'</div><div class="rbBody"><div class="rbName" style="color:'+c.c+'">'+c.n.toUpperCase()+'</div><div class="rbText">'+radioCur.text+"</div></div>",el.classList.remove("hidden"),placeRadio(el),el.style.animation="none",el.offsetWidth,el.style.animation=""}
try{speakAs(c.fac,radioCur.text,c.acc,c.g,c.p,c.r,!1,radioCur.who)}catch(e){}}
// Keep the radio box clear of the build panel, wherever the layout puts it.
function placeRadio(el){el.style.bottom=el.style.left=el.style.width="";const sd=$("#side"),r=sd&&!document.body.classList.contains("fps")&&sd.getClientRects().length?sd.getBoundingClientRect():null;if(!r)return;
if(r.left>innerWidth/2){const w=Math.min(460,r.left-24);el.style.left=(r.left/2)+"px",el.style.width=w+"px"}else if(r.top>innerHeight/3)el.style.bottom=(innerHeight-r.top+8)+"px"}
$("#radioBox")&&$("#radioBox").addEventListener("click",()=>{radioCur&&(radioCur.t=0)});

// ---- objectives panel -------------------------------------------------------------
const fmtT=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
function objLabel(o){let t=o.text;"survive"===o.t&&0===o.state&&(t+=" — "+fmtT(Math.max(0,o.time-S.time)));"hold"===o.t&&0===o.state&&(t+=" — "+Math.floor(100*Math.min(1,(o.prog||0)/o.time))+"%"+(o.contest?" (contested)":""));
("capture"===o.t||"build"===o.t||"kills"===o.t||"train"===o.t)&&0===o.state&&null!=o.cur&&(t+=" ("+Math.min(o.cur,o.n)+"/"+o.n+")");"escort"===o.t&&0===o.state&&(t+=" ("+(o.cur||0)+"/"+o.need+")");"timeMax"===o.t&&0===o.state&&(t+=" — "+fmtT(Math.max(0,o.time-S.time)));
"lossMax"===o.t&&(t+=" ("+((S.players[0].lost||0)-S.mission.lost0)+"/"+o.n+")");return t}
function updateObjPanel(m){const el=$("#tutorialPanel");if(!el)return;el.classList.remove("hidden");el.classList.add("obj");const rows=m.objs.filter(o=>o.shown).map(o=>{const cls=1===o.state?" done":-1===o.state?" fail":" cur";return'<div class="ts'+cls+(o.sec?" sec":"")+'"><b>'+(1===o.state?"✓":-1===o.state?"✗":o.sec?"★":"◆")+"</b><span>"+objLabel(o)+"</span></div>"}).join(""),st=m.st,meter=st?st.alarm>0?'<div class="stl alarm">⚠ ALARM — '+Math.ceil(st.alarm)+"s</div>":'<div class="stl'+(st.seeing?" warn":"")+'">'+(st.seeing?"BEING SPOTTED":"HIDDEN")+'<i style="width:'+Math.round(10*st.sus/m.D.detT)*10+'%"></i></div>':"",sig=rows+meter+(el._min?"m":"");if(el._sig===sig)return;el._sig=sig;
el.innerHTML='<div class="th">'+(m.training?"TRAINING · ":m.idx+1+". ")+m.def.name.toUpperCase()+'<button class="tMin">'+(el._min?"+":"–")+"</button></div>"+(el._min?"":meter+rows)}
function skipTutorial(){S.mission=null,hint("Tutorial skipped — good luck!")}
function updateTutorialPanel(){const m=S.mission,el=$("#tutorialPanel");if(m&&m.def)return;el.classList.remove("obj");if(!m||!m.tutorial)return void el.classList.add("hidden");el.classList.remove("hidden");const sig=(m.doneSteps||[]).join(",")+"|"+m.curStep;if(el._sig===sig)return;el._sig=sig;const rows=TUTORIAL_STEPS.map((s,i)=>{const done=m.doneSteps&&m.doneSteps[i],cur=i===m.curStep;return'<div class="ts'+(done?" done":cur?" cur":"")+'"><b>'+(done?"✓":i+1+".")+"</b><span>"+s.text+"</span></div>"}).join("");el.innerHTML='<div class="th">TUTORIAL<button class="tSkip">SKIP</button></div>'+rows}
$("#tutorialPanel").addEventListener("click",e=>{if(e.target.closest(".tSkip"))return skipTutorial();const el=$("#tutorialPanel");e.target.closest(".tMin")&&(el._min=!el._min,el._sig=null)});

// Recorded clips set the pace when present; the estimate covers anything else.
const lineT=(w,t,est)=>{const d="function"==typeof castDur?castDur(w,t):0;return d?d+.55:est};
function loadingVO(m){const prim=m.obj.filter(o=>!o.sec&&!o.hide);return[m.name+". Primary objectives."].concat(prim.map((o,i)=>(prim.length>1?["First","Then","And finally"][Math.min(i,2)]+": ":"")+o.text+"."),m.fpsOnly?["You are on your own out there. Stay out of sight."]:[])}
// Every (character, line) the campaigns and films can speak, for the recording script.
function castLineList(){const out=[],seen={},add=(w,t)=>{const k=w+"|"+t;t&&!seen[k]&&(seen[k]=1,out.push({who:w,text:t}))};
for(const m of Object.values(CAMPAIGNS).flatMap((c:any)=>c.missions).concat(Object.values(TRAINING))){m.brief.forEach(([w,t])=>add(w,t));m.ev.forEach(e=>e.do.forEach(a=>"say"===a[0]&&add(a[1],a[2])));(m.alarm||[]).concat(m.win||[],m.lose||[]).forEach(([w,t])=>add(w,t));loadingVO(m).forEach(t=>add(m.brief[0][0],t))}
if("undefined"!=typeof FILMS)for(const k in FILMS)FILMS[k].shots.forEach(sh=>sh.say&&add(sh.say[0],sh.say[1]));return out}
// ---- menus ---------------------------------------------------------------------------
const FAC_ICON={vanguard:"✦",legion:"✪",syndicate:"◉"};
const mapName=k=>{const e=(typeof MAPS!="undefined"?MAPS:[]).find(x=>x.k===k);return e?e.n:k.toUpperCase()};
const TYPE_TAG=m=>m.hero?"COMMANDO":m.noBuild?"STRIKE GROUP":m.obj.some(o=>"survive"===o.t)?"DEFENCE":m.obj.some(o=>"escort"===o.t)?"ESCORT":"ASSAULT";
function campStars(fac){return CAMPAIGNS[fac].missions.reduce((a,_,i)=>a+missionStars(fac,i),0)}
function hideLoading(){const l=$("#loadScreen");l&&(l._tok=(l._tok||0)+1,l.classList.add("hidden"))}
function showCampaign(){radioStop(),hideLoading(),leaveFpsForMenu(),$("#menu").classList.remove("hidden");const rows=["vanguard","legion","syndicate"].map(fac=>{const camp=CAMPAIGNS[fac],unlocked=campaignUnlocked(fac),total=camp.missions.length,done=Math.min(total,Math.max(0,unlocked-1));return'<button class="campCard f-'+fac+'" data-fac="'+fac+'"><div class="ccTop"><span class="ccIcon">'+FAC_ICON[fac]+'</span><span class="ccFac">'+FAC_NAME[fac].toUpperCase()+'</span><span class="ccProg">'+done+"/"+total+'</span></div><div class="ccTitle">'+camp.title+'</div><div class="ccTag">'+camp.tag+'</div><div class="ccBar"><i style="width:'+Math.round(100*done/total)+'%"></i></div><div class="ccStars">★ '+campStars(fac)+" / "+3*total+"</div></button>"}).join("");
$("#panelMain").innerHTML='<h1>CAMPAIGN</h1><div class="sub">Three wars for the Frontier</div><button class="bPlay" id="filmPro">▶ PROLOGUE — THE IRON FRONTIER</button><div id="campList">'+rows+'</div><button id="backSetup" '+SECBTN+">BACK</button>";$("#filmPro").onclick=()=>playFilm("prologue");$("#panelMain").querySelectorAll(".campCard").forEach(b=>b.onclick=()=>showMissionList(b.dataset.fac)),$("#backSetup").onclick=showSetup;filmSeen("prologue")||playFilm("prologue")}
function showMissionList(fac){radioStop(),hideLoading();const camp=CAMPAIGNS[fac],unlocked=campaignUnlocked(fac);const rows=camp.missions.map((m,i)=>{const locked=i>=unlocked,done=i<unlocked-1;return'<button class="mRow'+(locked?" locked":done?" done":" next")+'" data-i="'+i+'"'+(locked?" disabled":"")+'><span class="mNum">'+(i+1)+'</span><span class="mMain"><b>'+m.name+"</b><small>"+(locked?"LOCKED":mapName(m.map)+" · "+TYPE_TAG(m))+"</small></span>"+(done?starStr(missionStars(fac,i)):locked?'<span class="mLock">🔒</span>':'<span class="mGo">PLAY ›</span>')+"</button>"}).join("");
$("#panelMain").innerHTML='<h1 class="f-'+fac+'">'+FAC_ICON[fac]+" "+FAC_NAME[fac].toUpperCase()+'</h1><div class="sub">'+camp.title+'</div><div class="small" style="margin:4px 0 8px;opacity:.8">'+camp.tag+'</div><div class="filmRow"><button class="bPlay" id="filmIntro">▶ INTRO</button>'+(unlocked>camp.missions.length?'<button class="bPlay" id="filmEnd">▶ ENDING</button>':"")+'</div><div id="missionList">'+rows+'</div><button id="backCampList" '+SECBTN+">BACK</button>";$("#filmIntro").onclick=()=>playFilm(fac+"_intro");$("#filmEnd")&&($("#filmEnd").onclick=()=>playFilm(fac+"_end"));filmSeen(fac+"_intro")||playFilm(fac+"_intro");$("#panelMain").querySelectorAll(".mRow").forEach(b=>b.onclick=()=>{b.disabled||showBriefing(fac,+b.dataset.i)}),$("#backCampList").onclick=showCampaign}
let briefPlay=0;
function showBriefing(fac,idx){radioStop(),hideLoading();const m=CAMPAIGNS[fac].missions[idx],mp=Math.max(4,(m.foes.length||0)+1);
const lines=m.brief.map(([w,t])=>{const c=castOf(w);return'<div class="bLine"><span class="bWho" style="color:'+c.c+'">'+c.n+"</span><span>"+t+"</span></div>"}).join("");
const objs=m.obj.filter(o=>!o.hide).map(o=>'<div class="bObj'+(o.sec?" sec":"")+'"><b>'+(o.sec?"★":"◆")+"</b>"+o.text+"</div>").join("");
const foes=m.foes.map(f=>'<span class="bFoe'+(f.ally?" ally":"")+'">'+(f.ally?"ALLY ":"")+FAC_NAME[f.fac].toUpperCase()+" · "+DIFFS[f.diff].name+"</span>").join(" ");
$("#panelMain").innerHTML='<div class="bHead"><div><div class="bOp">'+CAMPAIGNS[fac].title.toUpperCase()+" · MISSION "+(idx+1)+"</div><h1>"+m.name.toUpperCase()+'</h1><div class="sub">'+m.loc+" · "+mapName(m.map)+" · "+TYPE_TAG(m)+'</div></div>'+starStr(missionStars(fac,idx))+'</div><div class="bMap">'+mapPreviewSVG(m.map,mp)+'</div><div class="bLines">'+lines+'</div><div class="filmRow"><button id="bPlay" class="bPlay">▶ PLAY TRANSMISSION</button>'+(m.film?'<button id="bFilm" class="bPlay">▶ CUTSCENE</button>':"")+'</div>'+(m.hero||m.noBuild?"":'<div class="bSec">TECHNOLOGY · TIER '+m.tier+'</div><div class="bTech">'+tierNews(fac,m.tier)+"</div>")+'<div class="bSec">DIFFICULTY</div><div class="dPick">'+DORDER.map(k=>'<button data-d="'+k+'" class="'+(k===campDiff()?"on":"")+'">'+CDIFF[k].n+"</button>").join("")+'</div><div class="small dDesc" style="margin-top:4px;text-align:left">'+CDIFF[campDiff()].d+'</div><div class="bSec">OBJECTIVES</div>'+objs+(m.fpsOnly?'<div class="bObj"><b>⌖</b>First-person only — one operative, no base</div>':"")+'<div class="bSec">OPPOSITION</div><div>'+foes+'</div><button id="launchM">LAUNCH MISSION</button><button id="backCamp" '+SECBTN+">BACK</button>";
document.querySelectorAll(".dPick button").forEach(b=>b.onclick=()=>{setCampDiff(b.dataset.d),document.querySelectorAll(".dPick button").forEach(x=>x.classList.toggle("on",x===b)),$(".dDesc").textContent=CDIFF[b.dataset.d].d});$("#launchM").onclick=()=>{briefPlay++,launchMission(fac,idx)},$("#backCamp").onclick=()=>{briefPlay++,showMissionList(fac)};
m.film&&($("#bFilm").onclick=()=>{briefPlay++,playFilm(m.film)},filmSeen(m.film)||playFilm(m.film));$("#bPlay").onclick=()=>{audio();const tok=++briefPlay;let k=0;const next=()=>{if(tok!==briefPlay||k>=m.brief.length||!$("#bPlay"))return;const[w,t]=m.brief[k++],c=castOf(w);document.querySelectorAll(".bLine").forEach((e,i)=>e.classList.toggle("on",i===k-1));try{speakAs(c.fac,t,c.acc,c.g,c.p,c.r,!1,w)}catch(e){}setTimeout(next,1e3*lineT(w,t,clamp(1.2+.062*t.length,3,11)))};next()}}
// ---- loading screen: the map with objective markers, and the commander
// reading out the objectives while the world finishes loading.
function missionMapSVG(m){const W=920,H=720,img=mapPreviewImg(m.map),X=x=>(x/92*W).toFixed(1),Y=y=>(y/72*H).toFixed(1),spots=mapSpots(m.map)||[],c=[];
const p0=S.players[0],sp=p0&&p0.spawnX?[p0.spawnX/32,p0.spawnY/32]:spots[m.spawn||0];sp&&c.push('<circle cx="'+X(sp[0])+'" cy="'+Y(sp[1])+'" r="26" fill="#ffffff22" stroke="#ffffff" stroke-width="5"/><text x="'+X(sp[0])+'" y="'+(sp[1]>60?+Y(sp[1])-40:+Y(sp[1])+56)+'" class="mL" fill="#ffffff">YOU</text>');
const mk=S.mission&&S.mission.def===m?objMarkers():[];for(const q of mk.slice().sort((a,b)=>+a.prim-+b.prim)){const x=+X(q.x/32),y=+Y(q.y/32),col=q.prim?"#46e06a":"#ff9a2c",r=q.prim?30:24;c.push('<g><circle cx="'+x+'" cy="'+y+'" r="'+(r+10)+'" fill="none" stroke="'+col+'" stroke-width="3" opacity=".55"/><path d="M'+x+" "+(y-r)+"L"+(x+r)+" "+y+"L"+x+" "+(y+r)+"L"+(x-r)+" "+y+'Z" fill="'+col+'aa" stroke="'+col+'" stroke-width="4"/></g>')}
c.push('<g font-family="monospace" font-size="26" font-weight="700" transform="translate('+(W-270)+' 0)"><rect x="14" y="'+(H-86)+'" width="250" height="72" rx="8" fill="#000a"/><path d="M34 '+(H-66)+'l12 12-12 12-12-12z" fill="#46e06a"/><text x="56" y="'+(H-45)+'" fill="#bff5c8">PRIMARY</text><path d="M34 '+(H-36)+'l10 10-10 10-10-10z" fill="#ff9a2c"/><text x="56" y="'+(H-17)+'" fill="#ffd2a0">BONUS</text></g>');
return'<svg viewBox="0 0 '+W+" "+H+'" preserveAspectRatio="xMidYMid meet"><image href="'+img+'" width="'+W+'" height="'+H+'" preserveAspectRatio="none"/>'+c.join("")+"</svg>"}
const LOAD_TIPS=["Bonus objectives earn stars — replay missions to collect them all.","High ground gives your units 30% more sight range.","Units on an overpass can't be hit by units passing underneath.","Garrison town buildings with infantry to hold them.","Power down a base and its defences stop firing."];
function showLoading(fac,idx,defOv?){const m=defOv||CAMPAIGNS[fac].missions[idx],cd=defOv?"easy":campDiff();let el=$("#loadScreen");el||(el=document.createElement("div"),el.id="loadScreen",document.body.appendChild(el));
"function"==typeof probeMedia&&probeMedia(m.brief[0][0]);const lsImg="function"==typeof fmvSrc&&fmvSrc(m.brief[0][0]),prim=m.obj.filter(o=>!o.sec&&!o.hide),sec=m.obj.filter(o=>o.sec&&!o.hide&&!("stealth"===o.t&&"hard"===cd)),speaker=m.brief[0][0],c=castOf(speaker);let k=0;
el.innerHTML='<div class="lsMap">'+missionMapSVG(m)+'</div><div class="lsShade"></div><div class="lsInfo"><div class="lsOp f-'+fac+'">'+(defOv?"TRAINING":CAMPAIGNS[fac].title.toUpperCase()+" · MISSION "+(idx+1)+" · "+CDIFF[cd].n)+'</div><h1>'+m.name.toUpperCase()+'</h1><div class="lsLoc">'+m.loc+" · "+mapName(m.map)+'</div>'+(m.hero||m.noBuild||defOv?"":'<div class="lsSec">NEW TECHNOLOGY</div><div class="bTech">'+tierNews(fac,m.tier)+"</div>")+'<div class="lsSec">PRIMARY OBJECTIVES</div>'+prim.map(o=>'<div class="bObj"><b style="color:#46e06a">◆</b>'+o.text+"</div>").join("")+(sec.length?'<div class="lsSec">BONUS</div>'+sec.map(o=>'<div class="bObj sec"><b style="color:#ff9a2c">◆</b>'+o.text+"</div>").join(""):"")+'<div class="lsVo"><span class="rbPort'+(lsImg?" img":"")+'" style="--rc:'+c.c+(lsImg?";background-image:url("+lsImg+")":"")+'">'+(lsImg?"":c.n.split(" ").map(w=>w[0]).join("").slice(-2))+'</span><span><b style="color:'+c.c+'">'+c.n.toUpperCase()+'</b><i class="lsWave"></i></span></div><div class="lsTip">TIP — '+pick(LOAD_TIPS)+'</div><div class="lsBar"><i></i></div><button class="lsGo" disabled>LOADING…</button></div>';
el.classList.remove("hidden"),S.running=!1;const bar=el.querySelector(".lsBar i"),go=el.querySelector(".lsGo");bar.style.width="0%",requestAnimationFrame(()=>{bar.style.transition="width 1.6s ease-out",bar.style.width="100%"});
try{cineMood("tense")}catch(e){}
const vo=loadingVO(m);let vi=0;const tok=el._tok=(el._tok||0)+1;
const say=()=>{if(el._tok!==tok||el.classList.contains("hidden")||vi>=vo.length)return;const t=vo[vi++];try{speakAs(c.fac,t,c.acc,c.g,c.p,c.r,!1,speaker)}catch(e){}setTimeout(say,1e3*lineT(speaker,t,clamp(1+.065*t.length,1.6,8)))};setTimeout(say,500);
setTimeout(()=>{if(el._tok!==tok)return;go.disabled=!1,go.textContent="BEGIN MISSION ›",go.classList.add("ready")},1700);
go.onclick=()=>{el._tok++,el.classList.add("hidden");try{speakStop(),cineStop()}catch(e){}S.running=!0}}

// Debrief block for the results screen.
function missionDebrief(win){const m=S.mission;if(!m||!m.def)return"";radioStop();const lines=(win?m.def.win:m.def.lose)||[],last=!m.training&&win&&m.idx===CAMPAIGNS[m.fac].missions.length-1,endKey=m.fac+"_end",autoEnd=last&&!filmSeen(endKey);
last&&setTimeout(()=>{const b=$("#dEnd");b&&(b.onclick=()=>playFilm(endKey));autoEnd&&playFilm(endKey)},autoEnd?2500:0);
let tk=0;const speak=()=>{if(!lines[tk])return;const[w,t]=lines[tk++],c=castOf(w);try{speakAs(c.fac,t,c.acc,c.g,c.p,c.r,!1,w)}catch(e){}setTimeout(speak,1e3*lineT(w,t,clamp(1.2+.062*t.length,3,11)))};autoEnd||setTimeout(speak,600);
const objs=m.objs.filter(o=>o.shown).map(o=>'<div class="bObj'+(o.sec?" sec":"")+(1===o.state?" ok":-1===o.state?" bad":"")+'"><b>'+(1===o.state?"✓":-1===o.state?"✗":"–")+"</b>"+o.text+"</div>").join("");
return'<div class="dBrief">'+(last?'<button class="bPlay" id="dEnd">▶ WATCH THE ENDING</button>':"")+(win?'<div class="dStars">'+starStr(m.stars)+"</div>":"")+lines.map(([w,t])=>{const c=castOf(w);return'<div class="bLine"><span class="bWho" style="color:'+c.c+'">'+c.n+"</span><span>"+t+"</span></div>"}).join("")+objs+"</div>"}

Object.assign(window, {
  FAC_NAME, CAMPAIGNS, launchMission, checkMissionOutcome, campaignUnlocked, unlockNext, applyPendingMission,
  otherFacs, launchTutorial, showTraining, launchTraining, TRAINING, updateTutorial, updateTutorialPanel, skipTutorial,
  techAllowed, tierNews, objMarkers, castLineList, showCampaign, showMissionList, showBriefing, missionDebrief, stealthBlock, showLoading, campDiff, CDIFF, missionStars, radioStop, CAST, castOf,
});

Object.defineProperties(window, {
  pendingMission: { get: () => pendingMission, configurable: true },
});
