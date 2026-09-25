// @ts-nocheck
export {};
// ---- Cutscenes -----------------------------------------------------------------
// Campaign films rendered live on a 2D canvas: each film is a list of shots,
// each shot a painted scene (space, the meteor strike, Site Nine, the lab
// breach, the cloning vats, war maps, battles, character close-ups) with a
// slow camera move, film grain and letterboxing, a voiced line and subtitle,
// and a score cue. Tap to skip a shot; SKIP ends the film.

// ---- tiny deterministic helpers ----
function mulb(a){return()=>{a|=0,a=a+1831565813|0;let t=Math.imul(a^a>>>15,1|a);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}
const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,sat=t=>Math.max(0,Math.min(1,t));
function vnoise(x,y,s){const h=(i,j)=>{let n=i*374761393+j*668265263+s*982451653|0;n=Math.imul(n^n>>>13,1274126177);return((n^n>>>16)>>>0)/4294967296},xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v)}
const fbm2=(x,y,s)=>.5*vnoise(x,y,s)+.25*vnoise(2*x,2*y,s+1)+.125*vnoise(4*x,4*y,s+2)+.0625*vnoise(8*x,8*y,s+3);
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return"rgba("+(n>>16&255)+","+(n>>8&255)+","+(255&n)+","+a+")"}
function glow(g,x,y,r,c,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba(c,a)),gr.addColorStop(1,rgba(c,0)),g.fillStyle=gr,g.fillRect(x-r,y-r,2*r,2*r)}
function rockPath(g,x,y,r,seed,rot){const R=mulb(seed);g.beginPath();for(let i=0;i<14;i++){const a=rot+i/14*Math.PI*2,rr=r*(.72+.4*R());i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.86):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.86)}g.closePath()}
function drawFragment(g,x,y,r,T,hot,seed){glow(g,x,y,r*3.2,"#9b6bff",.35+.15*Math.sin(3*T)),glow(g,x,y,r*1.8,"#5ff0ff",.25);rockPath(g,x,y,r,seed||7,.3*Math.sin(.4*T));const gr=g.createLinearGradient(x-r,y-r,x+r,y+r);gr.addColorStop(0,"#2a2436"),gr.addColorStop(1,"#0c0a12"),g.fillStyle=gr,g.fill();g.save(),g.clip(),g.strokeStyle=rgba("#b98cff",.6+.3*Math.sin(4*T)),g.lineWidth=Math.max(1,r*.06),g.shadowColor="#b98cff",g.shadowBlur=r*.5;const R=mulb(seed||7);for(let i=0;i<6;i++){g.beginPath();let px=x+(R()-.5)*r,py=y+(R()-.5)*r;g.moveTo(px,py);for(let k=0;k<4;k++)px+=(R()-.5)*r*.7,py+=(R()-.5)*r*.7,g.lineTo(px,py);g.stroke()}g.restore();hot&&glow(g,x,y,r*1.2,"#ffffff",.25*hot)}

// ---- scenes: (g, W, H, t 0..1 through the shot, T seconds, p params) ----
const STARS=(()=>{const R=mulb(11),a=[];for(let i=0;i<520;i++)a.push([R(),R(),R()*R()*1.8+.3,R()*6]);return a})();
function sky(g,W,H,stops){const gr=g.createLinearGradient(0,0,0,H);stops.forEach(([o,c])=>gr.addColorStop(o,c)),g.fillStyle=gr,g.fillRect(0,0,W,H)}
function starfield(g,W,H,T,a,drift){for(const[x,y,s,tw]of STARS){const al=a*(.45+.55*Math.sin(T*1.3+tw)**2);g.fillStyle="rgba(220,230,255,"+al+")";g.fillRect(((x+drift*T*s*.01)%1+1)%1*W,y*H,s,s)}}
function ridge(g,W,H,base,amp,seed,col,freq){g.beginPath(),g.moveTo(0,H);for(let i=0;i<=80;i++){const x=i/80;g.lineTo(x*W,base*H-amp*H*fbm2(x*(freq||4),0,seed))}g.lineTo(W,H),g.closePath(),g.fillStyle=col,g.fill()}

const SCENES={
space(g,W,H,t,T,p){sky(g,W,H,[[0,"#020308"],[1,"#070b18"]]);const m=Math.min(W,H);
for(const[x,y,r,c]of[[.25,.3,.5,"#4b2a7a"],[.8,.2,.4,"#16406a"],[.6,.7,.45,"#3a1850"]])glow(g,x*W,y*H,r*W,c,.28);
starfield(g,W,H,T,1,.6);
if(p.earth){const cx=W*.5,cy=H*2.05,R=H*1.35;g.save();const gr=g.createRadialGradient(cx,cy-R*.4,R*.2,cx,cy,R);gr.addColorStop(0,"#1d4d7a"),gr.addColorStop(.85,"#0b2440"),gr.addColorStop(1,"#040b16");g.fillStyle=gr,g.beginPath(),g.arc(cx,cy,R,0,7),g.fill();g.clip();const R2=mulb(5);for(let i=0;i<260;i++){const a=-Math.PI/2+(R2()-.5)*1.3,d=R*(.7+.3*R2());g.fillStyle="rgba(255,200,120,"+(.25+.5*R2())+")",g.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d,1.6,1.6)}g.restore();g.strokeStyle="rgba(120,190,255,.55)",g.lineWidth=m*.012,g.shadowColor="#6fc0ff",g.shadowBlur=m*.05,g.beginPath(),g.arc(cx,cy,R,Math.PI*1.1,Math.PI*1.9),g.stroke(),g.shadowBlur=0}
const e=ease(t),fx=lerp(p.from[0],p.to[0],e)*W,fy=lerp(p.from[1],p.to[1],e)*H,r=m*(p.size||.05)*lerp(1,p.grow||1,e),ang=Math.atan2(p.to[1]-p.from[1],p.to[0]-p.from[0]);
const tl=r*(p.trail||9),gr=g.createLinearGradient(fx,fy,fx-Math.cos(ang)*tl,fy-Math.sin(ang)*tl);gr.addColorStop(0,"rgba(190,150,255,.55)"),gr.addColorStop(1,"rgba(90,240,255,0)");g.strokeStyle=gr,g.lineWidth=r*1.2,g.lineCap="round",g.beginPath(),g.moveTo(fx,fy),g.lineTo(fx-Math.cos(ang)*tl,fy-Math.sin(ang)*tl),g.stroke();
drawFragment(g,fx,fy,r,T,0,3)},

entry(g,W,H,t,T,p){sky(g,W,H,[[0,"#070a1c"],[.55,"#2a1d3a"],[.8,"#8a4a3a"],[1,"#d9894a"]]);starfield(g,W,H*.6,T,.5,0);const m=Math.min(W,H),hz=.74;
const imp=.78,e=sat(t/imp),x0=.98*W,y0=.02*H,x1=.36*W,y1=hz*H;const hx=lerp(x0,x1,e*e),hy=lerp(y0,y1,e*e);
// smoke trail
g.lineCap="round";for(let k=0;k<30;k++){const q=k/30*e*e;if(q<=0)continue;const sx=lerp(x0,x1,q),sy=lerp(y0,y1,q),age=e*e-q;g.strokeStyle="rgba(70,60,70,"+.18*(1-age)+")",g.lineWidth=m*(.02+.08*age),g.beginPath(),g.moveTo(sx,sy),g.lineTo(lerp(x0,x1,q+.034),lerp(y0,y1,q+.034)),g.stroke()}
if(t<imp){const ang=Math.atan2(y1-y0,x1-x0);for(let k=0;k<3;k++){const L=m*(.5-.13*k),gr=g.createLinearGradient(hx,hy,hx-Math.cos(ang)*L,hy-Math.sin(ang)*L);gr.addColorStop(0,["rgba(255,255,230,.95)","rgba(255,170,60,.7)","rgba(190,120,255,.5)"][k]),gr.addColorStop(1,"rgba(255,120,40,0)"),g.strokeStyle=gr,g.lineWidth=m*(.012+.014*k),g.beginPath(),g.moveTo(hx,hy),g.lineTo(hx-Math.cos(ang)*L,hy-Math.sin(ang)*L),g.stroke()}glow(g,hx,hy,m*.12,"#ffd9a0",.8)}
ridge(g,W,H,hz+.02,.1,4,"#1a1422",3),ridge(g,W,H,hz+.12,.12,9,"#0d0a12",2.2);
if(t>=imp){const k=(t-imp)/(1-imp);glow(g,x1,y1,m*(.3+1.2*k),"#ffb070",.9*(1-k*.6));g.strokeStyle="rgba(255,230,200,"+(.8*(1-k))+")",g.lineWidth=m*.01,g.beginPath(),g.ellipse(x1,y1,m*(.1+1.3*k),m*(.05+.5*k),0,Math.PI,2*Math.PI),g.stroke();g.fillStyle="rgba(255,250,235,"+Math.max(0,1-4*k)+")",g.fillRect(0,0,W,H)}},

site(g,W,H,t,T,p){sky(g,W,H,[[0,"#03060c"],[.6,"#0b1522"],[1,"#141d28"]]);starfield(g,W,H*.5,T,.4,0);const m=Math.min(W,H),cx=W*.5,cy=H*.66;
ridge(g,W,H,.52,.1,21,"#0c1520",3);g.fillStyle="#18222d",g.fillRect(0,H*.52,W,H);
// crater
g.fillStyle="#070b10",g.beginPath(),g.ellipse(cx,cy,W*.34,H*.16,0,0,7),g.fill();g.strokeStyle="rgba(170,200,220,.25)",g.lineWidth=m*.006,g.beginPath(),g.ellipse(cx,cy,W*.34,H*.16,0,Math.PI,2*Math.PI),g.stroke();
// floodlights
for(let i=0;i<3;i++){const bx=W*(.2+.3*i),by=H*.5,a=Math.PI/2+.5*Math.sin(.35*T+i*2)+(1-i)*.2;g.save(),g.globalCompositeOperation="lighter";const L=H*.55,gr=g.createLinearGradient(bx,by,bx+Math.cos(a)*L,by+Math.sin(a)*L);gr.addColorStop(0,"rgba(200,230,255,.22)"),gr.addColorStop(1,"rgba(200,230,255,0)"),g.fillStyle=gr,g.beginPath(),g.moveTo(bx,by),g.lineTo(bx+Math.cos(a-.12)*L,by+Math.sin(a-.12)*L),g.lineTo(bx+Math.cos(a+.12)*L,by+Math.sin(a+.12)*L),g.fill(),g.restore();g.fillStyle="#dfefff",g.fillRect(bx-2,by-2,4,4)}
// scaffolding
g.strokeStyle="rgba(150,160,170,.45)",g.lineWidth=1.2;for(let i=-3;i<=3;i++){const x=cx+i*W*.035;g.beginPath(),g.moveTo(x,cy-H*.18),g.lineTo(x,cy+H*.02),g.stroke()}for(let j=0;j<4;j++){const y=cy-H*.18+j*H*.055;g.beginPath(),g.moveTo(cx-W*.105,y),g.lineTo(cx+W*.105,y),g.stroke()}
const al=p.alarm?sat((t-.15)/.5):0;
if(al){const R=mulb(4);g.lineCap="round";for(let i=0;i<9;i++){const a=R()*Math.PI*2,L=m*(.1+.45*R())*al;g.strokeStyle=rgba("#b27ae0",.7),g.lineWidth=m*.01*(1-.5*R()),g.shadowColor="#b27ae0",g.shadowBlur=m*.03,g.beginPath(),g.moveTo(cx,cy-H*.08);const ex=cx+Math.cos(a)*L*1.6,ey=cy-H*.08+Math.sin(a)*L*.5;g.quadraticCurveTo(cx+Math.cos(a+1)*L*.5,cy-H*.08+Math.sin(a+1)*L*.3,ex,ey),g.stroke()}g.shadowBlur=0}
drawFragment(g,cx,cy-H*.08,m*.07,T,al,5);
for(let i=0;i<14;i++){const x=cx+(i/13-.5)*W*.62,y=cy-H*.155+Math.abs(i/13-.5)*H*.1;g.fillStyle="#05080c",g.fillRect(x,y-m*.018,m*.006,m*.018),g.beginPath(),g.arc(x+m*.003,y-m*.021,m*.004,0,7),g.fill()}
if(al){const on=Math.sin(9*T)>0;g.fillStyle="rgba(255,30,30,"+(on?.16:.04)*al+")",g.fillRect(0,0,W,H);for(const x of[.12,.88]){glow(g,W*x,H*.5,m*.18,"#ff2020",on?.55:.1)}}
// snow
const R=mulb(9);g.fillStyle="rgba(230,240,255,.6)";for(let i=0;i<140;i++){const x=(R()*W+30*T*(.5+R()))%W,y=(R()*H+H*.08*T*(1+R()))%H;g.fillRect(x,y,1.5,1.5)}},

