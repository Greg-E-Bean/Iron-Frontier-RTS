export {};
const BRIDGE_DECK_H=8;
let GL=null;const GL_F=[.6118,.50143,.6118],GL_U=[-.35463,.86524,-.35463],GL_SX=Math.SQRT2,GL_SY=1.41007,DAY_LEN=720,FOG_NEAR=2600,FOG_FAR=5200,_s2l=new Float32Array(256);for(let e=0;e<256;e++){const t=e/255;_s2l[e]=t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}const _dawnCol=new THREE.Color(16754253),_noonCol=new THREE.Color(16774368),_hemiDay=new THREE.Color(9417949),_hemiNight=new THREE.Color(1713216),_hemiGroundDay=new THREE.Color(6114360),_hemiGroundNight=new THREE.Color(856608),_skyDay=new THREE.Color(16777215),_skyNight=new THREE.Color(2238527),_fogDay=new THREE.Color(13615264),_fogNight=new THREE.Color(725273),_tmpFog=new THREE.Color,_skyOver=new THREE.Color(10134701),_fogOver=new THREE.Color(10989752),_hemiOver=new THREE.Color(8621977),_hemiGroundOver=new THREE.Color(6054248),_skyRain=new THREE.Color(7173760),_fogRain=new THREE.Color(7897740),_hemiRain=new THREE.Color(5989744),_hemiGroundRain=new THREE.Color(4211786);
function glReady(){return"undefined"!=typeof THREE}function initGL(){if(!glReady())return!1;const e=document.getElementById("gl");let t;try{t=new THREE.WebGLRenderer({canvas:e,antialias:!0,powerPreference:"high-performance"})}catch(e){return!1}t.setPixelRatio(glPixelRatioCap()),t.shadowMap.enabled=QUALITY>=1,t.shadowMap.type=THREE.PCFSoftShadowMap,void 0!==THREE.sRGBEncoding&&(t.outputEncoding=THREE.sRGBEncoding),t.toneMapping=THREE.ACESFilmicToneMapping,t.toneMappingExposure=.97,t.setClearColor(725273,1);const r=new THREE.Scene;r.fog=new THREE.Fog(725273,FOG_NEAR,FOG_FAR);const n=new THREE.OrthographicCamera(-1,1,1,-1,1,9e3);n.up.set(GL_U[0],GL_U[1],GL_U[2]);const a=new THREE.DirectionalLight(15397109,1.9);a.castShadow=!0,a.shadow.mapSize.set(Math.min(window.innerWidth,window.innerHeight)<560?2048:3072,Math.min(window.innerWidth,window.innerHeight)<560?2048:3072),a.shadow.bias=-9e-4,a.shadow.normalBias=1.2,a.shadow.camera.near=1,a.shadow.camera.far=3e3,r.add(a),r.add(a.target);const o=new THREE.HemisphereLight(9417949,6114360,.36);r.add(o);const s=new THREE.DirectionalLight(6258598,.4);s.position.set(-.6,.5,-.8),r.add(s),GL={renderer:t,scene:r,camera:n,sun:a,hemi:o,fill:s,groups:new Map,statics:new Map,terrain:null,water:null,litPool:[]};const i=makeSurface("metal",1.5),l=makeSurface("rough",2.6),c=makeSurface("soft",.9),mC=makeSurface("concrete",2.2),mO=makeSurface("organic",1.8),mR=makeSurface("rubber",1.4),mF=makeSurface("foliage",2);GL.surfaces={sMetal:i,sRough:l,sSoft:c,sConcrete:mC,sOrganic:mO,sRubber:mR,sFoliage:mF},GL.mats={metal:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.58,metalness:.6,envMapIntensity:.8,map:i.map,normalMap:i.normal,normalScale:new THREE.Vector2(.95,.95),roughnessMap:i.map}),matte:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.97,metalness:.02,envMapIntensity:.5,map:l.map,normalMap:l.normal,normalScale:new THREE.Vector2(1.25,1.25)}),glass:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.24,metalness:.3,envMapIntensity:1,map:c.map,normalMap:c.normal,normalScale:new THREE.Vector2(.3,.3)}),concrete:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.95,metalness:0,envMapIntensity:.4,map:mC.map,normalMap:mC.normal,normalScale:new THREE.Vector2(1.1,1.1)}),organic:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.7,metalness:.05,envMapIntensity:.6,map:mO.map,normalMap:mO.normal,normalScale:new THREE.Vector2(.85,.85)}),rubber:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:1,metalness:0,envMapIntensity:.25,map:mR.map,normalMap:mR.normal,normalScale:new THREE.Vector2(1.4,1.4)}),foliage:new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.92,metalness:0,envMapIntensity:.35,map:mF.map,normalMap:mF.normal,normalScale:new THREE.Vector2(1,1)}),emis:new THREE.MeshBasicMaterial({vertexColors:!0})};for(const e of["metal","matte","glass","concrete","organic","rubber","foliage"])GL.mats[e].color=new THREE.Color(1.06,1.06,1.06);_mat=new THREE.Matrix4,buildFogTex();for(const e in GL.mats)fogPatch(GL.mats[e]);return buildTerrainGL(),buildSkyGL(),!0}function glPixelRatioCap(){if(MENU_CAM)return .7*Math.min(1,window.devicePixelRatio||1);return QUALITY>=2?Math.min(3,window.devicePixelRatio||1):QUALITY>=1?Math.min(1.5,window.devicePixelRatio||1):1}function applyGLQuality(){if(!GL)return;const shadowsOn=QUALITY>=1;GL.renderer.shadowMap.enabled=shadowsOn,GL.sun.castShadow=shadowsOn;if(shadowsOn){const sz=QUALITY>=2?(Math.min(window.innerWidth,window.innerHeight)<560?2048:3072):1024;GL.sun.shadow.mapSize.x!==sz&&(GL.sun.shadow.mapSize.set(sz,sz),GL.sun.shadow.map&&(GL.sun.shadow.map.dispose(),GL.sun.shadow.map=null))}}function resizeGL(){GL&&(GL.renderer.setPixelRatio(glPixelRatioCap()),GL.renderer.setSize(CW,CH,!0),applyGLQuality())}const GLBUCKET={glass:"glass",glassdark:"glass",crystal:"glass",arcbolt:"glass",lightY:"glass",concrete:"concrete",concrete2:"concrete",asphalt:"concrete",sand:"matte",olive:"foliage",wood:"matte",skin:"matte",rubber:"rubber",tread:"rubber",rust:"matte",neutral:"matte",carapace:"organic",carapace2:"organic",pod:"organic",bark:"matte",roof:"concrete",rock2:"concrete",rock3:"concrete",tibG:"glass",tibB:"glass",green:"foliage",green2:"foliage",green3:"foliage",pine:"foliage",autumn:"foliage",bark2:"matte",scorch:"matte",wreck:"matte"};function glMerge(e,t){const r={metal:{p:[],n:[],c:[],u:[]},matte:{p:[],n:[],c:[],u:[]},glass:{p:[],n:[],c:[],u:[]},emis:{p:[],n:[],c:[],u:[]},concrete:{p:[],n:[],c:[],u:[]},organic:{p:[],n:[],c:[],u:[]},rubber:{p:[],n:[],c:[],u:[]},foliage:{p:[],n:[],c:[],u:[]}},n=[];for(const a of e){if(!a||!a.m)continue;if(a.a){const e=glMerge([Object.assign({},a,{a:null,x:0,y:0,z:0})],t);n.push({geo:e,px:a.x||0,py:a.y||0,pz:a.z||0,spin:a.a.spin||0,bob:a.a.bob||0,orbit:a.a.orbit||0,amp:a.a.amp||0,pvx:null!=a.a.pvx?a.a.pvx:a.x||0,pvy:null!=a.a.pvy?a.a.pvy:a.y||0,patrol:a.a.patrol||0,pw:a.a.pw||0,ph:a.a.ph||0,ba:a.a.ba||4.5,belt:a.a.belt||0,bdy:a.a.bdy||0,bdz:a.a.bdz||0,pp:a.a.pp||0,rock:a.a.rock||0,ra:a.a.ra||0,rph:a.a.rph||0,rpx:null!=a.a.rpx?a.a.rpx:a.x||0,rpz:null!=a.a.rpz?a.a.rpz:a.z||0});continue}const e=a.r||0,o=Math.cos(e),s=Math.sin(e),i=a.tx||0,l=a.ty||0,c=Math.cos(i),d=Math.sin(i),f=Math.cos(l),h=Math.sin(l),u=a.x||0,p=a.y||0,m=a.z||0,g=a.sx||1,y=a.sy||1,x=a.sz||1,M=rgbOf(colOf(a.c,t)),b=_s2l[M[0]],P=_s2l[M[1]],k=_s2l[M[2]],S=!!a.e,v=S?r.emis:r[GLBUCKET[a.c]||"metal"],w=v.p,_=v.n,L=v.c,T=v.u;for(const e of a.m){const t=[0,0,0],r=[0,0,0],n=[0,0,0],a=[0,0,0],M=[0,0,0],v=[0,0,0];for(let b=0;b<3;b++){let P=e.p[b][0]*g,k=e.p[b][1]*y,S=e.p[b][2]*x,w=e.n[b][0],_=e.n[b][1],L=e.n[b][2];if(i){const e=k*d+S*c;k=k*c-S*d,S=e;const t=_*d+L*c;_=_*c-L*d,L=t}if(l){const e=-P*h+S*f;P=P*f+S*h,S=e;const t=-w*h+L*f;w=w*f+L*h,L=t}t[b]=P*o-k*s+u,r[b]=P*s+k*o+p,n[b]=S+m,a[b]=w*o-_*s,M[b]=w*s+_*o,v[b]=L}const E=Math.abs(a[0]+a[1]+a[2]),B=Math.abs(M[0]+M[1]+M[2]),C=Math.abs(v[0]+v[1]+v[2]),R=C>=E&&C>=B?2:E>=B?0:1;for(const e of[2,1,0]){w.push(t[e],n[e],r[e]),_.push(a[e],v[e],M[e]);const o=S?1:.66+.34*Math.min(1,Math.max(0,n[e])/16);L.push(b*o,P*o,k*o);const s=.055;2===R?T.push(t[e]*s,r[e]*s):0===R?T.push(r[e]*s,n[e]*s):T.push(t[e]*s,n[e]*s)}}}const a=e=>{if(!e.p.length)return null;const t=new THREE.BufferGeometry;return t.setAttribute("position",new THREE.Float32BufferAttribute(e.p,3)),t.setAttribute("normal",new THREE.Float32BufferAttribute(e.n,3)),t.setAttribute("color",new THREE.Float32BufferAttribute(e.c,3)),t.setAttribute("uv",new THREE.Float32BufferAttribute(e.u,2)),t.computeBoundingSphere(),t};return{metal:a(r.metal),matte:a(r.matte),glass:a(r.glass),emis:a(r.emis),concrete:a(r.concrete),organic:a(r.organic),rubber:a(r.rubber),foliage:a(r.foliage),anims:n}}const GLGEO=new Map;function glGeom(e,t,r){let n=GLGEO.get(e);return n||(n=glMerge(t(),r),GLGEO.set(e,n)),n}let _mat=null,_usc=1,_ux=0,_uy=0,_uz=0;const _scV=new THREE.Vector3();const GLPASS=["metal","matte","glass","emis","concrete","organic","rubber","foliage"];function glFlush(e,t){const r=e.list.length/6;for(const t of GLPASS){const n=e.geo[t];if(!n)continue;let a=e[t];if(!a||a.count0<r){a&&(GL.scene.remove(a),a.dispose());const o=Math.max(8,1<<Math.ceil(Math.log2(Math.max(1,r))));a=new THREE.InstancedMesh(n,e.wind&&"emis"!==t?fgWindMat(t):GL.mats[t],o),a.count0=o,a.castShadow="emis"!==t&&!e.noShadow,a.receiveShadow="emis"!==t,a.frustumCulled=!1,GL.scene.add(a),e[t]=a}a.count=r;const o=e.list,s=_mat,sc=e.sc||1;for(let e=0;e<r;e++){const t=o[6*e],r=o[6*e+1],n=o[6*e+2],i=o[6*e+3],q=o[6*e+4],p=o[6*e+5],l=Math.cos(-i),c=Math.sin(-i);if(q||p){const cq=Math.cos(q),sq=Math.sin(q),cp=Math.cos(p),sp=Math.sin(p);s.set(l*cp+c*sq*sp,-l*sp+c*sq*cp,c*cq,t,cq*sp,cq*cp,-sq,n,-c*cp+l*sq*sp,c*sp+l*sq*cp,l*cq,r,0,0,0,1)}else s.set(l,0,c,t,0,1,0,n,-c,0,l,r,0,0,0,1);sc!==1&&s.scale(_scV.set(sc,sc,sc));a.setMatrixAt(e,s)}a.instanceMatrix.needsUpdate=!0,a.visible=r>0}}function surfCanvas(e,t){const r=document.createElement("canvas");r.width=r.height=e;const n=r.getContext("2d"),a=n.createImageData(e,e),o=a.data;for(let r=0;r<e;r++)for(let n=0;n<e;n++){const a=n/e,s=r/e;let i;i="metal"===t?.86+.2*(tfbm(46*a,3.5*s,11)-.5)+.13*(tfbm(7*a,7*s,5)-.5):"rough"===t?.84+.28*(tfbm(26*a,26*s,3)-.5)+.14*(tfbm(80*a,80*s,21)-.5):"concrete"===t?.88+.22*(tfbm(18*a,18*s,13)-.5)+.1*(tfbm(60*a,60*s,29)-.5):"organic"===t?.85+.16*(tfbm(9*a,9*s,17)-.5)+.08*(tfbm(23*a,23*s,31)-.5):"rubber"===t?.78+.1*(tfbm(30*a,30*s,19)-.5)+.06*(tfbm(90*a,90*s,41)-.5):"foliage"===t?.82+.18*(tfbm(20*a,20*s,23)-.5)+.09*(tfbm(55*a,55*s,43)-.5):.9+.12*(tfbm(14*a,14*s,7)-.5);const l=Math.max(0,Math.min(255,Math.round(255*i))),c=4*(r*e+n);o[c]=o[c+1]=o[c+2]=l,o[c+3]=255}if(n.putImageData(a,0,0),"metal"===t){n.globalAlpha=.2,n.strokeStyle="#4a4a4a",n.lineWidth=1.4;for(let t=0;t<5;t++){const r=53*t%e;n.beginPath(),n.moveTo(0,r),n.lineTo(e,r+(t%2?3:-3)),n.stroke()}n.globalAlpha=.13,n.strokeStyle="#f0f0f0",n.lineWidth=.8;for(let t=0;t<26;t++){const r=97*t%e,a=61*t%e,o=8+13*t%42;n.beginPath(),n.moveTo(r,a),n.lineTo(r+o,a+3*(t%3-1)),n.stroke()}n.globalAlpha=.3,n.strokeStyle="#181818",n.lineWidth=2.4;for(let pg=32;pg<e;pg+=64){n.beginPath(),n.moveTo(pg+(7*pg%5-2),0),n.lineTo(pg+(11*pg%5-2),e),n.stroke()}for(let pg=42;pg<e;pg+=58){n.beginPath(),n.moveTo(0,pg+(5*pg%5-2)),n.lineTo(e,pg+(9*pg%5-2)),n.stroke()}n.globalAlpha=.55;for(let rv=0;rv<64;rv++){const rx=(37*rv+13)%e,ry=(53*rv+7)%e,rr=1+(7*rv%3)*.3;n.beginPath(),n.arc(rx,ry,rr,0,6.2832),n.fillStyle="rgba(8,8,8,"+(.5+.08*(13*rv%5))+")",n.fill(),n.beginPath(),n.arc(rx-.4,ry-.4,.5*rr,0,6.2832),n.fillStyle="rgba(230,228,220,.35)",n.fill()}n.globalAlpha=.18;for(let rs=0;rs<12;rs++){const bx=(61*rs+23)%e,by=(89*rs+41)%e,br=6+31*rs%16,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(110,64,38,.9)"),rg.addColorStop(1,"rgba(110,64,38,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1}else if("rough"===t){n.globalAlpha=.13,n.strokeStyle="#4a4a4a",n.lineWidth=1.6;for(let t=0;t<9;t++){let r=89*t%e,a=37*t%e;n.beginPath(),n.moveTo(r,a);for(let e=0;e<5;e++)r+=(7*t+11*e)%23-11,a+=(5*t+17*e)%19-6,n.lineTo(r,a);n.stroke()}n.globalAlpha=.16;for(let gm=0;gm<10;gm++){const bx=(71*gm+9)%e,by=(97*gm+31)%e,br=8+23*gm%18,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(20,17,14,.85)"),rg.addColorStop(1,"rgba(20,17,14,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1}else if("concrete"===t){n.globalAlpha=.16,n.strokeStyle="#38352f",n.lineWidth=1.1;for(let cc=0;cc<6;cc++){let cx=71*cc%e,cy=43*cc%e;n.beginPath(),n.moveTo(cx,cy);for(let cs=0;cs<6;cs++)cx+=(13*cc+19*cs)%29-14,cy+=(17*cc+7*cs)%25-12,n.lineTo(cx,cy);n.stroke()}n.globalAlpha=.5;for(let ag=0;ag<140;ag++){const ax=(31*ag+11)%e,ay=(47*ag+23)%e,ar=.5+(9*ag%3)*.35;n.beginPath(),n.arc(ax,ay,ar,0,6.2832),n.fillStyle="rgba(10,9,7,"+(.35+.06*(11*ag%5))+")",n.fill()}n.globalAlpha=.14;for(let cs2=0;cs2<9;cs2++){const bx=(67*cs2+19)%e,by=(83*cs2+37)%e,br=10+29*cs2%20,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(24,20,15,.8)"),rg.addColorStop(1,"rgba(24,20,15,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1}else if("organic"===t){n.globalAlpha=.15,n.strokeStyle="#2a221c",n.lineWidth=1.3;for(let vv=0;vv<7;vv++){let vx=59*vv%e,vy=31*vv%e;n.beginPath(),n.moveTo(vx,vy);for(let vs=0;vs<8;vs++){const ang=(7*vv+13*vs)%628/100;vx+=9*Math.cos(ang),vy+=9*Math.sin(ang),n.lineTo(vx,vy)}n.stroke()}n.globalAlpha=.17;for(let mo=0;mo<11;mo++){const bx=(53*mo+7)%e,by=(79*mo+17)%e,br=10+27*mo%20,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(30,22,26,.7)"),rg.addColorStop(1,"rgba(30,22,26,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1}else if("rubber"===t){n.globalAlpha=.28,n.strokeStyle="#050505",n.lineWidth=2.6;for(let rg2=0;rg2<8;rg2++){const ry=rg2*(e/8);n.beginPath(),n.moveTo(0,ry),n.lineTo(.5*e,ry+.09*e),n.lineTo(e,ry),n.stroke()}n.globalAlpha=.15;for(let sc=0;sc<14;sc++){const bx=(43*sc+13)%e,by=(71*sc+31)%e,br=4+19*sc%14,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(90,90,90,.55)"),rg.addColorStop(1,"rgba(90,90,90,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1}else if("foliage"===t){n.globalAlpha=.22;for(let fl=0;fl<16;fl++){const bx=(41*fl+11)%e,by=(59*fl+29)%e,br=8+23*fl%20,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(10,14,6,.6)"),rg.addColorStop(1,"rgba(10,14,6,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=.14;for(let hl=0;hl<12;hl++){const bx=(67*hl+7)%e,by=(83*hl+37)%e,br=6+17*hl%14,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(200,220,150,.5)"),rg.addColorStop(1,"rgba(200,220,150,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1}n.globalAlpha=.12;for(let wr=0;wr<8;wr++){const bx=(83*wr+17)%e,by=(101*wr+29)%e,br=10+37*wr%22,rg=n.createRadialGradient(bx,by,0,bx,by,br);rg.addColorStop(0,"rgba(12,10,9,.7)"),rg.addColorStop(1,"rgba(12,10,9,0)"),n.fillStyle=rg,n.fillRect(bx-br,by-br,2*br,2*br)}n.globalAlpha=1;return r}function normalFrom(e,t){const r=e.width,n=e.getContext("2d").getImageData(0,0,r,r).data,a=new Uint8Array(r*r*4),o=(e,t)=>n[4*((t+r)%r*r+(e+r)%r)]/255;for(let e=0;e<r;e++)for(let n=0;n<r;n++){let s=-((o(n+1,e)-o(n-1,e))*t),i=-((o(n,e+1)-o(n,e-1))*t),l=1;const c=Math.hypot(s,i,l),d=4*(e*r+n);a[d]=Math.round(255*(s/c*.5+.5)),a[d+1]=Math.round(255*(i/c*.5+.5)),a[d+2]=Math.round(255*(l/c*.5+.5)),a[d+3]=255}const s=new THREE.DataTexture(a,r,r,THREE.RGBAFormat);return s.wrapS=s.wrapT=THREE.RepeatWrapping,s.needsUpdate=!0,s}function makeSurface(e,t){const r=surfCanvas(256,e),n=new THREE.CanvasTexture(r);return n.wrapS=n.wrapT=THREE.RepeatWrapping,n.anisotropy=4,{map:n,normal:normalFrom(r,t)}}function buildFogTex(){const e=new THREE.DataTexture(new Uint8Array(26496),92,72,THREE.RGBAFormat);e.magFilter=THREE.LinearFilter,e.minFilter=THREE.LinearFilter,e.wrapS=e.wrapT=THREE.ClampToEdgeWrapping,e.needsUpdate=!0,GL.fogTex=e,GL.fogData=e.image.data}function onFogUpdated(){if(!GL||!GL.fogData)return;const e=GL.fogData,t=G.vis;for(let r=0;r<t.length;r++){const n=2===t[r]?255:1===t[r]?96:0,a=4*r;e[a]=n,e[a+1]=n,e[a+2]=n,e[a+3]=255}GL.fogTex.needsUpdate=!0}function fogPatch(e){e.onBeforeCompile=t=>{t.uniforms.fogMap={value:GL.fogTex},t.uniforms.mapSize={value:new THREE.Vector2(2944,2304)},t.uniforms.fogOn={value:1},t.vertexShader="varying vec3 vWorldFog;\n"+t.vertexShader.replace("#include <project_vertex>","#include <project_vertex>\n       #ifdef USE_INSTANCING\n         vWorldFog = (modelMatrix * instanceMatrix * vec4(transformed,1.0)).xyz;\n       #else\n         vWorldFog = (modelMatrix * vec4(transformed,1.0)).xyz;\n       #endif"),t.fragmentShader="uniform sampler2D fogMap;\nuniform vec2 mapSize;\nuniform float fogOn;\nvarying vec3 vWorldFog;\n#define MAPW_F 92\n#define MAPH_F 72\n"+t.fragmentShader.replace("#include <dithering_fragment>","#include <dithering_fragment>\n       if(fogOn > 0.5){\n         vec2 fuv = vec2(vWorldFog.x / mapSize.x, vWorldFog.z / mapSize.y);\n         vec2 tx = vec2(1.0/float(MAPW_F), 1.0/float(MAPH_F));\n         float shroud = texture2D(fogMap, clamp(fuv, 0.002, 0.998)).r * 0.36;\n         shroud += texture2D(fogMap, clamp(fuv+vec2( tx.x,0.0), 0.002,0.998)).r * 0.16;\n         shroud += texture2D(fogMap, clamp(fuv+vec2(-tx.x,0.0), 0.002,0.998)).r * 0.16;\n         shroud += texture2D(fogMap, clamp(fuv+vec2(0.0, tx.y), 0.002,0.998)).r * 0.16;\n         shroud += texture2D(fogMap, clamp(fuv+vec2(0.0,-tx.y), 0.002,0.998)).r * 0.16;\n         float lit = smoothstep(0.10, 0.72, shroud);\n         gl_FragColor.rgb *= mix(vec3(0.055,0.065,0.085), vec3(1.0), lit);\n       }"),e.userData.shader=t},e.needsUpdate=!0}function setFogUniform(e){const t=[GL.mats.metal,GL.mats.matte,GL.mats.glass,GL.mats.emis,GL.terrain&&GL.terrain.material,GL.water&&GL.water.material];for(const r of t)r&&r.userData&&r.userData.shader&&(r.userData.shader.uniforms.fogOn.value=e?1:0)}function glNoiseTex(){const e=256,t=document.createElement("canvas");t.width=t.height=e;const r=t.getContext("2d"),n=r.createImageData(e,e);for(let t=0;t<e;t++)for(let r=0;r<e;r++){const a=.55*tfbm(r/e*7,t/e*7,3)+.45*tfbm(r/e*23,t/e*23,9),o=200+Math.round(110*a),s=4*(t*e+r);n.data[s]=o,n.data[s+1]=o,n.data[s+2]=o,n.data[s+3]=255}r.putImageData(n,0,0);const a=new THREE.CanvasTexture(t);return a.wrapS=a.wrapT=THREE.RepeatWrapping,a.repeat.set(1,1),a.anisotropy=4,a}function glWaterTex(){const e=256,c=document.createElement("canvas");c.width=c.height=e;const ctx=c.getContext("2d"),img=ctx.createImageData(e,e);for(let y=0;y<e;y++)for(let x=0;x<e;x++){const a=.55*tfbm(x/e*3,y/e*11,4)+.45*tfbm(x/e*9,y/e*29,10),v=Math.max(0,Math.min(1,.5+.5*a)),i=4*(y*e+x);img.data[i]=Math.round(10+20*v),img.data[i+1]=Math.round(58+58*v),img.data[i+2]=Math.round(82+68*v),img.data[i+3]=255}ctx.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);return t.wrapS=t.wrapT=THREE.RepeatWrapping,t.anisotropy=4,t}function glWaterBumpTex(){const e=128,c=document.createElement("canvas");c.width=c.height=e;const ctx=c.getContext("2d"),img=ctx.createImageData(e,e);for(let y=0;y<e;y++)for(let x=0;x<e;x++){const a=.6*tfbm(x/e*5,y/e*18,6)+.4*tfbm(x/e*17,y/e*46,13),v=Math.max(0,Math.min(255,Math.round(128+110*a))),i=4*(y*e+x);img.data[i]=v,img.data[i+1]=v,img.data[i+2]=v,img.data[i+3]=255}ctx.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);return t.wrapS=t.wrapT=THREE.RepeatWrapping,t.anisotropy=4,t}function glCol(e,t,r,n){const a=rgbOf(e);t[r]=a[0]/255*n,t[r+1]=a[1]/255*n,t[r+2]=a[2]/255*n}function cornerBumpBase(e,t){for(let r=-1;r<=0;r++)for(let n=-1;n<=0;n++){const a=e+n,o=t+r;if(a<0||o<0||a>=92||o>=72)return 0}const r=G.seed||0;let mtn=0,shore=0,cnt=0;for(let n=-1;n<=0;n++)for(let a=-1;a<=0;a++){const o=e+a,s=t+n;o>=0&&s>=0&&o<92&&s<72&&(mtn+=G.mtn[idx(o,s)],shore+=G.shore?G.shore[idx(o,s)]:0,cnt++)}mtn=cnt?mtn/cnt:0,shore=cnt?shore/cnt:0;const peak=fbm(.24*e+r+70,.24*t-r+70,r+70),hills=(fbm(.045*e+r+130,.045*t-r+130,r+130)-.5)*(G.calm?7:30),base=(fbm(.1*e+r+50,.1*t-r+50,r+50)-.5)*(G.calm?3:9)+hills+Math.pow(mtn,2.1)*(190+70*peak),land=Math.max(0,1-1.15*shore);return base*land*land}
function cornerOv(e,t){let ov=0,cnt=0;for(let n=-1;n<=0;n++)for(let a=-1;a<=0;a++){const o=e+a,s=t+n;o>=0&&s>=0&&o<92&&s<72&&(ov+=G.elevOverride?G.elevOverride[idx(o,s)]:0,cnt++)}return cnt?ov/cnt:0}
const cidx=(e,t)=>93*t+e;
function cornerBump(e,t){if(G.flatCornerSet&&G.flatCornerSet[cidx(e,t)])return G.flatCorner[cidx(e,t)];return cornerBumpBase(e,t)+22*cornerOv(e,t)}
function patchTerrainGL(tx,ty,size){if(!GL||!GL.terrain)return;const posAttr=GL.terrain.geometry.attributes.position,nrmAttr=GL.terrain.geometry.attributes.normal;if(!posAttr||!nrmAttr)return;const pos=posAttr.array,nrm=nrmAttr.array,y0=Math.max(0,ty-1),y1=Math.min(72,ty+size+1),x0=Math.max(0,tx-1),x1=Math.min(92,tx+size+1);for(let ey=y0;ey<y1;ey++)for(let ex=x0;ex<x1;ex++){const bTL=cornerBump(ex,ey),bBL=cornerBump(ex,ey+1),bBR=cornerBump(ex+1,ey+1),bTR=cornerBump(ex+1,ey),nTL=cornerNormal(ex,ey),nBL=cornerNormal(ex,ey+1),nBR=cornerNormal(ex+1,ey+1),nTR=cornerNormal(ex+1,ey),off=(ey*92+ex)*18;pos[off+1]=bTL,nrm[off]=nTL[0],nrm[off+1]=nTL[1],nrm[off+2]=nTL[2];pos[off+4]=bBL,nrm[off+3]=nBL[0],nrm[off+4]=nBL[1],nrm[off+5]=nBL[2];pos[off+7]=bBR,nrm[off+6]=nBR[0],nrm[off+7]=nBR[1],nrm[off+8]=nBR[2];pos[off+10]=bTL,nrm[off+9]=nTL[0],nrm[off+10]=nTL[1],nrm[off+11]=nTL[2];pos[off+13]=bBR,nrm[off+12]=nBR[0],nrm[off+13]=nBR[1],nrm[off+14]=nBR[2];pos[off+16]=bTR,nrm[off+15]=nTR[0],nrm[off+16]=nTR[1],nrm[off+17]=nTR[2]}posAttr.needsUpdate=!0,nrmAttr.needsUpdate=!0}
function flattenFootprint(tx,ty,size){let sumH=0,cnt=0;for(let dy=0;dy<=size;dy++)for(let dx=0;dx<=size;dx++)sumH+=cornerBump(tx+dx,ty+dy),cnt++;const targetH=sumH/cnt;for(let dy=0;dy<=size;dy++)for(let dx=0;dx<=size;dx++){const cx=tx+dx,cy=ty+dy;cx<0||cy<0||cx>92||cy>72||(G.flatCorner[cidx(cx,cy)]=targetH,G.flatCornerSet[cidx(cx,cy)]=1)}for(let dy=-1;dy<=size+1;dy++)for(let dx=-1;dx<=size+1;dx++){const cx=tx+dx,cy=ty+dy;inMap(cx,cy)&&(G.elev[idx(cx,cy)]=heightAt(32*cx,32*cy))}patchTerrainGL(tx-1,ty-1,size+2)}function cornerNormal(e,t){const r=cornerBump(e-1,t),n=cornerBump(e+1,t),a=cornerBump(e,t-1),o=cornerBump(e,t+1),s=(n-r)/64,i=(o-a)/64;let l=-s,c=1,d=-i;const f=Math.hypot(l,c,d)||1;return[l/f,c/f,d/f]}const _hasB=new Map;function turretHasBarrel(k,g,dep){const key=k+"|"+(g||"")+(dep?"D":"");let v=_hasB.get(key);return void 0===v&&(v=UTURRET(k,0,{gunKey:g}).some(q=>q.b),_hasB.set(key,v)),v}function groundTilt(e,yaw,turret?){if(e.d.fly||e.d.naval||"inf"===e.d.kind||e.inside||e.lvl)return null;const d=Math.max(8,.45*(e.d.radius||12));if(!turret||e._tiltT!==S.time){const gx=(heightAt(e.x+d,e.y)-heightAt(e.x-d,e.y))/(2*d),gyy=(heightAt(e.x,e.y+d)-heightAt(e.x,e.y-d))/(2*d),k=Math.min(1,.12+(e._tiltT===void 0?1:0));e._gx=(e._gx||0)+(gx-(e._gx||0))*k,e._gy=(e._gy||0)+(gyy-(e._gy||0))*k,e._tiltT=S.time}const c=Math.cos(yaw),s=Math.sin(yaw),fw=e._gx*c+e._gy*s,sd=-e._gx*s+e._gy*c,rk=turret?0:.07*(e.recoil||0)+(e.moving?.012*Math.sin(.9*(e.animT||0)+e.id):0);return[TILT_R*Math.atan(sd),TILT_P*Math.atan(fw)+rk]}const TILT_R=-1,TILT_P=1;function heightAt(e,t){const r=e/32,n=t/32,a=Math.floor(r),o=Math.floor(n),s=r-a,i=n-o,l=cornerBump(a,o),c=cornerBump(a+1,o),d=cornerBump(a,o+1),f=cornerBump(a+1,o+1),h=l+(c-l)*s,u=d+(f-d)*s;let p=h+(u-h)*i;const m=Math.max(0,Math.min(91,a)),g=Math.max(0,Math.min(71,o));if(inMap(m,g)){if(G.bridge&&G.bridge[idx(m,g)])return BRIDGE_DECK_H;const e=G.terr[idx(m,g)];p+=3===e?11:2===e?-5:0}return p}function tintCorner(cx,cy,c){const x=Math.min(91,Math.max(0,cx)),y=Math.min(71,Math.max(0,cy)),i=idx(x,y),land=G.terr[i]<2;let r=c[0],g=c[1],b=c[2];const sh=G.shore?G.shore[i]:0;if(land&&sh>.1){const k=.8*Math.min(1,2.4*(sh-.1));r+=(184-r)*k,g+=(168-g)*k,b+=(122-b)*k}const nn=cornerNormal(cx,cy),sl=1-nn[1];if(sl>.12){const k=Math.min(1,3.2*(sl-.12));r+=(121-r)*k,g+=(114-g)*k,b+=(103-b)*k}const h=cornerBump(cx,cy);if(land&&h>28){const k=Math.min(.3,(h-28)/160);r+=(176-r)*k,g+=(162-g)*k,b+=(112-b)*k}const v=fbm(.31*cx+7,.31*cy-3,91)-.5,v2=fbm(.9*cx-11,.9*cy+5,37)-.5;return[r*(1+.2*v+.08*v2),g*(1+.26*v+.08*v2),b*(1+.12*v+.06*v2)]}// ---- water & shores: a signed distance field from the water tiles (tiles:
// + inside water, - on land) drives smooth organic coastlines, beaches, a
// sloping seabed and depth-based water colour, instead of per-tile squares.
let WSD: Float32Array | null = null;
function waterSDF() {
  const W = 92, H = 72, INF = 1e9, dIn = new Float32Array(W * H), dOut = new Float32Array(W * H);
  const isW = (i: number) => 2 === G.terr[i];
  for (let i = 0; i < W * H; i++) dIn[i] = isW(i) ? INF : 0, dOut[i] = isW(i) ? 0 : INF;
  const pass = (d: Float32Array) => {
    const D = 1.4142;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; let v = d[i]; if (!v) continue;
      x > 0 && (v = Math.min(v, d[i - 1] + 1)), y > 0 && (v = Math.min(v, d[i - W] + 1)), x > 0 && y > 0 && (v = Math.min(v, d[i - W - 1] + D)), x < W - 1 && y > 0 && (v = Math.min(v, d[i - W + 1] + D)); d[i] = v; }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; let v = d[i]; if (!v) continue;
      x < W - 1 && (v = Math.min(v, d[i + 1] + 1)), y < H - 1 && (v = Math.min(v, d[i + W] + 1)), x < W - 1 && y < H - 1 && (v = Math.min(v, d[i + W + 1] + D)), x > 0 && y < H - 1 && (v = Math.min(v, d[i + W - 1] + D)); d[i] = v; }
  };
  pass(dIn), pass(dOut);
  const tsd = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) tsd[i] = isW(i) ? Math.min(dIn[i], 40) - .5 : -(Math.min(dOut[i], 40) - .5);
  const sd = new Float32Array(93 * 73);
  for (let cy = 0; cy < 73; cy++) for (let cx = 0; cx < 93; cx++) { let s = 0, n = 0;
    for (let dy = -1; dy <= 0; dy++) for (let dx = -1; dx <= 0; dx++) { const x = Math.max(0, Math.min(W - 1, cx + dx)), y = Math.max(0, Math.min(H - 1, cy + dy)); s += tsd[y * W + x], n++; }
    sd[cy * 93 + cx] = s / n; }
  return WSD = sd;
}
const WATER_Y = 2;
// seabed drops away from the coast
function seabedDip(cx: number, cy: number) { const s = WSD ? WSD[cy * 93 + cx] : -1; return s > 0 ? -Math.min(34, 1.6 + 9 * Math.pow(s, 1.1)) : 0; }
// beach sand / pebbles / wet line on land near water, darkening seabed under it
function shoreTint(cx: number, cy: number, c: number[]) {
  if (!WSD) return c;
  const s = WSD[cy * 93 + cx]; if (s < -2.6) return c;
  const x = Math.max(0, Math.min(91, cx - 1)), y = Math.max(0, Math.min(71, cy - 1)), rocky = G.mtn && G.mtn[y * 92 + x] > .22;
  const n = fbm(.33 * cx + 11, .33 * cy - 7, 91), sand = rocky ? [128, 121, 108] : [205 + 14 * n, 186 + 12 * n, 136 + 10 * n];
  const mix = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  if (s <= 0) {
    const w = Math.max(0, Math.min(1, (s + 2.6 - 1.4 * n) / 2)), k = w * w * (3 - 2 * w);
    let r = mix(c, sand, k); s > -.7 && (r = mix(r, [r[0] * .72, r[1] * .7, r[2] * .66], (s + .7) / .7));
    return r;
  }
  const wet = [sand[0] * .68, sand[1] * .66, sand[2] * .6], bed = [58, 72, 66];
  return mix(wet, bed, Math.min(1, s / 2.6));
}
function glWaterField() {
  const N = 93 * 73, d = new Uint8Array(4 * N);
  for (let i = 0; i < N; i++) { const s = WSD ? WSD[i] : -4; d[4 * i] = Math.max(0, Math.min(255, Math.round((s / 8 + .5) * 255))), d[4 * i + 1] = d[4 * i + 2] = 0, d[4 * i + 3] = 255; }
  const t = new THREE.DataTexture(d, 93, 73, THREE.RGBAFormat);
  t.magFilter = t.minFilter = THREE.LinearFilter, t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping, t.needsUpdate = !0;
  return t;
}
const WATER_GLSL = `
float wHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float wNoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wHash(i), wHash(i + vec2(1.0, 0.0)), f.x), mix(wHash(i + vec2(0.0, 1.0)), wHash(i + vec2(1.0, 1.0)), f.x), f.y); }
float wWave(vec2 p, float t){
  return sin(dot(p, vec2(0.021, 0.013)) + t * 1.1) * 0.5 + sin(dot(p, vec2(-0.017, 0.024)) + t * 0.9) * 0.4
       + (wNoise(p * 0.045 + vec2(t * 0.05, t * 0.03)) - 0.5) * 1.3 + (wNoise(p * 0.12 - vec2(t * 0.09, 0.0)) - 0.5) * 0.55; }
float wSD(vec2 wp){ vec2 fuv = vec2((wp.x / 32.0 + 0.5) / 93.0, (wp.y / 32.0 + 0.5) / 73.0); return (texture2D(uWField, fuv).r - 0.5) * 8.0; }
`;
function buildWaterGL() {
  if (!WSD || !WSD.some(v => v > 0)) return null;
  const u = { uWField: { value: glWaterField() }, uWTime: { value: 0 } };
  const m = new THREE.MeshStandardMaterial({ color: 16777215, roughness: .1, metalness: 0, transparent: !0, depthWrite: !1 });
  fogPatch(m);
  const fog = m.onBeforeCompile;
  m.onBeforeCompile = (sh: any, r: any) => {
    fog && fog(sh, r);
    sh.uniforms.uWField = u.uWField, sh.uniforms.uWTime = u.uWTime;
    sh.fragmentShader = "uniform sampler2D uWField;\nuniform float uWTime;\n" + WATER_GLSL + sh.fragmentShader
      .replace("#include <color_fragment>", `#include <color_fragment>
        vec2 wp = vWorldFog.xz; float wt = uWTime;
        float wsd = wSD(wp), wn = wNoise(wp * 0.03 + 7.0);
        float wedge = wsd + (wn - 0.5) * 0.55 + (wNoise(wp * 0.11) - 0.5) * 0.18;
        if (wedge < -0.04) discard;
        float wdepth = clamp(wsd / 3.2, 0.0, 1.0);
        vec3 wcol = mix(vec3(0.06, 0.34, 0.34), vec3(0.012, 0.07, 0.13), smoothstep(0.0, 0.85, wdepth));
        wcol = mix(wcol, vec3(0.1, 0.3, 0.26), (1.0 - smoothstep(0.0, 0.25, wdepth)) * 0.5);
        float wband = 1.0 - smoothstep(0.0, 0.7, wedge);
        float wsurf = wband * (0.5 + 0.5 * sin(wedge * 10.0 - wt * 1.7 + wn * 6.0));
        float wfn = wNoise(wp * 0.09 + vec2(wt * 0.25, -wt * 0.18));
        float wFoam = clamp(wsurf * smoothstep(0.35, 0.75, wfn + wband * 0.35) + (1.0 - smoothstep(-0.04, 0.1, wedge)) * 0.85, 0.0, 1.0);
        wFoam += smoothstep(0.78, 0.9, wNoise(wp * 0.06 + vec2(-wt * 0.12, wt * 0.07))) * 0.25 * (1.0 - wdepth * 0.6);
        wFoam = clamp(wFoam, 0.0, 1.0);
        diffuseColor.rgb = mix(wcol, vec3(0.82, 0.86, 0.86), wFoam);
        diffuseColor.a = max(mix(0.5, 0.94, smoothstep(0.0, 0.55, wdepth)), wFoam * 0.92) * smoothstep(-0.04, 0.1, wedge);`)
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n        roughnessFactor = mix(roughnessFactor, 0.85, wFoam);")
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        { float e = 2.0, h0 = wWave(wp, wt), hx = wWave(wp + vec2(e, 0.0), wt), hz = wWave(wp + vec2(0.0, e), wt);
          float k = 1.6 * (1.0 - wFoam * 0.7);
          vec3 wn3 = normalize(vec3(-(hx - h0) / e * k, 1.0, -(hz - h0) / e * k));
          normal = normalize((viewMatrix * vec4(wn3, 0.0)).xyz); }`);
  };
  const g = new THREE.PlaneGeometry(2944, 2304, 1, 1), mesh = new THREE.Mesh(g, m);
  mesh.rotation.x = -Math.PI / 2, mesh.position.set(1472, WATER_Y, 1152), mesh.receiveShadow = !0, mesh.frustumCulled = !1, mesh.renderOrder = 2;
  GL.waterU = u.uWTime;
  return mesh;
}
// ---- ground detail: world-space albedo variation at three scales (breaks
// up tiling), dry vs lush grass patches, rock strata on slopes.
let _detTex: any = null;
function glDetailTex() {
  if (_detTex) return _detTex;
  const N = 256, cv = document.createElement("canvas"); cv.width = cv.height = N;
  const cx = cv.getContext("2d")!, im = cx.createImageData(N, N), d = im.data;
  const h = (x: number, y: number, p: number, s: number) => { x = ((x % p) + p) % p, y = ((y % p) + p) % p; const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
  const vn = (u: number, v: number, p: number, s: number) => { const x = u * p, y = v * p, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return (h(xi, yi, p, s) * (1 - sx) + h(xi + 1, yi, p, s) * sx) * (1 - sy) + (h(xi, yi + 1, p, s) * (1 - sx) + h(xi + 1, yi + 1, p, s) * sx) * sy; };
  const fb = (u: number, v: number, p: number, s: number) => (vn(u, v, p, s) * .5 + vn(u, v, 2 * p, s + 1) * .3 + vn(u, v, 4 * p, s + 2) * .2);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const u = i / N, v = j / N, k = 4 * (j * N + i);
    d[k] = 255 * Math.min(1, Math.max(0, fb(u, v, 16, 3) * .75 + .25 * h(i, j, N, 9)));
    d[k + 1] = 255 * fb(u, v, 4, 17);
    d[k + 2] = 255 * Math.min(1, Math.max(0, .5 + .5 * Math.sin(v * 6.283 * 9 + 5 * fb(u, v, 6, 29)) * (.4 + .6 * fb(u, v, 16, 41))));
    d[k + 3] = 255; }
  cx.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping, t.anisotropy = 4;
  return _detTex = t;
}
// ---- roads: 8px-per-tile mask of G.pave, softened, so the shader can paint
// asphalt and gravel shoulders that follow the road.
let _roadTex: any = null;
function glRoadTex() {
  const PX = 8, W = 92 * PX, H = 72 * PX, N = W * H, bin = new Uint8Array(N);
  // Highways are stroked from their straightened polylines so diagonal runs
  // stay smooth; remaining paved tiles (plazas, ramps, city grids) fill as
  // blocks.
  const lines: number[][][] = G.roadLines || [];
  let cover: Uint8ClampedArray | null = null;
  if (lines.length) {
    const lc = document.createElement("canvas"); lc.width = W, lc.height = H;
    const lx = lc.getContext("2d")!; lx.fillStyle = "#000", lx.fillRect(0, 0, W, H);
    const stroke = (w: number, col: string) => { lx.strokeStyle = col, lx.lineWidth = w, lx.lineCap = "round", lx.lineJoin = "round"; for (const pl of lines) { lx.beginPath(); pl.forEach((q, k) => { const X = (q[0] + 1) * PX, Y = (q[1] + 1) * PX; k ? lx.lineTo(X, Y) : lx.moveTo(X, Y); }); lx.stroke(); } };
    stroke(2 * PX + 10, "#010101");
    stroke(2 * PX, "#fff");
    const ld = lx.getImageData(0, 0, W, H).data;
    cover = new Uint8ClampedArray(N);
    for (let i = 0; i < N; i++) ld[4 * i] > 128 ? (bin[i] = 1, cover[i] = 2) : ld[4 * i] > 0 && (cover[i] = 1);
  }
  if (G.pave) for (let ty = 0; ty < 72; ty++) for (let tx = 0; tx < 92; tx++) if (G.pave[ty * 92 + tx]) {
    if (cover && cover[(ty * PX + PX / 2) * W + tx * PX + PX / 2]) continue;
    for (let y = ty * PX; y < ty * PX + PX; y++) bin.fill(1, y * W + tx * PX, y * W + tx * PX + PX);
  }
  const cv = document.createElement("canvas"); cv.width = W, cv.height = H;
  const cx = cv.getContext("2d")!, im = cx.createImageData(W, H), d = im.data;
  for (let i = 0; i < N; i++) d[4 * i] = bin[i] ? 255 : 0, d[4 * i + 3] = 255;
  cx.putImageData(im, 0, 0);
  // soften the mask so kerbs and junctions round off
  const out = document.createElement("canvas"); out.width = W, out.height = H;
  const oc = out.getContext("2d")!; oc.fillStyle = "#000", oc.fillRect(0, 0, W, H);
  oc.filter = "blur(3px)", oc.drawImage(cv, 0, 0), oc.filter = "none";
  _roadTex && _roadTex.dispose();
  const t = new THREE.CanvasTexture(out); t.anisotropy = 4, t.flipY = !1;
  return _roadTex = t;
}
function terrainDetailPatch(m: any) {
  const prev = m.onBeforeCompile, tex = glDetailTex(), rtex = glRoadTex();
  m.onBeforeCompile = (sh: any, r: any) => {
    prev && prev(sh, r);
    sh.uniforms.tDetail = { value: tex }; sh.uniforms.tRoad = { value: rtex }; sh.uniforms.uSnow = { value: G.snow ? 1 : 0 };
    sh.vertexShader = "varying vec3 vTN;\n" + sh.vertexShader.replace("#include <beginnormal_vertex>", "#include <beginnormal_vertex>\nvTN = objectNormal;");
    sh.fragmentShader = "uniform sampler2D tDetail;\nuniform sampler2D tRoad;\nuniform float uSnow;\nvarying vec3 vTN;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      { vec2 wp = vWorldFog.xz;
        float tdD1 = texture2D(tDetail, wp / 96.0).r, tdD2 = texture2D(tDetail, mat2(0.8, -0.6, 0.6, 0.8) * wp / 31.0).r;
        float tdM1 = texture2D(tDetail, wp / 700.0).g, tdM2 = texture2D(tDetail, wp / 190.0).g;
        vec3 c = diffuseColor.rgb;
        float grass = clamp((c.g - max(c.r, c.b)) * 9.0, 0.0, 1.0);
        c = mix(c, mix(c * vec3(0.82, 1.08, 0.84), c * vec3(1.25, 1.06, 0.66), smoothstep(0.35, 0.72, tdM1)), grass * 0.6);
        float tdG = texture2D(tDetail, mat2(0.6, 0.8, -0.8, 0.6) * wp / 8.5).r;
        c *= (0.74 + 0.52 * mix(tdD1, tdD2, 0.5)) * (0.86 + 0.28 * tdM2) * (0.86 + 0.28 * tdG);
        vec3 tdN = normalize(vTN);
        float slope = 1.0 - clamp(tdN.y, 0.0, 1.0);
        // cliffs: layered sedimentary rock, projected triplanar-style onto
        // the x- and z-facing planes so strata stay continuous across faces.
        vec2 tw = pow(abs(tdN.xz) + 0.001, vec2(4.0)); tw /= tw.x + tw.y;
        float ch = vWorldFog.y + (texture2D(tDetail, wp / 520.0).g - 0.5) * 34.0;
        #define TRI(U, V, CH) (texture2D(tDetail, vec2(wp.y / (U), (CH) / (V))) CH_SEL * tw.x + texture2D(tDetail, vec2(wp.x / (U), (CH) / (V))) CH_SEL * tw.y)
        #define CH_SEL .b
        float bandA = TRI(1100.0, 150.0, ch), bandB = TRI(1100.0, 150.0, ch + 3.0), bandC = TRI(700.0, 60.0, ch * 1.07 + 9.0);
        #undef CH_SEL
        #define CH_SEL .r
        float fiss = TRI(70.0, 420.0, ch), grit = TRI(30.0, 30.0, ch);
        #undef CH_SEL
        #undef TRI
        float strat = mix(bandA, bandC, 0.4);
        float ledge = clamp((bandA - bandB) * 3.2, -1.0, 1.0);
        vec3 rockLo = vec3(0.25, 0.2, 0.155), rockHi = vec3(0.42, 0.355, 0.275), rockDk = vec3(0.16, 0.13, 0.1);
        vec3 rockC = mix(rockLo, rockHi, smoothstep(0.25, 0.8, strat));
        rockC = mix(rockC, rockC * vec3(1.1, 0.9, 0.74), smoothstep(0.5, 0.8, tdM1) * 0.8);
        rockC *= 0.9 + 0.3 * ledge;
        rockC = mix(rockC, rockDk, smoothstep(0.33, 0.2, fiss) * 0.8);
        rockC *= 0.82 + 0.36 * grit;
        float cliffK = smoothstep(0.26, 0.5, slope);
        vec3 scree = mix(vec3(0.36, 0.33, 0.29), vec3(0.5, 0.46, 0.4), tdG) * (0.75 + 0.5 * tdD2);
        c = mix(c, scree, smoothstep(0.14, 0.28, slope) * (1.0 - cliffK) * 0.75);
        c = mix(c, rockC, cliffK);
        // snow: flat and gentle ground under a white blanket; cliffs stay
        // rock with drifts caught on the ledges.
        if (uSnow > 0.5) {
          float lie = 1.0 - smoothstep(0.3, 0.6, slope);
          vec3 snowC = vec3(0.86, 0.9, 0.96) * (0.9 + 0.1 * tdD1) * (0.95 + 0.05 * tdG);
          snowC = mix(snowC, vec3(0.78, 0.83, 0.92), smoothstep(0.55, 0.8, tdM1) * 0.5);
          c = mix(c, snowC, max(lie, cliffK * smoothstep(0.2, 0.6, ledge) * 0.7) * 0.96);
        }
        // roads: plain asphalt with patches and cracks, gravel shoulders,
        // darker worn edges.
        vec4 rd = texture2D(tRoad, wp / vec2(2944.0, 2304.0));
        float rMask = smoothstep(0.42, 0.62, rd.r), sMask = smoothstep(0.14, 0.42, rd.r) * (1.0 - rMask);
        if (rd.r > 0.1) {
          vec3 asph = vec3(0.19, 0.19, 0.2) * (0.78 + 0.4 * tdG) * (0.88 + 0.24 * tdM2);
          asph = mix(asph, vec3(0.13, 0.13, 0.14), smoothstep(0.62, 0.8, tdD1) * 0.6);
          asph = mix(asph, vec3(0.09), smoothstep(0.26, 0.2, texture2D(tDetail, wp / 19.0).r) * 0.7);
          asph = mix(asph, asph * 1.25 + vec3(0.03, 0.025, 0.0), smoothstep(0.4, 0.6, tdM1) * 0.35);
          asph *= 1.0 - 0.12 * smoothstep(0.75, 0.58, rd.r);
          vec3 grav = mix(vec3(0.42, 0.38, 0.31), vec3(0.3, 0.27, 0.22), tdG) * (0.85 + 0.3 * tdD2);
          if (uSnow > 0.5) { asph = mix(asph, vec3(0.66, 0.69, 0.74) * (0.85 + 0.2 * tdG), 0.55); grav = mix(grav, vec3(0.8, 0.83, 0.88), 0.7); }
          c = mix(c, grav, sMask * 0.85);
          c = mix(c, asph, rMask);
        }
        diffuseColor.rgb = c; }`);
  };
  m.needsUpdate = !0;
}
function buildTerrainGL(){waterSDF();const e=[],t=[],r=[],n=[],a=e=>0,PALS=[GRASS,DIRT,WATER,ROCK],colBlend=(a,e,t)=>{const o=.62*tfbm(.0085*e,.0085*t,11)+.38*tfbm(.03*e,.03*t,29),s=Math.max(0,Math.min(a.length-1.001,o*(a.length-1))),i=0|s,l=Math.min(a.length-1,i+1),c=s-i,d=rgbOf(a[i]),f=rgbOf(a[l]);return[d[0]+(f[0]-d[0])*c,d[1]+(f[1]-d[1])*c,d[2]+(f[2]-d[2])*c]},cornerColor=(cx,cy)=>{let rr=0,gg=0,bb=0,cnt=0;const wx=32*cx,wy=32*cy;for(let dy=-1;dy<=0;dy++)for(let dx=-1;dx<=0;dx++){const xx=cx+dx,yy=cy+dy;if(xx<0||yy<0||xx>=92||yy>=72)continue;let nn=G.terr[idx(xx,yy)];nn=nn>3?3:nn;const col=colBlend(PALS[nn],wx,wy);rr+=col[0],gg+=col[1],bb+=col[2],cnt++}const tc=shoreTint(cx,cy,tintCorner(cx,cy,cnt?[rr/cnt,gg/cnt,bb/cnt]:[110,110,110]));let pv=0;if(G.pave)for(let dy=-1;dy<=0;dy++)for(let dx=-1;dx<=0;dx++){const xx=cx+dx,yy=cy+dy;xx>=0&&yy>=0&&xx<92&&yy<72&&G.pave[idx(xx,yy)]&&pv++}if(!pv)return tc;const k=.35*Math.min(1,pv/2.5),n=fbm(.7*cx+3,.7*cy-9,55)-.5,ar=86+14*n,ag=88+14*n,ab=86+12*n;return[tc[0]+(ar-tc[0])*k,tc[1]+(ag-tc[1])*k,tc[2]+(ab-tc[2])*k]},CCR=new Float32Array(93*73),CCG=new Float32Array(93*73),CCB=new Float32Array(93*73);for(let cy=0;cy<73;cy++)for(let cx=0;cx<93;cx++){const col=cornerColor(cx,cy),ci=93*cy+cx;CCR[ci]=col[0],CCG[ci]=col[1],CCB[ci]=col[2]}const getCorner=(cx,cy)=>{const ci=93*cy+cx;return[CCR[ci],CCG[ci],CCB[ci]]},s=(a,o,s,i,l,c,d,f)=>{e.push(a,o,s),t.push(i,l,c);const h=f*(.72+.32*(.62*tfbm(a/32*.34,s/32*.34,5)+.38*tfbm(a/32*1.15,s/32*1.15,17))),u="string"==typeof d?rgbOf(d):d;r.push(_s2l[Math.round(u[0])]*h,_s2l[Math.round(u[1])]*h,_s2l[Math.round(u[2])]*h),n.push(a/48,s/48)};for(let e=0;e<72;e++)for(let t=0;t<92;t++){const r=idx(t,e),n=G.terr[r];const l=a(n);const paved=G.pave&&G.pave[r];const flat=null;const cTL=flat||getCorner(t,e),cBL=flat||getCorner(t,e+1),cBR=flat||getCorner(t+1,e+1),cTR=flat||getCorner(t+1,e);const c=32*t,d=c+32,f=32*e,h=f+32;const bTL=cornerBump(t,e),bBL=cornerBump(t,e+1),bBR=cornerBump(t+1,e+1),bTR=cornerBump(t+1,e);const nTL=cornerNormal(t,e),nBL=cornerNormal(t,e+1),nBR=cornerNormal(t+1,e+1),nTR=cornerNormal(t+1,e);const dTL=seabedDip(t,e),dBL=seabedDip(t,e+1),dBR=seabedDip(t+1,e+1),dTR=seabedDip(t+1,e);s(c,l+bTL+dTL,f,nTL[0],nTL[1],nTL[2],cTL,1),s(c,l+bBL+dBL,h,nBL[0],nBL[1],nBL[2],cBL,1),s(d,l+bBR+dBR,h,nBR[0],nBR[1],nBR[2],cBR,1),s(c,l+bTL+dTL,f,nTL[0],nTL[1],nTL[2],cTL,1),s(d,l+bBR+dBR,h,nBR[0],nBR[1],nBR[2],cBR,1),s(d,l+bTR+dTR,f,nTR[0],nTR[1],nTR[2],cTR,1)}const i=new THREE.BufferGeometry;i.setAttribute("position",new THREE.Float32BufferAttribute(e,3)),i.setAttribute("normal",new THREE.Float32BufferAttribute(t,3)),i.setAttribute("color",new THREE.Float32BufferAttribute(r,3)),i.setAttribute("uv",new THREE.Float32BufferAttribute(n,2));const l=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.95,metalness:0,map:glNoiseTex()});l.map.repeat.set(1,1),fogPatch(l),terrainDetailPatch(l);const c=new THREE.Mesh(i,l);c.receiveShadow=!0,c.frustumCulled=!1,GL.scene.add(c),GL.terrain=c;{const wm=buildWaterGL();wm?(GL.scene.add(wm),GL.water=wm):GL.water=null}const f=new THREE.Mesh(new THREE.PlaneGeometry(14720,11520),new THREE.MeshBasicMaterial({color:725273}));f.rotation.x=-Math.PI/2,f.position.set(1472,-60,1152),f.frustumCulled=!1,GL.scene.add(f),GL.backdrop=f;buildSkirtGL(getCorner)}
function buildSkirtGL(gc?){GL.skirt&&(GL.scene.remove(GL.skirt),GL.skirt.geometry.dispose());const W=2944,H=2304,EXT=1792,ST=64,x0=-EXT,z0=-EXT,nx=Math.round((W+2*EXT)/ST),nz=Math.round((H+2*EXT)/ST),V=(nx+1)*(nz+1),pos=new Float32Array(3*V),col=new Float32Array(3*V),dAt=(x,z)=>{const dx=x<0?-x:x>W?x-W:0,dz=z<0?-z:z>H?z-H:0;return Math.hypot(dx,dz)},sm=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)},FOG=[11/255,17/255,25/255],props=[];
for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=x0+i*ST,z=z0+j*ST,d=dAt(x,z),k=3*(j*(nx+1)+i),ecx=Math.max(0,Math.min(92,Math.round(x/32))),ecz=Math.max(0,Math.min(72,Math.round(z/32))),edgeH=cornerBump(ecx,ecz),n1=tfbm(.0022*x,.0022*z,71),n2=tfbm(.009*x,.009*z,83),hill=70+320*Math.pow(n1,1.4)+50*n2,s1=sm(0,380,d),fall=sm(1300,1800,d),h=d<=0?edgeH:edgeH*(1-s1)+hill*s1*(1-.85*fall)-40*fall;pos[k]=x,pos[k+1]=h,pos[k+2]=z;let r,g,b;const rockT=sm(120,260,hill*s1)+.3*sm(.55,.7,n2),forT=sm(.35,.6,tfbm(.006*x,.006*z,97))*(1-rockT);r=.29*(1-rockT)+.42*rockT,g=.4*(1-rockT)+.38*rockT,b=.2*(1-rockT)+.33*rockT,r=r*(1-.45*forT),g=g*(1-.3*forT),b=b*(1-.4*forT);const snow=sm(260,330,h);r+=(.86-r)*snow,g+=(.88-g)*snow,b+=(.9-b)*snow;const fz=sm(950,1750,d);r=Math.pow(r,2.2),g=Math.pow(g,2.2),b=Math.pow(b,2.2);if(gc){const ec=gc(ecx,ecz),eb=1-sm(0,220,d);r+=(.88*_s2l[Math.round(ec[0])]-r)*eb,g+=(.88*_s2l[Math.round(ec[1])]-g)*eb,b+=(.88*_s2l[Math.round(ec[2])]-b)*eb}const FL=[Math.pow(FOG[0],2.2),Math.pow(FOG[1],2.2),Math.pow(FOG[2],2.2)];col[k]=r+(FL[0]-r)*fz,col[k+1]=g+(FL[1]-g)*fz,col[k+2]=b+(FL[2]-b)*fz;if(d>40&&d<1100&&forT>.35&&rockT<.4&&tnoise(.05*x,.05*z,5)>.35)for(let t=0;t<2;t++){const px=x+(tnoise(.3*x,.3*z,t)-.5)*56,pz=z+(tnoise(.3*z,.3*x,t+9)-.5)*56;dAt(px,pz)>36&&props.push({kind:"tree",v:G.snow?((i+j+t)%3?11:15):(i*7+j*3+t)%6,x:px,y:pz,z:h-1,r:tnoise(px,pz,3)*6.28})}}
const idxs=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const cx=x0+(i+.5)*ST,cz=z0+(j+.5)*ST;if(cx>0&&cx<W&&cz>0&&cz<H)continue;const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idxs.push(a,c,b,b,c,d)}
const geo=new THREE.BufferGeometry;geo.setAttribute("position",new THREE.BufferAttribute(pos,3)),geo.setAttribute("color",new THREE.BufferAttribute(col,3)),geo.setIndex(idxs),geo.computeVertexNormals();const mat=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.97,metalness:0,map:glNoiseTex()});fogPatch(mat),G.snow&&terrainDetailPatch(mat);const m=new THREE.Mesh(geo,mat);m.receiveShadow=!0,m.frustumCulled=!1,GL.scene.add(m),GL.skirt=m,G.skirtProps=props}function glDisposeMesh(m){if(!m)return;GL.scene.remove(m),m.geometry&&m.geometry.dispose();const ms=Array.isArray(m.material)?m.material:[m.material];for(const t of ms)t&&(["map","bumpMap","normalMap"].forEach(k=>t[k]&&t[k].dispose()),t.dispose())}function rebuildTerrainGL(){GL&&(glDisposeMesh(GL.terrain),glDisposeMesh(GL.water),glDisposeMesh(GL.backdrop),GL.terrain=GL.water=GL.backdrop=null,buildTerrainGL())}function skySphere(){
  const e=new THREE.SphereGeometry(4200,32,20),t=[],r=e.attributes.position;
  for(let i=0;i<r.count;i++){
    const y=Math.max(-1,Math.min(1,r.getY(i)/4200));
    let cr,cg,cb;
    if(y>=0){
      const h=Math.pow(Math.max(0,1-y/.48),1.4);
      cr=.10+.72*h;cg=.16+.60*h;cb=.37+.28*h;
    }else{
      const d=Math.min(1,-y/.32);
      cr=.82-.40*d;cg=.76-.38*d;cb=.65-.31*d;
    }
    t.push(cr,cg,cb);
  }
  return e.setAttribute("color",new THREE.Float32BufferAttribute(t,3)),new THREE.Mesh(e,new THREE.MeshBasicMaterial({vertexColors:!0,side:THREE.BackSide,fog:!1}));
}
function buildEnvGL(){try{const e=new THREE.PMREMGenerator(GL.renderer),t=new THREE.Scene;t.add(skySphere());const r=new THREE.Mesh(new THREE.PlaneGeometry(9e3,9e3),new THREE.MeshBasicMaterial({color:6974036,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2,r.position.y=-30,t.add(r);const n=e.fromScene(t,.04,1,6e3);GL.scene.environment=n.texture,e.dispose()}catch(e){}}
function buildSunDisc(){
  const cv=document.createElement("canvas");cv.width=cv.height=256;
  const cx=cv.getContext("2d"),g=cx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,"rgba(255,250,225,1)");
  g.addColorStop(.18,"rgba(255,244,200,.95)");
  g.addColorStop(.4,"rgba(255,220,150,.45)");
  g.addColorStop(.75,"rgba(255,200,130,.12)");
  g.addColorStop(1,"rgba(255,200,130,0)");
  cx.fillStyle=g,cx.fillRect(0,0,256,256);
  const tex=new THREE.CanvasTexture(cv);tex.needsUpdate=!0;
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:!0,depthWrite:!1,fog:!1,blending:THREE.AdditiveBlending}));
  return spr.scale.set(1050,1050,1),spr;
}
function buildMoonDisc(){
  const cv=document.createElement("canvas");cv.width=cv.height=256;
  const cx=cv.getContext("2d"),g=cx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,"rgba(225,235,255,1)");
  g.addColorStop(.2,"rgba(210,222,250,.9)");
  g.addColorStop(.45,"rgba(180,195,230,.35)");
  g.addColorStop(.8,"rgba(160,180,220,.08)");
  g.addColorStop(1,"rgba(160,180,220,0)");
  cx.fillStyle=g,cx.fillRect(0,0,256,256);
  const tex=new THREE.CanvasTexture(cv);tex.needsUpdate=!0;
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:!0,depthWrite:!1,fog:!1,blending:THREE.AdditiveBlending,opacity:0}));
  return spr.scale.set(620,620,1),spr;
}
function buildStarfield(){
  const n=700,pos=new Float32Array(3*n);
  for(let i=0;i<n;i++){
    const th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1),r=4000;
    pos[3*i]=r*Math.sin(ph)*Math.cos(th),pos[3*i+1]=Math.abs(r*Math.cos(ph))*.7+500,pos[3*i+2]=r*Math.sin(ph)*Math.sin(th);
  }
  const geo=new THREE.BufferGeometry;geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color:16777215,size:9,sizeAttenuation:!1,transparent:!0,opacity:0,depthWrite:!1,fog:!1});
  return new THREE.Points(geo,mat);
}
function buildCloudTex(){
  const cv=document.createElement("canvas");cv.width=cv.height=256;
  const cx=cv.getContext("2d");
  const puff=(x,y,r,a)=>{const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba(255,255,255,"+a+")"),g.addColorStop(.6,"rgba(255,255,255,"+.55*a+")"),g.addColorStop(1,"rgba(255,255,255,0)"),cx.fillStyle=g,cx.fillRect(0,0,256,256)};
  puff(100,140,80,.85),puff(150,130,70,.8),puff(180,150,55,.7),puff(90,110,50,.6),puff(130,170,60,.55);
  const tex=new THREE.CanvasTexture(cv);return tex.needsUpdate=!0,tex;
}
function buildClouds(){
  const tex=buildCloudTex(),g=new THREE.Group;
  for(let i=0;i<14;i++){
    const ang=Math.random()*Math.PI*2,dist=1700+Math.random()*1700,h=420+Math.random()*900,s=380+Math.random()*520,op=.35+Math.random()*.4;
    const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:!0,depthWrite:!1,fog:!1,opacity:op,color:15922407}));
    spr.position.set(Math.cos(ang)*dist,h,Math.sin(ang)*dist),spr.scale.set(s,s*.55,1),g.add(spr);
  }
  return g;
}function updateLitPool(camX,camY,dayF){
  const pool=GL.litPool,maxLights=QUALITY>=2?14:QUALITY>=1?8:4,cands=[];
  for(const b of S.blds){
    if(b.dead||"wall"===b.key||"gate"===b.key)continue;
    const dx=b.x-camX,dy=b.y-camY,d2=dx*dx+dy*dy;
    if(d2>1.7e6)continue;
    cands.push({x:b.x,y:heightAt(b.x,b.y)+18+6*b.size,z:b.y,d2,owner:b.owner});
  }
  for(const u of S.units){
    if(u.dead||u.inside)continue;
    const dx=u.x-camX,dy=u.y-camY,d2=dx*dx+dy*dy;
    if(d2>1e6)continue;
    cands.push({x:u.x,y:heightAt(u.x,u.y)+(u.alt||0)+10,z:u.y,d2,owner:u.owner});
  }
  cands.sort((c1,c2)=>c1.d2-c2.d2);
  const n=Math.min(maxLights,cands.length);
  while(pool.length<n){
    const pl=new THREE.PointLight(16777215,0,150,2);
    pl.castShadow=!1,GL.scene.add(pl),pool.push(pl);
  }
  const baseInt=.5+1.1*(1-dayF);
  for(let i=0;i<pool.length;i++){
    const pl=pool[i];
    if(i<n){
      const c=cands[i],pal=S.players[c.owner]?palette(c.owner):null,col=pal&&pal.body||"#ffcf8a";
      pl.visible=!0,pl.position.set(c.x,c.y,c.z),pl.color.set(col),pl.intensity=baseInt;
    }else pl.visible=!1,pl.intensity=0;
  }
}
function buildRain(){
  const n=900,pos=new Float32Array(6*n),drop=new Float32Array(n);
  for(let i=0;i<n;i++){
    const x=(Math.random()-.5)*2600,z=(Math.random()-.5)*2600,y=Math.random()*1200;
    drop[i]=y;
    pos[6*i]=x,pos[6*i+1]=y,pos[6*i+2]=z;
    pos[6*i+3]=x+18,pos[6*i+4]=y-38,pos[6*i+5]=z+18;
  }
  const geo=new THREE.BufferGeometry;geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const mat=new THREE.LineBasicMaterial({color:12175830,transparent:!0,opacity:0,depthWrite:!1,fog:!1});
  const ls=new THREE.LineSegments(geo,mat);
  ls._pos=pos,ls._drop=drop;
  return ls;
}
function buildSkyGL(){const e=skySphere();e.frustumCulled=!1,GL.scene.add(e),GL.sky=e,buildEnvGL();const s=buildSunDisc();s.frustumCulled=!1,GL.scene.add(s),GL.sunDisc=s;const m=buildMoonDisc();m.frustumCulled=!1,GL.scene.add(m),GL.moonDisc=m;const st=buildStarfield();st.frustumCulled=!1,GL.scene.add(st),GL.stars=st;const cl=buildClouds();cl.frustumCulled=!1,GL.sky.add(cl),GL.clouds=cl;const rn=buildRain();rn.frustumCulled=!1,GL.scene.add(rn),GL.rain=rn}// launch-menu backdrop: a perspective camera orbiting the whole map
var MENU_CAM:any=null;function setMenuCam(c){MENU_CAM=c}

