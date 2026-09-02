let superAim=!1,spyAim=!1,paradropAim=!1,empAim=!1;const ABILITIES={super:{name:"Superweapon"},spy:{name:"Spy Plane",cost:1500,cd:75},paradrop:{name:"Paradrop",cost:1200,cd:60},emp:{name:"EMP Burst",cost:1800,cd:90}};function spyStrike(owner,x,y){const p=S.players[owner];p.credits-=ABILITIES.spy.cost,p.spyCD=ABILITIES.spy.cd,S.spyReveals=S.spyReveals||[],S.spyReveals.push({x:x,y:y,r:260,t:8}),S.fx.push({kind:"ring",x:x,y:y,z:6,s:1.1,c:"#8fd0ff",t:0,life:1.2}),0===owner&&(cam.x=x,cam.y=y,clampCam(),S.marker={x:x,y:y,t:0,c:"#8fd0ff"},hint("Recon sweep"),sfx("beam"))}function paradropStrike(owner,x,y){const p=S.players[owner],baseKey=FACTIONS[p.fac].base;p.credits-=ABILITIES.paradrop.cost,p.paradropCD=ABILITIES.paradrop.cd;for(let i=0;i<3;i++){const a=addUnit(owner,baseKey,x+rnd(-30,30),y+rnd(-30,30));a&&(a.order="idle")}S.fx.push({kind:"ring",x:x,y:y,z:6,s:1.3,c:"#ffd75e",t:0,life:1}),0===owner&&(cam.x=x,cam.y=y,clampCam(),S.marker={x:x,y:y,t:0,c:"#ffd75e"},hint("Paradrop inbound"),sfx("launch"))}function fireEmp(owner,x,y){const p=S.players[owner];p.credits-=ABILITIES.emp.cost,p.empCD=ABILITIES.emp.cd;const R2=240*240;let hit=0,bhit=0;for(const u of S.units)!u.dead&&u.owner!==owner&&u.owner!==NEUTRAL&&teamOf(u.owner)!==teamOf(owner)&&("veh"===u.d.armor||u.d.fly)&&dist2(u.x,u.y,x,y)<R2&&(u.frozen=6,hit++,spark(u.x,u.y,"#9fe8ff"));for(const b of S.blds)!b.dead&&b.owner!==owner&&b.owner!==NEUTRAL&&teamOf(b.owner)!==teamOf(owner)&&dist2(b.x,b.y,x,y)<R2&&(b.blackoutT=10,bhit++,spark(b.x,b.y,"#9fe8ff"));S.fx.push({kind:"ring",x:x,y:y,z:6,s:1.4,c:"#9fe8ff",t:0,life:1}),0===owner&&(cam.x=x,cam.y=y,clampCam(),S.marker={x:x,y:y,t:0,c:"#9fe8ff"},hint("EMP burst — "+hit+" units, "+bhit+" buildings disabled"),sfx("tesla"))}function abilityClick(key){const t=P();if("super"===key){const b=superReady(t.id);if(!b){const anyB=S.blds.find(x=>!x.dead&&x.owner===t.id&&"super"===x.key);return void hint(anyB?"Charging — "+Math.ceil(anyB.d.charge-(anyB.charge||0))+"s to go":"Build a "+bname("super",t.fac)+" first")}return superAim=!superAim,void hint(superAim?"Tap the map to strike":"Strike cancelled")}if("spy"===key){if(!hasBld(t.id,"airfield"))return void hint("Needs "+bname("airfield",t.fac));if((t.spyCD||0)>0)return void hint("Recharging — "+Math.ceil(t.spyCD)+"s");if(t.credits<ABILITIES.spy.cost)return void hint("Need $"+ABILITIES.spy.cost);spyAim=!spyAim,hint(spyAim?"Tap the map to scan":"Scan cancelled")}if("paradrop"===key){if(!hasBld(t.id,"paradropHangar"))return void hint("Needs a captured Paradrop Hangar");if((t.paradropCD||0)>0)return void hint("Recharging — "+Math.ceil(t.paradropCD)+"s");if(t.credits<ABILITIES.paradrop.cost)return void hint("Need $"+ABILITIES.paradrop.cost);paradropAim=!paradropAim,hint(paradropAim?"Tap the map to drop reinforcements":"Drop cancelled")}if("emp"===key){if(!hasBld(t.id,"empTower"))return void hint("Needs a captured EMP Spire");if((t.empCD||0)>0)return void hint("Recharging — "+Math.ceil(t.empCD)+"s");if(t.credits<ABILITIES.emp.cost)return void hint("Need $"+ABILITIES.emp.cost);empAim=!empAim,hint(empAim?"Tap the map to trigger the EMP":"EMP cancelled")}}function updateSuperPanel(){const el=$("#superPanel"),list=S.blds.filter(b=>!b.dead&&"super"===b.key);
if(!list.length)return superAim=!1,el.classList.add("hidden"),el.innerHTML="",void(el._rows=null);
el.classList.remove("hidden");
const rows=el._rows||(el._rows=new Map()),seenIds=new Set();
for(const b of list){
seenIds.add(b.id);
const own=0===b.owner,fac=S.players[b.owner].fac,ready=(b.charge||0)>=b.d.charge,frac=Math.min(1,(b.charge||0)/b.d.charge),col=fc(b.owner);
let row=rows.get(b.id);
if(!row){
row=document.createElement("div");
row.innerHTML='<span class="dot"></span><svg class="ring" viewBox="0 0 20 20"><circle class="bg" cx="10" cy="10" r="8.5"/><circle class="fg" cx="10" cy="10" r="8.5"/></svg><span class="nm"></span><span class="st"></span>';
row.addEventListener("click",()=>{
if(!row._own)return void(cam.x=row._b.x,cam.y=row._b.y);
if(!row._ready)return void hint("Charging — "+Math.ceil(row._b.d.charge-(row._b.charge||0))+"s to go");
superAim=!superAim,hint(superAim?"Tap the map to strike":"Strike cancelled")
}),el.appendChild(row),rows.set(b.id,row)
}
row._own=own,row._ready=ready,row._b=b,row.className="swRow"+(own?" own":"")+(own&&ready?" ready":"")+(own&&superAim?" aiming":""),row.querySelector(".dot").style.background=col,row.querySelector(".fg").style.strokeDashoffset=53.4*(1-frac),row.querySelector(".nm").textContent=bname("super",fac).toUpperCase()+(own?"":" — "+S.players[b.owner].f.name.toUpperCase()),row.querySelector(".st").textContent=ready?own?"FIRE":"RDY":Math.ceil(b.d.charge-(b.charge||0))+"s"
}
for(const[id,row]of rows)seenIds.has(id)||(row.remove(),rows.delete(id))
}
Object.assign(window, {
  ABILITIES, spyStrike, paradropStrike, fireEmp, abilityClick, updateSuperPanel
});

Object.defineProperties(window, {
  superAim: { get: () => superAim, set: v => { superAim = v; }, configurable: true },
  spyAim: { get: () => spyAim, set: v => { spyAim = v; }, configurable: true },
  paradropAim: { get: () => paradropAim, set: v => { paradropAim = v; }, configurable: true },
  empAim: { get: () => empAim, set: v => { empAim = v; }, configurable: true },
});