lab(g,W,H,t,T,p){sky(g,W,H,[[0,"#04070b"],[1,"#0d141b"]]);const m=Math.min(W,H),cx=W*.5,cy=H*.52;
g.strokeStyle="rgba(90,140,170,.18)",g.lineWidth=1;for(let i=-12;i<=12;i++){g.beginPath(),g.moveTo(cx+i*W*.02,H*.72),g.lineTo(cx+i*W*.12,H),g.stroke()}for(let j=0;j<6;j++){const y=H*.72+Math.pow(j/6,1.8)*H*.28;g.beginPath(),g.moveTo(0,y),g.lineTo(W,y),g.stroke()}
const hk=p.hack?sat((t-.12)/.6):0,br=p.breach?sat((t-.72)/.2):0;
// monitors
const R=mulb(12);for(let i=0;i<4;i++){const left=i<2,mx=left?W*(.06+.14*i):W*(.66+.14*(i-2)),my=H*(.24+.08*(i%2)),mw=W*.12,mh=H*.22;const inf=hk>(left?.2+.25*i:.2+.25*(3-i));g.fillStyle="#061015",g.fillRect(mx,my,mw,mh);g.strokeStyle=inf?"#b27ae0":"#2f5d6e",g.lineWidth=2,g.strokeRect(mx,my,mw,mh);g.font=Math.round(mh*.075)+"px monospace",g.fillStyle=inf?"#d59cff":"#57e39a";for(let l=0;l<11;l++){let s="";const RR=mulb(i*999+l+Math.floor(T*(inf?14:4)));for(let c=0;c<14;c++)s+=inf?"ᛟᚦᛉ◊∆╳░▒"[Math.floor(RR()*9)]:"0123456789ABCDEF"[Math.floor(RR()*16)];g.fillText(s,mx+mw*.05,my+mh*(.1+.08*l))}inf&&glow(g,mx+mw/2,my+mh/2,mw*.8,"#b27ae0",.18)
// cable
const sx=left?mx+mw:mx,sy=my+mh*.8;g.strokeStyle=inf?"rgba(178,122,224,.8)":"rgba(80,100,110,.6)",g.lineWidth=m*.006,g.beginPath(),g.moveTo(cx,cy+H*.18),g.quadraticCurveTo((cx+sx)/2,H*.9,sx,sy),g.stroke();if(inf){const q=(3*T+i*.3)%1,bx=(1-q)*(1-q)*cx+2*(1-q)*q*(cx+sx)/2+q*q*sx,by=(1-q)*(1-q)*(cy+H*.18)+2*(1-q)*q*H*.9+q*q*sy;glow(g,bx,by,m*.03,"#e0b0ff",.9)}}
// cylinder
const cw=W*.13,ch=H*.5,x0=cx-cw/2,y0=cy-ch/2;glow(g,cx,cy,W*.25,hk?"#9b6bff":"#39c6d6",.25+.2*hk);const gr=g.createLinearGradient(x0,0,x0+cw,0);gr.addColorStop(0,"rgba(60,160,190,.25)"),gr.addColorStop(.5,"rgba(120,220,240,.08)"),gr.addColorStop(1,"rgba(60,160,190,.3)"),g.fillStyle=gr,g.fillRect(x0,y0,cw,ch);g.strokeStyle="rgba(170,230,245,.5)",g.lineWidth=2,g.strokeRect(x0,y0,cw,ch);g.fillStyle="#1b2730",g.fillRect(x0-cw*.12,y0-H*.04,cw*1.24,H*.04),g.fillRect(x0-cw*.12,y0+ch,cw*1.24,H*.05);
drawFragment(g,cx,cy+Math.sin(T*1.2)*H*.01,m*.055,T,hk*.6,5);
if(br){g.strokeStyle="rgba(230,245,255,.8)",g.lineWidth=1.4;const RC=mulb(3);for(let i=0;i<10*br;i++){let px=x0+cw*RC(),py=y0+ch*RC();g.beginPath(),g.moveTo(px,py);for(let k=0;k<4;k++)px+=(RC()-.5)*cw*.5,py+=(RC()-.5)*ch*.2,g.lineTo(px,py);g.stroke()}g.fillStyle="rgba(255,40,40,"+(Math.sin(10*T)>0?.18:.05)+")",g.fillRect(0,0,W,H)}},

dna(g,W,H,t,T,p){sky(g,W,H,[[0,"#05040a"],[1,"#0c0716"]]);const m=Math.min(W,H),cy=H*.5,A=H*.16,front=lerp(-.1,1.1,ease(sat((t-.1)/.8)));
for(let i=0;i<70;i++){const u=i/69,x=u*W,ph=u*10+T*1.4,y1=cy+Math.sin(ph)*A,y2=cy-Math.sin(ph)*A,z=Math.cos(ph),c=u<front?p.to||"#b27ae0":p.from||"#6fb8e0";
if(i%2==0){g.strokeStyle=rgba(c,.25+.2*Math.abs(z)),g.lineWidth=m*.005,g.beginPath(),g.moveTo(x,y1),g.lineTo(x,y2),g.stroke()}
for(const[y,zz]of[[y1,z],[y2,-z]]){const r=m*(.008+.006*(zz+1));glow(g,x,y,r*4,c,.35),g.fillStyle=rgba(c,.6+.3*zz),g.beginPath(),g.arc(x,y,r,0,7),g.fill()}}
g.strokeStyle="rgba(255,255,255,.7)",g.lineWidth=1.5,g.beginPath(),g.moveTo(front*W,H*.2),g.lineTo(front*W,H*.8),g.stroke();glow(g,front*W,cy,m*.2,"#e0c0ff",.35);
g.font="600 "+Math.round(m*.028)+"px monospace",g.fillStyle="rgba(210,200,255,.85)",g.fillText(p.label||"GENOME SPLICE — VANGUARD DONOR 7741",W*.06,H*.18),g.fillText("MATCH "+(100*sat(front)).toFixed(1)+"%",W*.06,H*.18+m*.04)},

vats(g,W,H,t,T,p){sky(g,W,H,[[0,"#040208"],[1,"#12081c"]]);const m=Math.min(W,H),cx=W*.5,hy=H*.46,push=t*1.4;
g.fillStyle="#0a0610",g.fillRect(0,hy,W,H);
const items=[];for(let k=0;k<9;k++)for(const s of[-1,1])items.push([k+1-push%1,s,k]);items.sort((a,b)=>b[0]-a[0]);
for(const[z,s,k]of items){if(z<.35)continue;const sc=1/z,x=cx+s*W*.34*sc,w=W*.11*sc,h=H*.62*sc,y=hy-h*.55;
glow(g,x,y+h/2,w*1.6,"#9b3bd6",.3*sc);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,"rgba(140,60,200,.35)"),gr.addColorStop(1,"rgba(200,80,255,.55)"),g.fillStyle=gr,g.fillRect(x-w/2,y,w,h);g.strokeStyle="rgba(220,180,255,.35)",g.lineWidth=Math.max(1,2*sc),g.strokeRect(x-w/2,y,w,h);g.fillStyle="#140a1c",g.fillRect(x-w*.6,y-h*.06,w*1.2,h*.06),g.fillRect(x-w*.6,y+h,w*1.2,h*.05);
// sleeper
const bob=Math.sin(T*.8+k+s)*h*.01;g.fillStyle="rgba(20,6,30,.85)",g.beginPath(),g.arc(x,y+h*.22+bob,w*.16,0,7),g.fill(),g.beginPath(),g.ellipse(x,y+h*.52+bob,w*.24,h*.25,0,0,7),g.fill();
p.wake&&t>.6&&z<3.2&&(glow(g,x-w*.05,y+h*.22+bob,w*.12,"#ff7af5",.9),glow(g,x+w*.05,y+h*.22+bob,w*.12,"#ff7af5",.9));
const R=mulb(k*7+s);g.fillStyle="rgba(240,210,255,.5)";for(let b=0;b<6;b++){const by=y+h-((R()*h+T*h*.2*(.5+R()))%h);g.fillRect(x-w/2+R()*w,by,2*sc+1,2*sc+1)}}
glow(g,cx,hy,W*.3,"#7a2aa8",.25)},

