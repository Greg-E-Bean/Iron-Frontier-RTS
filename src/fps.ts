export {};
function projModel(kind,fac){const e=[],glowC="allied"===fac?"#8fe0ff":"soviet"===fac?"#ff9c4a":"yuri"===fac?"#c98cff":"glow",bodyC="soviet"===fac?"#8a7a6a":"allied"===fac?"#d8e8ee":"yuri"===fac?"#7a5f8a":"white",noseC="soviet"===fac?"#c0392b":"allied"===fac?"#3ba0c9":"yuri"===fac?"#8c3fc9":"red",shellC="soviet"===fac?"#e8c04a":"allied"===fac?"#c9d8e0":"yuri"===fac?"#b98cd8":"gold";return"bullet"===kind||"flak"===kind?e.push(P_(CYL(.5,4.5,6),0,0,0,glowC,{ty:PI2,e:1})):"flame"===kind?e.push(P_(CYL(.9,3,6),0,0,0,"yuri"===fac?"#8fe06a":"tibGlit",{ty:PI2,e:1})):"rocket"===kind||"missile"===kind||"aamissile"===kind?(e.push(P_(CYL(.7,4.5,7),0,0,0,bodyC,{ty:PI2})),e.push(P_(CONE(.7,.2,1.6,7),4.5,0,0,noseC,{ty:PI2})),e.push(P_(CYL(.95,1.6,6),-.6,0,0,glowC,{ty:PI2,e:1}))):"bomb"===kind?e.push(P_(CYL(1.1,3.5,8),0,0,0,"darkmetal",{ty:PI2})):"grenade"===kind?(e.push(P_(CYL(1.3,1.9,8),0,0,0,"olive",{ty:PI2})),e.push(P_(CYL(.35,.5,6),0,1.1,0,"darkmetal",{ty:PI2}))):"fshell"===kind?(e.push(P_(CYL(2.6,5,8),-1,0,0,"#ffb040",{ty:PI2,e:1})),e.push(P_(CYL(1.5,6,8),-.5,0,0,"#fff2c0",{ty:PI2,e:1})),e.push(P_(CONE(2.4,.2,11,8),-12,0,0,"#ff5a10",{ty:PI2,e:1}))):e.push(P_(CYL(.55,3.4,6),0,0,0,shellC,{ty:PI2})),e}const FPS={on:!1,u:null,yaw:0,pitch:-.03,cam:null,mv:{f:0,s:0},firing:!1,aiming:!1,look:null,stick:null,vm:null,vvm:null,interact:null,entering:null,viewKick:0,hitFlashT:0,aimTarget:null,aimLockT:0,thirdPerson:!1,tpDist:null,sprinting:!1,stamina:1,crouching:!1,lastStepT:0,damageFlashT:0,damageDir:0,killFlashT:0,lastEngineSfxT:0,deathT:0,jumpT:0,jumpZ:0,chargingGrenade:!1,swimming:!1,nextAmbientT:0,shakeMag:0,shakeX:0,shakeY:0,exitCD:0,sprintLock:!1};let fpsPromptTarget=null;let rotateTarget=null;// FPS/third-person world scale: units (and the player camera) are drawn
// smaller so buildings, trees and terrain read at a realistic size.
const FPS_INF_SC=.22,FPS_VEH_SC=.34;function fpsUnitScale(e){return FPS.on&&e&&e.d?"inf"===e.d.kind?FPS_INF_SC:FPS_VEH_SC:1}function fpsEyeH(e){return fpsUnitScale(e)*("inf"===e.d.kind?19:"kirov"===e.key?44:e.d.fly?22:34)-(FPS.crouching&&"inf"===e.d.kind?6:0)}function enterFPS(e){return!(!GL||!e||e.dead)&&(FPS.cam||(FPS.cam=new THREE.PerspectiveCamera(74,CW/CH,.6,5200),FPS.cam.up.set(0,1,0),GL.scene.add(FPS.cam)),FPS.on=!0,FPS.u=e,FPS.yaw=e.ang,FPS.pitch=-.04,FPS.mv.f=0,FPS.mv.s=0,FPS.firing=!1,FPS.aiming=!1,FPS.interact=null,FPS.sprinting=!1,FPS.stamina=1,FPS.crouching=!1,FPS.tpDist=null,FPS.lastStepT=e.animT||0,FPS.lastEngineSfxT=e.animT||0,FPS.damageFlashT=0,FPS.killFlashT=0,FPS.deathT=0,FPS.jumpT=0,FPS.jumpZ=0,FPS.vm&&(FPS.vm.userData.mag=null,FPS.vm.userData.reloadT=0),FPS.chargingGrenade=!1,FPS.swimming=!1,FPS.nextAmbientT=S.time+rnd(4,10),startFpsAmbience(),e.fps=1,e.order="idle",e.path=null,e.target=null,document.body.classList.add("fps"),document.getElementById("fpsui").classList.remove("hidden"),preFpsSel=S.sel,S.sel=[e],S.autopilot=autopilotEnabled&&0===e.owner&&!(S.mission&&S.mission.hero)&&S.blds.some(b=>b.owner===0&&!b.dead),S.autopilot&&(S.players[0].ai.mimicProfile=inferPlayerProfile(S.players[0])),"inf"===e.d.kind&&!fpsHintShown&&(fpsHintShown=!0,hint("SPACE to jump · hold ABILITY to aim & throw grenade")),!0)}let fpsHintShown=!1;let preFpsSel:any[]=[];function exitFPS(){stopFpsAmbience(),FPS.cam&&FPS.cam.up.set(0,1,0),grenadeArc&&(grenadeArc.visible=!1),FPS.chargingGrenade=!1,FPS.u&&(FPS.u.fps=0,FPS.u.order="idle",FPS.u.path=null),FPS.on=!1,FPS.u=null,FPS.firing=!1,FPS.aiming=!1,FPS.interact=null,FPS.deathT=0,S.sel=preFpsSel.filter(u=>!u.dead),preFpsSel=[],S.autopilot=!1,S.players[0]&&(S.players[0].ai.mimicProfile=null),document.exitPointerLock&&document.pointerLockElement&&document.exitPointerLock(),document.body.classList.remove("fps"),document.getElementById("fpsui").classList.add("hidden")}
let grenadeArc=null;
function ensureGrenadeArc(){if(grenadeArc)return grenadeArc;const N=14,pos=new Float32Array(3*N),geo=new THREE.BufferGeometry;geo.setAttribute("position",new THREE.BufferAttribute(pos,3));const mat=new THREE.LineDashedMaterial({color:16764778,dashSize:4,gapSize:3,transparent:!0,opacity:.85,depthTest:!1});const line=new THREE.Line(geo,mat);return line.frustumCulled=!1,line.visible=!1,line.renderOrder=999,GL.scene.add(line),grenadeArc=line,line}
function fpsPassable(x,y,e){if(passableAt(x,y,e))return!0;if("inf"!==e.d.kind)return!1;const tx=Math.floor(x/32),ty=Math.floor(y/32);if(!inMap(tx,ty))return!1;const o=idx(tx,ty);if(G.terr[o]<2)return!1;const s=G.occ[o];if(0!==s){const b=S.blds.find(b=>b.id===s);if(b&&!b.dead)return!1}return!0}
function fpsJump(){const t=FPS.u;t&&!t.dead&&"inf"===t.d.kind&&!FPS.swimming&&!(FPS.jumpT>0)&&(FPS.jumpT=1e-4,sfx("jump"))}
const JUMP_DUR=.62,JUMP_H=13;
const DEATH_DUR=2.6;
function fpsDeathTick(dt){FPS.deathT<=0&&sfx("death"),FPS.firing=!1,FPS.aiming=!1,FPS.deathT=Math.min(DEATH_DUR,(FPS.deathT||0)+dt),FPS.deathT>=DEATH_DUR&&exitFPS()}function fpsTick(e){const t=FPS.u;if(!t)return void exitFPS();if(t.dead)return void fpsDeathTick(e);t.fps=1,t.order="idle",t.path=null,t.target=null;t.cool>0&&(t.cool-=e);t.muzzle>0&&(t.muzzle-=e);t.recoil>0&&(t.recoil=Math.max(0,t.recoil-6*e));t.hitT>0&&(t.hitT-=e);t.abilityCD>0&&(t.abilityCD-=e);FPS.viewKick&&(FPS.viewKick=Math.max(0,FPS.viewKick-4*e));FPS.hitFlashT>0&&(FPS.hitFlashT-=e);FPS.killFlashT>0&&(FPS.killFlashT=Math.max(0,FPS.killFlashT-e));FPS.damageFlashT>0&&(FPS.damageFlashT=Math.max(0,FPS.damageFlashT-1.4*e));S.time>=(FPS.nextAmbientT||0)&&(FPS.nextAmbientT=S.time+rnd(5,14),sfx(Math.random()<.55?"distant_gun":"distant_boom"));FPS.shakeMag>0?(FPS.shakeMag=Math.max(0,FPS.shakeMag-1.8*e),FPS.shakeX+=((Math.random()-.5)*FPS.shakeMag-FPS.shakeX)*Math.min(1,12*e),FPS.shakeY+=((Math.random()-.5)*FPS.shakeMag-FPS.shakeY)*Math.min(1,12*e)):(FPS.shakeX=0,FPS.shakeY=0);if(FPS.jumpT>0){FPS.jumpT+=e;const p=Math.min(1,FPS.jumpT/JUMP_DUR);FPS.jumpZ=JUMP_H*4*p*(1-p),p>=1&&(FPS.jumpT=0,FPS.jumpZ=0,sfx("land"))}const sprintOk="inf"===t.d.kind&&FPS.sprinting&&!FPS.aiming&&!FPS.crouching;sprintOk&&t.moving?(FPS.stamina=Math.max(0,(FPS.stamina??1)-e/3),0===FPS.stamina&&(FPS.sprinting=!1)):FPS.stamina=Math.min(1,(FPS.stamina??1)+e/2.2);if(FPS.vm&&FPS.vm.userData.reloadT>0){FPS.vm.userData.reloadT=Math.max(0,FPS.vm.userData.reloadT-e);const magSize=MAG_SIZE[FPS.vm.userData.magFamily];0===FPS.vm.userData.reloadT&&magSize&&(FPS.vm.userData.mag=magSize,sfx("reload"))}if(t.d.fly){const _wa=t.d.alt||0;t.alt=void 0===t.alt?_wa:t.alt+clamp(_wa-t.alt,-70*e,70*e)}const r="inf"===t.d.kind?7:2.9;t.ang+=clamp(angDiff(t.ang,FPS.yaw),-r*e,r*e),t.d.turret?t.tang=FPS.yaw:t.tang=t.ang;const n=FPS.mv.f,a=FPS.mv.s,o=Math.hypot(n,a);if(o>.06){const r=t.d.speed*("inf"===t.d.kind?1:.7)*(t.slowT>0?.5:1)*Math.min(1,o)*("inf"===t.d.kind?FPS.crouching?.55:sprintOk&&FPS.stamina>0?1.5:1:1)*(FPS.swimming?.5:1);let s,i;if("inf"===t.d.kind){const e=FPS.yaw;s=Math.cos(e)*n-Math.sin(e)*a,i=Math.sin(e)*n+Math.cos(e)*a;const r=Math.hypot(s,i)||1;s/=r,i/=r,t.ang=FPS.yaw}else{const e=Math.max(0,Math.cos(angDiff(t.ang,FPS.yaw))),r=(n<0?-.5:e*e*.55+.45*e)*Math.sign(n||1);s=Math.cos(t.ang)*r,i=Math.sin(t.ang)*r}const l=t.x+s*r*e,c=t.y+i*r*e;let d=t.x,f=t.y;if(t.inside&&fpsDoorExit(t,l,c)){}else if(t.inside){const b=t.inside,hw=interiorHalf(b)-8;t.x=clamp(l,b.x-hw,b.x+hw),t.y=clamp(c,b.y-hw,b.y+hw);if(b.furnCols&&!(b.d.roof&&(t.alt||0)>FLOOR_Z+20))for(const fc of b.furnCols){if(fc.o)continue;const dx=t.x-(b.x+fc.x),dz=t.y-(b.y+fc.z);if(fc.hw){const px=fc.hw+3-Math.abs(dx),pz=fc.hd+3-Math.abs(dz);px>0&&pz>0&&(px<pz?t.x+=Math.sign(dx||1)*px:t.y+=Math.sign(dz||1)*pz);continue}const dd=Math.hypot(dx,dz),minD=fc.r+3;if(dd<minD&&dd>.01){const push=(minD-dd)/dd;t.x+=dx*push,t.y+=dz*push}}if(b.d.roof){const lx=t.x-b.x,lz=t.y-b.y,zA=hw-STAIR_GAP,zB=hw;if(Math.abs(lx)<8&&lz>=zA&&lz<=zB){const p=clamp((lz-zA)/(zB-zA),0,1);t.alt=FLOOR_Z+p*(ROOF_Z-FLOOR_Z)}else t.alt=(void 0!==t.alt?t.alt:FLOOR_Z)>(FLOOR_Z+ROOF_Z)/2?ROOF_Z:FLOOR_Z}}else{const _fi=tileOfU(t);fpsPassable(l,c,t)?(t.x=l,t.y=c):fpsPassable(l,t.y,t)?t.x=l:fpsPassable(t.x,c,t)&&(t.y=c),t.x=clamp(t.x,6,2938),t.y=clamp(t.y,6,2298),G.hasOver&&syncLevel(t,_fi)}if("inf"===t.d.kind&&!t.inside){const wtx=Math.floor(t.x/32),wty=Math.floor(t.y/32);FPS.swimming=inMap(wtx,wty)&&G.terr[idx(wtx,wty)]>=2}else FPS.swimming=!1;const h=Math.hypot(t.x-d,t.y-f);t.animT=(t.animT||0)+h,t.moving=h>.05,t.moving&&"inf"===t.d.kind&&!t.inside&&!(FPS.jumpT>0)&&(t.animT-(FPS.lastStepT||0)>=(FPS.crouching?17:sprintOk&&FPS.stamina>0?30:22)&&(FPS.lastStepT=t.animT,sfx(FPS.swimming?"splash":"step"))),t.moving&&"inf"!==t.d.kind&&(t.animT-(FPS.lastEngineSfxT||0)>=(t.d.fly?26:t.d.naval?40:18)&&(FPS.lastEngineSfxT=t.animT,sfx(t.d.fly?"engine_air":t.d.naval?"engine_sea":"engine_gnd")),t.d.naval?Math.random()<.18&&S.fx.push({kind:"smoke",x:t.x-Math.cos(t.ang)*t.d.radius,y:t.y-Math.sin(t.ang)*t.d.radius,z:1,s:.4,c:"#e4f2f5",t:0,life:.5}):(Math.random()<.06&&S.fx.push({kind:"smoke",x:t.x-Math.cos(t.ang)*t.d.radius,y:t.y-Math.sin(t.ang)*t.d.radius,z:2,s:.35,c:"#8a7f6a",t:0,life:.55}),trackPair(t)))}else t.moving=!1;if("inf"===t.d.kind){if(t.inside)FPS.interact=t.inside;else{let bb=null,bd=1e9;for(const b of S.blds){if(!fpsEnterable(b))continue;const dx=b.x-t.x,dy=b.y-t.y,dst=Math.hypot(dx,dy),thr=16*b.size+55;dst<thr&&dst<bd&&(bd=dst,bb=b)}FPS.interact=bb,bb&&Math.hypot(Math.max(0,Math.abs(bb.x-t.x)-16*bb.size),Math.max(0,Math.abs(bb.y-t.y)-16*bb.size))<14&&S.time>(FPS.exitCD||0)&&enterGarrison(t,bb)&&fpsEnterDoor(t,bb)}}else FPS.interact=null;fpsUpdateAim(t,e),FPS.firing&&fpsShoot(t)}
function leaveGarrison(u){const b=u.inside;if(!b)return;b.garrison=(b.garrison||[]).filter(x=>x!==u),u.inside=null,u.alt=0;const r=nearestFree(b.tx+irnd(0,b.size-1),b.ty+irnd(0,b.size-1),walkable);r?(u.x=32*r[0]+16,u.y=32*r[1]+16):(u.x=b.x,u.y=b.y+16*b.size+14),u.order="idle",b.d.civ&&!b.garrison.length&&(b.owner=NEUTRAL)}
function fpsBeingTargeted(e){return S.units.some(u=>!u.dead&&u.owner!==e.owner&&teamOf(u.owner)!==teamOf(e.owner)&&u.target===e&&("attack"===u.order||"amove"===u.order))}
function fpsEnterDoor(u,b){if(b.d.roof)return!0;u.x=b.x,u.y=b.y+interiorHalf(b)-16,FPS.yaw=-Math.PI/2,u.ang=FPS.yaw,FPS.pitch=0;return!0}
function fpsDoorExit(u,nx,ny){const b=u.inside,H=interiorHalf(b),dw=Math.min(22,1.1*H)/2-2.5;if(ny-b.y<=H-7||Math.abs(nx-b.x)>dw||b.d.roof&&(u.alt||0)>FLOOR_Z+20)return!1;const ox=nx-b.x;leaveGarrison(u);const ex=b.x+.6*ox,ey=b.y+16*b.size+14;fpsPassable(ex,ey,u)&&(u.x=ex,u.y=ey),FPS.exitCD=S.time+1.6,u.ang=FPS.yaw,hint("Left the building");return!0}
function fpsInteract(){const e=FPS.u;if(!e||e.dead||"inf"!==e.d.kind)return;e.inside?(leaveGarrison(e),hint("Left the building")):FPS.interact&&enterGarrison(e,FPS.interact)&&fpsEnterDoor(e,FPS.interact),e.inside||(FPS.exitCD=S.time+1.6)}
function fpsCanPlantBomb(){const e=FPS.u,b=e&&e.inside;return!!(e&&!e.dead&&e.d.c4&&b&&!b.dead&&b.owner!==NEUTRAL&&b.owner!==e.owner&&teamOf(b.owner)!==teamOf(e.owner)&&!(b.bombT>0))}
function bombProp(){const g=new THREE.Group,body=new THREE.Mesh(new THREE.CylinderGeometry(3,3.6,4.2,10),new THREE.MeshStandardMaterial({color:0x24211d,roughness:.55,metalness:.3})),strap=new THREE.Mesh(new THREE.TorusGeometry(3.2,.4,6,14),new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:.5,metalness:.6})),blink=new THREE.Mesh(new THREE.SphereGeometry(.55,8,6),new THREE.MeshBasicMaterial({color:0xff2a1a})),light=new THREE.PointLight(0xff2a1a,1.2,50,2);body.position.y=2.1,strap.rotation.x=Math.PI/2,strap.position.y=2.1,blink.position.y=4.3,light.position.y=4.3;return g.add(body,strap,blink,light),g.userData.blink=blink,g.userData.light=light,g}
function fpsPlantBomb(){if(!fpsCanPlantBomb())return;const e=FPS.u,b=e.inside,fuse=8;b.bombT=fuse,b.bombFuse=fuse,b.bombOwner=e.owner;const floorZ=b.d.roof?FLOOR_Z:0,mesh=bombProp();mesh.position.set(e.x-b.x,floorZ,e.y-b.y),ensureInterior(b).add(mesh),b.bombMesh=mesh,sfx("place"),hint("Charge set — "+fuse+"s! Get clear!")}
function syncBombProp(bld){const mesh=bld.bombMesh;if(!mesh)return;const p=1-Math.max(0,bld.bombT||0)/Math.max(.01,bld.bombFuse||8),hz=2+10*p,pulse=.5+.5*Math.sin(S.time*6.283*hz);mesh.userData.blink.material.color.setRGB(1,.15+.1*pulse,.1),mesh.userData.light.intensity=.6+1.4*pulse}function fpsAimTarget(e){const t=e.d,w=heroWpn(e),aim=FPS.aiming,r=1.05*(w.range||120)*(aim?1.2:1),coneMin=(aim?.975:.945)-(FPS.crouching?.02:0),n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw);let o=null,s=-1;const i=arr=>{for(const l of arr){if(l.dead||l.owner===e.owner||void 0===l.owner)continue;if("u"===l.e&&l.inside&&l.inside!==e.inside)continue;const p="u"===l.e&&l.inside?interiorFigurePos(l):{x:l.x,y:l.y};const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy);if(d>r||d<1)continue;if("u"===l.e&&(l.alt||0)>2&&!t.aa&&!l.inside)continue;if("b"===l.e&&t.noBld)continue;const f=(dx*n+dy*a)/d;if(f<coneMin)continue;if(!e.inside&&!((l.alt||0)>2)&&!hasLineOfFire(e.x,e.y,p.x,p.y,heightAt(e.x,e.y)+losEyeH(e),heightAt(p.x,p.y)+losEyeH(l),"b"===l.e?l.id:void 0))continue;const h=1e3*f-.05*d;h>s&&(s=h,o=l)}};return i(S.units),i(S.blds),o}
function fpsUpdateAim(e,dt){const tgt=fpsAimTarget(e);FPS.aimLockT=tgt&&tgt===FPS.aimTarget?(FPS.aimLockT||0)+dt:0,FPS.aimTarget=tgt}
const MAG_SIZE={rifle:24,sniper:5,flak:8,pistol:10};
const RELOAD_DUR=1.6;
function fpsReload(){const vm=FPS.vm;if(!vm||!FPS.u||FPS.u.dead)return;const mag=MAG_SIZE[vm.userData.magFamily];mag&&!(vm.userData.reloadT>0)&&null!=vm.userData.mag&&vm.userData.mag<mag&&(vm.userData.reloadT=RELOAD_DUR)}
function fpsShoot(e){if(e.cool>0)return;const vm=FPS.vm,magSize=vm&&MAG_SIZE[vm.userData.magFamily];if(magSize&&vm.userData.reloadT>0)return;if(magSize&&null==vm.userData.mag)vm.userData.mag=magSize;const t=e.d,w=heroWpn(e),n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw),r=1.05*(w.range||120)*(FPS.aiming?1.2:1),o=fpsAimTarget(e);FPS.viewKick=Math.min(.09,(FPS.viewKick||0)+.028),o?(e.cool=w.rof*vRof(e),"mind"!==t.role?fire(e,o,w):mindTick(e,o)):"mind"!==t.role&&w.dmg>0&&(e.cool=w.rof*vRof(e),fire(e,{x:e.x+n*r,y:e.y+a*r,e:"u",d:{armor:"veh"},dead:!1} as any,w));magSize&&(vm.userData.akimbo&&(vm.userData.altFire=!vm.userData.altFire),spawnShell(vm),vm.userData.mag--,vm.userData.mag<=0&&(vm.userData.reloadT=RELOAD_DUR,vm.userData.mag=0))}
const FPS_ABILITIES={bullet:{name:"FRAG\nGRENADE",cd:9},flame:{name:"FLAME\nBURST",cd:7},missile:{name:"DIG\nIN",cd:1.5},rocket:{name:"DIG\nIN",cd:1.5}};
function fpsAbilityInfo(e){return e&&"inf"===e.d.kind?FPS_ABILITIES[e.d.proj]||null:null}
function throwGrenade(e){fpsViewmodelThrow();const n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw),range=150,tx=e.x+n*range,ty=e.y+a*range,sp=230;spark(e.x+n*16,e.y+a*16,"#ffb060"),S.projs.push({x:e.x+n*14,y:e.y+a*14,z:9,z0:9,t0:0,dur:Math.max(.4,range/sp),tgt:null,dmg:42,owner:e.owner,by:e,sp,kind:"grenade",ang:FPS.yaw,life:3,splash:55,tx0:tx,ty0:ty,d0:range})}
function flameNova(e){const radius=70,dmg=28;boom(e.x,e.y,2.2,"#ff8a3c");for(const u of S.units){if(u.dead||u===e||u.owner===e.owner||teamOf(u.owner)===teamOf(e.owner))continue;const d=dist(u.x,u.y,e.x,e.y);d<radius&&damage(u,dmg*(1-d/radius),e.owner,e)}sfx("flame"),textFx(e.x,e.y-24,"FLAME BURST","#ff8a3c")}
function fpsAbility(){const e=FPS.u;if(!e||e.dead)return;const info=fpsAbilityInfo(e);if(!info)return void hint("No special ability for this unit");if(e.abilityCD>0)return;const kind=e.d.proj;"bullet"===kind?throwGrenade(e):"flame"===kind?flameNova(e):("missile"===kind||"rocket"===kind)&&e.d.deploy&&toggleDeploy(e),e.abilityCD=info.cd}
function fpsToggleWeapon(){const e=FPS.u;e&&e.d.modes&&(toggleHeroWeapon(e),hint("sniper"===e.heroMode?"SNIPER MODE":"MACHINE GUN MODE"),sfx("sel"))}
function fpsAbilityDown(){const e=FPS.u,info=e&&fpsAbilityInfo(e);info&&!(e.abilityCD>0)&&"bullet"===e.d.proj?FPS.chargingGrenade=!0:fpsAbility()}
function fpsAbilityUp(){FPS.chargingGrenade&&(FPS.chargingGrenade=!1,fpsAbility())}function ensureViewmodel(kind){const u=FPS.u,vk=kind+"|"+(u&&u.key)+"|"+(u&&u.owner);if(FPS.vm&&FPS.vm.userData.vk===vk)return FPS.vm;fgDisposeRig(FPS.vm);FPS.vm=fpsBuildViewmodel(kind,u);FPS.vm.userData.vk=vk;return FPS.vm}
function ensureVehicleViewmodel(e){const vk=e.key+"|"+e.owner;if(FPS.vvm&&FPS.vvm.userData.vk===vk)return FPS.vvm;fgDisposeRig(FPS.vvm);FPS.vvm=fpsBuildCockpit(e);FPS.vvm.userData.vk=vk;return FPS.vvm}
let SHELL_GEO=null,SHELL_MAT=null;function spawnShell(vm){const ej=vm.userData.eject;if(!ej)return;vm.updateMatrixWorld(!0);const p=ej.getWorldPosition(new THREE.Vector3());vm.worldToLocal(p);const bx=p.x,by=p.y,bz=p.z,m=new THREE.Mesh(SHELL_GEO||(SHELL_GEO=new THREE.CylinderGeometry(.0045,.0045,.02,8)),SHELL_MAT||(SHELL_MAT=new THREE.MeshStandardMaterial({color:14071847,roughness:.3,metalness:.85})));m.userData.shared=1,m.position.set(bx,by,bz),m.userData.t0=S.time,m.userData.bx=bx,m.userData.by=by,m.userData.bz=bz,m.userData.dx=.35+.2*Math.random(),m.userData.dy=.28+.2*Math.random(),m.userData.dz=.1+.1*Math.random(),vm.add(m),(vm.userData.shells=vm.userData.shells||[]).push(m)}
function tickShells(vm){const shells=vm.userData.shells;if(!shells||!shells.length)return;for(let i=shells.length-1;i>=0;i--){const s=shells[i],dt=S.time-s.userData.t0;if(dt>.45){vm.remove(s),shells.splice(i,1);continue}s.position.set(s.userData.bx+s.userData.dx*dt,s.userData.by+s.userData.dy*dt-2.4*dt*dt,s.userData.bz+s.userData.dz*dt),s.rotation.x=16*dt,s.rotation.z=11*dt}}
const VM_KEY={marksman:"sniper",engineer:"tool",chrono:"beam_temporal",vindicator:"beam_plasma",leech:"beam_drain"};
function unitViewmodelKind(e){return e.heroMode?("sniper"===e.heroMode?"sniper":"rifle"):VM_KEY[e.key]||e.d.proj||"rifle"}
const TOWER_H=150,ROOM_H=66,FLOOR_Z=TOWER_H-ROOM_H-8,ROOF_Z=TOWER_H-2,STAIR_GAP=24,ROOM_H_SHORT=56;
function interiorHalf(bld){return 20*bld.size}
function ensureInteriorMats(){
  if(GL.intMats)return GL.intMats;
  const cloneTex=s=>{const m=s.map.clone();return m.needsUpdate=!0,m};
  const wallTex=cloneTex(GL.surfaces.sConcrete);wallTex.repeat.set(2,1);
  const floorTex=cloneTex(GL.surfaces.sRough);floorTex.repeat.set(3,3);
  const ceilTex=cloneTex(GL.surfaces.sConcrete);ceilTex.repeat.set(3,3);
  const trimTex=cloneTex(GL.surfaces.sMetal);trimTex.repeat.set(2,1);
  GL.intMats={
    wall:new THREE.MeshStandardMaterial({color:9013641,map:wallTex,normalMap:GL.surfaces.sConcrete.normal,roughness:.92,metalness:.02,side:THREE.DoubleSide}),
    floor:new THREE.MeshStandardMaterial({color:7040600,map:floorTex,normalMap:GL.surfaces.sRough.normal,roughness:.95,metalness:0}),
    ceil:new THREE.MeshStandardMaterial({color:5658199,map:ceilTex,normalMap:GL.surfaces.sConcrete.normal,roughness:.97,metalness:0,side:THREE.DoubleSide}),
    trim:new THREE.MeshStandardMaterial({color:3881787,map:trimTex,normalMap:GL.surfaces.sMetal.normal,roughness:.5,metalness:.65}),
    glass:new THREE.MeshStandardMaterial({color:9420504,roughness:.12,metalness:.15,transparent:!0,opacity:.32,side:THREE.DoubleSide}),
  };
  return GL.intMats;
}
function panelWall(w,h,winW,winH,winZ,mat,glassMat){
  const grp=new THREE.Group,segW=(w-winW)/2;
  const panel=(pw,ph,px,py,m?)=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),m||mat);mesh.position.set(px,py,0),grp.add(mesh)};
  if(segW>.4)panel(segW,h,-(winW/2+segW/2),h/2),panel(segW,h,winW/2+segW/2,h/2);
  if(winZ>.4){
    panel(winW,winZ,0,winZ/2);
    glassMat&&panel(winW-2,winH-2,0,winZ+winH/2,glassMat);
  }
  const topH=h-winZ-winH;
  if(topH>.4)panel(winW,topH,0,h-topH/2);
  return grp;
}
const PROD_THEME={conyard:"hq",super:"hq",factory:"assembly",navalyard:"assembly",airfield:"control",barracks:"barracks",power:"reactor",refinery:"silo",silo:"silo",repair:"workshop",lab:"lab",hive:"organic"};
function furnishTheme(theme,c){
  const{g,half:H,floorZ:F,rh,box,cyl,sph,emisMat,metalMat,propMat,im,fac,anims}=c,ro=-1e4,T3=THREE;
  const acc=fac==="soviet"?16734780:fac==="yuri"?13208831:9427199,base=fac==="soviet"?8018490:fac==="yuri"?6969984:10134445,dark=fac==="soviet"?3814440:fac==="yuri"?3549768:3159597;
  const add=(geo,mat,x,y,z,par?)=>{const m=new T3.Mesh(geo,mat);return m.position.set(x,y,z),m.renderOrder=ro+1,(par||g).add(m),m};
  const grp=(x,y,z)=>{const q=new T3.Group;return q.position.set(x,y,z),g.add(q),q};
  const decal=(w,d,x,z,col,em?)=>{const m=new T3.Mesh(new T3.PlaneGeometry(w,d),em?emisMat(col):propMat(col));return m.rotation.x=-Math.PI/2,m.position.set(x,F+.45,z),m.renderOrder=ro+1,g.add(m),m};
  const hazardRect=(w,d,x,z)=>{for(const[sx,sz,ww,dd]of[[0,-d/2,w,1.4],[0,d/2,w,1.4],[-w/2,0,1.4,d],[w/2,0,1.4,d]])decal(ww,dd,x+sx,z+sz,15251968)};
  const screen=(w,h,x,y,z,rotY,col)=>{const m=add(new T3.PlaneGeometry(w,h),emisMat(col),x,y,z);m.rotation.y=rotY;const ph=Math.random()*6;anims.push(t=>{m.material.emissiveIntensity=.55+.3*Math.sin(3.1*t+ph)*Math.sin(7.7*t+2*ph)});return m};
  const console_=(x,z,rotY,w)=>{const q=grp(x,F,z);q.rotation.y=rotY;add(new T3.BoxGeometry(w,9,6),im.trim,0,4.5,0,q);const s=add(new T3.PlaneGeometry(w-2,5),emisMat(acc),0,11.5,-1.6,q);s.rotation.x=-.35;add(new T3.BoxGeometry(w,5.4,1),propMat(dark),0,11.5,-2.2,q).rotation.x=-.35;c.cols.push({x,z,hw:w/2+1,hd:4});const ph=Math.random()*6;anims.push(t=>{s.material.emissiveIntensity=.5+.35*Math.abs(Math.sin(2.3*t+ph))});return q};
  const beacon=(x,y,z)=>{cyl(1.4,2,x,z,y,dark,metalMat(dark));c.cols.pop();const b=add(new T3.BoxGeometry(3.4,1.6,1),emisMat(fac==="yuri"?acc:16753920),x,y+3,z);anims.push(t=>{b.rotation.y=5*t})};
  const crate=(x,z,s,y?)=>box(s,s,s,x,z,y,fac==="yuri"?6969984:fac==="soviet"?6309413:7361622,im.trim);
  const locker=(x,z,rotY)=>{const q=grp(x,F,z);q.rotation.y=rotY;add(new T3.BoxGeometry(7,22,5),metalMat(base),0,11,0,q);add(new T3.BoxGeometry(.4,20,.3),propMat(dark),0,11,2.6,q);for(const ly of[18,19.4])add(new T3.BoxGeometry(5,.3,.2),propMat(dark),0,ly,2.6,q);c.cols.push({x,z,hw:4.5,hd:4.5})};
  for(const[w,ry,px,pz]of[[H*2-2,0,0,-H+.5],[H*2-2,Math.PI/2,-H+.5,0],[H*2-2,Math.PI/2,H-.5,0]]){const m=add(new T3.PlaneGeometry(w,16),new T3.MeshStandardMaterial({color:base,roughness:.7,metalness:.3,side:T3.DoubleSide}),px,F+8,pz);m.rotation.y=ry;const st=add(new T3.PlaneGeometry(w,1.2),emisMat(acc),px,F+16.6,pz);st.rotation.y=ry;st.position[ry?"x":"z"]+=ry?(px<0?.1:-.1):.1;st.material.emissiveIntensity=.5}
  for(let k=-1;k<=1;k++)box(H*2,3,3,0,k*H*.6,F+rh-3,dark,metalMat(dark));c.cols.length-=3;
  if(theme==="assembly"){
    hazardRect(40,34,0,-6);decal(16,H,0,H/2,dark);
    const tt=grp(0,F,-6);add(new T3.CylinderGeometry(17,17,1.6,28),metalMat(4210752),0,.8,0,tt);add(new T3.TorusGeometry(16.4,.35,6,28),emisMat(acc),0,1.7,0,tt).rotation.x=Math.PI/2;
    const veh=new T3.Group;veh.position.y=1.6,tt.add(veh);
    for(const sz of[-6.5,6.5])add(new T3.BoxGeometry(26,5,4),propMat(1579812),0,2.5,sz,veh);
    const hull=add(new T3.BoxGeometry(24,5,11),metalMat(base),0,6.5,0,veh),tur=add(new T3.CylinderGeometry(5,5.6,4,12),metalMat(base),-2,11,0,veh),gun=add(new T3.CylinderGeometry(.9,.9,14,8),metalMat(3355443),6,11.4,0,veh);gun.rotation.z=Math.PI/2;
    c.cols.push({x:0,z:-6,r:18});
    anims.push(t=>{tt.rotation.y=.18*t;const ph=(.06*t)%1;hull.visible=ph>.15,tur.visible=ph>.4,gun.visible=ph>.6;hull.material.color.setHex(ph<.3?5921370:base)});
    for(const sx of[-1,1]){const q=grp(sx*24,F,-6);add(new T3.CylinderGeometry(3,3.6,4,10),metalMat(dark),0,2,0,q);const a1=new T3.Group;a1.position.y=4,q.add(a1);add(new T3.BoxGeometry(2.4,14,2.4),metalMat(15251968),0,7,0,a1);const a2=new T3.Group;a2.position.y=14,a1.add(a2);add(new T3.BoxGeometry(2,10,2),metalMat(15251968),0,5,0,a2);const tip=add(new T3.SphereGeometry(1.2,8,6),emisMat(16775388),0,10.5,0,a2);c.cols.push({x:sx*24,z:-6,r:5});const ph=sx>0?0:2;anims.push(t=>{q.rotation.y=(sx>0?Math.PI:0)+.5*Math.sin(.7*t+ph);a1.rotation.z=-sx*(.55+.2*Math.sin(1.1*t+ph));a2.rotation.z=-sx*(.9+.3*Math.sin(1.7*t+ph));tip.visible=Math.sin(9*t+ph)>-.2;tip.scale.setScalar(.6+.8*Math.random())})}
    const rail=rh-6;for(const sz of[-H+8,H-24])box(H*2-6,2,2,0,sz,F+rail,dark,metalMat(dark));c.cols.length-=2;
    const cr=grp(0,F+rail,0);add(new T3.BoxGeometry(5,4,H*2-26+(H-8-24)*0,),metalMat(15251968),0,0,(-H+8+H-24)/2-0,cr);const hook=add(new T3.CylinderGeometry(.3,.3,rail-26,5),metalMat(2236962),0,-(rail-26)/2,-6,cr);const blk=add(new T3.BoxGeometry(4,3,4),metalMat(15251968),0,-(rail-26)-1.5,-6,cr);
    anims.push(t=>{cr.position.x=(H-14)*Math.sin(.23*t)});
    const belt=grp(0,F,-H+7);add(new T3.BoxGeometry(H*2-10,4,7),im.trim,0,2,0,belt);add(new T3.BoxGeometry(H*2-10,.3,6),propMat(1579812),0,4.2,0,belt);c.cols.push({x:0,z:-H+7,hw:H-5,hd:4});
    const bx=[];for(let i=0;i<5;i++)bx.push(add(new T3.BoxGeometry(4,4,4),propMat([7361622,5921370,9127187][i%3]),0,6.4,0,belt));
    anims.push(t=>{bx.forEach((b,i)=>{b.position.x=((.12*t*20+i*(H*2-12)/5)%(H*2-12))-(H-6)})});
    for(const sx of[-1,1]){for(let i=0;i<3;i++)locker(sx*(H-4),H-14-i*8,sx>0?-Math.PI/2:Math.PI/2);crate(sx*(H-9),-H+20,6),crate(sx*(H-9),-H+20,4,F+6)}
    beacon(-H+4,F+rh-16,-H+4),beacon(H-4,F+rh-16,-H+4);
  }else if(theme==="hq"){
    decal(H*1.3,H*1.3,0,-4,dark);
    box(26,18,7,0,-6,F,dark,im.trim);const map=add(new T3.PlaneGeometry(24,16),emisMat(fac==="yuri"?acc:4251856),0,F+7.3,-6);map.rotation.x=-Math.PI/2;
    const globe=add(new T3.SphereGeometry(5,14,10),new T3.MeshBasicMaterial({color:acc,wireframe:!0,transparent:!0,opacity:.7}),0,F+18,-6);
    const blips=[];for(let i=0;i<5;i++)blips.push(add(new T3.SphereGeometry(.6,6,4),emisMat(i%2?16734780:acc),0,F+7.8,-6));
    anims.push(t=>{globe.rotation.y=.8*t,globe.position.y=F+18+1.2*Math.sin(1.3*t);blips.forEach((b,i)=>{b.position.x=10*Math.sin(.3*t+1.7*i),b.position.z=-6+6*Math.cos(.23*t+2.3*i),b.visible=Math.sin(4*t+i)>-.5})});
    for(let i=-1;i<=1;i++)console_(i*18,-H+6,0,14);for(const sx of[-1,1])console_(sx*(H-6),-10,sx*Math.PI/2*-1,12);
    for(const sx of[-1,1])screen(22,12,sx*16,F+rh-24,-H+.8,0,acc);
    for(const[px,pz]of[[-H+11,-H+11],[H-11,-H+11],[-H+11,H-11],[H-11,H-11]])box(6,6,rh-4,px,pz,F,dark,im.trim);
  }else if(theme==="control"){
    decal(H*1.6,10,0,-H+14,dark);
    for(let i=-2;i<=2;i++)console_(i*14,-H+8,0,12);
    const sw=add(new T3.CircleGeometry(12,32),emisMat(1262640),0,F+rh-24,-H+.8),sweep=add(new T3.PlaneGeometry(12,.8),emisMat(acc),0,F+rh-24,-H+1);sweep.geometry.translate(6,0,0);
    const dots=[];for(let i=0;i<4;i++)dots.push(add(new T3.CircleGeometry(.7,8),emisMat(16734780),0,0,-H+1.1));
    anims.push(t=>{sweep.rotation.z=-2*t;dots.forEach((d,i)=>{const a=1.3*i+.05*t,r=4+2*i;d.position.set(r*Math.cos(a),F+rh-24+r*Math.sin(a),-H+1.1);d.material.emissiveIntensity=Math.max(0,Math.cos(2*t+a))})});
    for(const sx of[-1,1])screen(14,9,sx*24,F+rh-26,-H+.8,0,4251856);
    box(20,12,7,0,8,F,dark,im.trim);const plan=add(new T3.PlaneGeometry(18,10),emisMat(acc),0,F+7.3,8);plan.rotation.x=-Math.PI/2;
    for(const sx of[-1,1])for(let i=0;i<3;i++)cyl(1.6,5,sx*(H-8),-10+i*12,F,dark,metalMat(dark));
    beacon(0,F+rh-8,0);
  }else if(theme==="barracks"){
    for(const sx of[-1,1])for(let i=0;i<3;i++){const bz=-H+12+i*16,bxp=sx*(H-10);if(fac==="yuri"){const pod=cyl(4,16,bxp,bz,F,acc,new T3.MeshStandardMaterial({color:acc,emissive:acc,emissiveIntensity:.35,transparent:!0,opacity:.55}));const ph=i+sx;anims.push(t=>{pod.material.emissiveIntensity=.25+.2*Math.sin(1.5*t+ph)})}else{box(18,8,4,bxp,bz,F+3,base,im.trim),box(18,8,4,bxp,bz,F+13,base,im.trim);for(const lz of[-3.5,3.5])for(const lx of[-8,8])cyl(.5,20,bxp+lx,bz+lz,F,dark,metalMat(dark)),c.cols.pop();box(16,7,1,bxp,bz,F+7.2,15263976),box(16,7,1,bxp,bz,F+17.2,15263976)}}
    for(let i=-2;i<=2;i++)locker(i*9,-H+4,0);
    const rack=grp(-H+2,F,H-22);rack.rotation.y=Math.PI/2;add(new T3.BoxGeometry(16,1,3),propMat(5263440),0,6,0,rack);add(new T3.BoxGeometry(16,1,3),propMat(5263440),0,16,0,rack);for(let i=0;i<5;i++)add(new T3.BoxGeometry(1,14,1.2),metalMat(1710618),-6+3*i,11,.6,rack);
    box(16,10,6,0,-4,F,fac==="soviet"?6309413:7361622,im.trim);const mp=add(new T3.PlaneGeometry(14,8),propMat(12893352),0,F+6.2,-4);mp.rotation.x=-Math.PI/2;
    const dm=grp(H-12,F,H-18);add(new T3.CylinderGeometry(.6,.6,26,6),metalMat(dark),0,13,0,dm);const bag=new T3.Group;bag.position.y=24,dm.add(bag);add(new T3.CylinderGeometry(3,3,11,10),propMat(fac==="soviet"?9127187:5263440),0,-9,0,bag);c.cols.push({x:H-12,z:H-18,r:4});
    anims.push(t=>{bag.rotation.z=.15*Math.sin(2.2*t),bag.rotation.x=.08*Math.sin(1.3*t)});
    crate(-H+8,-H+14,6),crate(-H+8,-H+22,5);
    if(fac==="soviet")for(const sx of[-1,1]){const bn=add(new T3.PlaneGeometry(10,18),emisMat(13122091),sx*14,F+rh-20,-H+.7);bn.material.emissiveIntensity=.25}
  }else if(theme==="reactor"){
    decal(40,40,0,0,dark);
    const coreCol=fac==="yuri"?acc:fac==="soviet"?9427199:6281471,core=cyl(5,rh-4,0,-6,F,coreCol,emisMat(coreCol));c.cols.pop();c.cols.push({x:0,z:-6,r:11});
    const cage=[];for(let i=0;i<8;i++){const a=i*.7854;cyl(.8,rh-6,8*Math.cos(a),-6+8*Math.sin(a),F,3355443,metalMat(3355443));c.cols.pop()}
    const ring=add(new T3.TorusGeometry(9,.7,8,32),metalMat(fac==="soviet"?9127187:5921370),0,F+rh-10,-6),ring2=add(new T3.TorusGeometry(9.5,.45,8,32),emisMat(coreCol),0,F+rh/2,-6);ring.rotation.x=Math.PI/2;
    const arcs=[];if(fac==="soviet")for(let i=0;i<4;i++){const a=add(new T3.CylinderGeometry(.25,.25,10,4),emisMat(12640255),0,F+rh/2,0);arcs.push(a)}
    anims.push(t=>{core.material.emissiveIntensity=.6+.35*Math.sin(2.6*t);ring.rotation.z=.9*t;ring2.rotation.x=Math.PI/2+.5*Math.sin(.8*t),ring2.rotation.y=.6*t;ring2.position.y=F+rh/2+(rh/2-8)*Math.sin(.5*t);arcs.forEach((a,i)=>{const an=Math.random()*6.28;a.position.set(7*Math.cos(an),F+6+Math.random()*(rh-14),-6+7*Math.sin(an)),a.rotation.set(Math.random()*3,0,Math.random()*3),a.visible=Math.random()<.6})});
    for(let i=0;i<4;i++){const a=i*1.5708+.785;cyl(2.2,rh-2,(H-8)*Math.cos(a),(H-8)*Math.sin(a),F,base,metalMat(base))}
    for(const sx of[-1,1])console_(sx*(H-6),0,-sx*Math.PI/2,14);console_(0,-H+6,0,16);
    for(const sx of[-1,1]){const fanG=grp(sx*20,F+rh-3,-H+16),blades=new T3.Group;fanG.add(blades);for(let k=0;k<4;k++){const w=new T3.Group;w.rotation.y=k*1.5708,blades.add(w),add(new T3.BoxGeometry(9,.3,2),metalMat(3355443),4.5,0,0,w)}anims.push(t=>{blades.rotation.y=6*t})}
    beacon(-H+4,F+rh-14,H-4),beacon(H-4,F+rh-14,H-4);
  }else if(theme==="silo"){
    decal(12,H*2-4,0,0,dark);
    const hop=grp(-H+14,F,-H+14);add(new T3.CylinderGeometry(10,4,14,10),metalMat(base),0,20,0,hop);for(const[lx,lz]of[[-6,-6],[6,-6],[-6,6],[6,6]])add(new T3.BoxGeometry(1.2,14,1.2),metalMat(dark),lx,7,lz,hop);c.cols.push({x:-H+14,z:-H+14,r:10});
    const len=H*2-24,belt=grp(4,F,-H+14);add(new T3.BoxGeometry(len,5,7),im.trim,0,2.5,0,belt);add(new T3.BoxGeometry(len,.3,6),propMat(1579812),0,5.2,0,belt);c.cols.push({x:4,z:-H+14,hw:len/2+1,hd:4});
    const oreCol=fac==="yuri"?acc:14064174,ores=[];for(let i=0;i<9;i++)ores.push(add(new T3.DodecahedronGeometry(1.5+.6*(i%3),0),new T3.MeshStandardMaterial({color:oreCol,emissive:oreCol,emissiveIntensity:.25,roughness:.5}),0,7,0,belt));
    const drum=add(new T3.CylinderGeometry(5,5,8,12),metalMat(dark),len/2+2,6,0,belt);drum.rotation.x=Math.PI/2;
    anims.push(t=>{ores.forEach((o,i)=>{o.position.x=((14*t+i*len/9)%len)-len/2,o.rotation.y=t+i,o.rotation.x=.7*t});drum.rotation.y=3*t});
    for(const[px,pz]of[[H-14,6],[H-14,H-16]]){const tk=cyl(8,rh-12,px,pz,F,base,metalMat(base));for(const hy of[8,rh-22])add(new T3.TorusGeometry(8.2,.6,6,20),metalMat(dark),px,F+hy,pz).rotation.x=Math.PI/2;const gl=add(new T3.BoxGeometry(1,rh-20,2.4),emisMat(oreCol),px-8.1,F+(rh-12)/2,pz);const ph=pz;anims.push(t=>{gl.scale.y=.55+.4*Math.sin(.4*t+ph)})}
    console_(-H+6,H-16,Math.PI/2,12);crate(-14,H-10,6),crate(-22,H-10,5);
    beacon(0,F+rh-10,-H+3);
  }else if(theme==="workshop"){
    hazardRect(34,40,0,-4);
    const lift=grp(0,F,-4);add(new T3.BoxGeometry(30,1.2,20),metalMat(15251968),0,.6,0,lift);for(const sx of[-1,1])add(new T3.BoxGeometry(2,1,18),metalMat(dark),sx*10,-.2,0,lift);
    const car=new T3.Group;lift.add(car);for(const sz of[-6,6])add(new T3.BoxGeometry(24,4,3.4),propMat(1579812),0,3.2,sz,car);add(new T3.BoxGeometry(22,5,10),metalMat(base),0,7,0,car);add(new T3.CylinderGeometry(4.4,5,3.4,12),metalMat(base),-1,11,0,car);
    for(const[px,pz]of[[-15,-13],[15,-13],[-15,5],[15,5]])cyl(1.2,26,px,pz,F,dark,metalMat(dark));c.cols.push({x:0,z:-4,hw:15,hd:10});
    const sp=add(new T3.SphereGeometry(1,6,5),emisMat(16775388),0,0,0);
    anims.push(t=>{const u=.5+.5*Math.sin(.35*t);lift.position.y=F+10*Math.max(0,Math.min(1,1.6*u-.3));sp.position.set(8*Math.sin(.9*t),lift.position.y+6+2*Math.sin(3*t),2),sp.visible=Math.sin(11*t)>0,sp.scale.setScalar(.5+Math.random())});
    box(16,6,10,-H+12,H-12,F,15251968*0+13117721,im.trim);for(let i=0;i<4;i++)box(15,5.6,.4,-H+12,H-9.2,F+2+2.2*i,dark);
    const arm=grp(H-12,F,-H+12);add(new T3.CylinderGeometry(3,3.4,5,10),metalMat(dark),0,2.5,0,arm);const aa=new T3.Group;aa.position.y=5,arm.add(aa);add(new T3.BoxGeometry(2.2,16,2.2),metalMat(15251968),0,8,0,aa);c.cols.push({x:H-12,z:-H+12,r:5});anims.push(t=>{arm.rotation.y=.8*Math.sin(.5*t),aa.rotation.z=.5+.3*Math.sin(.9*t)});
    for(let i=0;i<3;i++)locker(-H+4,-H+14+i*8,Math.PI/2);
    beacon(-H+4,F+rh-14,-H+4);
  }else if(theme==="lab"){
    decal(H*1.2,H*1.2,0,-4,dark);
    const liq=fac==="yuri"?8235833:fac==="soviet"?9427199:6881192;
    for(let i=0;i<6;i++){const a=i/6*6.283,px=(H-12)*Math.cos(a)*.95,pz=-4+(H-14)*Math.sin(a)*.9;if(pz>H-22&&Math.abs(px)<14)continue;cyl(4.2,2,px,pz,F,dark,metalMat(dark));const tube=cyl(3.6,18,px,pz,F+2,liq,new T3.MeshStandardMaterial({color:liq,emissive:liq,emissiveIntensity:.35,transparent:!0,opacity:.5}));c.cols.pop();cyl(4.2,2,px,pz,F+20,dark,metalMat(dark));c.cols.pop();const bub=[];for(let k=0;k<3;k++)bub.push(add(new T3.SphereGeometry(.6,6,4),emisMat(16777215),px,F+4,pz));const fig=fac==="yuri"?add(new T3.SphereGeometry(2.2,10,8),propMat(15255215),px,F+11,pz):null;anims.push(t=>{bub.forEach((b,k)=>{const u=((.4*t+k/3+i*.13)%1);b.position.y=F+3+16*u,b.position.x=px+.8*Math.sin(5*u+k)});fig&&(fig.position.y=F+11+.8*Math.sin(.9*t+i))})}
    cyl(6,3,0,-4,F,dark,metalMat(dark));const helix=grp(0,F+6,-4);for(let k=0;k<16;k++)for(const s of[0,Math.PI]){const a=k*.55+s;add(new T3.SphereGeometry(.8,6,4),emisMat(k%2?acc:16777215),3*Math.cos(a),k*1.8,3*Math.sin(a),helix)}
    anims.push(t=>{helix.rotation.y=.7*t});
    console_(-14,-H+6,0,14),console_(14,-H+6,0,14);screen(20,10,0,F+rh-22,-H+.8,0,acc);
  }else{
    decal(H*1.5,H*1.5,0,0,2365479);
    const sac=add(new T3.SphereGeometry(10,16,12),new T3.MeshStandardMaterial({color:9127276,emissive:acc,emissiveIntensity:.3,roughness:.4}),0,F+11,-4);c.cols.push({x:0,z:-4,r:12});
    const veins=[];for(let i=0;i<6;i++){const a=i*1.047,v=add(new T3.CylinderGeometry(.7,1.4,H,6),emisMat(acc),Math.cos(a)*H/2,F+1,-4+Math.sin(a)*H/2);v.rotation.z=Math.PI/2,v.rotation.y=-a;veins.push(v)}
    anims.push(t=>{const p=1+.07*Math.sin(2.4*t)+.03*Math.sin(5.3*t);sac.scale.set(p,1/p*1.02,p),sac.material.emissiveIntensity=.25+.2*Math.sin(2.4*t);veins.forEach((v,i)=>v.material.emissiveIntensity=.4+.4*Math.sin(2.4*t-i*.6))});
    for(const[px,pz]of[[-H+13,-H+13],[H-13,-H+13],[-H+13,H-18],[H-13,H-18]]){cyl(3,rh-10,px,pz,F,6969984,propMat(6969984));const pod=add(new T3.SphereGeometry(4,10,8),new T3.MeshStandardMaterial({color:acc,emissive:acc,emissiveIntensity:.4,transparent:!0,opacity:.7}),px,F+rh-14,pz);const ph=px+pz;anims.push(t=>{pod.position.y=F+rh-14+1.5*Math.sin(1.1*t+ph)})}
    const spores=[];for(let i=0;i<14;i++)spores.push(add(new T3.SphereGeometry(.45,5,4),emisMat(acc),0,0,0));
    anims.push(t=>{spores.forEach((s,i)=>{const u=((.07*t+i/14)%1),a=i*2.4+.3*t;s.position.set((6+i%4*5)*Math.cos(a),F+2+(rh-8)*u,-4+(6+i%4*5)*Math.sin(a))})});
  }
}
const CIV_INT:Record<string,any>={
civ1:(c)=>{const{box,cyl,sph,emisMat,metalMat,im,half:H,floorZ:F,anims}=c;box(20,8,8,-H+14,-H+6,F,4474679,im.trim);const sc=[];for(let k=0;k<3;k++)sc.push(box(5,.6,4,-H+8+6*k,-H+2.6,F+9,8971743,emisMat(8971743)));anims.push(t=>sc.forEach((m,k)=>m.material.emissiveIntensity=.5+.35*Math.sin(3*t+k*1.7)));for(let k=0;k<2;k++)box(18,7,4,H-11,-10+16*k,F+3,6053456,im.trim),box(18,7,4,H-11,-10+16*k,F+12,6053456,im.trim);for(const[x,z]of[[H-19,-13],[H-3,-13],[H-19,9],[H-3,9]])cyl(.5,20,x,z,F,3355443,metalMat(3355443));box(14,10,6,-8,6,F,6309413,im.trim);box(12,8,.3,-8,6,F+6.1,12893352);for(let k=0;k<3;k++)box(14,4,2.4,-H+11,H-5,F+2.4*k,7236176,im.trim);const rack=box(1.4,14,14,-H+1.2,-4,F+4,5263440,im.trim);for(let k=0;k<5;k++)box(.8,1,11,-H+2,-10+3*k,F+5,1710618,metalMat(1710618))},
civ7:(c)=>{const{box,cyl,sph,emisMat,metalMat,propMat,im,half:H,floorZ:F,anims,g}=c;const lift=[box(30,20,1.2,0,-4,F,15251968,metalMat(15251968)),box(22,10,5,0,-4,F+3.4,9127187,metalMat(9127187)),box(13,9,4,-1,-4,F+8.4,9127187,metalMat(9127187)),box(12.4,8.6,3,-1,-4,F+8.6,9420504,im.trim)];for(const[x,z]of[[-7,-9.6],[7,-9.6],[-7,1.6],[7,1.6]])lift.push(cyl(2.2,1.4,x,z,F+1.4,1315860));for(const[x,z]of[[-14,-13],[14,-13],[-14,5],[14,5]])cyl(.8,18,x,z,F,3355443,metalMat(3355443));const base=lift.map(m=>m.position.y);anims.push(t=>{const u=7*Math.max(0,Math.min(1,.5+.8*Math.sin(.35*t)));lift.forEach((m,k)=>m.position.y=base[k]+u)});box(24,7,8,-H+16,H-6,F,7228205,im.trim);for(let k=0;k<6;k++)box(1,1,4,-H+8+3*k,H-6,F+8,3355443,metalMat(3355443));const sp=sph(1,-H+14,H-6,F+9.5,16775388,emisMat(16775388));anims.push(t=>{sp.visible=Math.sin(13*t)>0,sp.scale.setScalar(.5+Math.random())});for(let k=0;k<4;k++)cyl(3.4,1.6,H-6,H-6,F+1.6*k,1315860);for(let k=0;k<3;k++)cyl(2.4,7,H-6-5*k,-H+5,F,k%2?9127187:3947580,metalMat(3947580));box(4,16,26,-H+2,-10,F,4868682,im.trim);for(let k=0;k<4;k++)box(4,16,.6,-H+2.4,-10,F+6*k,6316646)},
civ9:(c)=>{const{box,cyl,sph,emisMat,metalMat,propMat,im,half:H,floorZ:F,anims,g}=c;const rug=box(26,20,.3,-10,-8,F,7084852);box(20,7,6,-10,-18,F,4876938,im.trim),box(20,2,5,-10,-21,F+6,4876938,im.trim);box(7,7,6,-24,-6,F,4876938,im.trim);box(10,6,3.6,-10,-7,F,6309413,im.trim);const tv=box(14,1,8,-10,4,F+6,1052688);const scr=box(12,.4,6.6,-10,3.4,F+6.7,9420504,emisMat(9420504));box(16,5,6,-10,5,F,4868682,im.trim);anims.push(t=>{scr.material.emissiveIntensity=.35+.3*Math.abs(Math.sin(2.1*t)*Math.sin(5.3*t)),scr.material.color.setHSL(.55+.1*Math.sin(.7*t),.4,.6)});box(14,9,6,H-14,-12,F,6309413,im.trim);for(const[x,z]of[[H-20,-12],[H-8,-12],[H-14,-18],[H-14,-6]])box(3.4,3.4,4,x,z,F,4868682,im.trim);box(6,22,9,H-4,12,F,13421772,im.trim);box(6,8,16,H-4,-H+6,F,14277081,metalMat(14277081));for(let k=0;k<3;k++)box(4,22,.6,-H+2,H-16,F+6+7*k,6309413),box(4,20,5,-H+2,H-16,F+6.6+7*k,[9127187,3947580,7361622][k]);cyl(.4,18,-24,12,F,3355443,metalMat(3355443));const lamp=sph(2,-24,12,F+18,16767134,emisMat(16767134));anims.push(t=>lamp.material.emissiveIntensity=.8+.05*Math.sin(9*t))},
paradropHangar:(c)=>{const{box,cyl,sph,emisMat,metalMat,propMat,im,half:H,floorZ:F,anims}=c;for(let k=0;k<3;k++)for(let j=0;j<2;j++)box(8,8,6,-H+8+10*k,-H+8,F+6*j,7361622,im.trim);for(let k=0;k<4;k++)sph(3,-H+8+8*k,-H+18,F+22,15592941,propMat(15592941)),cyl(.1,8,-H+8+8*k,-H+18,F+14,3355443);for(const sx of[-1,1])box(3,30,4,sx*(H-6),4,F,5263440,im.trim);box(2,6,12,H-2,-18,F+8,3355443,im.trim);const lr=sph(1.4,H-3,-20,F+18,16734780,emisMat(16734780)),lg=sph(1.4,H-3,-16,F+18,4250176,emisMat(4250176));anims.push(t=>{const on=Math.sin(1.2*t)>0;lr.visible=!on,lg.visible=on});box(16,1,10,0,-H+1,F+14,12893352,im.trim);for(let k=0;k<5;k++)box(2,.6,2,-5+2.5*k,-H+1.6,F+16+(k%2)*3,16734780)},
empTower:(c)=>{const{box,cyl,sph,emisMat,metalMat,im,half:H,floorZ:F,rh,anims}=c;const core=cyl(5,rh-6,0,-6,F,9427199,emisMat(9427199));const rings=[];for(let k=0;k<4;k++)rings.push(cyl(8,1.2,0,-6,F+8+10*k,9427199,emisMat(9427199)));c.cols.length-=4;anims.push(t=>{core.material.emissiveIntensity=.6+.4*Math.abs(Math.sin(4*t)),rings.forEach((m,k)=>{m.position.y=F+8+10*k+2*Math.sin(2*t+k)})});for(let k=0;k<4;k++){const a=k*1.571+.78;box(6,6,14,Math.cos(a)*(H-10),-6+Math.sin(a)*(H-14),F,3355443,im.trim);sph(1.2,Math.cos(a)*(H-10),-6+Math.sin(a)*(H-14),F+14,9427199,emisMat(9427199))}for(const sx of[-1,1])box(12,6,9,sx*16,H-8,F,2960939,im.trim),box(10,.5,5,sx*16,H-11.2,F+9.5,9427199,emisMat(9427199))},
rogueDen:(c)=>{const{box,cyl,sph,emisMat,metalMat,propMat,im,half:H,floorZ:F,anims}=c;cyl(3,6,0,-4,F,3947580,metalMat(3947580));const fire=sph(2.4,0,-4,F+5,16753920,emisMat(16753920));anims.push(t=>{fire.scale.setScalar(.8+.3*Math.random()),fire.material.emissiveIntensity=.7+.4*Math.random()});for(let k=0;k<3;k++)box(14,7,2,-H+10,-H+8+10*k,F,6572845,im.trim);box(12,12,6,H-12,-H+12,F,6309413,im.trim);for(let k=0;k<4;k++)box(2.4,3.4,.2,H-15+2*k,-H+12,F+6.1,[16777215,13378082,16753920,16777215][k]);for(const[x,z]of[[H-12,-H+4],[H-4,-H+12]])box(3,3,4,x,z,F,4868682,im.trim);for(let k=0;k<5;k++)cyl(2,5,-H+5+4.5*k,H-5,F,k%2?9127187:3947580,metalMat(3947580));box(30,.6,14,4,-H+.6,F+10,13378082,emisMat(13378082)).material.emissiveIntensity=.25;box(1.2,14,12,H-1.2,8,F+4,5263440,im.trim)},
bridgehut:(c)=>{const{box,cyl,sph,emisMat,metalMat,im,half:H,floorZ:F,anims}=c;box(12,6,7,-H+8,-H+5,F,5263440,im.trim);const rad=box(4,3,3,-H+6,-H+5,F+7,3355443,metalMat(3355443));const led=sph(.6,-H+8,-H+4,F+10.5,4250176,emisMat(4250176));anims.push(t=>led.visible=Math.sin(5*t)>0);box(4,4,5,H-6,-H+6,F,6309413,im.trim);cyl(2.4,6,H-6,H-6,F,3947580,metalMat(3947580))},
oilDerek:(c)=>{const{box,cyl,sph,emisMat,metalMat,im,half:H,floorZ:F,anims,g}=c;for(let k=0;k<3;k++)cyl(2,H*1.6,-H+6+10*k,0,F+3,6316646,metalMat(6316646)),c.cols.pop();box(22,8,10,0,-H+6,F,3355443,im.trim);const gs=[];for(let k=0;k<4;k++)gs.push(box(3,.5,3,-8+5.4*k,-H+10.3,F+11,16766814,emisMat(16766814)));anims.push(t=>gs.forEach((m,k)=>m.material.emissiveIntensity=.4+.4*Math.abs(Math.sin(1.3*t+k))));const wh=cyl(4,1,H-8,H-8,F+12,13378082,metalMat(13378082));anims.push(t=>wh.rotation.y=.8*t);cyl(1,12,H-8,H-8,F,3355443,metalMat(3355443));for(let k=0;k<3;k++)cyl(3,8,-H+6+7*k,H-8,F,1315860)}
};
function furnishInterior(g,bld,half,floorZ,tall){
  const ro=-1e4,im=ensureInteriorMats(),cols=[];
  const propMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.8,metalness:.05}),
    metalMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.4,metalness:.7}),
    emisMat=c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.85,roughness:.4});
  const box=(w,d,h,x,z,y,color,mat?)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||propMat(color));m.position.set(x,(void 0===y?floorZ:y)+h/2,z),m.renderOrder=ro+1,g.add(m),cols.push({x,z,hw:w/2+.5,hd:d/2+.5,o:(void 0===y?floorZ:y)>floorZ+18||h<1.2?1:0});return m};
  const cyl=(r,h,x,z,y,color,mat?)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),mat||propMat(color));m.position.set(x,(void 0===y?floorZ:y)+h/2,z),m.renderOrder=ro+1,g.add(m),cols.push({x,z,r:r+1,o:(void 0===y?floorZ:y)>floorZ+18?1:0});return m};
  const sph=(r,x,z,y,color,mat?)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),mat||propMat(color));m.position.set(x,(void 0===y?floorZ:y)+r,z),m.renderOrder=ro+1,g.add(m),cols.push({x,z,r:r+1,o:(void 0===y?floorZ:y)>floorZ+18?1:0});return m};
  const owner=bld.owner;
  if(void 0!==owner&&owner!==NEUTRAL){
    const pal=S.players[owner]?palette(owner):null,accent=pal&&pal.body||"#8fe0ff",flag=new THREE.Mesh(new THREE.PlaneGeometry(10,14),new THREE.MeshStandardMaterial({color:new THREE.Color(accent),roughness:.6,side:THREE.DoubleSide}));
    flag.position.set(0,floorZ+(tall?ROOM_H:ROOM_H_SHORT)-14,-half+.6),flag.renderOrder=ro+1,g.add(flag);
  }
  const key=bld.key;
  if("civ3"===key){
    box(42,12,18,-6,-half+13,floorZ,3811360,im.trim),box(12,12,22,22,-half+13,floorZ,3811360,im.trim);
    box(46,13,1.5,-6,-half+13,floorZ+18,1842207),box(13,13,1.5,22,-half+13,floorZ+22,1842207);
    box(10,1,7,-16,-half+9,floorZ+19,8568544,emisMat(8568544)),cyl(.8,9,-2,-half+9,floorZ+19,3618876,im.trim),box(4,4,3,-4,-half+8,floorZ+27,3811360);
    box(50,2,10,-6,-half+1,floorZ+40,11045448);
    cyl(7,3,-6,-half+24,floorZ,2105378,im.trim),box(7,1,10,-6,-half+28,floorZ+3,2105378),cyl(1,15,-6,-half+24,floorZ+3,3618876,metalMat(3618876));
    for(const[ex,pz]of[[half-.5,-16],[half-.5,14]])box(1,18,38,ex,pz,floorZ,9869467,im.trim),box(.6,8,34,ex-.5,pz-4.5,floorZ,6316646),box(.6,8,34,ex-.5,pz+4.5,floorZ,6316646),box(.6,4,4,ex-.5,pz,floorZ+40,16762970,emisMat(16762970));
    box(.8,3,6,half-.5,-1,floorZ+18,9869467,im.trim);
    box(1.5,22,28,half-.5,half-14,floorZ+9,3946290),box(1,20,26,half-1,half-14,floorZ+10,15460578);
    box(30,24,.3,-half+20,15,floorZ+.3,7086630),box(14,10,1,-half+20,15,floorZ+8,11847885);
    for(const[lx,lz]of[[-half+15,10],[-half+25,10],[-half+15,20],[-half+25,20]])cyl(.6,8,lx,lz,floorZ,4074528,im.trim);
    cyl(7,3,-half+8,4,floorZ,4479076,im.trim),box(9,1,10,-half+8,0,floorZ+3,4479076),cyl(7,3,-half+32,26,floorZ,4479076,im.trim),box(9,1,10,-half+32,30,floorZ+3,4479076);
    cyl(4,10,-half+8,26,floorZ,5913642,im.trim),sph(7,-half+8,26,floorZ+10,3173434),sph(5,-half+6,28,floorZ+15,3173434);
  }else if("civ5"===key){
    box(7,6,11,-25,-24,floorZ,2829099,metalMat(2829099)),cyl(1,22,-25,-24,floorZ+11,3815994,metalMat(3815994));
    box(13,6,8,-25,-10,floorZ,7029795,im.trim),box(13,6,.6,-25,-10,floorZ+8,9132587);
    cyl(2.5,2,-19,-9,floorZ+8,15263976,im.trim),sph(1.3,-16,-9,floorZ+9,3829413);
    box(9,9,1,-14,-20,floorZ+9,9132587,im.trim);
    for(const[lx,lz]of[[-18,-24],[-10,-24],[-18,-16],[-10,-16]])cyl(.4,9,lx,lz,floorZ,9132587,im.trim);
    for(const cx of[-18,-10])box(5,5,6,cx,-27,floorZ,9132587,im.trim);
    box(15,6,7,-22,10,floorZ,8010566,im.trim),box(15,1,2,-22,7,floorZ+6,4861722);
    box(7,7,7,-11,18,floorZ,4876938,im.trim);
    box(7,5,3,-18,18,floorZ+3,7029795,im.trim);
    const rug=new THREE.Mesh(new THREE.PlaneGeometry(14,18),propMat(3107642));rug.rotation.x=-Math.PI/2,rug.position.set(-18,floorZ+.4,13),rug.renderOrder=ro+1,g.add(rug);
    box(14,20,3,20,-6,floorZ,2829099,metalMat(2829099)),box(13,19,2.5,20,-6,floorZ+3,14736584),box(5,4,2,20,-14,floorZ+6,16117984),box(13,9,1,20,0,floorZ+6.5,9120812);
    box(9,6,18,26,20,floorZ,5913114,im.trim);
    box(5,5,6,14,-6,floorZ,7029795,im.trim),cyl(1,4,14,-6,floorZ+6,3815994,metalMat(3815994)),sph(2,14,-6,floorZ+10,16107898,emisMat(16107898));
    box(.6,10,16,half-.6,20,floorZ+16,4861722,im.trim),box(.4,8,14,half-.8,20,floorZ+16,12113120,metalMat(12113120));
    box(50,.5,.5,0,-28,floorZ+45,3815994,metalMat(3815994));
    box(3,1,5,-15,-28,floorZ+38,13213856,im.trim),box(3,1,5,0,-28,floorZ+38,10533065,im.trim),box(3,1,4,15,-28,floorZ+37,13224352,im.trim);
  }else if("civ6"===key){
    for(const[sx,awn]of[[-20,9186600],[0,3628855],[20,9861190]]){
      box(16,6,10,sx,-27,floorZ,7029795,im.trim),box(17,6.5,1,sx,-27,floorZ+10,9132587);
      box(15,3,18,sx,-30.5,floorZ,7029795,im.trim),box(14,2.5,.8,sx,-29.5,floorZ+8,9132587),box(14,2.5,.8,sx,-29.5,floorZ+14,9132587);
      box(5,5,4,sx-4,-26,floorZ+10,9201985,im.trim),box(5,5,4,sx+4,-26,floorZ+10,6572845,im.trim);
      cyl(1,30,sx-8,-24,floorZ,5258275,im.trim),cyl(1,30,sx+8,-24,floorZ,5258275,im.trim);
      box(18,10,1,sx,-20,floorZ+30,awn);
    }
    box(.3,.3,10,0,-20,floorZ+22,5258275,im.trim);
    for(const[dx,pc]of[[-6,11152685],[0,13137960],[6,13808700]])sph(2,dx,-20,floorZ+21,pc);
    for(const[bx,bz]of[[14,10],[24,10],[19,19]]){cyl(5,12,bx,bz,floorZ,472403,im.trim),cyl(5.2,1,bx,bz,floorZ+2,3946290,metalMat(3946290)),cyl(5.2,1,bx,bz,floorZ+9,3946290,metalMat(3946290));}
    box(16,10,3,-14,12,floorZ+7,7887415,im.trim),cyl(3,2,-18,10,floorZ+2,3616035,im.trim),cyl(3,2,-10,10,floorZ+2,3616035,im.trim),cyl(3,2,-18,15,floorZ+2,3616035,im.trim),cyl(3,2,-10,15,floorZ+2,3616035,im.trim);
    for(const[px,pz,pc]of[[-18,10,13137960],[-14,11,11152685],[-10,13,6259255],[-16,14,13808700],[-12,10,13137960]])sph(2,px,pz,floorZ+10,pc);
    box(9,9,7,-half+10,half-14,floorZ,9201985,im.trim),box(6,6,6,-half+10,half-14,floorZ+7,6572845,im.trim);
    box(9,9,9,half-11,half-12,floorZ,10521705,im.trim);
  }else if("civ8"===key){
    box(60,10,10,0,-27,floorZ,7228205,im.trim),box(62,10.5,1,0,-27,floorZ+10,4928025);
    box(58,3,18,0,-30.5,floorZ,4928025,im.trim);
    for(const sh of[8,14])box(56,2.5,.6,0,-29.5,floorZ+sh,4928025);
    for(let i=0;i<10;i++){const bx=-25+i*5.5,bm=[2641972,5255706,9874080][i%3];cyl(1.2,5,bx,-29,floorZ+9,bm,im.trim),cyl(1.2,5,bx,-29,floorZ+15,bm,im.trim)}
    for(const sx of[-24,-12,0,12,24])cyl(4,3,sx,-19,floorZ+3,6571565,im.trim),cyl(1,18,sx,-19,floorZ,6571565,im.trim);
    for(const[bx,bz]of[[24,-16],[30,-16],[27,-9]]){cyl(6,14,bx,bz,floorZ,472403,im.trim),cyl(6.2,1,bx,bz,floorZ+2,3946290,metalMat(3946290)),cyl(6.2,1,bx,bz,floorZ+11,3946290,metalMat(3946290));}
    for(const[tx,tz]of[[-27,-3],[8,-3],[-9,22]]){cyl(1.2,16,tx,tz,floorZ,6900525,im.trim),cyl(10,1.5,tx,tz,floorZ+16,6900525,im.trim);for(let i=0;i<4;i++){const a=Math.PI/2*i+Math.PI/4,sx=tx+10*Math.cos(a),sz=tz+10*Math.sin(a);cyl(2.5,2,sx,sz,floorZ+9,6571565,im.trim),cyl(.6,9,sx,sz,floorZ,6571565,im.trim)}}
    box(1.5,16,32,half-.5,20,floorZ,7235940,im.trim),box(10,1.5,32,half-11,10,floorZ,7235940,im.trim),box(10,1.5,32,half-11,28,floorZ,7235940,im.trim),box(10,16,3,half-11,20,floorZ+29,7235940,im.trim),box(7,10,4,half-8,20,floorZ+3,15104040,emisMat(15104040));
    cyl(.6,20,0,0,floorZ+30,2631203,metalMat(2631203)),cyl(9,1.2,0,0,floorZ+28,2631203,metalMat(2631203));
    for(let i=0;i<6;i++){const a=Math.PI/3*i,cx=8*Math.cos(a),cz=8*Math.sin(a);cyl(.5,4,cx,cz,floorZ+28,2631203,metalMat(2631203)),cyl(.7,2,cx,cz,floorZ+32,15774800,emisMat(15774800))}
  }else if(CIV_INT[key]){
    {const WB:Record<string,number[]>={civ1:[5067832,9087064,4012609],civ7:[7031354,12088115,3813674],civ9:[9203546,14540253,5913642],paradropHangar:[4871520,9152703,3552822],empTower:[3095112,9427199,2105376],rogueDen:[5913130,13378082,3155231],bridgehut:[5918792,11119017,3552822],oilDerek:[3815994,16766814,2631720]}[key];if(WB){const H=half,rhh=tall?ROOM_H:ROOM_H_SHORT;for(const[w,ry,px,pz]of[[H*2-2,0,0,-H+.5],[H*2-2,Math.PI/2,-H+.5,0],[H*2-2,Math.PI/2,H-.5,0]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,18),new THREE.MeshStandardMaterial({color:WB[0],roughness:.8,metalness:.1,side:THREE.DoubleSide}));m.rotation.y=ry,m.position.set(px,floorZ+9,pz),m.renderOrder=ro+1,g.add(m);const st=new THREE.Mesh(new THREE.PlaneGeometry(w,1),new THREE.MeshStandardMaterial({color:WB[1],roughness:.6,side:THREE.DoubleSide}));st.rotation.y=ry,st.position.set(px+(ry?(px<0?.1:-.1):0),floorZ+18.4,pz+(ry?0:.1)),st.renderOrder=ro+1,g.add(st)}const fl=new THREE.Mesh(new THREE.PlaneGeometry(H*2-6,H*2-6),new THREE.MeshStandardMaterial({color:WB[2],roughness:.9}));fl.rotation.x=-Math.PI/2,fl.position.set(0,floorZ+.4,0),fl.renderOrder=ro+1,g.add(fl);for(let k=-1;k<=1;k++){const bm=new THREE.Mesh(new THREE.BoxGeometry(H*2,2.4,2.4),new THREE.MeshStandardMaterial({color:WB[2],roughness:.7}));bm.position.set(0,floorZ+rhh-2,k*H*.6),bm.renderOrder=ro+1,g.add(bm)}}}
    CIV_INT[key]({g,half,floorZ,rh:tall?ROOM_H:ROOM_H_SHORT,box,cyl,sph,emisMat,metalMat,propMat,im,anims:g.userData.anims||(g.userData.anims=[]),cols});
  }else if(tall){
    for(const[px,pz]of[[-half+13,-half+13],[half-13,-half+13],[-half+13,half-13],[half-13,half-13]])box(8,8,ROOM_H-4,px,pz,floorZ,4210752,im.trim);
    box(16,10,10,0,-half+14,floorZ,5333596),box(14,20,3,0,half-16,floorZ,6250335);
    for(const[px,pz]of[[-half+16,0],[half-16,0]])box(3,3,3,px,pz,floorZ,16766814,emisMat(16766814));
  }else if("civ2"===key){
    for(const[px,pz]of[[-half+15,-half+15],[half-15,half-15]])box(13,13,12,px,pz,floorZ,9075248,im.trim);
    for(let i=0;i<3;i++)box(9,9,20,-half+13,-half+30+i*22,floorZ,7683434,im.trim);
    box(half*2-20,4,30,0,half-9,floorZ,3552822,im.trim);
    for(let i=0;i<3;i++)box(half*2-24,1,3,0,half-9,floorZ+8+9*i,5333596);
  }else if("civ4"===key){
    box(10,44,.4,0,-2,floorZ+.4,7741990);
    for(const pz of[-14,-4,6]){
      box(20,6,5,-16,pz,floorZ,5257258,im.trim),box(20,1,7,-16,pz+2.5,floorZ+5,5257258);
      box(20,6,5,16,pz,floorZ,5257258,im.trim),box(20,1,7,16,pz+2.5,floorZ+5,5257258);
    }
    box(26,10,3,0,-27,floorZ,12893352,im.trim),box(16,6,3,0,-28,floorZ+3,12893352);
    box(14,4,8,0,-29,floorZ+6,4337692,im.trim);
    box(2,1,14,-1,-31.5,floorZ+18,3285526),box(8,1,2,-4,-31.5,floorZ+28,3285526);
    for(const cx of[-8,8])cyl(.6,5,cx,-27,floorZ+9,11045448,metalMat(11045448)),sph(.6,cx,-27,floorZ+14,16762990,emisMat(16762990));
    box(6,5,10,20,-20,floorZ,3942938,im.trim),box(7,6,1,20,-20,floorZ+10,3942938);
    for(const bz of[-20,-5,10])box(half*2-6,2,2,0,bz,44,3811356,im.trim);
  }else if(PROD_THEME[key]){
    furnishTheme(PROD_THEME[key],{g,half,floorZ,rh:tall?ROOM_H:ROOM_H_SHORT,box,cyl,sph,emisMat,metalMat,propMat,im,fac:S.players[bld.owner]&&S.players[bld.owner].fac||"allied",anims:g.userData.anims||(g.userData.anims=[]),cols});
  }else{
    box(20,9,14,0,-half+15,floorZ,2763306,im.trim),box(7,7,4,0,-half+15,floorZ+14,16766814);
    box(9,9,16,half-14,half-14,floorZ,7683434,im.trim),box(9,9,16,-(half-14),half-14,floorZ,4471129,im.trim);
  }
  return cols;
}
function ensureInterior(bld){
  if(bld.interior)return bld.interior;
  const half=interiorHalf(bld),tall=!!bld.d.roof,roomH=tall?ROOM_H:ROOM_H_SHORT,floorZ=tall?FLOOR_Z:0,ceilZ=floorZ+roomH,g=new THREE.Group,ro=-1e4,im=ensureInteriorMats();
  const winW=Math.min(half*1.3,half*2-8),winH=roomH*.45,winZ=roomH*.3,doorW=Math.min(22,half*1.1),doorH=roomH*.62;
  const mkWall=(w,rotY,px,pz,isDoor?)=>{
    const wg=panelWall(w,roomH,isDoor?Math.min(doorW,w-6):Math.min(winW,w-6),isDoor?doorH:winH,isDoor?0:winZ,im.wall,isDoor?null:im.glass);
    wg.rotation.y=rotY,wg.position.set(px,floorZ,pz),wg.children.forEach(m=>m.renderOrder=ro),g.add(wg);
  };
  mkWall(half*2,0,0,-half),mkWall(half*2,0,0,half,!0),mkWall(half*2,Math.PI/2,-half,0),mkWall(half*2,Math.PI/2,half,0);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(half*2+2,half*2+2),im.floor);
  floor.rotation.x=-Math.PI/2,floor.position.y=floorZ+.3,floor.renderOrder=ro+1,g.add(floor);
  const baseH=6,baseband=(w,rotY,px,pz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w-4,baseH),im.trim);m.rotation.y=rotY,m.position.set(px,floorZ+baseH/2,pz),m.renderOrder=ro,g.add(m)};
  baseband(half*2,0,0,-half+.3),baseband(half*2,0,0,half-.3),baseband(half*2,Math.PI/2,-half+.3,0),baseband(half*2,Math.PI/2,half-.3,0);
  if(tall){
    const hw=half-8,gap=STAIR_GAP,zStart=hw-gap,cd=half+2+zStart;
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(half*2+2,cd),im.ceil);
    ceil.rotation.x=Math.PI/2,ceil.position.set(0,ceilZ,(zStart-(half+2))/2),ceil.renderOrder=ro+1,g.add(ceil);
    const steps=8,stepD=gap/steps,stepH=(ROOF_Z-floorZ)/steps;
    for(let i=0;i<steps;i++){
      const topY=(i+1)*stepH,z0=zStart+i*stepD,block=new THREE.Mesh(new THREE.BoxGeometry(16,topY,stepD+.15),im.trim);
      block.position.set(0,floorZ+topY/2,z0+stepD/2),block.renderOrder=ro+1,g.add(block);
    }
    const rampAngle=Math.atan2(ROOF_Z-floorZ,gap),rampLen=Math.hypot(gap,ROOF_Z-floorZ),railH=8;
    for(const rx of[-8.5,8.5]){
      const rail=new THREE.Mesh(new THREE.BoxGeometry(1,1,rampLen),im.trim);
      rail.position.set(rx,floorZ+.5*(ROOF_Z-floorZ)+railH,zStart+.5*gap),rail.rotation.x=-rampAngle,rail.renderOrder=ro+1,g.add(rail);
      for(let i=0;i<=steps;i++){
        const t01=i/steps,post=new THREE.Mesh(new THREE.BoxGeometry(1,railH,1),im.trim);
        post.position.set(rx,floorZ+t01*(ROOF_Z-floorZ)+railH/2,zStart+t01*gap),post.renderOrder=ro+1,g.add(post);
      }
    }
    const rf=hw,roof=new THREE.Mesh(new THREE.PlaneGeometry(rf*2,rf*2),im.floor);
    roof.rotation.x=-Math.PI/2,roof.position.y=ROOF_Z,roof.renderOrder=ro+1,g.add(roof);
    const parH=8;
    const mkPar=(w,rotY,px,pz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,parH),im.trim);m.rotation.y=rotY,m.position.set(px,ROOF_Z+parH/2,pz),m.renderOrder=ro+1,g.add(m)};
    mkPar(rf*2,0,0,-rf),mkPar(rf*2,0,0,rf),mkPar(rf*2,Math.PI/2,-rf,0),mkPar(rf*2,Math.PI/2,rf,0);
  }else{
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(half*2+2,half*2+2),im.ceil);
    ceil.rotation.x=Math.PI/2,ceil.position.y=ceilZ,ceil.renderOrder=ro+1,g.add(ceil);
  }
  bld.furnCols=furnishInterior(g,bld,half,floorZ,tall);
  g.add(new THREE.AmbientLight(4867583,.55));
  const bulbCol=16769228;
  for(const bx of[-half*.35,half*.35]){
    const bulb=new THREE.PointLight(bulbCol,1.9,half*3.6,1.7);
    bulb.position.set(bx,ceilZ-8,0),g.add(bulb);
    const bulbMesh=new THREE.Mesh(new THREE.SphereGeometry(2.4,8,6),new THREE.MeshBasicMaterial({color:bulbCol,fog:!1,depthTest:!0}));
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
  const g=new THREE.Group,ro=-9997,
    mat=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.04}),
    darkMat=new THREE.MeshStandardMaterial({color:2500134,roughness:.6,metalness:.35}),
    skinMat=new THREE.MeshStandardMaterial({color:14595744,roughness:.75});
  const mesh=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);return o.position.set(x,y,z),o.renderOrder=ro,g.add(o),o};
  mesh(new THREE.BoxGeometry(2.3,10,3.1),mat,-1.4,5,0);
  mesh(new THREE.BoxGeometry(2.3,10,3.1),mat,1.4,5,0);
  mesh(new THREE.BoxGeometry(2,2,3.4),darkMat,-1.4,10.4,.3);
  mesh(new THREE.BoxGeometry(2,2,3.4),darkMat,1.4,10.4,.3);
  const torso=mesh(new THREE.BoxGeometry(6.6,11,4.3),mat,0,16,0);
  const armL=mesh(new THREE.BoxGeometry(1.9,7.2,2.7),mat,-4.3,18.8,0);armL.geometry.translate(0,-3.6,0);
  const armR=mesh(new THREE.BoxGeometry(1.9,7.2,2.7),mat,4.3,18.8,0);armR.geometry.translate(0,-3.6,0);
  mesh(new THREE.SphereGeometry(1.15,6,6),skinMat,-4.3,10.6,0);
  mesh(new THREE.SphereGeometry(1.15,6,6),skinMat,4.3,10.6,0);
  mesh(new THREE.BoxGeometry(5.2,3.4,2.4),darkMat,0,20.6,-1.9);
  mesh(new THREE.SphereGeometry(2.35,8,6),skinMat,0,23,0);
  mesh(new THREE.SphereGeometry(2.5,8,7,0,6.283,0,1.65),darkMat,0,23.7,0);
  g.userData.torso=torso,g.userData.armL=armL,g.userData.armR=armR;
  return g;
}
function syncInteriorFigures(bld){
  const figMap=bld.interior.userData.figMap||(bld.interior.userData.figMap=new Map),list=(bld.garrison||[]).filter(u=>u!==FPS.u&&!u.dead),floorZ=bld.d.roof?FLOOR_Z:0;
  list.forEach((u,idx)=>{
    let f=figMap.get(u);
    f||(f=GL&&QUALITY>=1?fpsInteriorFig(u,bld.interior):humanFigure(palette(u.owner).body||"#888"),f.userData.seed=Math.random()*6.283,f.parent||bld.interior.add(f),figMap.set(u,f));
    const pos=interiorSlotPos(bld,idx,list.length),sway=Math.sin(S.time*1.6+f.userData.seed);
    f.userData.F?(f.position.set(pos.x-bld.x,floorZ,pos.y-bld.y),f.rotation.y=-(u.ang||0),fpsPoseFig(f.userData.F)):(f.position.set(pos.x-bld.x,floorZ+.3*Math.abs(sway),pos.y-bld.y),f.rotation.y=-(u.ang||0));
    f.userData.armL&&(f.userData.armL.rotation.x=.05*sway,f.userData.armR.rotation.x=-.05*sway);
  });
  for(const[u,f]of figMap)list.includes(u)||(bld.interior.remove(f),figMap.delete(u));
}function tpCameraDist(e,desired,camY){const dx=-Math.cos(FPS.yaw),dy=-Math.sin(FPS.yaw),step=5,MIN=22*fpsUnitScale(e);for(let d=step;d<=desired;d+=step){const wx=e.x+dx*d,wy=e.y+dy*d,tx=Math.floor(wx/32),ty=Math.floor(wy/32),blocked=inMap(tx,ty)&&(G.occ[idx(tx,ty)]||G.blk[idx(tx,ty)]);if(blocked||heightAt(wx,wy)>camY-8)return Math.max(MIN,d-step)}return desired}
function fpsRender(){const e=FPS.u,t=FPS.cam;t.aspect!==CW/CH&&(t.aspect=CW/CH);if(e.dead){const dt=Math.min(1,(FPS.deathT||0)/1.4),gy=unitGroundH(e)+(e.alt||0),r=gy+fpsEyeH(e)*(1-.85*dt),fall=1.25*dt,roll=.5*dt;return t.fov=68,t.position.set(e.x,r,e.y),t.up.set(Math.sin(roll),Math.cos(roll),0),t.lookAt(e.x+Math.cos(FPS.yaw)*Math.cos(fall)*50,r-50*Math.sin(fall),e.y+Math.sin(FPS.yaw)*Math.cos(fall)*50),FPS.vm&&(FPS.vm.visible=!1),FPS.vvm&&(FPS.vvm.visible=!1),void 0}t.up.set(.05*(FPS.shakeX||0),1,0),t.up.normalize();const kp=FPS.pitch+(FPS.viewKick||0)+.05*(FPS.shakeY||0),a=Math.cos(kp);if(FPS.thirdPerson){const k=fpsUnitScale(e),backH=52*k,gy=unitGroundH(e)+(e.alt||0),eyeY=gy+fpsEyeH(e)+(FPS.jumpZ||0)*k,camY=eyeY+backH,rawDist=tpCameraDist(e,105*k,camY);FPS.tpDist=null==FPS.tpDist?rawDist:FPS.tpDist+(rawDist-FPS.tpDist)*.25;const dist=FPS.tpDist,camWx=e.x-Math.cos(FPS.yaw)*dist,camWy=e.y-Math.sin(FPS.yaw)*dist,finalY=Math.max(camY,heightAt(camWx,camWy)+8*k);t.position.set(camWx,finalY,camWy),t.lookAt(e.x+Math.cos(FPS.yaw)*a*120,eyeY+140*Math.sin(kp),e.y+Math.sin(FPS.yaw)*a*120),t.fov=FPS.aiming?50:68}else{const k=fpsUnitScale(e),r=fpsEyeH(e)+(e.alt||0)+unitGroundH(e)+((FPS.jumpZ||0)-(FPS.swimming?10:0))*k,n=.1*-e.d.radius*k;t.position.set(e.x+Math.cos(FPS.yaw)*n,r,e.y+Math.sin(FPS.yaw)*n),t.lookAt(t.position.x+Math.cos(FPS.yaw)*a*100,t.position.y+100*Math.sin(kp),t.position.z+Math.sin(FPS.yaw)*a*100),t.fov=FPS.aiming?"inf"===e.d.kind?46:28:74}
if(FPS.chargingGrenade&&"inf"===e.d.kind&&!e.inside){const line=ensureGrenadeArc(),n=Math.cos(FPS.yaw),a=Math.sin(FPS.yaw),range=150,N=14,arr=line.geometry.attributes.position.array;for(let i=0;i<N;i++){const s=i/(N-1),wx=e.x+n*range*s,wy=e.y+a*range*s,wz=9+42*Math.sin(Math.PI*s)+heightAt(wx,wy);arr[3*i]=wx,arr[3*i+1]=wz,arr[3*i+2]=wy}line.geometry.attributes.position.needsUpdate=!0,line.computeLineDistances(),line.visible=!0}else grenadeArc&&(grenadeArc.visible=!1);
e.inside&&(ensureInterior(e.inside),syncInteriorFigures(e.inside),syncBombProp(e.inside),(e.inside.interior.userData.anims||[]).forEach(f=>f(S.time)));if(!FPS.thirdPerson&&"inf"===e.d.kind){const vm=ensureViewmodel(unitViewmodelKind(e));vm.visible=!0,fpsViewmodelAnimate(vm,e),FPS.vvm&&(FPS.vvm.visible=!1)}else if(!FPS.thirdPerson&&"inf"!==e.d.kind){FPS.vm&&(FPS.vm.visible=!1);const vvm=ensureVehicleViewmodel(e);vvm.visible=!0,fpsCockpitAnimate(vvm,e)}else{FPS.vm&&(FPS.vm.visible=!1),FPS.vvm&&(FPS.vvm.visible=!1)}return t.updateProjectionMatrix(),t}