// ---- tread marks: terrain decals laid along each vehicle's path. One
// instanced mesh, a ring buffer of segments; each quad is tilted to the
// ground under it and multiplies the terrain darker, fading with age.
const TRK = { n: 4000, i: 0, mesh: null as any, fade: null as any, born: new Float32Array(4000), life: new Float32Array(4000), dirty: !1, lastT: 0 };
const _tkM = new THREE.Matrix4(), _tkX = new THREE.Vector3(), _tkY = new THREE.Vector3(), _tkZ = new THREE.Vector3();
function trackMark(x: number, y: number, ang: number, w: number, l: number, life: number) {
  if (!GL || !GL.scene) { S.fx.push({ kind: "track", x, y, ang, w: .5 * w, l: .5 * l, t: 0, life: Math.min(life, 5) }); return; }
  if (!TRK.mesh) glTrackInit();
  const k = TRK.i, c = Math.cos(ang), s = Math.sin(ang), h = heightAt(x, y);
  // tilt to the slope: forward and side vectors follow the ground
  const hf = heightAt(x + c * 4, y + s * 4) - heightAt(x - c * 4, y - s * 4), hs = heightAt(x - s * 4, y + c * 4) - heightAt(x + s * 4, y - c * 4);
  _tkX.set(c, hf / 8, s).normalize().multiplyScalar(l);
  _tkZ.set(-s, hs / 8, c).normalize().multiplyScalar(w);
  _tkY.crossVectors(_tkZ, _tkX).normalize();
  _tkM.makeBasis(_tkX, _tkY, _tkZ).setPosition(x, h + .45, y);
  TRK.mesh.setMatrixAt(k, _tkM);
  TRK.born[k] = S.time, TRK.life[k] = life;
  TRK.i = (k + 1) % TRK.n, TRK.dirty = !0;
  TRK.mesh.count = Math.max(TRK.mesh.count, k + 1);
}
function glTrackInit() {
  const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2);
  const fade = new THREE.InstancedBufferAttribute(new Float32Array(TRK.n), 1); fade.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute("aFade", fade);
  const m = new THREE.ShaderMaterial({
    vertexShader: "attribute float aFade;varying float vF;varying vec2 vUv;void main(){vF=aFade;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}",
    uniforms: { uSnow: { value: 0 } },
    fragmentShader: "uniform float uSnow;varying float vF;varying vec2 vUv;void main(){float bar=mix(0.55+0.45*step(0.45,fract(vUv.x*5.0)),1.0,uSnow*0.6);float edge=smoothstep(0.0,0.22,vUv.y)*smoothstep(1.0,0.78,vUv.y);float d=mix(0.44,0.5,uSnow)*bar*edge*vF;vec3 tint=mix(vec3(1.0),vec3(0.95,0.88,0.7),uSnow);gl_FragColor=vec4(vec3(1.0)-d*tint,1.0);}",
    transparent: !0, depthWrite: !1, blending: THREE.CustomBlending, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor, blendEquation: THREE.AddEquation,
    polygonOffset: !0, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const mesh = new THREE.InstancedMesh(g, m, TRK.n);
  mesh.count = 0, mesh.frustumCulled = !1, mesh.renderOrder = 1;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  GL.scene.add(mesh), TRK.mesh = mesh, TRK.fade = fade;
}
function glTrackUpdate() {
  if (!TRK.mesh) return;
  if (S.time < TRK.lastT - 1) TRK.mesh.count = 0, TRK.i = 0; // new game
  TRK.lastT = S.time;
  TRK.mesh.material.uniforms.uSnow.value = G.snow ? 1 : 0;
  if (TRK.mesh.parent !== GL.scene) GL.scene.add(TRK.mesh);
  const a = TRK.fade.array, n = TRK.mesh.count;
  for (let k = 0; k < n; k++) { const age = (S.time - TRK.born[k]) / (TRK.life[k] || 1); a[k] = age >= 1 ? 0 : age < .7 ? 1 : 1 - (age - .7) / .3; }
  TRK.fade.needsUpdate = !0;
  if (TRK.dirty) TRK.mesh.instanceMatrix.needsUpdate = !0, TRK.dirty = !1;
}

// ---- snowfall: a drifting field of flakes kept centred on the view.
const SNOWF = { pts: null as any, pos: null as any, n: 2600, ph: null as any };
function glSnowFall(on: boolean, cx: number, cy: number, amt = 1) {
  if (!on) { SNOWF.pts && (SNOWF.pts.visible = !1); return; }
  if (!SNOWF.pts) {
    const g = new THREE.BufferGeometry(), p = new Float32Array(3 * SNOWF.n); SNOWF.ph = new Float32Array(SNOWF.n);
    for (let i = 0; i < SNOWF.n; i++) p[3 * i] = rnd(-900, 900), p[3 * i + 1] = rnd(0, 900), p[3 * i + 2] = rnd(-900, 900), SNOWF.ph[i] = 6.283 * Math.random();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({ color: 0xffffff, size: 2.6, sizeAttenuation: !1, transparent: !0, opacity: .85, depthWrite: !1, fog: !1 });
    SNOWF.pts = new THREE.Points(g, m), SNOWF.pts.frustumCulled = !1, SNOWF.pos = p;
  }
  SNOWF.pts.parent !== GL.scene && GL.scene.add(SNOWF.pts);
  SNOWF.pts.visible = !0, SNOWF.pts.position.set(cx, 0, cy), SNOWF.pts.material.opacity = .85 * amt;
  const p = SNOWF.pos, T = S.time, fall = 55 * RDT;
  for (let i = 0; i < SNOWF.n; i++) {
    const k = 3 * i; p[k + 1] -= fall * (.7 + .6 * (i % 7) / 7);
    p[k] += Math.sin(.9 * T + SNOWF.ph[i]) * 18 * RDT + 10 * RDT, p[k + 2] += Math.cos(.7 * T + SNOWF.ph[i]) * 14 * RDT;
    p[k + 1] < 0 && (p[k + 1] += 900); p[k] > 900 && (p[k] -= 1800); p[k] < -900 && (p[k] += 1800); p[k + 2] > 900 && (p[k + 2] -= 1800); p[k + 2] < -900 && (p[k + 2] += 1800);
  }
  SNOWF.pts.geometry.attributes.position.needsUpdate = !0;
}
function renderGL(){fpsGfxPre();glTrackUpdate();GL.waterU&&(GL.waterU.value=S.time);if(GL.water){const wm=GL.water.material;wm.map&&(wm.map.offset.x=.015*S.time,wm.map.offset.y=.006*S.time),wm.bumpMap&&(wm.bumpMap.offset.x=-.03*S.time,wm.bumpMap.offset.y=.012*S.time)}let e,t,r;if(FPS.on&&FPS.u)cam.x=FPS.u.x,cam.y=FPS.u.y,e=fpsRender(),t=r=620;else if(MENU_CAM)e=MENU_CAM,t=r=2600;else{e=GL.camera,t=CW/(GL_SX*cam.z)/2,r=CH/(GL_SY*cam.z)/2,e.left=-t,e.right=t,e.top=r,e.bottom=-r;const n=cam.x,a=cam.y;e.position.set(n+3200*GL_F[0],3200*GL_F[1],a+3200*GL_F[2]),e.lookAt(n,0,a),e.updateProjectionMatrix()}const n=cam.x,a=cam.y;GL.sky&&(GL.sky.position.set(n,0,a),GL.sky.rotation.y=.0035*S.time);
const dph=S.time%DAY_LEN/DAY_LEN,elev=1.15*Math.sin(6.283*dph),ce=Math.cos(elev),se=Math.sin(elev),bmag=859,ux=-495/bmag,uz=-702/bmag,sdx=bmag*ce*ux,sdz=bmag*ce*uz,sdy=700*se,dayF=Math.max(0,se),nightF=Math.max(0,-se);
const wMood=S.weather||"clear",isRain="rain"===wMood,isSnow="snow"===wMood,wxA=null==S.wxAmt?1:S.wxAmt,wAmt=("clear"===wMood?0:isRain?.85:isSnow?.45:.55)*wxA;glSnowFall(isSnow&&wxA>.03,n,a,wxA);
GL.sun.color.copy(_dawnCol).lerp(_noonCol,Math.min(1,dayF/.9)),GL.sun.intensity=(.05+dayF*2.05)*(1-.55*wAmt);
GL.hemi.intensity=.1+.5*dayF+.05*nightF,GL.hemi.color.copy(_hemiDay).lerp(_hemiNight,nightF),GL.hemi.groundColor.copy(_hemiGroundDay).lerp(_hemiGroundNight,nightF);
wAmt>0&&(GL.hemi.color.lerp(isRain?_hemiRain:_hemiOver,wAmt),GL.hemi.groundColor.lerp(isRain?_hemiGroundRain:_hemiGroundOver,wAmt));
GL.fill&&(GL.fill.intensity=(.12+.32*dayF)*(1-.4*wAmt));
GL.sky.material.color.copy(_skyDay).lerp(_skyNight,nightF),wAmt>0&&GL.sky.material.color.lerp(isRain?_skyRain:_skyOver,wAmt);
_tmpFog.copy(_fogDay).lerp(_fogNight,nightF),wAmt>0&&_tmpFog.lerp(isRain?_fogRain:_fogOver,wAmt),GL.scene.fog&&(GL.scene.fog.color.copy(_tmpFog),GL.scene.fog.near=FOG_NEAR+300*wAmt,GL.scene.fog.far=FOG_FAR-(FOG_FAR-4200)*wAmt),GL.renderer.setClearColor(_tmpFog,1);
GL.sunDisc&&(GL.sunDisc.position.set(n+8*sdx,10*Math.max(40,sdy),a+8*sdz),GL.sunDisc.material.opacity=Math.min(1,1.4*dayF)*(1-.8*wAmt));
GL.moonDisc&&(GL.moonDisc.position.set(n-8*sdx,10*Math.max(40,-sdy),a-8*sdz),GL.moonDisc.material.opacity=Math.min(1,1.4*nightF)*(1-.6*wAmt));
GL.stars&&(GL.stars.position.set(n,0,a),GL.stars.material.opacity=Math.min(.85,1.2*nightF)*(1-.7*wAmt));
GL.clouds&&GL.clouds.children.forEach(cl=>{void 0===cl._baseOp&&(cl._baseOp=cl.material.opacity),cl.material.opacity=Math.min(1,cl._baseOp*(.3+.7*dayF)*(1+.6*wAmt))});
if(GL.rain){const targetOp=isRain?.5*wxA:0;GL.rain.material.opacity+=(targetOp-GL.rain.material.opacity)*.04;if(GL.rain.material.opacity>.01){GL.rain.visible=!0,GL.rain.position.set(n,0,a);const rpos=GL.rain._pos,rdrop=GL.rain._drop,rspd=900*RDT;for(let ri=0;ri<rdrop.length;ri++){rdrop[ri]-=rspd,rdrop[ri]<-150&&(rdrop[ri]+=1350);const rdy=rdrop[ri]-rpos[6*ri+1];rpos[6*ri+1]+=rdy,rpos[6*ri+4]+=rdy}GL.rain.geometry.attributes.position.needsUpdate=!0}else GL.rain.visible=!1}
const o=GL.sun;o.target.position.set(n,0,a),o.position.set(n+sdx,Math.max(80,sdy+120),a+sdz);const s=1.35*Math.max(t,r)+140,i=o.shadow.camera;i.left=-s,i.right=s,i.top=s,i.bottom=-s,i.near=1,i.far=2600,i.updateProjectionMatrix(),fpsGfxShadow();updateLitPool(n,a,dayF);const l=[],c=(e,t,r,n,a,o,s,i?,c?,rl?,pt?)=>{let d=GL.groups.get(e);d&&d.touched||(d=d||{geo:c||glGeom(e,t,r),solid:null,emis:null,list:[]},d.geo||(d.geo=c||glGeom(e,t,r)),d.list.length=0,d.touched=1,d.noShadow=!!i,d.wind=WIND_KEYS.test(e),GL.groups.set(e,d),l.push(e)),_usc!==1&&(n=_ux+(n-_ux)*_usc,a=_uy+(a-_uy)*_usc,o=_uz+(o-_uz)*_usc),d.sc=_usc,d.list.push(n,a,o,s,rl||0,pt||0)};for(const e of GL.groups.values())e.touched=0;const d=S.time,f=FPS.on?1700:(CW+CH)/cam.z*.62+320;for(const e of S.blds){if(e.dead)continue;if(FPS.on&&FPS.u&&FPS.u.inside===e)continue;if(Math.abs(e.x-cam.x)+Math.abs(e.y-cam.y)>f+220)continue;if(!seen(e))continue;const live=2===visAt(e.x,e.y);const t=e.owner<0?"neutral":S.players[e.owner].fac,r=e.owner<0?{body:MAT.neutral,dark:"#6a6252",trim:"#aaa"}:palette(e.owner),gy=e.d.naval?3.8:heightAt(e.x,e.y),n=(hasStagedBuild(e.key)?0:(e.rise>=1?0:-(1-e.rise)*(32*e.size*.62+30)))+gy,conn=("wall"===e.key||"gate"===e.key)?wallNeighborMask(e.tx,e.ty,e.owner)|("gate"===e.key?gateNeighborBits(e.tx,e.ty,e.owner)<<4:0):0,gateBucket="gate"===e.key?Math.round(8*(e.gateT||0)):0,riseBucket=hasStagedBuild(e.key)?Math.round(4*Math.min(1,e.rise)):4,mf=e.capturedFac||t,prod=("factory"===e.key&&S.players[e.owner]&&S.players[e.owner].queues.veh&&S.players[e.owner].queues.veh.list.length)?S.players[e.owner].queues.veh.list[0]+"@"+Math.min(4,Math.floor(5*(S.players[e.owner].queues.veh.prog||0))):null,doorBucket="factory"===e.key?Math.round(10*(e.doorT||0)):0,a="B"+e.key+(("hive"===e.key||"super"===e.key)?e.deployed?"D":"U":"gate"===e.key?"G"+gateBucket:hasStagedBuild(e.key)?"R"+riseBucket:"")+(conn?"_c"+conn:"")+("factory"===e.key?"|PU"+(prod||"-")+"|DR"+doorBucket:"")+"|"+mf+"|"+e.owner;c(a,()=>BMODEL(e.key,mf,"gate"===e.key?gateBucket/8:hasStagedBuild(e.key)?Math.min(1,e.rise):e.deployed,conn,e.rot||0,prod,doorBucket/10),r,e.x,e.y,n,e.rot||0);const o=GLGEO.get(a);if(live&&o&&o.anims)for(let t=0;t<o.anims.length;t++){const s=o.anims[t];let px=s.px,py=s.py,pz=s.pz,rot=s.spin?d*s.spin:0;if(s.orbit){const ang=s.amp?s.amp*Math.sin(d*s.orbit):d*s.orbit,rx=s.px-s.pvx,ry=s.py-s.pvy,ca=Math.cos(ang),sa=Math.sin(ang);px=s.pvx+rx*ca-ry*sa,py=s.pvy+rx*sa+ry*ca,rot=ang}if(s.belt){const bf=(d*s.belt+s.pp)%1;px=s.px-s.pw*bf,py=s.py-s.bdy*bf,pz=s.pz-s.bdz*bf}if(s.patrol){const ph=(d*s.patrol+s.pp)%1,p4=4*ph,w=s.pw,h=s.ph;let ox=0,oz=0;p4<1?ox=-w*p4:p4<2?(ox=-w,oz=-h*(p4-1)):p4<3?(ox=-w,oz=-h*(1-(p4-2))):ox=-w*(1-(p4-3));px=s.px+ox,pz=s.pz+oz}let pit=0;if(s.rock){pit=s.ra?s.ra*Math.sin(d*s.rock+s.rph):d*s.rock+s.rph;const dx=px-s.rpx,dz=pz-s.rpz,cq=Math.cos(pit),sq=Math.sin(pit);px=s.rpx+dx*cq-dz*sq,pz=s.rpz+dx*sq+dz*cq}c(a+"#a"+t,null,r,e.x+px,e.y+py,n+pz+(s.bob?s.ba*Math.sin(d*s.bob+s.rph):0),rot,0,s.geo,0,pit)}live&&(e.frTang=e.tang||0,e.frTang2=e.tang2||0);hasBTurret(e.key,mf)&&c("BT"+e.key+"|"+mf+"|"+e.owner,()=>BTURRET(e.key,mf,0),r,e.x,e.y,n,live?e.tang||0:e.frTang||0);if("triturret"===e.key){const off=.34*32*e.size,ownKey="|"+mf+"|"+e.owner;c("BTt1"+ownKey,()=>triGunHead(mf),r,e.x-off,e.y,n,live?e.tang||0:e.frTang||0),c("BTt2"+ownKey,()=>triGunHead(mf),r,e.x+off,e.y,n,live?e.tang||0:e.frTang||0),c("BTt3"+ownKey,()=>triAAHead(mf),r,e.x,e.y,n,live?e.tang2||0:e.frTang2||0)}}const hdS=fpsHDSet();for(const e of S.units){if(e.dead||e.inside)continue;if(FPS.on&&!FPS.thirdPerson&&e===FPS.u&&"inf"===e.d.kind)continue;if(hdS&&hdS.has(e))continue;if(Math.abs(e.x-cam.x)+Math.abs(e.y-cam.y)>f)continue;if(!seen(e))continue;_usc=FPS.on?fpsUnitScale(e):1,_ux=e.x,_uy=e.y,_uz=(e.d.naval?.8:e.d.swim?unitGroundH(e):heightAt(e.x,e.y))+(e.d.fly?e.alt||0:0);const hitFlash=e.hitT>0&&"inf"===e.d.kind,t=hitFlash?{body:"#ffffff",dark:"#ddb8b0",trim:"#ffffff"}:palette(e.owner),r=unitFrame(e),gy=(e.d.naval?.8:unitGroundH(e))+(FPS.on&&e===FPS.u?0:unitBob(e)),v3l="ravager"===e.key?e.cool<=0:void 0,dep=e.deployed?1:0,turRise=dep&&TURRET_RISE[e.key]||0;let gt:any,tt:any;const hb=hdBakeOk(e)?hdBakeGeo(e,r&15):null;c((hb?"UH":"U")+e.key+"|"+e.owner+"|"+r+("ravager"===e.key?"|L"+(v3l?1:0):"")+(dep?"|D":"")+(hitFlash&&!hb?"|H":"")+(e.heroMode?"|"+e.heroMode:""),()=>UMODEL(e.key,r,{l:v3l,dep:e.deployed,fac:S.players[e.owner]&&S.players[e.owner].fac,heroMode:e.heroMode}),t,e.x,e.y,gy+(e.alt||0),e.ang,void 0,hb||void 0,(gt=groundTilt(e,e.ang))?gt[0]:e.bank||0,gt?gt[1]:e.pitchA||0),hasTurret(e.key)&&(tt=gt&&groundTilt(e,e.tang,1),((tk,rc)=>{const hb=turretHasBarrel(e.key,e.gunKey,dep),bk=rc*(hb?.7:2.8),cx=Math.cos(e.tang),sx=Math.sin(e.tang),tz=gy+(e.alt||0)+turRise,tr=tt?tt[0]:0,tp=(tt?tt[1]:0)+(hb?.03:.1)*rc;c("UT"+tk,()=>UTURRET(e.key,0,{gunKey:e.gunKey}).filter(q=>!q.b),t,e.x-cx*bk,e.y-sx*bk,tz,e.tang,void 0,void 0,tr,tp);hb&&c("UB"+tk,()=>UTURRET(e.key,0,{gunKey:e.gunKey}).filter(q=>q.b),t,e.x-cx*4.2*rc,e.y-sx*4.2*rc,tz,e.tang,void 0,void 0,tr,tp)})(e.key+(e.gunKey?"_"+e.gunKey:"")+"|"+e.owner+(dep?"|D":""),e.recoil||0)),"miner"===e.d.role&&(mo=>c("UA"+e.key+"|"+e.owner,mo[0],t,e.x+mo[1]*Math.cos(e.ang),e.y+mo[1]*Math.sin(e.ang),gy+(e.alt||0),e.augerSpin||0))(MINE_TOOL[e.key]||MINE_DEFAULT),("chinook"===e.key||"skyhauler"===e.key)&&(c("UR"+e.key+"|"+e.owner,heliRotor,t,e.x+2*Math.cos(e.ang),e.y+2*Math.sin(e.ang),gy+(e.alt||0)+22,e.rotorSpin||0),"chinook"===e.key?c("UTR"+e.key+"|"+e.owner,heliRotor,t,e.x-28*Math.cos(e.ang),e.y-28*Math.sin(e.ang),gy+(e.alt||0)+22,-(e.rotorSpin||0)):c("UTRV"+e.key+"|"+e.owner,heliTailRotorV,t,e.x-28*Math.cos(e.ang)-2.2*Math.sin(e.ang),e.y-28*Math.sin(e.ang)+2.2*Math.cos(e.ang),gy+(e.alt||0)+16,e.ang,void 0,void 0,0,1.4*(+e.rotorSpin||0))),e.d.vehSlots&&e.cargo&&e.cargo.length&&(cv=>cv&&c("UV"+cv.key+"|"+cv.owner,()=>UMODEL(cv.key,unitFrame(cv),{}),palette(cv.owner),e.x,e.y,gy+Math.max(2,(e.alt||0)-22),e.ang))(e.cargo.find(cc=>"inf"!==cc.d.kind))}_usc=1;const h=FPS.on?1500:(CW+CH)/cam.z*.55+260;if(S.crates)for(const e of S.crates)(!FOG_ON||G.vis[idx(e.x/32|0,e.y/32|0)]>0)&&c("XCRATE",crateModel,TIBPAL,e.x,e.y,heightAt(e.x,e.y)+1.2+1.2*Math.sin(3*S.time+e.x),e.r+.6*S.time);if(G.props)for(const e of G.props)Math.abs(e.x-cam.x)+Math.abs(e.y-cam.y)>1.25*h||c("X"+e.kind+e.v,()=>PROPMODEL(e.kind,e.v),TIBPAL,e.x,e.y,null!=e.z?e.z:heightAt(e.x,e.y),e.r,"scrub"===e.kind||"stone"===e.kind||"crater"===e.kind||"grass"===e.kind||"flower"===e.kind);if(G.skirtProps)for(const e of G.skirtProps)Math.abs(e.x-cam.x)+Math.abs(e.y-cam.y)>1.4*h||c("X"+e.kind+e.v,()=>PROPMODEL(e.kind,e.v),TIBPAL,e.x,e.y,e.z,e.r,!0);if(S.traffic)for(const e of S.traffic)Math.abs(e.x-cam.x)+Math.abs(e.y-cam.y)>1.25*h||c("CAR"+e.v,()=>carModel(e.v),TIBPAL,e.x,e.y,heightAt(e.x,e.y),e.ang,!1);if(G.trees)for(const e of G.trees)e.px||(e.px=32*e.tx+16,e.py=32*e.ty+16),Math.abs(e.px-cam.x)+Math.abs(e.py-cam.y)>1.4*h||c("P"+e.type,()=>blossomModel(e.type),TIBPAL,e.px,e.py,heightAt(e.px,e.py),(7*e.tx+3*e.ty)%8/8*6.283,1);const u=FPS.on?900:.8*h,p=Math.max(0,Math.floor((cam.x-u)/32)),m=Math.min(91,Math.ceil((cam.x+u)/32)),g=Math.max(0,Math.floor((cam.y-u)/32)),y=Math.min(71,Math.ceil((cam.y+u)/32)),drillTiles={};if(G.oreSpots)for(const spot of G.oreSpots){if(Math.abs(32*spot.x+16-cam.x)+Math.abs(32*spot.y+16-cam.y)>1.3*h)continue;if(inMap(spot.x,spot.y)&&G.occ[idx(spot.x,spot.y)]){for(let ny=spot.y-1;ny<=spot.y+1;ny++)for(let nx=spot.x-1;nx<=spot.x+1;nx++)drillTiles[nx+","+ny]=1;continue}for(let ny=spot.y-1;ny<=spot.y+1;ny++)for(let nx=spot.x-1;nx<=spot.x+1;nx++)drillTiles[nx+","+ny]=1;const dwx=32*spot.x+16,dwy=32*spot.y+16,dwz=heightAt(dwx,dwy),drot=(7*spot.x+3*spot.y)%8/8*6.283,dk="DRILL"+spot.type;c(dk,()=>oreDrillModel(spot.type),TIBPAL,dwx,dwy,dwz,drot,0);const og=GLGEO.get(dk);if(og&&og.anims)for(let ai=0;ai<og.anims.length;ai++){const s=og.anims[ai];c(dk+"#a"+ai,null,TIBPAL,dwx+s.px,dwy+s.py,dwz+s.pz+(s.bob?s.ba*Math.sin(d*s.bob):0),drot+(s.spin?d*s.spin:0),0,s.geo)}}for(let e=g;e<=y;e++)for(let t=p;t<=m;t++){const r=idx(t,e),n=G.ore[r];if(n<=0)continue;if(drillTiles[t+","+e])continue;const hh=(t*928371+e*128371|0)>>>0;if(hh%100<8)continue;const o=2===G.tib[r]?2:1,frac=Math.max(0,Math.min(1,n/(ORE_MAX[o]||2600))),wx=32*t+16,wy=32*e+16,wz=heightAt(wx,wy),rot=(7*t+3*e)%8/8*6.283;const a=Math.min(5,Math.floor(6*frac)),vv=hh%3;c("O"+o+a+"v"+vv,()=>crystalModel(o,a,vv),TIBPAL,wx,wy,wz,rot,1)}for(const p of S.projs){if(p.dead)continue;if(FPS.on&&("bullet"===p.kind||"flak"===p.kind))continue;if(2!==visAt(p.x,p.y))continue;const pf=S.players[p.owner]&&S.players[p.owner].fac||"";const pk=p.fire?"fshell":p.kind;c("PJ"+pk+pf,()=>projModel(pk,pf),TIBPAL,p.x,p.y,heightAt(p.x,p.y)+(p.z||0)*(FPS.on?FPS_INF_SC+.1:1),p.ang,!1)}if(S.rockets)for(const rk of S.rockets){if(rk.dead)continue;rk.mesh||(rk.mesh=buildRocketMesh3D(),GL.scene.add(rk.mesh));const arc=rocketArc(rk),dx=(rk.tx-rk.x0)/rk.dur,dy=(rk.ty-rk.y0)/rk.dur,dz=arc.peak*4*(1-2*arc.p)/rk.dur,fwd=new THREE.Vector3(dx,dz,dy);rk.mesh.position.set(arc.x,arc.z,arc.y),fwd.lengthSq()>1e-6&&rk.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),fwd.normalize()),rk.mesh.visible=2===visAt(arc.x,arc.y)}for(const[e,t]of GL.groups)t.touched||(t.list.length=0),glFlush(t,e);GL.renderer.render(GL.scene,e);if(FPS.on&&FPS.u&&FPS.u.inside&&GL.interiorScene){for(const ig of GL.interiorScene.children)ig.visible=ig===FPS.u.inside.interior;GL.renderer.autoClear=!1,GL.renderer.clearDepth(),GL.renderer.render(GL.interiorScene,e),GL.renderer.autoClear=!0}fpsGfxPost()}
Object.assign(window,{setMenuCam,trackMark,cornerBumpBase});
Object.assign(window, {
  glMerge, fogPatch, glPixelRatioCap, GLGEO,
  initGL, resizeGL, onFogUpdated, setFogUniform, heightAt, rebuildTerrainGL, renderGL, flattenFootprint
});

Object.defineProperties(window, {
  GL: { get: () => GL, configurable: true },
});