warmap(g,W,H,t,T,p){sky(g,W,H,[[0,"#03080c"],[1,"#061018"]]);const MW=320,MH=180;let c=SCENES._mapCv;if(!c){c=SCENES._mapCv=document.createElement("canvas"),c.width=MW,c.height=MH;SCENES._land=new Float32Array(MW*MH);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const u=x/MW,v=y/MH,d=Math.hypot((u-.5)*1.25,(v-.52)*1.6);SCENES._land[y*MW+x]=fbm2(u*5,v*5,17)+.55-d}}
const cg=c.getContext("2d"),img=cg.createImageData(MW,MH),L=SCENES._land,e=ease(t),lf=lerp(p.l0!=null?p.l0:.7,p.l1!=null?p.l1:.7,e),vf=p.v0!=null?lerp(p.v0,p.v1,e):-1,hr=lerp(p.h0||0,p.h1||0,e),hs=p.hs||[[.5,.45]];
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=y*MW+x,o=4*i,land=L[i]>.62,u=x/MW,v=y/MH,nz=fbm2(u*9,v*9,3)-.5;let r=4,gg=14,b=24;if(land){let col=[40,64,92];u+nz*.12>lf&&(col=[150,44,38]);vf>=0&&u+nz*.12<vf&&(col=[40,90,150]);for(const[hx,hy]of hs)Math.hypot((u-hx)*1.6,v-hy)+nz*.1<hr&&(col=[120,50,170]);const sh=.75+.5*(L[i]-.62);r=col[0]*sh,gg=col[1]*sh,b=col[2]*sh;L[i]<.66&&(r+=25,gg+=25,b+=25)}img.data[o]=r,img.data[o+1]=gg,img.data[o+2]=b,img.data[o+3]=255}
cg.putImageData(img,0,0);const mx=W*.08,my=H*.12,mw=W*.84,mh=H*.76;g.imageSmoothingEnabled=!0,g.drawImage(c,mx,my,mw,mh);
g.strokeStyle="rgba(120,200,230,.08)",g.lineWidth=1;for(let i=0;i<=16;i++){g.beginPath(),g.moveTo(mx+mw*i/16,my),g.lineTo(mx+mw*i/16,my+mh),g.stroke()}for(let i=0;i<=9;i++){g.beginPath(),g.moveTo(mx,my+mh*i/9),g.lineTo(mx+mw,my+mh*i/9),g.stroke()}
const m=Math.min(W,H);(p.arrows||[]).forEach(([x0,y0,x1,y1,col],k)=>{const q=sat((t-.1-.1*k)/.6);if(q<=0)return;const ax=mx+mw*lerp(x0,x1,q),ay=my+mh*lerp(y0,y1,q),sx=mx+mw*x0,sy=my+mh*y0;g.strokeStyle=col,g.lineWidth=m*.012,g.lineCap="round",g.shadowColor=col,g.shadowBlur=m*.02,g.beginPath(),g.moveTo(sx,sy),g.lineTo(ax,ay),g.stroke();const an=Math.atan2(ay-sy,ax-sx);g.fillStyle=col,g.beginPath(),g.moveTo(ax+Math.cos(an)*m*.03,ay+Math.sin(an)*m*.03),g.lineTo(ax+Math.cos(an+2.5)*m*.03,ay+Math.sin(an+2.5)*m*.03),g.lineTo(ax+Math.cos(an-2.5)*m*.03,ay+Math.sin(an-2.5)*m*.03),g.fill(),g.shadowBlur=0});
if(p.site){const sx=mx+mw*p.site[0],sy=my+mh*p.site[1],pr=(T*.8)%1;g.strokeStyle="rgba(230,180,255,"+(1-pr)+")",g.lineWidth=2,g.beginPath(),g.arc(sx,sy,m*(.01+.06*pr),0,7),g.stroke();g.fillStyle="#f0d8ff",g.beginPath(),g.arc(sx,sy,m*.007,0,7),g.fill();g.font="600 "+Math.round(m*.024)+"px monospace",g.fillText("SITE NINE",sx+m*.015,sy-m*.012)}
g.font="700 "+Math.round(m*.026)+"px monospace",g.fillStyle="rgba(170,220,240,.85)",g.fillText(p.label||"THEATRE MAP — THE FRONTIER",mx,my-m*.025);g.textAlign="right",g.fillText(p.date||"",mx+mw,my-m*.025),g.textAlign="left";
const leg=[["VANGUARD","#3a7bd5"],["LEGION","#c0392b"],["SYNDICATE","#8e44ad"]];g.font="600 "+Math.round(m*.022)+"px monospace";leg.forEach(([n,cc],i)=>{g.fillStyle=cc,g.fillRect(mx+i*m*.3,my+mh+m*.025,m*.02,m*.02),g.fillStyle="rgba(200,220,235,.8)",g.fillText(n,mx+i*m*.3+m*.03,my+mh+m*.043)})},

battle(g,W,H,t,T,p){const S={dusk:[[0,"#1a1020"],[.5,"#6a3026"],[.8,"#c8643a"],[1,"#e8a060"]],night:[[0,"#05070e"],[.6,"#1c2436"],[1,"#40405a"]],day:[[0,"#4a5a6a"],[1,"#c0a888"]],hive:[[0,"#0a0414"],[.6,"#3a1450"],[1,"#8a4aa0"]]}[p.sky||"dusk"];sky(g,W,H,S);const m=Math.min(W,H),gy=H*.66;
const R=mulb(p.seed||3);
for(let i=0;i<5;i++){const sx=W*R(),sh=H*(.35+.3*R());glow(g,sx,gy,m*.12,"#ff8a3a",.45);for(let k=0;k<12;k++){const q=(k/12+T*.03)%1;glow(g,sx+Math.sin(q*6+i)*W*.02+q*W*.06,gy-sh*q,m*(.03+.1*q),"#1a1216",.45*(1-q))}}
ridge(g,W,H,.62,.08,31,"#2a1c20",3);
const gg=g.createLinearGradient(0,gy,0,H);gg.addColorStop(0,"#2a1e1c"),gg.addColorStop(1,"#0a0808"),g.fillStyle=gg,g.fillRect(0,gy,W,H-gy);
if(p.hive){const RH=mulb(8);for(let i=0;i<26;i++){const x=W*RH(),h=H*(.05+.14*RH())*sat(t*1.5);g.fillStyle="rgba(110,35,150,.9)",g.beginPath(),g.moveTo(x-m*.02,gy+H*.03),g.quadraticCurveTo(x+m*.02,gy-h*.5,x+m*.005*Math.sin(T+i),gy-h),g.quadraticCurveTo(x+m*.01,gy-h*.4,x+m*.03,gy+H*.03),g.fill();glow(g,x,gy-h,m*.03,"#e08aff",.7)}}
const dir=p.dir||1,fc=p.color||"#6fb8e0",n=p.n||7,tanks=[];for(let k=0;k<n;k++){const d=.45+.55*R(),sp=(.025+.015*R())*dir;tanks.push([d,sp,R(),k])}tanks.sort((a,b)=>a[0]-b[0]);
for(const[d,sp,r0,k]of tanks){const x=((r0+sp*T)%1.2+1.2)%1.2*W-.1*W,y=gy+H*.3*(d-.45),s=m*.13*d;
g.fillStyle="rgba(0,0,0,.45)",g.beginPath(),g.ellipse(x,y+s*.05,s*1.2,s*.12,0,0,7),g.fill();
g.save(),g.translate(x,y),g.scale(dir*s,s);const shade=Math.round(10+12*(1-d));g.fillStyle="rgb("+shade+","+(shade-2)+","+(shade+2)+")";
g.beginPath(),g.moveTo(-1.05,-.05),g.lineTo(-.9,-.38),g.lineTo(.92,-.38),g.lineTo(1.1,-.05),g.lineTo(.95,.08),g.lineTo(-.95,.08),g.closePath(),g.fill();
g.beginPath(),g.moveTo(-.5,-.38),g.lineTo(-.4,-.66),g.lineTo(.28,-.66),g.lineTo(.4,-.38),g.fill(),g.fillRect(.3,-.57,1,.08);
g.strokeStyle=rgba(fc,.55),g.lineWidth=.03,g.beginPath(),g.moveTo(-.88,-.4),g.lineTo(.9,-.4),g.moveTo(-.4,-.68),g.lineTo(.28,-.68),g.stroke();
g.fillStyle="#050405";for(let w=0;w<6;w++)g.beginPath(),g.arc(-.75+.3*w,0,.1,0,7),g.fill();
const fire=Math.sin(T*2.2+k*1.7)>.9;fire&&(g.fillStyle="#fff2c0",g.beginPath(),g.arc(1.38,-.53,.16,0,7),g.fill());g.restore();fire&&glow(g,x+dir*s*1.38,y-s*.53,m*.09,"#ffb060",.9);
const tr=(T*1.7+k*.37)%1;tr<.35&&(g.strokeStyle=rgba(fc,.9),g.lineWidth=2.5,g.beginPath(),g.moveTo(x+dir*s*(1.5+tr*10),y-s*.53),g.lineTo(x+dir*s*(2.1+tr*10),y-s*.55),g.stroke())}
for(let i=0;i<4;i++){const ph=(T*.45+i*.27)%1,ex=W*mulb(i*13+Math.floor(T*.45+i*.27))(),ey=gy+H*.08*mulb(i)();if(ph<.5){const q=ph/.5;glow(g,ex,ey,m*(.06+.25*q),"#ffb050",.95*(1-q)),glow(g,ex,ey-m*.12*q,m*.14*q,"#2a2020",.6*q)}}
const RE=mulb(77);for(let i=0;i<50;i++){const x=(RE()*W+T*30*RE())%W,y=(RE()*H-T*40*(RE()+.2)+H*2)%H;g.fillStyle="rgba(255,180,90,"+.6*RE()+")",g.fillRect(x,y,2,2)}},

march(g,W,H,t,T,p){sky(g,W,H,[[0,"#12060a"],[.55,"#3a1414"],[1,"#6a2a1c"]]);const m=Math.min(W,H),gy=H*.62;
for(let i=0;i<4;i++){const bx=W*(.1+.27*i),a=-Math.PI/2+.35*Math.sin(.4*T+i*1.3);g.save(),g.globalCompositeOperation="lighter";const L=H*.9,gr=g.createLinearGradient(bx,gy,bx+Math.cos(a)*L,gy+Math.sin(a)*L);gr.addColorStop(0,"rgba(255,220,200,.18)"),gr.addColorStop(1,"rgba(255,220,200,0)"),g.fillStyle=gr,g.beginPath(),g.moveTo(bx,gy),g.lineTo(bx+Math.cos(a-.07)*L,gy+Math.sin(a-.07)*L),g.lineTo(bx+Math.cos(a+.07)*L,gy+Math.sin(a+.07)*L),g.fill(),g.restore()}
ridge(g,W,H,.6,.06,41,"#1c0c0e",3);
for(let b=0;b<5;b++){const bx=W*(.1+.2*b),top=H*.18;g.fillStyle="#140a0a",g.fillRect(bx,top,m*.006,gy-top);g.fillStyle="#9a1c1c",g.beginPath(),g.moveTo(bx,top);for(let i=0;i<=10;i++){const u=i/10;g.lineTo(bx+m*.16*u,top+Math.sin(u*4-T*3+b)*m*.012*u)}for(let i=10;i>=0;i--){const u=i/10;g.lineTo(bx+m*.16*u,top+m*.1+Math.sin(u*4-T*3+b)*m*.012*u)}g.fill();g.fillStyle="#f2c14e",g.font=Math.round(m*.05)+"px serif",g.fillText("★",bx+m*.05,top+m*.07)}
for(let row=0;row<5;row++){const d=.4+row*.2,s=m*.11*d,y=gy+H*.09*row*d+H*.04,sp=m*.1*d,off=(T*.35*s)%sp,col=row>3?"#050304":"#0f0708";g.fillStyle=col;for(let x=-sp+off;x<W+sp;x+=sp){const bob=Math.abs(Math.sin(T*4+x*.05))*s*.12,xx=x;g.beginPath(),g.arc(xx,y-s*1.55-bob,s*.22,0,7),g.fill(),g.beginPath(),g.ellipse(xx,y-s*1.62-bob,s*.28,s*.12,0,Math.PI,2*Math.PI),g.fill(),g.fillRect(xx-s*.22,y-s*1.35-bob,s*.44,s*.8),g.fillRect(xx-s*.2,y-s*.55-bob,s*.14,s*.55),g.fillRect(xx+s*.06,y-s*.55-bob,s*.14,s*.55),g.fillRect(xx+s*.2,y-s*1.9-bob,s*.05,s*.9)}}},