Object.assign(window, { fpsUnitScale, FPS_INF_SC,
  projModel, fpsEyeH, fpsReload, fpsEnterDoor, fpsDoorExit, furnishTheme, enterFPS, exitFPS, fpsTick, leaveGarrison, fpsInteract, fpsBeingTargeted,
  fpsAimTarget, fpsUpdateAim, fpsShoot, fpsAbilityInfo, throwGrenade, flameNova,
  fpsAbility, fpsAbilityDown, fpsAbilityUp, fpsJump, fpsPassable, fpsDeathTick, fpsToggleWeapon,
  ensureViewmodel, ensureVehicleViewmodel, unitViewmodelKind, interiorHalf,
  panelWall, furnishInterior, ensureInterior, interiorSlotPos, interiorFigurePos,
  humanFigure, syncInteriorFigures, fpsRender,
  fpsCanPlantBomb, fpsPlantBomb, bombProp, syncBombProp,
  spawnShell, tickShells, MAG_SIZE, RELOAD_DUR,
  FPS, FLOOR_Z,
});

Object.defineProperties(window, {
  fpsPromptTarget: { get: () => fpsPromptTarget, set: v => { fpsPromptTarget = v; }, configurable: true },
  rotateTarget: { get: () => rotateTarget, set: v => { rotateTarget = v; }, configurable: true },
  grenadeArc: { get: () => grenadeArc, configurable: true },
});
