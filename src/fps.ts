export {};
function projModel(kind,fac){const e=[],glowC="allied"===fac?"#8fe0ff":"soviet"===fac?"#ff9c4a":"yuri"===fac?"#c98cff":"glow",bodyC="soviet"===fac?"#8a7a6a":"allied"===fac?"#d8e8ee":"yuri"===fac?"#7a5f8a":"white",noseC="soviet"===fac?"#c0392b":"allied"===fac?"#3ba0c9":"yuri"===fac?"#8c3fc9":"red",shellC="soviet"===fac?"#e8c04a":"allied"===fac?"#c9d8e0":"yuri"===fac?"#b98cd8":"gold";return"bullet"===kind||"flak"===kind?e.push(P_(CYL(.5,4.5,6),0,0,0,glowC,{ty:PI2,e:1})):"flame"===kind?e.push(P_(CYL(.9,3,6),0,0,0,"yuri"===fac?"#8fe06a":"tibGlit",{ty:PI2,e:1})):"rocket"===kind||"missile"===kind||"aamissile"===kind?(e.push(P_(CYL(.7,4.5,7),0,0,0,bodyC,{ty:PI2})),e.push(P_(CONE(.7,.2,1.6,7),4.5,0,0,noseC,{ty:PI2})),e.push(P_(CYL(.95,1.6,6),-.6,0,0,glowC,{ty:PI2,e:1}))):"bomb"===kind?e.push(P_(CYL(1.1,3.5,8),0,0,0,"darkmetal",{ty:PI2})):"grenade"===kind?(e.push(P_(CYL(1.3,1.9,8),0,0,0,"olive",{ty:PI2})),e.push(P_(CYL(.35,.5,6),0,1.1,0,"darkmetal",{ty:PI2}))):e.push(P_(CYL(.55,3.4,6),0,0,0,shellC,{ty:PI2})),e}const FPS={on:!1,u:null,yaw:0,pitch:-.03,cam:null,mv:{f:0,s:0},firing:!1,aiming:!1,look:null,stick:null,vm:null,interact:null,entering:null,viewKick:0,hitFlashT:0,aimTarget:null,aimLockT:0};let fpsPromptTarget=null;let rotateTarget=null;function fpsEyeH(e){return"inf"===e.d.kind?19:"kirov"===e.key?44:e.d.fly?22:34}function enterFPS(e){return!(!GL||!e||e.dead)&&(FPS.cam||(FPS.cam=new THREE.PerspectiveCamera(74,CW/CH,.6,5200),FPS.cam.up.set(0,1,0),GL.scene.add(FPS.cam)),FPS.on=!0,FPS.u=e,FPS.yaw=e.ang,FPS.pitch=-.04,FPS.mv.f=0,FPS.mv.s=0,FPS.firing=!1,FPS.aiming=!1,FPS.interact=null,e.fps=1,e.order="idle",e.path=null,e.target=null,document.body.classList.add("fps"),document.getElementById("fpsui").classList.remove("hidden"),S.sel=[e],!0)}function exitFPS(){FPS.u&&(FPS.u.fps=0,FPS.u.order="idle",FPS.u.path=null),FPS.on=!1,FPS.u=null,FPS.firing=!1,FPS.aiming=!1,FPS.interact=null,document.body.classList.remove("fps"),document.getElementById("fpsui").classList.add("hidden")}function fpsTick(e){const t=FPS.u;if(!t||t.dead)return void exitFPS();t.fps=1,t.order="idle",t.path=null,t.target=null;t.cool>0&&(t.cool-=e);t.muzzle>0&&(t.muzzle-=e);t.recoil>0&&(t.recoil=Math.max(0,t.recoil-6*e));t.hitT>0&&(t.hitT-=e);t.abilityCD>0&&(t.abilityCD-=e);FPS.viewKick&&(FPS.viewKick=Math.max(0,FPS.viewKick-4*e));FPS.hitFlashT>0&&(FPS.hitFlashT-=e);if(t.d.fly){const _wa=t.d.alt||0;t.alt=void 0===t.alt?_wa:t.alt+clamp(_wa-t.alt,-70*e,70*e)}const r="inf"===t.d.kind?7:2.9;t.ang+=clamp(angDiff(t.ang,FPS.yaw),-r*e,r*e),t.d.turret?t.tang=FPS.yaw:t.tang=t.ang;const n=FPS.mv.f,a=FPS.mv.s,o=Math.hypot(n,a);if(o>.06){const r=t.d.speed*("inf"===t.d.kind?1.85:1)*(t.slowT>0?.5:1)*Math.min(1,o);let s,i;if("inf"===t.d.kind){const e=FPS.yaw;s=Math.cos(e)*n-Math.sin(e)*a,i=Math.sin(e)*n+Math.cos(e)*a;const r=Math.hypot(s,i)||1;s/=r,i/=r,t.ang=FPS.yaw}else{const e=Math.max(0,Math.cos(angDiff(t.ang,FPS.yaw))),r=(n<0?-.5:e*e*.55+.45*e)*Math.sign(n||1);s=Math.cos(t.ang)*r,i=Math.sin(t.ang)*r}const l=t.x+s*r*e,c=t.y+i*r*e;let d=t.x,f=t.y;if(t.inside){const b=t.inside,hw=interiorHalf(b)-8;t.x=clamp(l,b.x-hw,b.x+hw),t.y=clamp(c,b.y-hw,b.y+hw);if(b.furnCols)for(const fc of b.furnCols){const dx=t.x-(b.x+fc.x),dz=t.y-(b.y+fc.z),dd=Math.hypot(dx,dz),minD=fc.r+3;if(dd<minD&&dd>.01){const push=(minD-dd)/dd;t.x+=dx*push,t.y+=dz*push}}if(b.d.roof){const lx=t.x-b.x,lz=t.y-b.y,zA=hw-STAIR_GAP,zB=hw;if(Math.abs(lx)<8&&lz>=zA&&lz<=zB){const p=clamp((lz-zA)/(zB-zA),0,1);t.alt=FLOOR_Z+p*(ROOF_Z-FLOOR_Z)}else t.alt=(void 0!==t.alt?t.alt:FLOOR_Z)>(FLOOR_Z+ROOF_Z)/2?ROOF_Z:FLOOR_Z}}else passableAt(l,c,t)?(t.x=l,t.y=c):passableAt(l,t.y,t)?t.x=l:passableAt(t.x,c,t)&&(t.y=c),t.x=clamp(t.x,6,2938),t.y=clamp(t.y,6,2298);const h=Math.hypot(t.x-d,t.y-f);t.animT=(t.animT||0)+h,t.moving=h>.05,t.moving&&"inf"!==t.d.kind&&(t.d.naval?Math.random()<.18&&S.fx.push({kind:"smoke",x:t.x-Math.cos(t.ang)*t.d.radius,y:t.y-Math.sin(t.ang)*t.d.radius,z:1,s:.4,c:"#e4f2f5",t:0,life:.5}):(Math.random()<.06&&S.fx.push({kind:"smoke",x:t.x-Math.cos(t.ang)*t.d.radius,y:t.y-Math.sin(t.ang)*t.d.radius,z:2,s:.35,c:"#8a7f6a",t:0,life:.55}),(t.trackT=(t.trackT||0)-e)<=0&&(t.trackT=.16,S.fx.push({kind:"track",x:t.x,y:t.y,ang:t.ang,w:.35*t.d.radius,l:.9*t.d.radius,t:0,life:6}))))}else t.moving=!1;if("inf"===t.d.kind){if(t.inside)FPS.interact=t.inside;else{let bb=null,bd=1e9;for(const b of S.blds){if(!fpsEnterable(b))continue;const dx=b.x-t.x,dy=b.y-t.y,dst=Math.hypot(dx,dy),thr=16*b.size+55;dst<thr&&dst<bd&&(bd=dst,bb=b)}FPS.interact=bb,bb&&bd<16*bb.size+8&&enterGarrison(t,bb)}}else FPS.interact=null;fpsUpdateAim(t,e),FPS.firing&&fpsShoot(t)}
function leaveGarrison(u){const b=u.inside;if(!b)return;b.garrison=(b.garrison||[]).filter(x=>x!==u),u.inside=null,u.alt=0;const r=nearestFree(b.tx+irnd(0,b.size-1),b.ty+irnd(0,b.size-1),walkable);r?(u.x=32*r[0]+16,u.y=32*r[1]+16):(u.x=b.x,u.y=b.y+16*b.size+14),u.order="idle",b.garrison.length||(b.owner=NEUTRAL)}
function fpsInteract(){const e=FPS.u;if(!e||"inf"!==e.d.kind)return;e.inside?(leaveGarrison(e),hint("Left the building")):FPS.interact&&enterGarrison(e,FPS.interact)}function fpsAimTarget(e){const t=e.d,aim=FPS.aiming,r=1.05*(t.range||120)*(aim?1.2:1),coneMin=aim?.975:.945,n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw);let o=null,s=-1;const i=arr=>{for(const l of arr){if(l.dead||l.owner===e.owner||void 0===l.owner)continue;if("u"===l.e&&l.inside&&l.inside!==e.inside)continue;const p="u"===l.e&&l.inside?interiorFigurePos(l):{x:l.x,y:l.y};const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy);if(d>r||d<1)continue;if("u"===l.e&&(l.alt||0)>2&&!t.aa)continue;if("b"===l.e&&t.noBld)continue;const f=(dx*n+dy*a)/d;if(f<coneMin)continue;const h=1e3*f-.05*d;h>s&&(s=h,o=l)}};return i(S.units),i(S.blds),o}
function fpsUpdateAim(e,dt){const tgt=fpsAimTarget(e);FPS.aimLockT=tgt&&tgt===FPS.aimTarget?(FPS.aimLockT||0)+dt:0,FPS.aimTarget=tgt}
function fpsShoot(e){if(e.cool>0)return;const t=e.d,n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw),r=1.05*(t.range||120)*(FPS.aiming?1.2:1),o=fpsAimTarget(e);FPS.viewKick=Math.min(.09,(FPS.viewKick||0)+.028),o&&(FPS.hitFlashT=.15),o?(e.cool=t.rof*vRof(e),"mind"!==t.role?fire(e,o,t):mindTick(e,o)):"mind"!==t.role&&t.dmg>0&&(e.cool=t.rof*vRof(e),fire(e,{x:e.x+n*r,y:e.y+a*r,e:"u",d:{armor:"veh"},dead:!1} as any,t))}
const FPS_ABILITIES={bullet:{name:"FRAG\nGRENADE",cd:9},flame:{name:"FLAME\nBURST",cd:7},missile:{name:"DIG\nIN",cd:1.5},rocket:{name:"DIG\nIN",cd:1.5}};
function fpsAbilityInfo(e){return e&&"inf"===e.d.kind?FPS_ABILITIES[e.d.proj]||null:null}
function throwGrenade(e){const n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw),range=150,tx=e.x+n*range,ty=e.y+a*range,sp=230;spark(e.x+n*16,e.y+a*16,"#ffb060"),S.projs.push({x:e.x+n*14,y:e.y+a*14,z:9,z0:9,t0:0,dur:Math.max(.4,range/sp),tgt:null,dmg:42,owner:e.owner,by:e,sp,kind:"grenade",ang:FPS.yaw,life:3,splash:55,tx0:tx,ty0:ty,d0:range})}
function flameNova(e){const radius=70,dmg=28;boom(e.x,e.y,2.2,"#ff8a3c");for(const u of S.units){if(u.dead||u===e||u.owner===e.owner||teamOf(u.owner)===teamOf(e.owner))continue;const d=dist(u.x,u.y,e.x,e.y);d<radius&&damage(u,dmg*(1-d/radius),e.owner,e)}sfx("flame"),textFx(e.x,e.y-24,"FLAME BURST","#ff8a3c")}
function fpsAbility(){const e=FPS.u,info=fpsAbilityInfo(e);if(!info)return void hint("No special ability for this unit");if(e.abilityCD>0)return;const kind=e.d.proj;"bullet"===kind?throwGrenade(e):"flame"===kind?flameNova(e):("missile"===kind||"rocket"===kind)&&e.d.deploy&&toggleDeploy(e),e.abilityCD=info.cd}function buildViewmodel(kind){
const g=new THREE.Group,mat=(c,r,mm)=>new THREE.MeshStandardMaterial({color:c,roughness:null==r?.55:r,metalness:null==mm?.4:mm}),
mesh=(geo,m,x?,y?,z?,rx?,ry?,rz?)=>{const o=new THREE.Mesh(geo,m);return o.position.set(x||0,y||0,z||0),rx&&(o.rotation.x=rx),ry&&(o.rotation.y=ry),rz&&(o.rotation.z=rz),g.add(o),o};
g.userData.kind=kind;
if("melee"===kind||!kind){
mesh(new THREE.BoxGeometry(.09,.08,.15),mat("#3a2420",.6,.25),.04,-.05,-.08,.1);
for(let i=0;i<3;i++)mesh(new THREE.ConeGeometry(.011,.1,6),mat("#d8d0c0",.35,.35),.04+.022*(i-1),-.03,-.19,Math.PI/2*1.06);
return g.visible=!1,g}
const dark=mat("#20262a",.5,.5),metal=mat("#626a70",.32,.78),grip=mat("#2c2318",.75,.12),accent=mat("#b8863c",.4,.6);
if("rocket"===kind||"missile"===kind){
const big="rocket"===kind,tr=big?.062:.05,tl=big?.62:.5,dark2=mat("#232a2e",.55,.4),warhead=mat("#7a2a20",.5,.4),ox=.16,oy=.09,capZ=-.18-tl/2;
mesh(new THREE.CylinderGeometry(tr,tr+.006,tl,10),metal,ox,oy,-.18,Math.PI/2);
mesh(new THREE.CylinderGeometry(tr+.02,tr+.02,.05,12),dark2,ox,oy,capZ-.02,Math.PI/2);
mesh(new THREE.ConeGeometry(tr+.008,.13,10),warhead,ox,oy,capZ-.09,-Math.PI/2);
mesh(new THREE.TorusGeometry(tr+.006,.01,6,12),accent,ox,oy,-.18-tl*.15,Math.PI/2);
mesh(new THREE.CylinderGeometry(tr+.02,tr+.02,.05,12),dark2,ox,oy,-.18+tl/2+.02,Math.PI/2);
mesh(new THREE.BoxGeometry(.06,.09,.16),grip,ox-.03,oy-.12,.05,.14);
const flash=mesh(new THREE.ConeGeometry(.05,.13,6),new THREE.MeshBasicMaterial({color:"#ffe9a0",transparent:!0,opacity:.95,depthWrite:!1}),ox,oy,capZ-.14,Math.PI/2);
return flash.visible=!1,g.userData.flash=flash,g.visible=!1,g}
if("pistol"===kind){
mesh(new THREE.BoxGeometry(.04,.065,.16),metal,.065,-.03,-.12);
mesh(new THREE.BoxGeometry(.032,.05,.1),grip,.065,-.09,-.02,.35);
mesh(new THREE.BoxGeometry(.036,.06,.15),dark,-.065,-.02,-.1);
mesh(new THREE.BoxGeometry(.03,.045,.09),grip,-.065,-.075,0,.35);
const flash=mesh(new THREE.ConeGeometry(.03,.08,6),new THREE.MeshBasicMaterial({color:"#ffe9a0",transparent:!0,opacity:.95,depthWrite:!1}),.065,-.03,-.21,Math.PI/2);
return flash.visible=!1,g.userData.flash=flash,g.visible=!1,g}
if("tool"===kind){
mesh(new THREE.CylinderGeometry(.03,.034,.22,10),mat("#b8863c",.5,.65),0,-.03,-.16,Math.PI/2);
mesh(new THREE.BoxGeometry(.055,.06,.08),grip,0,-.09,-.02,.2);
mesh(new THREE.SphereGeometry(.026,10,8),new THREE.MeshStandardMaterial({color:"#8fe0ff",emissive:"#3fa8d8",emissiveIntensity:1.2,roughness:.25}),0,-.03,-.28);
return g.visible=!1,g}
mesh(new THREE.BoxGeometry(.065,.088,.34),dark,0,0,-.06);
mesh(new THREE.BoxGeometry(.05,.05,.15),grip,0,-.075,.09,.3);
mesh(new THREE.BoxGeometry(.022,.03,.055),metal,0,.052,-.09);
mesh(new THREE.BoxGeometry(.012,.05,.012),metal,0,.078,-.09);
mesh(new THREE.BoxGeometry(.05,.03,.16),dark,0,.05,-.2);
let frontZ=-.32;
if("flame"===kind){
mesh(new THREE.CylinderGeometry(.05,.06,.32,10),metal,0,-.02,-.34,Math.PI/2);
mesh(new THREE.ConeGeometry(.048,.1,10),accent,0,-.02,-.53,Math.PI/2);
mesh(new THREE.CylinderGeometry(.045,.045,.24,10),mat("#7a3a1c",.6,.3),.08,-.05,.03,0,0,.15);
frontZ=-.5
}else if("sniper"===kind){
mesh(new THREE.CylinderGeometry(.013,.015,.58,8),metal,0,.014,-.42,Math.PI/2);
mesh(new THREE.CylinderGeometry(.026,.026,.14,10),dark,0,.058,-.3);
mesh(new THREE.CylinderGeometry(.019,.019,.02,10),metal,0,.058,-.23,Math.PI/2);
mesh(new THREE.CylinderGeometry(.019,.019,.02,10),metal,0,.058,-.37,Math.PI/2);
frontZ=-.72
}else if("flak"===kind){
mesh(new THREE.CylinderGeometry(.023,.023,.42,8),metal,-.032,0,-.35,Math.PI/2);
mesh(new THREE.CylinderGeometry(.023,.023,.42,8),metal,.032,0,-.35,Math.PI/2);
mesh(new THREE.BoxGeometry(.1,.08,.1),dark,0,-.02,-.06);
mesh(new THREE.BoxGeometry(.045,.17,.06),dark,0,-.14,-.05,-.2);
frontZ=-.54
}else if("beam"===kind){
mesh(new THREE.CylinderGeometry(.026,.03,.38,8),mat("#3a4a52",.3,.8),0,0,-.34,Math.PI/2);
mesh(new THREE.OctahedronGeometry(.045,0),new THREE.MeshStandardMaterial({color:"#7ff0ff",emissive:"#3fd8ff",emissiveIntensity:1.5,roughness:.2}),0,0,-.55);
mesh(new THREE.TorusGeometry(.034,.008,6,10),accent,0,0,-.4,Math.PI/2);
frontZ=-.55
}else{
mesh(new THREE.CylinderGeometry(.014,.016,.4,8),metal,0,.012,-.34,Math.PI/2);
mesh(new THREE.CylinderGeometry(.021,.021,.03,8),dark,0,.012,-.53,Math.PI/2);
mesh(new THREE.BoxGeometry(.045,.13,.045),grip,0,-.09,-.11,-.22);
mesh(new THREE.CylinderGeometry(.017,.017,.04,10),dark,0,.068,-.26);
frontZ=-.53
}
mesh(new THREE.BoxGeometry(.012,.05,.012),metal,0,.05,frontZ+.02);
const flash=mesh(new THREE.ConeGeometry(.038,.1,6),new THREE.MeshBasicMaterial({color:"#ffe9a0",transparent:!0,opacity:.95,depthWrite:!1}),0,.012,frontZ-.02,Math.PI/2);
flash.visible=!1,g.userData.flash=flash;
return g.visible=!1,g}
function ensureViewmodel(kind){return FPS.vm&&FPS.vm.userData.kind===kind?FPS.vm:(FPS.vm&&FPS.cam.remove(FPS.vm),FPS.vm=buildViewmodel(kind),FPS.cam.add(FPS.vm),FPS.vm)}
const VM_KEY={marksman:"sniper",tanya:"pistol",reaper:"pistol",phantom:"pistol",engineer:"tool"};
function unitViewmodelKind(e){return VM_KEY[e.key]||e.d.proj||"rifle"}
const TOWER_H=150,ROOM_H=60,FLOOR_Z=TOWER_H-ROOM_H-8,ROOF_Z=TOWER_H-2,STAIR_GAP=24;
function interiorHalf(bld){return 16*bld.size}
function panelWall(w,h,winW,winH,winZ,mat){
  const grp=new THREE.Group,segW=(w-winW)/2;
  const panel=(pw,ph,px,py)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),mat);m.position.set(px,py,0),grp.add(m)};
  if(segW>.4)panel(segW,h,-(winW/2+segW/2),h/2),panel(segW,h,winW/2+segW/2,h/2);
  if(winZ>.4)panel(winW,winZ,0,winZ/2);
  const topH=h-winZ-winH;
  if(topH>.4)panel(winW,topH,0,h-topH/2);
  return grp;
}
function furnishInterior(g,bld,half,floorZ,tall){
  const ro=-1e4,propMat=c=>new THREE.MeshBasicMaterial({color:c,depthTest:!1,fog:!1}),cols=[];
  const box=(w,d,h,x,z,y,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),propMat(color));m.position.set(x,(void 0===y?floorZ:y)+h/2,z),m.renderOrder=ro+1,g.add(m),cols.push({x,z,r:.5*Math.max(w,d)+1});return m};
  const key=bld.key;
  if(tall){
    for(const[px,pz]of[[-half+13,-half+13],[half-13,-half+13],[-half+13,half-13],[half-13,half-13]])box(9,9,ROOM_H-4,px,pz,floorZ,3355443);
  }else if("civ2"===key){
    for(const[px,pz]of[[-half+15,-half+15],[half-15,half-15]])box(13,13,12,px,pz,floorZ,9075248);
  }else if("civ4"===key){
    box(6,.7*(half*2-20),7,-half+10,0,floorZ,4537624),box(6,.7*(half*2-20),7,half-10,0,floorZ,4537624),box(10,6,16,0,half-14,floorZ,7099965);
  }else{
    box(20,9,14,0,-half+15,floorZ,2763306),box(7,7,4,0,-half+15,floorZ+14,16766814);
  }
  return cols;
}
function ensureInterior(bld){
  if(bld.interior)return bld.interior;
  const half=interiorHalf(bld),tall=!!bld.d.roof,roomH=tall?ROOM_H:50,floorZ=tall?FLOOR_Z:0,ceilZ=floorZ+roomH,g=new THREE.Group,ro=-1e4;
  const wallMat=new THREE.MeshBasicMaterial({color:4407619,side:THREE.DoubleSide,depthTest:!1,fog:!1});
  const winW=Math.min(half*1.3,half*2-8),winH=roomH*.45,winZ=roomH*.3,doorW=Math.min(22,half*1.1),doorH=roomH*.62;
  const mkWall=(w,rotY,px,pz,isDoor?)=>{
    const wg=panelWall(w,roomH,isDoor?Math.min(doorW,w-6):Math.min(winW,w-6),isDoor?doorH:winH,isDoor?0:winZ,wallMat);
    wg.rotation.y=rotY,wg.position.set(px,floorZ,pz),wg.children.forEach(m=>m.renderOrder=ro),g.add(wg);
  };
  mkWall(half*2,0,0,-half),mkWall(half*2,0,0,half,!0),mkWall(half*2,Math.PI/2,-half,0),mkWall(half*2,Math.PI/2,half,0);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(half*2-2,half*2-2),new THREE.MeshBasicMaterial({color:2960939,depthTest:!1,fog:!1}));
  floor.rotation.x=-Math.PI/2,floor.position.y=floorZ+.3,floor.renderOrder=ro+1,g.add(floor);
  if(tall){
    const hw=half-8,gap=STAIR_GAP,zStart=hw-gap,cd=half-2+zStart;
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(half*2-2,cd),new THREE.MeshBasicMaterial({color:3618615,depthTest:!1,fog:!1,side:THREE.DoubleSide}));
    ceil.rotation.x=Math.PI/2,ceil.position.set(0,ceilZ,(zStart-(half-2))/2),ceil.renderOrder=ro+1,g.add(ceil);
    const steps=10,stairMat=new THREE.MeshBasicMaterial({color:2500134,depthTest:!1,fog:!1});
    for(let i=0;i<steps;i++){
      const t01=(i+.5)/steps,sz=new THREE.Mesh(new THREE.BoxGeometry(14,2,gap/steps+.4),stairMat);
      sz.position.set(0,floorZ+t01*(ROOF_Z-floorZ),zStart+t01*gap),sz.renderOrder=ro+1,g.add(sz);
    }
    const rf=hw,roof=new THREE.Mesh(new THREE.PlaneGeometry(rf*2,rf*2),new THREE.MeshBasicMaterial({color:3355443,depthTest:!1,fog:!1,side:THREE.DoubleSide}));
    roof.rotation.x=-Math.PI/2,roof.position.y=ROOF_Z,roof.renderOrder=ro+1,g.add(roof);
    const parMat=new THREE.MeshBasicMaterial({color:2500134,side:THREE.DoubleSide,depthTest:!1,fog:!1}),parH=8;
    const mkPar=(w,rotY,px,pz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,parH),parMat);m.rotation.y=rotY,m.position.set(px,ROOF_Z+parH/2,pz),m.renderOrder=ro+1,g.add(m)};
    mkPar(rf*2,0,0,-rf),mkPar(rf*2,0,0,rf),mkPar(rf*2,Math.PI/2,-rf,0),mkPar(rf*2,Math.PI/2,rf,0);
  }else{
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(half*2-2,half*2-2),new THREE.MeshBasicMaterial({color:3618615,depthTest:!1,fog:!1,side:THREE.DoubleSide}));
    ceil.rotation.x=Math.PI/2,ceil.position.y=ceilZ,ceil.renderOrder=ro+1,g.add(ceil);
  }
  bld.furnCols=furnishInterior(g,bld,half,floorZ,tall);
  const bulbCol=16769228;
  for(const bx of[-half*.35,half*.35]){
    const bulb=new THREE.PointLight(bulbCol,1.15,half*3.2,2);
    bulb.position.set(bx,ceilZ-8,0),g.add(bulb);
    const bulbMesh=new THREE.Mesh(new THREE.SphereGeometry(2.4,8,6),new THREE.MeshBasicMaterial({color:bulbCol,fog:!1,depthTest:!1}));
    bulbMesh.position.copy(bulb.position),bulbMesh.renderOrder=ro+2,g.add(bulbMesh);
  }
  g.position.set(bld.x,0,bld.y),g.frustumCulled=!1,GL.interiorScene||(GL.interiorScene=new THREE.Scene),GL.interiorScene.add(g),bld.interior=g;
  return g;
}
function interiorSlotPos(bld,idx,total){
  const half=interiorHalf(bld),r=Math.min(half*.55,70),ang=idx*(6.283/Math.max(3,total))+.5;
  return{x:bld.x+Math.cos(ang)*r,y:bld.y+Math.sin(ang)*r};
}
function interiorFigurePos(u){
  const bld=u.inside;
  if(!bld)return{x:u.x,y:u.y};
  const list=(bld.garrison||[]).filter(x=>x!==FPS.u&&!x.dead),idx=list.indexOf(u);
  return idx<0?{x:bld.x,y:bld.y}:interiorSlotPos(bld,idx,list.length);
}
function humanFigure(color){
  const g=new THREE.Group,mat=new THREE.MeshBasicMaterial({color:color,depthTest:!1,fog:!1}),ro=-9997;
  const legs=new THREE.Mesh(new THREE.BoxGeometry(5,10,3.5),mat);legs.position.y=5,legs.renderOrder=ro,g.add(legs);
  const torso=new THREE.Mesh(new THREE.BoxGeometry(6,11,4),mat);torso.position.y=15.5,torso.renderOrder=ro,g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(2.6,8,6),new THREE.MeshBasicMaterial({color:14595744,depthTest:!1,fog:!1}));
  head.position.y=23.5,head.renderOrder=ro,g.add(head);
  return g;
}
function syncInteriorFigures(bld){
  const figMap=bld.interior.userData.figMap||(bld.interior.userData.figMap=new Map),list=(bld.garrison||[]).filter(u=>u!==FPS.u&&!u.dead),floorZ=bld.d.roof?FLOOR_Z:0;
  list.forEach((u,idx)=>{
    let f=figMap.get(u);
    f||(f=humanFigure(palette(u.owner).body||"#888"),bld.interior.add(f),figMap.set(u,f));
    const pos=interiorSlotPos(bld,idx,list.length);
    f.position.set(pos.x-bld.x,floorZ,pos.y-bld.y),f.rotation.y=-(u.ang||0);
  });
  for(const[u,f]of figMap)list.includes(u)||(bld.interior.remove(f),figMap.delete(u));
}function fpsRender(){const e=FPS.u,t=FPS.cam;t.aspect!==CW/CH&&(t.aspect=CW/CH);const r=fpsEyeH(e)+(e.alt||0)+heightAt(e.x,e.y),n=.1*-e.d.radius;t.position.set(e.x+Math.cos(FPS.yaw)*n,r,e.y+Math.sin(FPS.yaw)*n);const kp=FPS.pitch+(FPS.viewKick||0),a=Math.cos(kp);t.lookAt(t.position.x+Math.cos(FPS.yaw)*a*100,t.position.y+100*Math.sin(kp),t.position.z+Math.sin(FPS.yaw)*a*100),t.fov=FPS.aiming?46:74;e.inside&&(ensureInterior(e.inside),syncInteriorFigures(e.inside));if("inf"===e.d.kind&&(e.d.dmg>0||"engineer"===e.d.role)){const vm=ensureViewmodel(unitViewmodelKind(e));vm.visible=!0;const aim=FPS.aiming,tx=aim?0:.26,ty=aim?-.075:-.3,tz=aim?-.95:-.95,kick=e.muzzle>0?.07*(e.muzzle/.09):0,maxCool=Math.max(.01,e.d.rof*vRof(e)),reloadP=e.cool>0?Math.min(1,e.cool/maxCool):0;let px=tx,py=ty;if(!aim&&e.moving){const bobT=.14*(e.animT||0);px+=.01*Math.sin(bobT),py+=.008*Math.abs(Math.cos(bobT))}py-=.045*reloadP,vm.position.set(px,py,tz+.22*kick),vm.rotation.x=-1.15*kick-.22*reloadP,vm.rotation.z=e.deployed?.14:0;const fl=vm.userData.flash;fl&&(fl.visible=e.muzzle>0,fl.scale.setScalar(.6+2.4*(e.muzzle/.09)))}else FPS.vm&&(FPS.vm.visible=!1);return t.updateProjectionMatrix(),t}

Object.assign(window, {
  projModel, fpsEyeH, enterFPS, exitFPS, fpsTick, leaveGarrison, fpsInteract,
  fpsAimTarget, fpsUpdateAim, fpsShoot, fpsAbilityInfo, throwGrenade, flameNova,
  fpsAbility, buildViewmodel, ensureViewmodel, unitViewmodelKind, interiorHalf,
  panelWall, furnishInterior, ensureInterior, interiorSlotPos, interiorFigurePos,
  humanFigure, syncInteriorFigures, fpsRender,
  FPS, FLOOR_Z,
});

Object.defineProperties(window, {
  fpsPromptTarget: { get: () => fpsPromptTarget, set: v => { fpsPromptTarget = v; }, configurable: true },
  rotateTarget: { get: () => rotateTarget, set: v => { rotateTarget = v; }, configurable: true },
});