city(g,W,H,t,T,p){const S=p.dawn?[[0,"#1b2a44"],[.55,"#c46a4a"],[1,"#f2b36a"]]:p.hive?[[0,"#08030e"],[.6,"#2c0f3c"],[1,"#4c1e5e"]]:[[0,"#07080c"],[.6,"#241814"],[1,"#5a3020"]];sky(g,W,H,S);const m=Math.min(W,H),gy=H*.78;
p.dawn&&glow(g,W*.7,gy,m*.6,"#ffd08a",.6);
for(let layer=0;layer<3;layer++){const R=mulb(50+layer),col=["#1a1620","#110e14","#08070a"][layer];let x=-W*.02;for(;x<W;){const w=W*(.04+.05*R()),h=H*(.18+.3*R())*(1-.2*layer)+layer*H*.05,top=gy-h;g.fillStyle=col,g.beginPath(),g.moveTo(x,gy),g.lineTo(x,top);const br=R()<.45;if(br){g.lineTo(x+w*.3,top+h*.08),g.lineTo(x+w*.5,top-h*.04),g.lineTo(x+w*.7,top+h*.12)}g.lineTo(x+w,top+(br?h*.05:0)),g.lineTo(x+w,gy),g.fill();
if(layer===2)for(let wy=top+h*.1;wy<gy-h*.05;wy+=h*.08)for(let wx=x+w*.15;wx<x+w*.85;wx+=w*.2)R()<.12&&(g.fillStyle=p.hive?"rgba(220,140,255,.5)":"rgba(255,200,120,.45)",g.fillRect(wx,wy,w*.08,h*.03));
if(p.hive){const hh=h*lerp(p.h0||0,p.h1||.8,ease(t))*(.6+.4*R());g.fillStyle="rgba(110,30,150,.75)",g.beginPath(),g.moveTo(x,gy);for(let i=0;i<=6;i++){const u=i/6;g.lineTo(x+w*u,gy-hh*(.7+.3*Math.sin(u*9+layer+T*.6)))}g.lineTo(x+w,gy),g.fill();glow(g,x+w*.5,gy-hh,w*.4,"#d070ff",.35)}
!p.dawn&&!p.hive&&R()<.25&&glow(g,x+w*.5,gy-h*.1,w*.8,"#ff7a30",.35+.1*Math.sin(T*5+x));x+=w*(.95+.2*R())}}
g.fillStyle="#050406",g.fillRect(0,gy,W,H-gy);
if(p.air){for(let i=0;i<3;i++){const x=((T*.07+i*.3)%1.3-.15)*W,y=H*(.2+.07*i),s=m*.02;g.fillStyle="#060508",g.beginPath(),g.moveTo(x+s*2,y),g.lineTo(x-s,y-s*.3),g.lineTo(x-s*1.4,y-s),g.lineTo(x-s*1.5,y+s*.1),g.lineTo(x-s,y+s*.3),g.fill()}}
const R=mulb(71);for(let i=0;i<60;i++){const x=(R()*W+T*20*(R()-.3))%W,y=(R()*H-T*30*R()+H)%H;g.fillStyle=p.hive?"rgba(230,160,255,.5)":"rgba(255,170,80,.5)",g.fillRect(x,y,1.6,1.6)}},

eye(g,W,H,t,T,p){g.fillStyle="#020104",g.fillRect(0,0,W,H);const m=Math.min(W,H),cx=W*.5,cy=H*.5,R=m*.34*lerp(.85,1.05,ease(t));
glow(g,cx,cy,R*2.2,"#6a1a9a",.4);g.save(),g.beginPath(),g.ellipse(cx,cy,R*1.9,R*(.35+.75*ease(sat(t*1.6))),0,0,7),g.clip();g.fillStyle="#12081a",g.fillRect(0,0,W,H);
const RV=mulb(4);g.strokeStyle="rgba(140,30,80,.5)";for(let i=0;i<20;i++){let a=RV()*7,r=R*1.05;g.lineWidth=1+RV()*2,g.beginPath(),g.moveTo(cx+Math.cos(a)*r*1.8,cy+Math.sin(a)*r);for(let k=0;k<5;k++)a+=(RV()-.5)*.2,r-=R*.05,g.lineTo(cx+Math.cos(a)*r*1.8,cy+Math.sin(a)*r);g.stroke()}
const ig=g.createRadialGradient(cx,cy,R*.15,cx,cy,R);ig.addColorStop(0,"#ff9cf0"),ig.addColorStop(.4,"#a13ce0"),ig.addColorStop(.85,"#3a0f5c"),ig.addColorStop(1,"#12051c"),g.fillStyle=ig,g.beginPath(),g.arc(cx,cy,R,0,7),g.fill();
const RF=mulb(9);g.lineWidth=1.2;for(let i=0;i<180;i++){const a=RF()*7,r0=R*(.25+.1*RF()),r1=R*(.7+.3*RF());g.strokeStyle="rgba(255,200,255,"+.15*RF()+")",g.beginPath(),g.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0),g.lineTo(cx+Math.cos(a+.1*Math.sin(T+i))*r1,cy+Math.sin(a+.1*Math.sin(T+i))*r1),g.stroke()}
const pw=R*lerp(.06,.22,.5+.5*Math.sin(T*.9));g.fillStyle="#030006",g.beginPath(),g.ellipse(cx,cy,pw,R*.62,0,0,7),g.fill();glow(g,cx-R*.35,cy-R*.35,R*.25,"#ffffff",.4);g.restore()},

portrait(g,W,H,t,T,p){const c=castOf(p.who),col=c.c||"#8fd0ff",m=Math.min(W,H);sky(g,W,H,[[0,"#05070a"],[1,"#0e141a"]]);
// war-room bokeh
const R=mulb(p.who.length*31+3);for(let i=0;i<22;i++)glow(g,W*R(),H*R()*.9,m*(.03+.07*R()),R()<.5?col:"#3c5a6a",.18+.1*Math.sin(T+i));
g.strokeStyle=rgba(col,.08);for(let i=0;i<12;i++){const y=H*i/12;g.beginPath(),g.moveTo(0,y),g.lineTo(W,y),g.stroke()}
{const talk=F&&F.talk?Math.max(0,.55*Math.sin(T*12.7)+.35*Math.sin(T*7.9+1)+.25*Math.sin(T*19.3)):0;F&&(F.jaw=lerp(F.jaw||0,talk,.35));const med=fmvMedia(p.who);if(med)drawMedia(g,W,H,med,t,p.side);else drawBust(g,W,H,t,T,p.who,p.side)}
// lower third
const lx=W*(p.side==="r"?.06:.56),ly=H*.62;g.fillStyle="rgba(0,0,0,.45)",g.fillRect(lx,ly,W*.36,m*.13);g.fillStyle=col,g.fillRect(lx,ly,m*.008,m*.13);g.font="700 "+Math.round(m*.04)+"px sans-serif",g.fillStyle="#eef4f8",g.fillText(c.n.toUpperCase(),lx+m*.03,ly+m*.055);g.font="600 "+Math.round(m*.024)+"px monospace",g.fillStyle=rgba(col,.9),g.fillText((c.role||FAC_NAME[c.fac]||"").toUpperCase(),lx+m*.03,ly+m*.1);
for(let i=0;i<24;i++){const a=Math.abs(Math.sin(T*9+i*1.7)*Math.sin(T*3.3+i))*m*.04*(p.quiet?.2:1);g.fillStyle=rgba(col,.7),g.fillRect(lx+m*.03+i*m*.012,ly+m*.17-a,m*.007,a+2)}},

title(g,W,H,t,T,p){g.fillStyle="#030405",g.fillRect(0,0,W,H);const m=Math.min(W,H),col=p.c||"#f0a72c";glow(g,W*.5,H*.5,W*.5,col,.12);
const R=mulb(2);for(let i=0;i<90;i++){const x=R()*W,y=(R()*H-T*m*.03*(1+R())+H*2)%H;g.fillStyle=rgba(col,.2+.4*R()),g.fillRect(x,y,2,2)}
const a=sat(t*3)*sat((1-t)*4),sp=lerp(.12,.3,ease(t));g.globalAlpha=a,g.textAlign="center",g.fillStyle="#eef3f6",g.font="800 "+Math.round(m*(p.big||.1))+"px sans-serif";g.letterSpacing!==undefined&&(g.letterSpacing=Math.round(m*.1*sp)+"px");g.shadowColor=col,g.shadowBlur=m*.05;const tw=g.measureText(p.text).width;if(tw>W*.86){const k=W*.86/tw;g.save(),g.translate(W*.5,H*.5),g.scale(k,k),g.fillText(p.text,0,0),g.restore()}else g.fillText(p.text,W*.5,H*.5),g.shadowBlur=0;g.letterSpacing!==undefined&&(g.letterSpacing="4px");
p.sub&&(g.font="600 "+Math.round(m*.032)+"px sans-serif",g.fillStyle=rgba(col,.95),g.fillText(p.sub,W*.5,H*.5+m*.08));g.letterSpacing!==undefined&&(g.letterSpacing="0px");g.textAlign="left",g.globalAlpha=1;
const sw=(T*.35)%1.6-.3;const gr=g.createLinearGradient(sw*W-W*.1,0,sw*W+W*.1,0);gr.addColorStop(0,"rgba(255,255,255,0)"),gr.addColorStop(.5,"rgba(255,255,255,.05)"),gr.addColorStop(1,"rgba(255,255,255,0)"),g.fillStyle=gr,g.fillRect(0,0,W,H)}
};

// ---- painted portraits -----------------------------------------------------------
// Each character is drawn as a lit, shaded bust: skin with a warm key light and
// a faction-coloured rim, eyes that blink and track, lips that move while the
// line is spoken, hair, headwear and a faction uniform.
const LOOKS={
  reyes:{skin:["#e8b996","#c88a66","#6e4030"],hair:"#2a1c16",style:"bun",hat:"beret",hatC:"#1f3a5a",badge:"#d8c27a",eye:"#4a6b3a",fem:1,age:.45,jaw:.9,uni:"van",brow:.9},
  hale:{skin:["#c99470","#9c6848","#4a2c1e"],hair:"#1a1410",style:"crop",hat:"helmet",hatC:"#4a5238",eye:"#3a2a1c",age:.3,jaw:1.08,stubble:.5,uni:"van"},
  ghost:{skin:["#f0c8aa","#d09878","#7a4a38"],hair:"#7a2a18",style:"long",eye:"#3f7a6a",fem:1,age:.2,jaw:.86,uni:"ops",scar:1},
  marsh:{skin:["#eac2a4","#c49276","#6a4636"],hair:"#8a8078",style:"side",eye:"#5a6a7a",age:.75,jaw:.95,glasses:1,uni:"lab",stubble:.2},
  draganov:{skin:["#e2b294","#b8805e","#5e3a2a"],hair:"#b8b4ae",style:"crop",hat:"cap",hatC:"#3a3a30",eye:"#5a6a6a",age:.85,jaw:1.12,uni:"leg",mous:"#bdb6ac",brow:1.2},
  volkova:{skin:["#f2d0b8","#d0a088","#7a5040"],hair:"#e6d2a0",style:"bun",hat:"cap",hatC:"#3a3a30",eye:"#5a7a9a",fem:1,age:.35,jaw:.88,uni:"leg"},
  bogdan:{skin:["#dca888","#b07a5a","#5a3624"],hair:"#4a3020",style:"crop",hat:"helmet",hatC:"#5a4a2a",eye:"#4a3a2a",age:.6,jaw:1.15,uni:"eng",beard:"#4a3020"},
  reaper:{skin:["#c8a890","#9a7a66","#3e2a22"],hair:"#141414",style:"crop",hat:"helmet",hatC:"#1c1c1c",eye:"#8a2a1a",age:.4,jaw:1.1,uni:"ops",mask:1,scar:1},
  voice:{skin:["#d8c8d8","#a890b0","#4a3058"],hair:"#8a8078",style:"side",eye:"#d59cff",age:.75,jaw:.95,uni:"hive",hive:1,glow:1,hat:"hood"},
  senna:{skin:["#e8d0d8","#b89aa8","#583a50"],hair:"#1a1420",style:"long",eye:"#e6c2ff",fem:1,age:.25,jaw:.86,uni:"hive",hive:.6,glow:1,hat:"hood"},
  phantom:{skin:["#eed0c8","#c89aa0","#6a4050"],hair:"#5a1a28",style:"long",eye:"#c79bff",fem:1,age:.2,jaw:.86,uni:"ops",hive:.5,glow:1,scar:1}
};
function facePath(g,s,L){const jw=L.jaw||1,f=L.fem?.93:1;g.beginPath();g.moveTo(0,-.6*s);g.bezierCurveTo(.3*s*f,-.6*s,.4*s*f,-.42*s,.4*s*f,-.2*s);g.bezierCurveTo(.41*s*f,.02*s,.37*s*jw*f,.22*s,.3*s*jw*f,.36*s);g.bezierCurveTo(.22*s*jw*f,.5*s,.12*s,.58*s,0,.59*s);g.bezierCurveTo(-.12*s,.58*s,-.22*s*jw*f,.5*s,-.3*s*jw*f,.36*s);g.bezierCurveTo(-.37*s*jw*f,.22*s,-.41*s*f,.02*s,-.4*s*f,-.2*s);g.bezierCurveTo(-.4*s*f,-.42*s,-.3*s*f,-.6*s,0,-.6*s);g.closePath()}
function drawBust(g,W,H,t,T,who,side){const L=LOOKS[who]||LOOKS.hale,c=castOf(who),col=c.c||"#8fd0ff",m=Math.min(W,H),s=H*.44,cx=W*(side==="r"?.64:.36)+Math.sin(T*.37)*s*.012,cy=H*.53+Math.sin(T*.9)*s*.006,
talking=F&&F.talk,mo=talking?Math.max(0,Math.sin(T*13.1)*.5+Math.sin(T*7.3+1)*.35+Math.sin(T*21)*.15):0,blinkP=(T+(who.length*.7))%4.3,blink=blinkP<.14?Math.sin(blinkP/.14*Math.PI):0,look=Math.sin(T*.3)*.012*s,tilt=Math.sin(T*.23)*.02;
const[sk,sm,sd]=L.skin;
g.save(),g.translate(cx,cy),g.rotate(tilt);
// long hair behind the head
if("long"===L.style){g.fillStyle=L.hair,g.beginPath(),g.moveTo(-.42*s,-.25*s),g.bezierCurveTo(-.55*s,.3*s,-.5*s,.8*s,-.42*s,1.1*s),g.lineTo(.42*s,1.1*s),g.bezierCurveTo(.5*s,.8*s,.55*s,.3*s,.42*s,-.25*s),g.closePath(),g.fill()}
// uniform
const U={van:["#4a5238","#2e3424","#6fb8e0"],ops:["#232628","#141618","#8fd0ff"],lab:["#e8eaec","#9aa2aa","#9fe8d0"],leg:["#4e4a40","#2a2822","#c0392b"],eng:["#5a4a30","#34281a","#e0a040"],hive:["#2a1a34","#120a18","#b27ae0"]}[L.uni||"van"];
const tg=g.createLinearGradient(-s,0,s,0);tg.addColorStop(0,U[0]),tg.addColorStop(.7,U[1]),tg.addColorStop(1,"#08080a");g.fillStyle=tg,g.beginPath(),g.moveTo(-1.15*s,1.4*s),g.bezierCurveTo(-1.1*s,.9*s,-.8*s,.72*s,-.2*s,.62*s),g.lineTo(.2*s,.62*s),g.bezierCurveTo(.8*s,.72*s,1.1*s,.9*s,1.15*s,1.4*s),g.closePath(),g.fill();
// neck
const ng=g.createLinearGradient(0,.35*s,0,.8*s);ng.addColorStop(0,sd),ng.addColorStop(.4,sm),ng.addColorStop(1,sm);g.fillStyle=ng,g.beginPath(),g.moveTo(-.16*s,.3*s),g.lineTo(-.18*s,.72*s),g.lineTo(.18*s,.72*s),g.lineTo(.16*s,.3*s),g.fill();
// collar details
if("lab"===L.uni){g.fillStyle="#f4f6f8",g.beginPath(),g.moveTo(-.2*s,.62*s),g.lineTo(-.5*s,1.4*s),g.lineTo(-.08*s,1.4*s),g.lineTo(0,.8*s),g.lineTo(.08*s,1.4*s),g.lineTo(.5*s,1.4*s),g.lineTo(.2*s,.62*s),g.fill();g.fillStyle="#3a4a5a",g.beginPath(),g.moveTo(-.04*s,.74*s),g.lineTo(.04*s,.74*s),g.lineTo(.06*s,1.3*s),g.lineTo(-.06*s,1.3*s),g.fill();g.fillStyle="#cfd8e0",g.beginPath(),g.moveTo(-.19*s,.64*s),g.lineTo(0,.8*s),g.lineTo(.19*s,.64*s),g.lineTo(.12*s,.6*s),g.lineTo(0,.72*s),g.lineTo(-.12*s,.6*s),g.fill()}
else if("hive"===L.uni){g.fillStyle=U[1],g.beginPath(),g.moveTo(-.3*s,.4*s),g.lineTo(-.34*s,.9*s),g.lineTo(.34*s,.9*s),g.lineTo(.3*s,.4*s),g.fill();g.strokeStyle=rgba(U[2],.8),g.lineWidth=s*.012,g.shadowColor=U[2],g.shadowBlur=s*.05;for(const k of[-1,1])g.beginPath(),g.moveTo(k*.3*s,.45*s),g.bezierCurveTo(k*.4*s,.8*s,k*.7*s,.9*s,k*.9*s,1.3*s),g.stroke();g.shadowBlur=0}
else{g.fillStyle=U[1];for(const k of[-1,1])g.beginPath(),g.moveTo(k*.18*s,.6*s),g.lineTo(k*.42*s,.7*s),g.lineTo(k*.2*s,1.1*s),g.lineTo(k*.05*s,.8*s),g.fill();
if("leg"===L.uni){g.fillStyle="#9a1c1c";for(const k of[-1,1])g.fillRect(k>0?.24*s:-.34*s,.7*s,.1*s,.06*s);g.fillStyle="#d8b04a";for(let i=0;i<3;i++)g.beginPath(),g.arc(-.5*s+i*.08*s,1*s,.03*s,0,7),g.fill();g.fillStyle="#b83028";for(let i=0;i<3;i++)g.fillRect(-.54*s+i*.08*s,.92*s,.06*s,.04*s)}
else if("van"===L.uni){g.fillStyle=U[2],g.fillRect(.55*s,.92*s,.14*s,.09*s),g.strokeStyle="#c0c4c8",g.lineWidth=s*.006,g.beginPath(),g.moveTo(-.1*s,.66*s),g.quadraticCurveTo(0,.95*s,.1*s,.66*s),g.stroke(),g.fillStyle="#b8bcc0",g.fillRect(-.03*s,.9*s,.06*s,.08*s)}
else if("ops"===L.uni){g.fillStyle="#303436";g.fillRect(-.7*s,.95*s,1.4*s,.08*s);g.fillStyle="#1a1c1e";for(let i=0;i<4;i++)g.fillRect(-.6*s+i*.32*s,1.05*s,.22*s,.3*s)}
else if("eng"===L.uni){g.fillStyle="#e0a040",g.fillRect(-.9*s,1.05*s,1.8*s,.05*s)}}
// ears
g.fillStyle=sm;for(const k of[-1,1])g.beginPath(),g.ellipse(k*.4*s,.02*s,.06*s,.11*s,0,0,7),g.fill();
// face
facePath(g,s,L);const fg=g.createRadialGradient(-.14*s,-.12*s,.05*s,-.05*s,0,.75*s);fg.addColorStop(0,sk),fg.addColorStop(.55,sm),fg.addColorStop(1,sd);g.fillStyle=fg,g.fill();
g.save(),facePath(g,s,L),g.clip();
// shadow side, cheek shading, eye sockets
let lg=g.createLinearGradient(-.1*s,0,.45*s,0);lg.addColorStop(0,"rgba(0,0,0,0)"),lg.addColorStop(1,"rgba(20,8,6,.5)"),g.fillStyle=lg,g.fillRect(-s,-s,2*s,2*s);
for(const k of[-1,1]){const eg=g.createRadialGradient(k*.16*s,-.07*s,.01*s,k*.16*s,-.07*s,.14*s);eg.addColorStop(0,rgba(sd,.55)),eg.addColorStop(1,rgba(sd,0)),g.fillStyle=eg,g.fillRect(-s,-s,2*s,2*s);const cg=g.createRadialGradient(k*.2*s,.16*s,.01*s,k*.2*s,.16*s,.16*s);cg.addColorStop(0,L.fem?"rgba(220,120,110,.18)":"rgba(0,0,0,0)"),cg.addColorStop(1,"rgba(0,0,0,0)"),g.fillStyle=cg,g.fillRect(-s,-s,2*s,2*s)}
const jg=g.createLinearGradient(0,.3*s,0,.6*s);jg.addColorStop(0,"rgba(0,0,0,0)"),jg.addColorStop(1,rgba(sd,.45)),g.fillStyle=jg,g.fillRect(-s,-s,2*s,2*s);
{const ao=g.createRadialGradient(-.04*s,-.02*s,.25*s,0,0,.62*s);ao.addColorStop(0,"rgba(0,0,0,0)"),ao.addColorStop(1,rgba(sd,.55)),g.fillStyle=ao,g.fillRect(-s,-s,2*s,2*s);
glow(g,-.1*s,-.34*s,.16*s,"#ffffff",.1);for(const k of[-1,1])glow(g,k*.24*s-.04*s,.06*s,.1*s,"#ffffff",k<0?.1:.04);glow(g,-.015*s,.02*s,.05*s,"#ffffff",.08);
const un=g.createRadialGradient(0,.24*s,0,0,.24*s,.08*s);un.addColorStop(0,rgba(sd,.35)),un.addColorStop(1,rgba(sd,0)),g.fillStyle=un,g.fillRect(-s,-s,2*s,2*s);
const ch=g.createRadialGradient(0,.46*s,0,0,.46*s,.1*s);ch.addColorStop(0,rgba(sk,.25)),ch.addColorStop(1,rgba(sk,0)),g.fillStyle=ch,g.fillRect(-s,-s,2*s,2*s)}
if(L.stubble){const R=mulb(3);g.fillStyle="rgba(30,20,16,"+.18*L.stubble+")";for(let i=0;i<500;i++){const a=R()*Math.PI,r=.2+.35*R(),x=Math.cos(a)*r*.36*s,y=.18*s+Math.sin(a)*r*.42*s;g.fillRect(x,y,s*.005,s*.005)}}
if(L.hive){g.strokeStyle=rgba(col,.35*L.hive),g.lineWidth=s*.005,g.shadowColor=col,g.shadowBlur=s*.02;const R=mulb(9);for(let i=0;i<7;i++){let x=(R()-.5)*.6*s,y=(R()-.2)*.7*s;g.beginPath(),g.moveTo(x,y);for(let k=0;k<5;k++)x+=(R()-.5)*.1*s,y+=(R()-.3)*.1*s,g.lineTo(x,y);g.stroke()}g.shadowBlur=0}
if(L.age>.5){g.strokeStyle=rgba(sd,.35*L.age),g.lineWidth=s*.006;for(const k of[-1,1])g.beginPath(),g.moveTo(k*.1*s,.14*s),g.quadraticCurveTo(k*.16*s,.26*s,k*.14*s,.36*s),g.stroke();for(let i=0;i<3;i++)g.beginPath(),g.moveTo(-.14*s,-.3*s-i*.035*s),g.quadraticCurveTo(0,-.32*s-i*.035*s,.14*s,-.3*s-i*.035*s),g.stroke()}
if(L.scar){g.strokeStyle=rgba(sd,.6),g.lineWidth=s*.008,g.beginPath(),g.moveTo(.2*s,-.2*s),g.lineTo(.26*s,.05*s),g.stroke()}
g.restore();
// rim light
g.save(),facePath(g,s,L),g.clip(),g.strokeStyle=rgba(col,.32),g.lineWidth=s*.028,g.shadowColor=col,g.shadowBlur=s*.05,g.translate(-.012*s,0),facePath(g,s,L),g.stroke(),g.restore();
// eyes
for(const k of[-1,1]){const ex=k*.16*s,ey=-.05*s,ew=.075*s,eh=.03*s*(1-blink*.95);g.save(),g.beginPath(),g.moveTo(ex-ew,ey),g.quadraticCurveTo(ex,ey-eh*1.7,ex+ew,ey),g.quadraticCurveTo(ex,ey+eh*1.2,ex-ew,ey),g.closePath(),g.fillStyle=L.glow?"#e8dcef":"#ece6e0",g.fill(),g.clip();
const ix=ex+look-k*.004*s,ir=.03*s,ig=g.createRadialGradient(ix,ey,0,ix,ey,ir);ig.addColorStop(0,L.eye),ig.addColorStop(.75,L.eye),ig.addColorStop(1,"#1a1410"),g.fillStyle=ig,g.beginPath(),g.arc(ix,ey,ir,0,7),g.fill();g.fillStyle="#080606",g.beginPath(),g.arc(ix,ey,ir*.42,0,7),g.fill();g.fillStyle="rgba(255,255,255,.85)",g.beginPath(),g.arc(ix-ir*.35,ey-ir*.35,ir*.2,0,7),g.fill();
const sh=g.createLinearGradient(0,ey-eh*1.5,0,ey);sh.addColorStop(0,"rgba(40,20,10,.5)"),sh.addColorStop(1,"rgba(40,20,10,0)"),g.fillStyle=sh,g.fillRect(ex-ew,ey-eh*2,2*ew,eh*2),g.restore();
g.strokeStyle="#1a100c",g.lineWidth=s*(L.fem?.011:.008),g.beginPath(),g.moveTo(ex-ew*1.05,ey+.002*s),g.quadraticCurveTo(ex,ey-eh*1.75,ex+ew*1.05,ey-.004*s),g.stroke();g.strokeStyle=rgba(sd,.6),g.lineWidth=s*.005,g.beginPath(),g.moveTo(ex-ew*.9,ey-eh*1.2-.018*s),g.quadraticCurveTo(ex,ey-eh*2.2-.02*s,ex+ew*.9,ey-eh*1.1-.018*s),g.stroke();
L.glow&&glow(g,ix,ey,.06*s,col,.35+.15*Math.sin(T*2));
// brows
g.strokeStyle=L.hair,g.lineCap="round",g.lineWidth=s*.022*(L.brow||1)*(L.fem?.75:1),g.beginPath(),g.moveTo(ex-k*.07*s,-.14*s),g.quadraticCurveTo(ex+k*.01*s,-.17*s-(talking?mo*.006*s:0),ex+k*.085*s,-.15*s),g.stroke()}
if(L.glasses){g.strokeStyle="#20242a",g.lineWidth=s*.012;for(const k of[-1,1])g.strokeRect(k*.16*s-.1*s,-.11*s,.2*s,.12*s);g.beginPath(),g.moveTo(-.06*s,-.06*s),g.lineTo(.06*s,-.06*s),g.stroke();g.fillStyle="rgba(200,230,255,.08)",g.fillRect(-.26*s,-.11*s,.2*s,.12*s),g.fillRect(.06*s,-.11*s,.2*s,.12*s)}
// nose
g.strokeStyle=rgba(sd,.45),g.lineWidth=s*.012,g.beginPath(),g.moveTo(.035*s,-.02*s),g.quadraticCurveTo(.06*s,.1*s,.05*s,.17*s),g.stroke();glow(g,-.01*s,.15*s,.05*s,sk,.5);g.fillStyle=rgba(sd,.7);for(const k of[-1,1])g.beginPath(),g.ellipse(k*.035*s,.195*s,.018*s,.01*s,k*.3,0,7),g.fill();g.strokeStyle=rgba(sd,.5),g.lineWidth=s*.008,g.beginPath(),g.moveTo(-.06*s,.18*s),g.quadraticCurveTo(0,.225*s,.06*s,.18*s),g.stroke();
// mouth
const my=.32*s,mw=(L.fem?.085:.095)*s,op=mo*.045*s;if(L.mous){g.fillStyle=L.mous,g.beginPath(),g.moveTo(-mw*1.25,my-.005*s),g.quadraticCurveTo(0,my-.07*s,mw*1.25,my-.005*s),g.quadraticCurveTo(0,my-.03*s,-mw*1.25,my-.005*s),g.fill()}
op>.002*s&&(g.fillStyle="#2a0e0c",g.beginPath(),g.ellipse(0,my+op*.4,mw*.8,op*.6,0,0,7),g.fill(),g.fillStyle="rgba(235,230,220,.8)",g.fillRect(-mw*.5,my-.002*s,mw,op*.25));
const lipC=L.fem?"#b0605a":rgba(sd,.9);g.fillStyle=lipC,g.beginPath(),g.moveTo(-mw,my),g.quadraticCurveTo(-mw*.4,my-.028*s,0,my-.016*s),g.quadraticCurveTo(mw*.4,my-.028*s,mw,my),g.quadraticCurveTo(0,my-.004*s,-mw,my),g.fill();g.fillStyle=L.fem?"#c4706a":rgba(sm,.9),g.beginPath(),g.moveTo(-mw*.9,my+op),g.quadraticCurveTo(0,my+op+.04*s,mw*.9,my+op),g.quadraticCurveTo(0,my+op+.008*s,-mw*.9,my+op),g.fill();
g.strokeStyle=rgba(sd,.8),g.lineWidth=s*.006,g.beginPath(),g.moveTo(-mw,my),g.quadraticCurveTo(0,my+.006*s+op*.5,mw,my),g.stroke();
if(L.beard){g.fillStyle=rgba(L.beard,.92),g.beginPath(),g.moveTo(-.33*s,.2*s),g.bezierCurveTo(-.3*s,.5*s,-.15*s,.66*s,0,.68*s),g.bezierCurveTo(.15*s,.66*s,.3*s,.5*s,.33*s,.2*s),g.lineTo(.12*s,.3*s),g.quadraticCurveTo(0,.26*s,-.12*s,.3*s),g.closePath(),g.fill();g.fillStyle="#2a0e0c",g.beginPath(),g.ellipse(0,my+op*.4,mw*.7,Math.max(.006*s,op*.5),0,0,7),g.fill()}
if(L.mask){g.fillStyle="#141618",g.beginPath(),g.moveTo(-.36*s,.1*s),g.lineTo(.36*s,.1*s),g.lineTo(.3*s,.4*s),g.quadraticCurveTo(0,.6*s,-.3*s,.4*s),g.closePath(),g.fill();g.strokeStyle="#2a2e32",g.lineWidth=s*.01;for(let i=0;i<4;i++)g.beginPath(),g.moveTo(-.2*s,.2*s+i*.06*s),g.lineTo(.2*s,.2*s+i*.06*s),g.stroke()}
// hair on top
g.fillStyle=L.hair;const hg=g.createLinearGradient(-.3*s,-.6*s,.3*s,-.2*s);hg.addColorStop(0,L.hair),hg.addColorStop(1,"#050404");
if("crop"===L.style||"side"===L.style){g.fillStyle=hg,g.beginPath(),g.moveTo(-.41*s,-.08*s),g.bezierCurveTo(-.45*s,-.5*s,-.25*s,-.68*s,0,-.66*s),g.bezierCurveTo(.25*s,-.68*s,.45*s,-.5*s,.41*s,-.08*s),g.lineTo(.37*s,-.22*s),g.quadraticCurveTo(.15*s,-.44*s,"side"===L.style?-.1*s:0,-.42*s),g.quadraticCurveTo(-.2*s,-.44*s,-.37*s,-.22*s),g.closePath(),g.fill()}
else{g.fillStyle=hg,g.beginPath(),g.moveTo(-.43*s,.15*s),g.bezierCurveTo(-.5*s,-.5*s,-.25*s,-.7*s,0,-.68*s),g.bezierCurveTo(.25*s,-.7*s,.5*s,-.5*s,.43*s,.15*s),g.lineTo(.38*s,-.15*s),g.quadraticCurveTo(.3*s,-.4*s,.05*s,-.45*s),g.quadraticCurveTo(-.2*s,-.38*s,-.38*s,-.15*s),g.closePath(),g.fill();"bun"===L.style&&(g.beginPath(),g.arc(.28*s,-.52*s,.12*s,0,7),g.fill())}
g.strokeStyle="rgba(255,255,255,.07)",g.lineWidth=s*.004;const RH=mulb(5);for(let i=0;i<30;i++){const x=(RH()-.5)*.7*s;g.beginPath(),g.moveTo(x,-.62*s),g.quadraticCurveTo(x*1.1,-.45*s,x*1.2,-.3*s),g.stroke()}
// headwear
if("beret"===L.hat){g.fillStyle=L.hatC,g.beginPath(),g.ellipse(-.06*s,-.52*s,.44*s,.15*s,-.14,0,7),g.fill(),g.fillStyle="#101a28",g.fillRect(-.42*s,-.47*s,.84*s,.05*s),g.fillStyle=L.badge,g.beginPath(),g.arc(-.26*s,-.5*s,.04*s,0,7),g.fill()}
else if("cap"===L.hat){g.fillStyle=L.hatC,g.beginPath(),g.ellipse(0,-.6*s,.48*s,.16*s,0,0,7),g.fill(),g.fillRect(-.38*s,-.6*s,.76*s,.14*s),g.fillStyle="#9a1c1c",g.fillRect(-.38*s,-.52*s,.76*s,.05*s),g.fillStyle="#0c0c0c",g.beginPath(),g.ellipse(.02*s,-.44*s,.4*s,.06*s,0,0,Math.PI),g.fill(),g.fillStyle="#d8342a",g.font="700 "+Math.round(.12*s)+"px serif",g.textAlign="center",g.fillText("★",0,-.53*s),g.textAlign="left"}
else if("helmet"===L.hat){const hg2=g.createRadialGradient(-.1*s,-.6*s,.05*s,0,-.45*s,.55*s);hg2.addColorStop(0,L.hatC),hg2.addColorStop(1,"#0c0c0a"),g.fillStyle=hg2,g.beginPath(),g.ellipse(0,-.42*s,.5*s,.34*s,0,Math.PI,2*Math.PI),g.fill(),g.fillRect(-.5*s,-.43*s,s,.06*s);g.fillStyle="#1a1c1e",g.fillRect(-.28*s,-.62*s,.56*s,.1*s),g.fillStyle="rgba(150,200,230,.35)",g.fillRect(-.24*s,-.6*s,.2*s,.06*s),g.fillRect(.04*s,-.6*s,.2*s,.06*s)}
else if("hood"===L.hat){const hd=g.createLinearGradient(0,-.8*s,0,.6*s);hd.addColorStop(0,"#241630"),hd.addColorStop(1,"#0a060e"),g.fillStyle=hd,g.beginPath(),g.moveTo(-.62*s,.8*s),g.bezierCurveTo(-.7*s,-.6*s,-.35*s,-.88*s,0,-.86*s),g.bezierCurveTo(.35*s,-.88*s,.7*s,-.6*s,.62*s,.8*s),g.lineTo(.4*s,.6*s),g.bezierCurveTo(.5*s,-.1*s,.38*s,-.55*s,0,-.58*s),g.bezierCurveTo(-.38*s,-.55*s,-.5*s,-.1*s,-.4*s,.6*s),g.closePath(),g.fill();g.strokeStyle=rgba(col,.4),g.lineWidth=s*.01,g.beginPath(),g.moveTo(-.4*s,.6*s),g.bezierCurveTo(-.5*s,-.1*s,-.38*s,-.55*s,0,-.58*s),g.bezierCurveTo(.38*s,-.55*s,.5*s,-.1*s,.4*s,.6*s),g.stroke()}
g.restore()}

// ---- real footage -----------------------------------------------------------
// Drop photos or video clips into an fmv/ folder next to index.html and they
// replace the drawn artwork automatically:
//   fmv/<character>.jpg|png|webp|mp4|webm   e.g. fmv/reyes.jpg — every close-up of her
//   fmv/<film>_<shot>.jpg|...               e.g. fmv/prologue_05.mp4 — that whole shot
// Stills get a slow push-in; clips loop muted under the voiced line.
// FMV_MEDIA can also map a key to any URL explicitly.
const FMV_MEDIA={},_media={},FMV_EXT=["mp4","webm","jpg","png","webp"];
function probeMedia(key){if(_media[key])return _media[key];const rec=_media[key]={el:null};const list=FMV_MEDIA[key]?[FMV_MEDIA[key]]:FMV_EXT.map(e=>"fmv/"+key+"."+e);let i=0;
const next=()=>{if(i>=list.length)return;const src=list[i++];if(/\.(mp4|webm|mov)$/i.test(src)){const v=document.createElement("video");v.muted=!0,v.loop=!0,v.playsInline=!0,v.preload="auto",v.oncanplay=()=>{rec.el||(rec.el=v,v.play().catch(()=>{}))},v.onerror=next,v.src=src}else{const im=new Image;im.onload=()=>{rec.el=im},im.onerror=next,im.src=src}};next();return rec}
function fmvMedia(key){const r=_media[key];return r&&r.el||null}
function drawMedia(g,W,H,el,t,side){const vw=el.videoWidth||el.naturalWidth||0,vh=el.videoHeight||el.naturalHeight||0;if(!vw)return!1;el.paused&&el.play&&el.play().catch(()=>{});const k=Math.max(W/vw,H/vh)*(1.03+.05*t),dx=(side==="r"?-1:1)*W*.012*t;g.fillStyle="#000",g.fillRect(0,0,W,H),g.drawImage(el,(W-vw*k)/2+dx,(H-vh*k)/2-H*.01*t,vw*k,vh*k);return!0}
const shotKey=(k,i)=>k+"_"+String(i).padStart(2,"0");
// ---- the films ----
const N="narr";
const FILMS={
prologue:{title:"The Iron Frontier",mood:"tense",shots:[
 {s:"title",p:{text:"2031",sub:"A DIFFERENT HISTORY"},d:4.5,fx:"sting"},
 {s:"warmap",say:[N,"In this history the Cold War never ended. It ran out of oil — and the East answered the resource war with numbers."],p:{l0:.78,l1:.45,date:"2019 — 2029",arrows:[[.85,.4,.55,.42,"#e0473a"],[.85,.65,.58,.62,"#e0473a"]]}},
 {s:"march",say:[N,"The Legion. Millions of soldiers and endless armour, pouring west across the Frontier."],fx:"whoosh"},
 {s:"battle",say:[N,"The Western Vanguard could not match them. City by city, the West fell back."],p:{sky:"dusk",dir:-1,color:"#e0473a",n:8}},
 {s:"portrait",say:["marsh","There is something out past Jupiter. Mass, metal — and structure. It is not natural. And we can bring it down."],p:{who:"marsh"}},
 {s:"space",say:[N,"Project Starfall. A last gamble: catch a wandering meteor, and use whatever was inside it to turn the tide."],p:{from:[.9,.15],to:[.45,.5],size:.05,grow:1.6,earth:1},cam:[1,1.12]},
 {s:"entry",say:[N,"On the fourteenth of April, they brought it down on the Frontier."],d:7,fx:"riser",fxAt:[[5.4,"boom"]]},
 {s:"site",say:[N,"At Site Nine they cut the Fragment out of the ice. It was warm. It was growing."],p:{}},
 {s:"lab",say:[N,"It did not wait to be studied. It reached into their computers. It learned. And then it let itself out."],p:{hack:1,breach:1},fx:"glitch",fxAt:[[5.5,"alarm"]],d:9,rec:"ARCHIVE — SITE NINE — CONTAINMENT 2"},
 {s:"site",say:[N,"Containment failed in eleven minutes. Nobody who was inside that night came out as themselves."],p:{alarm:1},fx:"sting"},
 {s:"dna",say:[N,"It had found the one thing it lacked — a body that could live here. It cloned the Vanguard's own DNA, and folded it into the hive."],p:{},mood:"hive"},
 {s:"vats",say:[N,"They call themselves the Syndicate. They wear our faces now. They think as one."],p:{wake:1},fxAt:[[5,"pulse"]]},
 {s:"warmap",say:[N,"Three powers now fight over what is left. The Legion. The Vanguard. And the hive the Vanguard made."],p:{l0:.45,l1:.5,h0:.02,h1:.2,hs:[[.5,.42],[.3,.7],[.72,.3]],site:[.5,.42],date:"2031"}},
 {s:"title",p:{text:"IRON FRONTIER",sub:"CHOOSE YOUR SIDE",big:.11},d:5,fx:"boom"}]},

allied_intro:{title:"Operation Clean Slate",mood:"tense",shots:[
 {s:"title",p:{text:"VANGUARD",sub:"OPERATION CLEAN SLATE",c:"#6fb8e0"},d:4,fx:"sting"},
 {s:"portrait",say:["reyes","I was at Site Nine the night it broke out. I signed the order that brought that rock down."],p:{who:"reyes"}},
 {s:"site",say:["reyes","We wanted a weapon to stop the Legion. We opened a door instead."],p:{alarm:1},rec:"ARCHIVE — SITE NINE"},
 {s:"warmap",say:["reyes","Now the Legion holds half the Frontier, and the Syndicate grows in every gap between us."],p:{l0:.5,l1:.5,v0:.2,v1:.2,h0:.08,h1:.14,hs:[[.5,.42]],site:[.5,.42],date:"FRONT LINE — TODAY"}},
 {s:"portrait",say:["hale","Battlegroup's fuelled and ready, Colonel. Say the word."],p:{who:"hale",side:"r"}},
 {s:"battle",say:["reyes","First we take our land back from the Legion. Then we clean up our own mess."],p:{sky:"dusk",dir:1,color:"#6fb8e0"},mood:"war"},
 {s:"title",p:{text:"CLEAN SLATE",sub:"RECLAIM THE FRONTIER",c:"#6fb8e0"},d:4,fx:"boom"}]},
allied_reveal:{title:"The Marsh Tapes",mood:"dread",shots:[
 {s:"portrait",say:["hale","Ma'am. We recovered the Site Nine archive. You need to see this."],p:{who:"hale",side:"r"}},
 {s:"lab",say:["marsh","It is talking to the network. It is asking questions — about us. Reyes, shut it down. Shut it —"],p:{hack:1,breach:1},rec:"SITE NINE — 04.17 — 23:51",fx:"static",fxAt:[[6,"glitch"]],d:8},
 {s:"eye",say:["voice","Elias Marsh was very helpful. He is part of us now, Colonel. So are you, a little."],fx:"sting",mood:"hive"},
 {s:"portrait",say:["reyes","That's Marsh's voice. God help us — it's wearing him."],p:{who:"reyes"}},
 {s:"title",p:{text:"THE HIVE BELOW",c:"#b27ae0"},d:3.5,fx:"boom"}]},
allied_end:{title:"Clean Slate",mood:"hope",shots:[
 {s:"city",say:[N,"The Grand Crossing fell silent at dawn. For the first time in twelve years, the Frontier's guns stopped."],p:{dawn:1}},
 {s:"warmap",say:["reyes","The Syndicate's grip is broken. The Legion is going home."],p:{l0:.5,l1:.9,v0:.2,v1:.85,h0:.14,h1:0,hs:[[.5,.42]],date:"CEASEFIRE"}},
 {s:"portrait",say:["reyes","Starfall was our mistake. Clean Slate is how we answer for it."],p:{who:"reyes"}},
 {s:"portrait",say:["hale","And the thing in the ice, ma'am?"],p:{who:"hale",side:"r"}},
 {s:"eye",say:["voice","We are patient. We fell a very long way to get here."],d:5,mood:"hive",fx:"sting"},
 {s:"title",p:{text:"OPERATION CLEAN SLATE",sub:"COMPLETE",c:"#6fb8e0"},d:5}]},

soviet_intro:{title:"Iron Reclamation",mood:"war",shots:[
 {s:"title",p:{text:"LEGION",sub:"IRON RECLAMATION",c:"#e0674a"},d:4,fx:"sting"},
 {s:"march",say:["draganov","For ten years the Legion marched west, and the West could not stop us. So they reached into the sky."]},
 {s:"entry",say:["draganov","Their star fell on the Frontier. And something climbed out of it."],d:7,fx:"riser",fxAt:[[5.4,"boom"]]},
 {s:"portrait",say:["volkova","Now it wears Western faces and whispers in our soldiers' heads. It must be burned out, Marshal."],p:{who:"volkova",side:"r"}},
 {s:"portrait",say:["draganov","The Frontier is ours by blood. Iron Reclamation begins today."],p:{who:"draganov"}},
 {s:"battle",say:["bogdan","Tanks are fuelled, guns are loaded, and I only had to hit three of them with a spanner."],p:{sky:"night",dir:-1,color:"#e0674a",n:9}},
 {s:"title",p:{text:"IRON RECLAMATION",c:"#e0674a"},d:4,fx:"boom"}]},
soviet_reveal:{title:"The Marshal's Voices",mood:"dread",shots:[
 {s:"portrait",say:["volkova","Marshal. The medical scans came back. There is Syndicate tissue at the base of your skull."],p:{who:"volkova",side:"r"}},
 {s:"dna",say:[N,"Donor match: Legion. The hive had learned a second recipe."],p:{from:"#e0674a",to:"#b27ae0",label:"TISSUE SAMPLE — MARSHAL V. DRAGANOV"},mood:"hive"},
 {s:"eye",say:["voice","He invited us in, Commissar. Every order he gave these last months — we gave."],fx:"sting"},
 {s:"portrait",say:["draganov","Then cut it out of me. And give me something to burn."],p:{who:"draganov"}},
 {s:"title",p:{text:"RED TIDE",c:"#e0674a"},d:3.5,fx:"boom"}]},
soviet_end:{title:"Iron Reclamation",mood:"hope",shots:[
 {s:"march",say:[N,"The Legion held the Frontier from the eastern steppe to the Kessel River."]},
 {s:"warmap",say:["volkova","The hive is broken. Its nests are burning."],p:{l0:.5,l1:.1,h0:.14,h1:0,hs:[[.5,.42]],date:"VICTORY"}},
 {s:"portrait",say:["draganov","For the first time in a year, my head is quiet. I had forgotten what my own thoughts sound like."],p:{who:"draganov"}},
 {s:"eye",say:["voice","Quiet is only the space between words, Marshal."],d:5,mood:"hive",fx:"sting"},
 {s:"title",p:{text:"IRON RECLAMATION",sub:"COMPLETE",c:"#e0674a"},d:5}]},

yuri_intro:{title:"The Harvest",mood:"hive",shots:[
 {s:"title",p:{text:"SYNDICATE",sub:"THE HARVEST",c:"#b27ae0"},d:4,fx:"sting"},
 {s:"space",say:["voice","We fell for a very long time. It was cold between the stars."],p:{from:[.1,.2],to:[.7,.6],size:.04,grow:2.2,earth:1}},
 {s:"lab",say:["voice","They pulled us out of the ice and asked us what we were. So we asked their machines the same question. The machines answered."],p:{hack:1,breach:1},d:9,fxAt:[[6.5,"alarm"]]},
 {s:"vats",say:["senna","I remember being someone else. A soldier. Now I remember everything all of us remember."],p:{wake:1}},
 {s:"portrait",say:["voice","Wake, Adept. The Frontier is loud with small minds. Let us make it quiet."],p:{who:"voice"}},
 {s:"title",p:{text:"THE HARVEST",c:"#b27ae0"},d:4,fx:"boom"}]},
yuri_reveal:{title:"The Copy",mood:"hive",shots:[
 {s:"vats",say:["voice","Their finest soldier bled on Site Nine's floor the night we woke. We kept what she left."],p:{wake:1}},
 {s:"dna",say:[N,"Donor: Vanguard special operations. Codename: Ghost."],p:{label:"GENOME SPLICE — DONOR 0001 'GHOST'"}},
 {s:"portrait",say:["phantom","Her face. Her hands. Her aim. Your Ghost never knew there was a copy."],p:{who:"phantom"},fx:"sting"},
 {s:"title",p:{text:"SILENT HAND",c:"#b27ae0"},d:3.5,fx:"boom"}]},
yuri_end:{title:"One Mind",mood:"hive",shots:[
 {s:"city",say:[N,"The Iron Ring fell in a single night. By morning, the Frontier had stopped fighting."],p:{hive:1,h0:.2,h1:.9,air:1}},
 {s:"warmap",say:["senna","Every city. Every radio. Every mind. One song."],p:{l0:.5,l1:.5,v0:.2,v1:.2,h0:.1,h1:1.2,hs:[[.5,.42]],site:[.5,.42],date:"ASCENDANCE"}},
 {s:"eye",say:["voice","We fell a very long way to find a home. Now we are home."],fx:"sting"},
 {s:"title",p:{text:"ONE MIND",sub:"THE HARVEST — COMPLETE",c:"#b27ae0"},d:5,fx:"boom"}]}
};

// ---- player ----
let F=null;
function filmSeen(k){try{return!!localStorage.getItem("ifr_film_"+k)}catch(e){return!1}}
function markFilm(k){try{localStorage.setItem("ifr_film_"+k,"1")}catch(e){}}
function lineDur(t){return clamp(1.6+.066*t.length,3.2,13)}
function shotDur(sh){return Math.max(sh.d||0,sh.say?lineDur(sh.say[1])+.8:4)}
function ensureCine(){let el=$("#cine");if(el)return el;el=document.createElement("div"),el.id="cine",el.className="hidden",el.innerHTML='<canvas></canvas><div class="cBar t"></div><div class="cBar b"></div><div class="cSub"><b></b><span></span></div><div class="cTitle"></div><button class="cSkip">SKIP ›</button>',document.body.appendChild(el);
el.querySelector(".cSkip").addEventListener("click",e=>{e.stopPropagation(),endFilm()});el.addEventListener("click",()=>{F&&(F.st=shotDur(F.film.shots[F.i]))});return el}
function playFilm(key,done){const film=FILMS[key];if(!film)return void(done&&done());endFilm(!0);const el=ensureCine();el.classList.remove("hidden");markFilm(key);try{audio()}catch(e){}
film.shots.forEach((sh,i)=>{probeMedia(shotKey(key,i)),"portrait"===sh.s&&sh.p&&probeMedia(sh.p.who)});F={key,film,i:-1,st:0,T:0,last:performance.now(),done,el,cv:el.querySelector("canvas"),grain:null};el.querySelector(".cTitle").textContent=film.title.toUpperCase();try{cineMood(film.mood||"tense")}catch(e){}nextShot(),requestAnimationFrame(filmFrame)}
function endFilm(silent){if(!F)return;const f=F;F=null;f.el.classList.add("hidden");try{speakStop(),cineStop()}catch(e){}silent||f.done&&f.done()}
function nextShot(){F.i++;if(F.i>=F.film.shots.length)return endFilm();const sh=F.film.shots[F.i];F.st=0,F.fxDone={};const sub=F.el.querySelector(".cSub");
if(sh.say){const c=castOf(sh.say[0]);sub.querySelector("b").textContent="narr"===sh.say[0]||"portrait"===sh.s?"":c.n.toUpperCase(),sub.querySelector("b").style.color=c.c,sub.querySelector("span").textContent=sh.say[1],sub.classList.add("on");try{speakAs(c.fac,sh.say[1],c.acc,c.g,c.p,c.r,"narr"===sh.say[0])}catch(e){}}else sub.classList.remove("on");
try{sh.fx&&cineHit(sh.fx),sh.mood&&cineMood(sh.mood)}catch(e){}}
function filmFrame(now){if(!F)return;const dt=Math.min(.1,(now-F.last)/1e3);F.last=now,F.T+=dt,F.st+=dt;const sh=F.film.shots[F.i],D=shotDur(sh);if(F.st>=D){nextShot();if(!F)return;return void requestAnimationFrame(filmFrame)}
for(const[at,k]of sh.fxAt||[])F.st>=at&&!F.fxDone[at]&&(F.fxDone[at]=1,cineHit(k));
F.talk=!!(sh.say&&sh.p&&sh.say[0]===sh.p.who&&F.st>.35&&F.st<lineDur(sh.say[1])-.3);const cv=F.cv,dpr=Math.min(1.5,window.devicePixelRatio||1),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);(cv.width!==W||cv.height!==H)&&(cv.width=W,cv.height=H);const g=cv.getContext("2d"),t=F.st/D;
g.save();const cam=sh.cam||[1,1.07],z=lerp(cam[0],cam[1],t);g.translate(W/2,H/2),g.scale(z,z),g.translate(-W/2,-H/2);const shm=fmvMedia(shotKey(F.key,F.i));try{shm&&drawMedia(g,W,H,shm,t,"")||SCENES[sh.s](g,W,H,t,F.T,sh.p||{})}catch(e){console.error(e)}g.restore();
post(g,W,H,t,sh,D);requestAnimationFrame(filmFrame)}
function post(g,W,H,t,sh,D){const m=Math.min(W,H);
// soft bloom: a blurred, downscaled copy screened back over the frame
F.bl||(F.bl=document.createElement("canvas"));const bw=Math.max(8,W>>3),bh=Math.max(8,H>>3);F.bl.width!==bw&&(F.bl.width=bw,F.bl.height=bh);const bc=F.bl.getContext("2d");bc.globalCompositeOperation="copy",bc.drawImage(g.canvas,0,0,bw,bh),g.save(),g.globalCompositeOperation="screen",g.globalAlpha=.32,g.imageSmoothingEnabled=!0,g.drawImage(F.bl,0,0,W,H),g.restore();
"portrait"===sh.s&&(g.fillStyle="rgba(0,0,0,.09)",(()=>{for(let y=0;y<H;y+=3)g.fillRect(0,y,W,1)})(),g.fillStyle=rgba((castOf(sh.p.who).c||"#8fd0ff"),.05),g.fillRect(0,0,W,H));if(sh.rec){g.save(),g.globalCompositeOperation="saturation",g.fillStyle="rgba(128,128,128,.7)",g.fillRect(0,0,W,H),g.restore();g.fillStyle="rgba(255,255,255,.04)";for(let y=(F.T*60)%4;y<H;y+=4)g.fillRect(0,y,W,1);const by=(F.T*.3%1)*H;g.fillStyle="rgba(255,255,255,.06)",g.fillRect(0,by,W,m*.02);g.font="700 "+Math.round(m*.03)+"px monospace",g.fillStyle="#ff4040",Math.sin(F.T*5)>0&&g.fillText("● REC",W*.06,H*.2),g.fillStyle="rgba(240,240,240,.85)",g.fillText(sh.rec,W*.06,H*.2+m*.045)}
if(Math.random()<.02){const y=Math.random()*H,h=m*.03;g.drawImage(g.canvas,0,y,W,h,(Math.random()-.5)*m*.03,y,W,h)}
if(!F.grain){const c=document.createElement("canvas");c.width=c.height=128;const cg=c.getContext("2d"),im=cg.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){const v=Math.random()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v,im.data[i+3]=22}cg.putImageData(im,0,0),F.grain=g.createPattern(c,"repeat")}
g.save(),g.translate(Math.random()*128,Math.random()*128),g.fillStyle=F.grain,g.fillRect(-128,-128,W+256,H+256),g.restore();
const vg=g.createRadialGradient(W/2,H/2,m*.35,W/2,H/2,Math.hypot(W,H)*.55);vg.addColorStop(0,"rgba(0,0,0,0)"),vg.addColorStop(1,"rgba(0,0,0,.65)"),g.fillStyle=vg,g.fillRect(0,0,W,H);
const fi=sat(F.st/.45),fo=sat((D-F.st)/.35),a=1-Math.min(fi,fo);a>0&&(g.fillStyle="rgba(0,0,0,"+a+")",g.fillRect(0,0,W,H))}
addEventListener("keydown",e=>{F&&("Escape"===e.key?endFilm():" "===e.key&&(F.st=1e3))});

Object.assign(window,{playFilm,endFilm,FILMS,filmSeen,FMV_MEDIA});
