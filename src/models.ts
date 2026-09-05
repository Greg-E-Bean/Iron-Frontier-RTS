export {};
function roundRectProfile(e,t,r,n){const a=e/2,o=t/2;r=Math.max(.01,Math.min(r,.98*Math.min(a,o))),n=Math.max(1,0|n);const s=[],i=[[a-r,o-r,0],[-(a-r),o-r,Math.PI/2],[-(a-r),-(o-r),Math.PI],[a-r,-(o-r),1.5*Math.PI]];for(const[e,t,a]of i)for(let o=0;o<=n;o++){const i=a+o/n*(Math.PI/2);s.push([e+Math.cos(i)*r,t+Math.sin(i)*r])}return s}function circleProfile(e,t){const r=[];for(let n=0;n<t;n++){const a=n/t*Math.PI*2;r.push([Math.cos(a)*e,Math.sin(a)*e])}return r}function polyProfile(e){return e.map(e=>[e[0],e[1]])}function triN(e,t,r){const n=t[0]-e[0],a=t[1]-e[1],o=t[2]-e[2],s=r[0]-e[0],i=r[1]-e[1],l=r[2]-e[2],c=a*l-o*i,d=o*s-n*l,f=n*i-a*s,h=Math.hypot(c,d,f)||1;return[c/h,d/h,f/h]}function pushTri(e,t,r,n,a?,o?,s?){if(!a){a=o=s=triN(t,r,n)}e.push({p:[t,r,n],n:[a,o,s]})}function fanCap(e,t,r,n,a?){const o=void 0===a?1:a,s=n?[0,0,1]:[0,0,-1],i=[0,0,r];for(let a=0;a<t.length;a++){const l=(a+1)%t.length,c=[t[a][0]*o,t[a][1]*o,r],d=[t[l][0]*o,t[l][1]*o,r];n?pushTri(e,i,c,d,s,s,s):pushTri(e,i,d,c,s,s,s)}}function nrm3(e,t,r){const n=Math.hypot(e,t,r)||1;return[e/n,t/n,r/n]}function wallMeshSG(e,t,r,n,a,o){const s=[],i=e.length;void 0===o&&(o=.6);const l=r-t,c=[];for(let t=0;t<i;t++){const r=(t+1)%i,o=e[t][0],s=e[t][1],d=e[r][0],f=e[r][1];let h=f-s,u=-(d-o);const p=.5*(Math.hypot(o,s)+Math.hypot(d,f)),m=l?p*(n-a)/l:0;c.push(nrm3(h,u,m*Math.hypot(h,u)/(p||1)))}const d=[];for(let e=0;e<i;e++){const t=c[(e-1+i)%i],r=c[e],n=t[0]*r[0]+t[1]*r[1]+t[2]*r[2];d.push(n>o?nrm3(t[0]+r[0],t[1]+r[1],t[2]+r[2]):null)}for(let o=0;o<i;o++){const l=(o+1)%i,f=[e[o][0]*n,e[o][1]*n,t],h=[e[l][0]*n,e[l][1]*n,t],u=[e[l][0]*a,e[l][1]*a,r],p=[e[o][0]*a,e[o][1]*a,r],m=d[o]||c[o],g=d[l]||c[o];pushTri(s,f,h,u,m,g,g),pushTri(s,f,u,p,m,g,m)}return s}function wallMesh(e,t,r,n,a,o){return wallMeshSG(e,t,r,n,a,o?-.2:.6)}function boxMesh(e,t,r,n?){n=(void 0===n?.2*Math.min(e,t,r):n)*1.35,n=Math.max(1e-4,Math.min(n,.3*Math.min(e,t),.36*r));const a=Math.min(10,Math.max(5,Math.round(.5*Math.min(e,t)))),o=roundRectProfile(e,t,1.3*n,a),s=roundRectProfile(e-2*n,t-2*n,1.3*n,a),i=[],l=Math.min(.65*n,.2*r),c=roundRectProfile(e-2*l,t-2*l,1.3*n,a);for(let e=0;e<c.length;e++){const t=(e+1)%c.length,r=[c[e][0],c[e][1],0],n=[c[t][0],c[t][1],0],a=[o[t][0],o[t][1],l],s=[o[e][0],o[e][1],l];pushTri(i,r,n,a),pushTri(i,r,a,s)}i.push(...wallMeshSG(o,l,r-n,1,1,.55));const d=o.length;for(let e=0;e<d;e++){const t=(e+1)%d,a=[o[e][0],o[e][1],r-n],l=[o[t][0],o[t][1],r-n],c=[s[t][0],s[t][1],r],f=[s[e][0],s[e][1],r];pushTri(i,a,l,c),pushTri(i,a,c,f)}return fanCap(i,s,r,!0),i}function cylMesh(e,t,r,n?){const a=circleProfile(e,Math.max(r||22,18)),o=wallMesh(a,0,t,1,1,!0);return!1!==n&&(fanCap(o,a,t,!0),fanCap(o,a,0,!1)),o}function coneMesh(e,t,r,n?){const a=circleProfile(1,Math.max(n||20,18)),o=wallMesh(a,0,r,e,t,!0);return t>.05&&fanCap(o,a.map(e=>[e[0]*t,e[1]*t]),r,!0),e>.05&&fanCap(o,a.map(t=>[t[0]*e,t[1]*e]),0,!1),o}function domeMesh(e,t,r,n?){r=Math.max(r||22,18),n=Math.max(n||10,8);const a=[];for(let o=0;o<n;o++){const s=o/n*(Math.PI/2),i=(o+1)/n*(Math.PI/2),l=Math.cos(s)*e,c=Math.cos(i)*e,d=Math.sin(s)*t,f=Math.sin(i)*t;for(let n=0;n<r;n++){const o=n/r*Math.PI*2,s=(n+1)/r*Math.PI*2,i=[Math.cos(o)*l,Math.sin(o)*l,d],h=[Math.cos(s)*l,Math.sin(s)*l,d],u=[Math.cos(s)*c,Math.sin(s)*c,f],p=[Math.cos(o)*c,Math.sin(o)*c,f],m=nrm3(i[0]/e,i[1]/e,i[2]/t),g=nrm3(h[0]/e,h[1]/e,h[2]/t),y=nrm3(u[0]/e,u[1]/e,u[2]/t),x=nrm3(p[0]/e,p[1]/e,p[2]/t);c<.02?pushTri(a,i,h,[0,0,f],m,g,[0,0,1]):(pushTri(a,i,h,u,m,g,y),pushTri(a,i,u,p,m,y,x))}}return a}function slabMesh(e,t,r?){const n=[];if(r=r||0,n.push(...wallMesh(e,0,t-r,1,1,!1)),r>0){const a=1-Math.min(.5,r/Math.max(4,Math.hypot(e[0][0],e[0][1])));n.push(...wallMesh(e,t-r,t,1,a,!1)),fanCap(n,e,t,!0,a)}else fanCap(n,e,t,!0);return n}function wedgeMesh(e,t,r,n){const a=e/2,o=t/2,s=[],i=[-a,-o,0],l=[a,-o,0],c=[a,o,0],d=[-a,o,0],f=[-a,-o,r],h=[a,-o,n],u=[a,o,n],p=[-a,o,r];return pushTri(s,f,h,u),pushTri(s,f,u,p),pushTri(s,i,l,h),pushTri(s,i,h,f),pushTri(s,l,c,u),pushTri(s,l,u,h),pushTri(s,c,d,p),pushTri(s,c,p,u),pushTri(s,d,i,f),pushTri(s,d,f,p),s}function taperSlabMesh(e,t,r){const n=wallMesh(e,0,t,1,r,!1);return fanCap(n,e,t,!0,r),n}function hexProfile(e,t){const r=e/2,n=t/2;return filletPoly([[r,0],[.55*r,n],[.55*-r,n],[-r,0],[.55*-r,-n],[.55*r,-n]],.1*Math.min(e,t),3)}function filletPoly(e,t,r){r=r||4;const n=e.length,a=[];for(let o=0;o<n;o++){const s=e[(o-1+n)%n],i=e[o],l=e[(o+1)%n],c=s[0]-i[0],d=s[1]-i[1],f=l[0]-i[0],h=l[1]-i[1],u=Math.hypot(c,d),p=Math.hypot(f,h),m=c/u,g=d/u,y=f/p,x=h/p,v=Math.max(-1,Math.min(1,m*y+g*x)),M=Math.acos(v);if(M<.08||M>3.06){a.push(i);continue}const T=Math.min(t/Math.tan(M/2),.42*u,.42*p),b=T*Math.tan(M/2),P=i[0]+m*T,S=i[1]+g*T,A=i[0]+y*T,I=i[1]+x*T;let B=m+y,D=g+x;const L=Math.hypot(B,D)||1;B/=L,D/=L;const R=b/Math.sin(M/2),C=i[0]+B*R,E=i[1]+D*R;let z=Math.atan2(S-E,P-C);const F0=Math.atan2(I-E,A-C);let H=F0-z;for(;H>Math.PI;)H-=2*Math.PI;for(;H<-Math.PI;)H+=2*Math.PI;for(let e=0;e<=r;e++){const t=z+H*e/r;a.push([C+Math.cos(t)*b,E+Math.sin(t)*b])}}return a}function hullProfile(e,t,fac?){const r=e/2,n=t/2;if("yuri"===fac){const p=[];for(let i=0;i<16;i++){const ang=i/16*Math.PI*2,bulge=1+.16*Math.cos(ang);p.push([Math.cos(ang)*r*bulge*.94,Math.sin(ang)*n*(1-.1*Math.cos(2*ang))])}return p}if("allied"===fac)return filletPoly([[r,0],[.6*r,.7*n],[.05*r,n],[-.7*r,.6*n],[-r,.26*n],[-r,-.26*n],[-.7*r,-.6*n],[.05*r,-n],[.6*r,-.7*n]],.15*Math.min(e,t),4);if("soviet"===fac)return filletPoly([[.92*r,.5*n],[.92*r,-.5*n],[.5*r,-.94*n],[-.72*r,-.94*n],[-r,-.42*n],[-r,.42*n],[-.72*r,.94*n],[.5*r,.94*n]],.05*Math.min(e,t),3);return filletPoly([[r,0],[.74*r,.82*n],[-.5*r,n],[-r,.78*n],[-r,-.78*n],[-.5*r,-n],[.74*r,-.82*n]],.09*Math.min(e,t),4)}const MESHC=new Map;function meshOf(e,t){let r=MESHC.get(e);return r||(r=t(),MESHC.set(e,r)),r}const BOXM=(e,t,r,n?)=>meshOf("B"+e.toFixed(2)+"_"+t.toFixed(2)+"_"+r.toFixed(2)+"_"+(void 0===n?"a":n.toFixed(2)),()=>boxMesh(e,t,r,n)),CYL=(e,t,r?,n?)=>meshOf("C"+e.toFixed(2)+"_"+t.toFixed(2)+"_"+(r||26)+"_"+(!1!==n),()=>cylMesh(e,t,r,n)),CONE=(e,t,r,n?)=>meshOf("K"+e.toFixed(2)+"_"+t.toFixed(2)+"_"+r.toFixed(2)+"_"+(n||20),()=>coneMesh(e,t,r,n)),DOME=(e,t,r?)=>meshOf("D"+e.toFixed(2)+"_"+t.toFixed(2)+"_"+(r||22),()=>domeMesh(e,t,r)),SLAB=(e,t,r,n)=>meshOf("S"+n,()=>slabMesh(e,t,r)),TSLAB=(e,t,r,n)=>meshOf("T"+n,()=>taperSlabMesh(e,t,r)),WEDGE=(e,t,r,n)=>meshOf("W"+e.toFixed(2)+"_"+t.toFixed(2)+"_"+r.toFixed(2)+"_"+n.toFixed(2),()=>wedgeMesh(e,t,r,n));function P_(e,t?,r?,n?,a?,o?){const s={m:e,x:t||0,y:r||0,z:n||0,c:a||"body"};return o&&Object.assign(s,o),s}function B_(e,t,r,n,a,o,s?){return{m:BOXM(n,a,o),x:e,y:t,z:r,c:s,w:n,d:a,h:o}}const cv=document.getElementById("game") as HTMLCanvasElement,ctx=cv.getContext("2d") as CanvasRenderingContext2D,mm=document.getElementById("minimap") as HTMLCanvasElement,mctx=mm.getContext("2d") as CanvasRenderingContext2D;let CW=0,CH=0,DPR=1;const cam={x:1472,y:1152,z:.62},ISO_H=.5,ZH=1.22,SPR=3,FACES=32,isoX=(e,t)=>e-t,isoY=(e,t)=>.5*(e+t);let camZTarget=cam.z,zoomPivot=null;function w2sx(e,t){return(isoX(e,t)-isoX(cam.x,cam.y))*cam.z+CW/2}function w2sy(e,t,r){return(isoY(e,t)-isoY(cam.x,cam.y))*cam.z+CH/2-(r||0)*ZH*cam.z}function s2w(e,t){const r=(e-CW/2)/cam.z+isoX(cam.x,cam.y),n=(t-CH/2)/cam.z+isoY(cam.x,cam.y);return{x:n/.5/2+r/2,y:n/.5/2-r/2}}const depthOf=e=>e.x+e.y;let QUALITY=2,lastQualityChange=-1e9;function setQuality(e){e!==QUALITY&&(S.time-lastQualityChange<12||(lastQualityChange=S.time,QUALITY=e,tileSprites=null,resize(),e<2&&S.running&&hint("Graphics scaled down to keep it smooth")))}function resize(){DPR=QUALITY>=2?Math.min(3,window.devicePixelRatio||1):1;const e=document.documentElement;CW=e&&e.clientWidth||window.innerWidth,CH=e&&e.clientHeight||window.innerHeight,cv.width=CW*DPR,cv.height=CH*DPR,cv.style.width=CW+"px",cv.style.height=CH+"px",ctx.setTransform(DPR,0,0,DPR,0,0);const t=Math.min(150,Math.max(96,Math.floor(.3*CW))),r=Math.round(72*t/92);mm.width=t*DPR,mm.height=r*DPR,mm.style.width=t+"px",mm.style.height=r+"px",mctx.setTransform(DPR,0,0,DPR,0,0),"function"==typeof resizeGL&&resizeGL()}function clampCam(){cam.z=clamp(cam.z,.3,2.3),cam.x=clamp(cam.x,-192,3136),cam.y=clamp(cam.y,-192,2496)}function shade(e,t){let r=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),a=parseInt(e.slice(5,7),16);return r=clamp(Math.round(r*t),0,255),n=clamp(Math.round(n*t),0,255),a=clamp(Math.round(a*t),0,255),"#"+((1<<24)+(r<<16)+(n<<8)+a).toString(16).slice(1)}window.addEventListener("resize",resize),window.addEventListener("orientationchange",()=>setTimeout(resize,140)),window.visualViewport&&(window.visualViewport.addEventListener("resize",resize),window.visualViewport.addEventListener("scroll",resize));const SHADECACHE=new Map;function sh(e,t){const r=e+t.toFixed(2);let n=SHADECACHE.get(r);return n||(n=shade(e,t),SHADECACHE.set(r,n)),n}function palette(e){const r=S.players[e],t=r.f;return{body:r.color||t.color,dark:r.dark||t.dark,trim:r.tint||t.tint}}const MAT={metal:"#868f99",steel:"#6b7178",dark2:"#24272d",tread:"#1c1e22",glass:"#9fd0ff",glassdark:"#4d6b8c",gold:"#d4a537",crystal:"#7ff0ff",psi:"#c98cff",skin:"#c39a76",olive:"#4d5438",white:"#c8cdd2",red:"#c8382b",concrete:"#8b8474",roof:"#4d545e",rust:"#7a5c3a",green:"#5aa653",black:"#131417",tesla:"#8fd8ff",neutral:"#8d8474",wood:"#5f4c36",rubber:"#141519",darkmetal:"#40454c",lightY:"#ffe9a0",sand:"#8f7d58",armor:"#828d9b",armor2:"#6a7280",armor3:"#4d5560",gunmetal:"#1a1d23",nose:"#646d79",rock2:"#635b4d",rock3:"#4d473c",concrete2:"#6f685c",asphalt:"#2f3237",carapace:"#8f7aa8",carapace2:"#6a5a80",tibG:"#d69a2e",tibGlit:"#ffe08a",tibB:"#7fd8e8",tibBlit:"#d8fbff",bark:"#4a4030",pod:"#6e5f45",glow:"#ffb347",green2:"#3f7a3d",green3:"#6cae4a",pine:"#3f5f4c",autumn:"#9a6a2e",bark2:"#5a4632",scorch:"#1c1a17",wreck:"#3a3128"};function colOf(e,t){return t[e]||MAT[e]||e}const LIGHT=-2.2;function projX(e,t){return e-t}function projY(e,t,r){return.5*(e+t)-r*ZH}function boxCorners(e,t){const r=Math.cos(t),n=Math.sin(t),a=e.x*r-e.y*n,o=e.x*n+e.y*r,s=t+(e.r||0),i=Math.cos(s),l=Math.sin(s),c=e.w/2,d=e.d/2;return[[a-c*i+d*l,o-c*l-d*i],[a+c*i+d*l,o+c*l-d*i],[a+c*i-d*l,o+c*l+d*i],[a-c*i-d*l,o-c*l+d*i]]}function boxCentre(e,t){const r=Math.cos(t),n=Math.sin(t);return[e.x*r-e.y*n,e.x*n+e.y*r]}const L_DIR=nrm3(-.55,-.78,.62),V_DIR=nrm3(1,1,1),H_DIR=nrm3(L_DIR[0]+V_DIR[0],L_DIR[1]+V_DIR[1],L_DIR[2]+V_DIR[2]),_L=[0,0,0];function shadeNormal(e,t,r,n,a,o){const s=Math.max(0,e*L_DIR[0]+t*L_DIR[1]+r*L_DIR[2]),i=.5+.5*r,l=.5-.5*r,c=.8+.2*Math.min(1,Math.max(0,n)/26),d=Math.abs(e*V_DIR[0]+t*V_DIR[1]+r*V_DIR[2]),f=.2*Math.pow(1-Math.min(1,d),3.4);let h=e*H_DIR[0]+t*H_DIR[1]+r*H_DIR[2];const u=void 0===o?26:o;h=h>0?Math.pow(h,u)*(void 0===a?.42:a):0;const p=.92*s*c,m=.29*c;return _L[0]=m+1*p+.24*i*.58+.15*l*.62+h+.72*f,_L[1]=m+.955*p+.24*i*.7+.15*l*.54+h+.86*f,_L[2]=m+.875*p+.24*i*.92+.15*l*.42+h+1*f,_L}const SURF={glass:[1.05,70],glassdark:[.85,60],crystal:[1.2,80],tesla:[.95,60],metal:[.74,42],steel:[.66,38],armor:[.54,32],armor2:[.5,30],armor3:[.46,28],gunmetal:[.64,38],darkmetal:[.54,32],white:[.4,24],gold:[.78,38],rubber:[.08,8],tread:[.1,9],concrete:[.1,7],concrete2:[.09,7],asphalt:[.12,9],sand:[.08,6],olive:[.12,10],wood:[.14,10],skin:[.22,14],black:[.32,22],rust:[.11,9],neutral:[.13,10]},_hexc=new Map;function rgbOf(e){let t=_hexc.get(e);return t||(t=[parseInt(e.slice(1,3),16),parseInt(e.slice(3,5),16),parseInt(e.slice(5,7),16)],_hexc.set(e,t)),t}function gritN(e,t,r){const n=Math.sin(12.9898*e+78.233*t+37.719*r)*43758.5453;return n-Math.floor(n)}function buildTris(e,t,r,n){n.length=0;const a=Math.cos(t),o=Math.sin(t);for(const s of e){if(!s||!s.m)continue;const e=t+(s.r||0),i=Math.cos(e),l=Math.sin(e),c=s.tx||0,d=s.ty||0,f=Math.cos(c),h=Math.sin(c),u=Math.cos(d),p=Math.sin(d),m=(s.x||0)*a-(s.y||0)*o,g=(s.x||0)*o+(s.y||0)*a,y=s.z||0,x=s.sx||1,M=s.sy||1,b=s.sz||1,P=rgbOf(colOf(s.c,r)),k=SURF[s.c]||SURF[s.s]||[.42,26],S=!!s.e,v=s.m;for(let e=0;e<v.length;e++){const t=v[e],r=t.p,a=t.n,o=[null,null,null],s=[null,null,null];for(let e=0;e<3;e++){let t=r[e][0]*x,n=r[e][1]*M,P=r[e][2]*b,v=a[e][0],w=a[e][1],_=a[e][2];if(c){const e=n*h+P*f;n=n*f-P*h,P=e;const t=w*h+_*f;w=w*f-_*h,_=t}if(d){const e=-t*p+P*u;t=t*u+P*p,P=e;const r=-v*p+_*u;v=v*u+_*p,_=r}const L=t*i-n*l+m,T=t*l+n*i+g,E=P+y,B=v*i-w*l,C=v*l+w*i,R=_;if(o[e]=[L-T,.5*(L+T)-E*ZH,L+T+E],S)s[e]=[1.22,1.16,1.06];else{const t=shadeNormal(B,C,R,E,k[0],k[1]);s[e]=[t[0],t[1],t[2]]}}const gv=S?1:.86+.28*gritN(r[0][0]+r[1][0]+r[2][0],r[0][1]+r[1][1]+r[2][1],r[0][2]+r[1][2]+r[2][2]);n.push({v:o,lum:s,r:P[0]*gv,g:P[1]*gv,b:P[2]*gv})}}return n}function triRasterG(e,t,r,n,a,o,s,i,l,c,d,f,h){const u=a[0],p=a[1],m=a[2],g=o[0],y=o[1],x=o[2],M=s[0],b=s[1],P=s[2],k=Math.max(0,Math.floor(Math.min(u,g,M))),S=Math.min(r-1,Math.ceil(Math.max(u,g,M))),v=Math.max(0,Math.floor(Math.min(p,y,b))),w=Math.min(n-1,Math.ceil(Math.max(p,y,b)));if(k>S||v>w)return;const _=(y-b)*(u-M)+(M-g)*(p-b);if(Math.abs(_)<1e-9)return;const L=1/_,T=i[0],E=i[1],B=i[2],C=l[0],R=l[1],O=l[2],A=c[0],I=c[1],G=c[2];for(let n=v;n<=w;n++){const a=n+.5;for(let o=k;o<=S;o++){const s=o+.5,i=((y-b)*(s-M)+(M-g)*(a-b))*L;if(i<-.0015)continue;const l=((b-p)*(s-M)+(u-M)*(a-b))*L;if(l<-.0015)continue;const c=1-i-l;if(c<-.0015)continue;const k=i*m+l*x+c*P,S=n*r+o;if(k<=t[S])continue;t[S]=k;let v=i*T+l*C+c*A,w=i*E+l*R+c*I,_=i*B+l*O+c*G;v<0?v=0:v>1.9&&(v=1.9),w<0?w=0:w>1.9&&(w=1.9),_<0?_=0:_>1.9&&(_=1.9);const F=4*S;e[F]=d*v,e[F+1]=f*w,e[F+2]=h*_,e[F+3]=255}}}function creaseAO(e,t,r,n,a){const o=new Float32Array(r*n),s=1/2.6;for(let e=1;e<n-1;e++){let n=e*r+1;for(let e=1;e<r-1;e++,n++){const e=t[n];if(e<-1e8)continue;let a,i=0;a=(t[n-1]-e)*s,a>0&&(i+=a>1?1:a),a=(t[n+1]-e)*s,a>0&&(i+=a>1?1:a),a=(t[n-r]-e)*s,a>0&&(i+=a>1?1:a),a=(t[n+r]-e)*s,a>0&&(i+=a>1?1:a),o[n]=.25*i}}const i=void 0===a?.62:a;for(let t=1;t<n-1;t++){let n=t*r+1;for(let t=1;t<r-1;t++,n++){const t=(2*o[n]+o[n-1]+o[n+1]+o[n-r]+o[n+r])*(1/6);if(t<=.004)continue;const a=1-Math.min(.7,t*i),s=4*n;e[s]*=a,e[s+1]*=a,e[s+2]*=a}}}const _tris=[],_stris=[],_ONE=[1,1,1],SHADOW_K=1.05;function buildShadowTris(e,t,r){r.length=0;const n=Math.cos(t),a=Math.sin(t),o=-L_DIR[0]/L_DIR[2]*1.05,s=-L_DIR[1]/L_DIR[2]*1.05;for(const i of e){if(!i||!i.m)continue;const e=t+(i.r||0),l=Math.cos(e),c=Math.sin(e),d=(i.x||0)*n-(i.y||0)*a,f=(i.x||0)*a+(i.y||0)*n,h=i.z||0,u=i.sx||1,p=i.sy||1,m=i.sz||1,g=i.tx||0,y=i.ty||0,x=Math.cos(g),M=Math.sin(g),b=Math.cos(y),P=Math.sin(y);for(const e of i.m){const t=e.p,n=[null,null,null];for(let e=0;e<3;e++){let r=t[e][0]*u,a=t[e][1]*p,i=t[e][2]*m;if(g){const e=a*M+i*x;a=a*x-i*M,i=e}if(y){const e=-r*P+i*b;r=r*b+i*P,i=e}let k=r*l-a*c+d,S=r*c+a*l+f;const v=Math.max(0,i+h);k+=v*o,S+=v*s,n[e]=[k-S,.5*(k+S),0]}r.push(n)}}return r}function makeShadow(e,t,r){const n=buildShadowTris(e,t,_stris);let a=1e9,o=1e9,s=-1e9,i=-1e9;for(const e of n)for(let t=0;t<3;t++)e[t][0]<a&&(a=e[t][0]),e[t][0]>s&&(s=e[t][0]),e[t][1]<o&&(o=e[t][1]),e[t][1]>i&&(i=e[t][1]);a>s&&(a=o=0,s=i=1);const l=1.5,c=r||2,d=Math.max(2,Math.ceil(s-a)+3),f=Math.max(2,Math.ceil(i-o)+3),h=Math.ceil(d*c),u=Math.ceil(f*c),p=new Uint8ClampedArray(h*u*4),m=new Float32Array(h*u);m.fill(-1e9);const g=-a+l,y=-o+l,x=[0,0,0],M=[0,0,0],b=[0,0,0];for(const e of n)x[0]=(e[0][0]+g)*c,x[1]=(e[0][1]+y)*c,x[2]=0,M[0]=(e[1][0]+g)*c,M[1]=(e[1][1]+y)*c,M[2]=0,b[0]=(e[2][0]+g)*c,b[1]=(e[2][1]+y)*c,b[2]=0,triRasterG(p,m,h,u,x,M,b,_ONE,_ONE,_ONE,12,14,18);const P=document.createElement("canvas");return P.width=h,P.height=u,P.getContext("2d").putImageData(new ImageData(p,h,u),0,0),{c:P,ox:g,oy:y,w:d,h:f}}const SHADOWS=new Map,SHADOW_CAP=300;function makeSprite(e,t,r,n?){const a=buildTris(e,t,r,_tris);let o=1e9,s=1e9,i=-1e9,l=-1e9;for(const e of a)for(let t=0;t<3;t++){const r=e.v[t];r[0]<o&&(o=r[0]),r[0]>i&&(i=r[0]),r[1]<s&&(s=r[1]),r[1]>l&&(l=r[1])}o>i&&(o=s=0,i=l=1);const c=1.5,d=Math.max(2,Math.ceil(i-o)+3),f=Math.max(2,Math.ceil(l-s)+3),h=n||3,u=Math.ceil(d*h),p=Math.ceil(f*h),m=new Uint8ClampedArray(u*p*4),g=new Float32Array(u*p);g.fill(-1e9);const y=-o+c,x=-s+c,M=[0,0,0],b=[0,0,0],P=[0,0,0];for(const e of a)M[0]=(e.v[0][0]+y)*h,M[1]=(e.v[0][1]+x)*h,M[2]=e.v[0][2],b[0]=(e.v[1][0]+y)*h,b[1]=(e.v[1][1]+x)*h,b[2]=e.v[1][2],P[0]=(e.v[2][0]+y)*h,P[1]=(e.v[2][1]+x)*h,P[2]=e.v[2][2],triRasterG(m,g,u,p,M,b,P,e.lum[0],e.lum[1],e.lum[2],e.r,e.g,e.b);creaseAO(m,g,u,p,.88*h/3);const k=document.createElement("canvas");return k.width=u,k.height=p,k.getContext("2d").putImageData(new ImageData(m,u,p),0,0),{c:k,ox:y,oy:x,w:d,h:f}}const SPRITES=new Map;function sprite(e,t,r,n){let a=SPRITES.get(e);return a||(a=makeSprite(t,r,n),SPRITES.set(e,a)),a}function blit(e,t,r,n,a){void 0!==a&&(ctx.globalAlpha=a),ctx.drawImage(e.c,t-e.ox*n,r-e.oy*n,e.w*n,e.h*n),void 0!==a&&(ctx.globalAlpha=1)}const faceIdx=e=>(Math.round(e/(2*Math.PI)*32)%32+32)%32,faceAng=e=>e/32*Math.PI*2,PI2=Math.PI/2;function rows(e,t,r,n,a,o,s,i,l,c){for(let d=0;d<o;d++)e.push(P_(BOXM(s,i,l),t+(r-t)*(1===o?.5:d/(o-1)),n,a,c))}function oreDrillModel(type){
  const e=[],glowTip=2===type?"tibBlit":"tibGlit",glowMid=2===type?"tibB":"tibG",baseZ=1.4,towerH=17,topZ=baseZ+towerH;
  e.push(P_(CYL(6.8,1.4,14),0,0,0,"concrete2"));
  e.push(P_(CYL(6,.6,14),0,0,1.4,"darkmetal"));
  lattice(e,0,0,baseZ,towerH,3.2,"rust");
  e.push(P_(BOXM(4.6,4.6,2.6,.6),0,0,topZ+1.3,"darkmetal"));
  e.push(P_(CYL(1.7,1.6,10),0,0,topZ+2.6,"steel"));
  e.push(P_(CYL(1,1.2,8),0,0,topZ+3.4,"glow",{e:1}));
  const segs=5,augerR=2.1,dz=topZ;
  for(let i=0;i<segs;i++){
    const zz=dz-3.4*i,rr=augerR*(1-i/segs*.55),dg={spin:2.2,bob:1.1};
    e.push(P_(CYL(.42*rr,3.6,8),0,0,zz,"gunmetal",{a:dg}));
    e.push(P_(BOXM(rr,.26*rr,3.4,.14),0,0,zz,i%2?glowMid:"rust",{a:dg}));
  }
  e.push(P_(CONE(.9,.14,2.6,7),0,0,dz-3.4*segs,glowTip,{e:1,a:{spin:2.2,bob:1.1}}));
  return e;
}
function crystalModel(e,t,v){v=v||0;const r=[],glowTip=2===e?"tibBlit":"tibGlit",glowMid=2===e?"tibB":"tibG",rk="#ab9c81",rk2="#83745f",frac=(t+1)/6,ph=1.7*v;
const boulderN=3+Math.round(7*frac);
for(let i=0;i<boulderN;i++){const ang=2.399*i+ph*.7+v,rad=12*Math.sqrt((i+.7)/boulderN),bh=(2.2+2.6*((i*53+v*17)%7)/7)*(.6+.4*frac),bw=bh*(1.25+.3*(i%3));
r.push(P_(DOME(bw,bh,8),Math.cos(ang)*rad,Math.sin(ang)*rad,0,i%3?rk:rk2,{r:1.7*ang}));
if(i%3===1&&frac>.3)r.push(P_(DOME(.42*bw,.55*bh,6),Math.cos(ang)*rad+.4*bw,Math.sin(ang)*rad+.3*bw,.75*bh,i%2?glowMid:glowTip,{r:ang,e:1}))}
const segs=3+Math.round(5*frac),augerR=1.9+2*frac,ax=-9*frac-2,ay=-2;
for(let i=0;i<segs;i++){const zz=1.6-1.2*i,rr=augerR*(1-i/segs*.7),ang=v+1.05*i;
r.push(P_(CYL(.4*rr,1,7),ax,ay,zz,rk2,{r:ang})),r.push(P_(BOXM(rr,.24*rr,.85,.12),ax,ay,zz,i%2?glowMid:rk,{r:ang}))}
r.push(P_(CONE(.6+.5*frac,.08,1.6+1.2*frac,6),ax,ay,1.6-1.2*segs,rk2));
return r}function blossomModel(e){const t=[],r=2===e?"tibBlit":"tibGlit",n=2===e?"tibB":"tibG";t.push(P_(CONE(15,11,7,9),0,0,0,"rock2")),t.push(P_(CONE(11,7,9,8),1.5,-1,7,"rock2",{r:.7})),t.push(P_(CONE(7,3,8,8),-2,2,14,"rock2",{r:1.9})),t.push(P_(CONE(4.5,1.2,7,7),.5,0,20,n)),t.push(P_(CONE(2.2,.3,5,6),.5,0,26,r,{e:1}));for(let e=0;e<5;e++){const r=1.257*e;t.push(P_(CONE(2.4,.4,7,6),8*Math.cos(r),8*Math.sin(r),8+(e%2?3:0),n,{r:r,ty:e%2?.42:-.42}))}return t.push(P_(CONE(1.4,.2,3.4,6),6,-5,15,r,{e:1})),t}function trackUnit(e,t,r,n,a,o){const s=(o=o||{}).trkW||6.8,i=r/2+.5*s-.8,l=SLAB(roundRectProfile(t,s,.49*s,4),n,1.8,"trk"+t.toFixed(1)+s.toFixed(1)+n.toFixed(1));e.push(P_(l,0,-i,0,"tread")),e.push(P_(l,0,i,0,"tread"));const c=o.wheels||6,d=.4*n;for(let r=0;r<c;r++){const o=.34*-t+r*(.68*t/(c-1)),s=0===r||r===c-1;for(const t of[-i,i])if(e.push(P_(CYL(s?1.12*d:d,5,14),o,t+2.4,.42*n,s?"steel":"gunmetal",{tx:PI2})),e.push(P_(CYL(.4*d,5.6,10),o,t+2.6,.42*n,"darkmetal",{tx:PI2})),drig(s))for(let r=0;r<8;r++){const s=.785*r+(a?.39:0);e.push(P_(BOXM(1.5,4.4,1,.25),o+Math.cos(s)*d*1.02,t+2.4,.42*n+Math.sin(s)*d*1.02,"steel",{ty:-s}))}}for(let r=0;r<3;r++){const a=.24*-t+r*(.24*t);for(const t of[-i,i])e.push(P_(CYL(.34*d,4.2,10),a,t+2.4,.86*n,"gunmetal",{tx:PI2}))}const f=Math.max(10,Math.round(t/5)),h=t/f;for(let r=0;r<f;r++){const o=-t/2+h*(r+.3+(a?.5:0));if(!(Math.abs(o)>t/2-.5*h))for(const t of[-i,i])e.push(P_(BOXM(.52*h,s+.9,1.5,.35),o,t,n-.2,"rubber")),e.push(P_(BOXM(.3*h,.34*s,.9,.2),o,t,n+1,"gunmetal")),e.push(P_(BOXM(.52*h,s+.9,1.4,.35),o,t,-.4,"rubber"))}for(const r of[-i,i])e.push(P_(BOXM(.86*t,1.1,.34*n,.3),0,r+(r<0?.46*-s:.46*s),.52*n,"armor3"))}function drig(e){return e}function wheelUnit(e,t,r,n,a){const o=r/2+1.4,rad=clamp(.34*r,.45*n,.7*n);for(let r=0;r<3;r++){const s=.32*-t+r*(.32*t);for(const t of[-o,o])e.push(P_(CYL(rad,5.4,10),s,t+2.7,rad,"rubber",{tx:PI2})),e.push(P_(CYL(.47*rad,5.8,8),s,t+2.9,rad,a&&r%2?"steel":"gunmetal",{tx:PI2}))}}
function strut3(e,x1,y1,z1,x2,y2,z2,rad,mat,segs?){
const dx=x2-x1,dy=y2-y1,dz=z2-z1,dh=Math.hypot(dx,dy),L=Math.hypot(dh,dz)||.01;
e.push(P_(CYL(rad,L,segs||8),x1,y1,z1,mat,{ty:Math.atan2(dh,dz),r:Math.atan2(dy,dx)}));
}
function legWalker(e,t,r,n,a,legCount){
legCount=legCount||6;
const perSide=legCount/2,hipZ=.82*n,spanX=.7*t,step=perSide>1?spanX/(perSide-1):0;
for(const side of[-1,1])for(let i=0;i<perSide;i++){
const hx=-spanX/2+i*step,hy=side*(.5*r-.5),
phase=(i+(side>0?0:1))%2,lift=phase===((a||0)&1)?2.4:0,
kx=hx+side*1.5,ky=side*(.5*r+4),kz=.46*hipZ+lift,
fx=hx+side*2.4,fy=side*(.5*r+6),fz=1.4+.5*lift;
e.push(P_(DOME(1.7,1.3,8),hx,hy,hipZ,"carapace2"));
strut3(e,hx,hy,hipZ,kx,ky,kz,1.15,"carapace");
strut3(e,kx,ky,kz,fx,fy,fz,.78,"dark2");
e.push(P_(DOME(1.5,.6,7),fx,fy,fz,"carapace2"));
e.push(P_(CYL(1,1.6,8),kx,ky,kz,"psi",{e:1}))
}
}
function deployedOutriggers(e,t,r,n){
const hz=.7*n;
for(const sx of[-1,1])for(const sy of[-1,1]){
const hx=sx*.36*t,hy=sy*(.5*r-1),fx=sx*.5*t,fy=sy*(.5*r+7),fz=.6;
strut3(e,hx,hy,hz,fx,fy,fz,1.3,"gunmetal");
e.push(P_(CYL(2.2,1,10),fx,fy,fz,"darkmetal"))
}
e.push(P_(CYL(.2*(t+r),1.4,16),0,0,.7,"dark"))
}
const PILLAR_H={grizzly:27,rhino:30,lasher:26};const TURRET_RISE={grizzly:15.5,rhino:17.5,lasher:14.5};
function deployedPillar(topZ,wid,fac){
const a=[],baseR=.44*wid;
a.push(P_(CYL(baseR*1.3,3,14),0,0,1.5,"dark"));
a.push(P_(CYL(baseR,topZ-6,16),0,0,3+.5*(topZ-6),"body"));
a.push(P_(CYL(baseR*.9,3.5,16),0,0,topZ-2,"trim"));
if("allied"===fac){
for(let i=0;i<4;i++){const t=i*PI2;a.push(P_(BOXM(2.4,2.4,topZ-10,.3),Math.cos(t)*baseR*.7,Math.sin(t)*baseR*.7,3+.5*(topZ-10),"armor3",{r:t}))}
a.push(P_(CYL(1.3,1.7,8),baseR*.65,0,topZ-4,"lightY",{e:1})),a.push(P_(CYL(1.3,1.7,8),baseR*-.65,0,topZ-4,"lightY",{e:1}))
}else if("soviet"===fac){
for(let i=0;i<3;i++)a.push(P_(CYL(baseR*1.1,1.2,14),0,0,7+i*(topZ-12)/3,"rust"));
boltRing(a,0,0,topZ-3,baseR*.85,10,"steel")
}else{
a.push(P_(DOME(baseR*.9,5,12),0,0,topZ-3,"carapace"));
for(let i=0;i<5;i++){const t=i/5*6.283;a.push(P_(CONE(1.3,.3,topZ*.42,6),Math.cos(t)*baseR*.72,Math.sin(t)*baseR*.72,3.5,"carapace2",{r:t,ty:.14}))}
}
return a;
}
function factionHullDetail(a,fac,e,t,s){if("soviet"===fac){a.push(P_(CYL(1.4,3.8,8),.5*-e,.16*-t,s+4.2,"rust",{ty:-PI2})),a.push(P_(CYL(1.4,3.8,8),.5*-e,.16*t,s+4.2,"rust",{ty:-PI2})),bolts(a,.42*-e,0,s+2.4,.5*t,PI2,5,"rust"),pipeRun(a,.3*-e,.5*-t,.44*-e,.16*-t,s+4.2,.5,"darkmetal"),pipeRun(a,.3*-e,.5*t,.44*-e,.16*t,s+4.2,.5,"darkmetal")}else if("allied"===fac){a.push(P_(BOXM(.36*e,.9,.5,.15),.32*-e,0,s+2.6,"tesla",{e:1})),a.push(P_(CYL(.3,6.4,6),.4*-e,.3*t,s+3.2,"darkmetal")),a.push(P_(CYL(.8,.9,8),.4*-e,.3*t,s+9.4,"tesla",{e:1})),a.push(P_(BOXM(.1*e,1,.4,.14),.42*-e,.34*-t,s+3,"tesla",{e:1})),a.push(P_(BOXM(.1*e,1,.4,.14),.42*-e,.34*t,s+3,"tesla",{e:1}))}else{a.push(P_(DOME(2.7,2.3,10),.36*-e,.34*-t,s+2.6,"carapace")),a.push(P_(DOME(2.7,2.3,10),.36*-e,.34*t,s+2.6,"carapace")),a.push(P_(CONE(1.2,.18,4.6,7),.48*-e,0,s+2.4,"psi",{e:1,ty:-.35})),a.push(P_(DOME(1.4,1.1,8),.3*-e,0,s+4,"psi",{e:1}))}}function longbowModel(t){const e=[],l=40,w=15;trackUnit(e,l,w,8,t,{wheels:6,trkW:7});const s=4.6,deck=filletPoly([[.46*l,0],[.36*l,.44*w],[-.4*l,.44*w],[-.46*l,.1*w],[-.46*l,-.1*w],[-.4*l,-.44*w],[.36*l,-.44*w]],3.2,3);e.push(P_(SLAB(deck,5,1.3,"lbdk"),0,0,s,"armor2")),e.push(P_(BOXM(10,11,6.5,1.6),.26*l,0,s+5,"armor2")),e.push(P_(BOXM(6.5,7.6,2.2,.4),.3*l,0,s+8.6,"glass",{e:1})),e.push(P_(BOXM(2,11.4,1,.2),.42*l,0,s+8,"trim")),e.push(P_(CYL(1.3,1.6,8),.46*l,.3*w,s+6,"lightY",{e:1})),e.push(P_(CYL(1.3,1.6,8),.46*l,-.3*w,s+6,"lightY",{e:1}));for(const sx of[-1,1])e.push(P_(BOXM(6,2.4,3,.5),-.32*l,sx*.34*w,s+3.5,"armor3"));return bolts(e,.06*-l,0,s+5.4,.4*w,0,4,"steel"),e.push(P_(BOXM(9.6,.6,6.9,.2),.26*l,-3.9,s+5,"trim")),e.push(P_(BOXM(9.6,.6,6.9,.2),.26*l,3.9,s+5,"trim")),bolts(e,.26*l,-3.9,s+5.2,4.4,0,4,"steel"),bolts(e,.26*l,3.9,s+5.2,4.4,0,4,"steel"),e}function longbowTurret(){const e=[],elev=.3,barrelLen=42;e.push(P_(CYL(6.2,2.4,14),0,0,0,"dark")),e.push(P_(CYL(5,3.6,12),0,0,2.4,"armor2"));for(const sx of[-1,1])e.push(P_(BOXM(3.4,2.8,8.4,.6),-1.5,sx*3.6,6.6,"gunmetal"));return e.push(P_(CYL(3.4,4.2,10),-1.5,0,6.6,"darkmetal",{ty:PI2-elev})),e.push(P_(CONE(2.7,1.6,barrelLen,10),-1.5,0,6.6,"steel",{ty:PI2-elev})),e.push(P_(CYL(3.1,2,10),-1.5,0,6.6,"steel",{ty:PI2-elev})),e.push(P_(BOXM(5.2,5.6,4.8,.7),-6.5,0,5.4,"darkmetal")),e.push(P_(BOXM(3.4,8.6,1.2,.2),-4,0,9,"trim")),e.push(P_(CYL(1.2,1.5,8),5,0,3.6,"lightY",{e:1})),boltRing(e,0,0,2.4,4.6,10,"steel"),bolts(e,-6.5,0,7.6,4.2,PI2,4,"steel"),bolts(e,-6.5,-2.6,5.4,4,0,3,"steel"),bolts(e,-6.5,2.6,5.4,4,0,3,"steel"),e}function riftModel(t,extra){const e=[],l=40,w=15,dep=!!(extra&&extra.dep);dep?deployedOutriggers(e,l,w,8):trackUnit(e,l,w,8,t,{wheels:6,trkW:7});const s=4.6,hull=hullProfile(.86*l,.92*w,"yuri");e.push(P_(SLAB(hull,5.4,2,"rfdk"),0,0,s,"dark2")),e.push(P_(DOME(6.5,5,10),.26*l,0,s+5,"carapace")),e.push(P_(DOME(2.6,2.2,8),.26*l,0,s+9,"psi",{e:1}));for(const sx of[-1,1])e.push(P_(DOME(2.6,2,8),-.16*l,sx*.36*w,s+3.4,"carapace2"));return e}function riftTurret(){const e=[],elev=.32,barrelLen=38;e.push(P_(DOME(6.4,3.2,12),0,0,0,"carapace"));for(const sx of[-1,1])e.push(P_(DOME(3.2,3,8),-1.5,sx*3.6,5,"carapace2"));return e.push(P_(CYL(3.2,3.8,10),-1.5,0,5,"dark2",{ty:PI2-elev})),e.push(P_(CONE(2.5,.8,barrelLen,10),-1.5,0,5,"crystal",{ty:PI2-elev,e:1})),e.push(P_(CYL(3,1.9,10),-1.5,0,5,"psi",{ty:PI2-elev,e:1})),e.push(P_(DOME(4.2,3.6,10),-6.5,0,4,"carapace2")),boltRing(e,0,0,2.6,5.6,10,"carapace2"),e}function boatHull(e,t,r,n){
n=n||{};
const a=[],th=n.th||6.5,org="yuri"===n.fac;
a.push(P_(SLAB(hullProfile(e,t,n.fac),th,1.8,"bh"+e.toFixed(1)+t.toFixed(1)+(n.fac||"")),0,0,0,"body"));
a.push(P_(SLAB(hullProfile(.82*e,.74*t,n.fac),1.8,1,"bd"+e.toFixed(1)+t.toFixed(1)+(n.fac||"")),0,0,th,"dark"));
if(org){
a.push(P_(DOME(.18*e,.4*t,10),.42*e,0,th,"dark"));
a.push(P_(DOME(.16*e,.34*t,10),-.3*e,0,th+2.8,"carapace2"));
a.push(P_(DOME(.09*e,.22*t,8),-.3*e,0,th+4.6,"carapace"));
a.push(P_(CONE(1.4,.3,3.6,7),-.32*e,0,th+6.2,"psi",{e:1}));
}else{
a.push(P_(WEDGE(.2*e,.46*t,2.6,1),.42*e,0,th,"trim"));
a.push(P_(BOXM(.2*e,.44*t,3.6,.6),-.3*e,0,th+1.8,"armor2"));
a.push(P_(BOXM(.12*e,.3*t,1.3,.3),-.3*e,0,th+3.6,"armor3"));
a.push(P_(CYL(.35,4.6,6),-.32*e,0,th+4.4,"gunmetal"));
}
a.push(P_(CYL(.18*t,1.4,12),.16*e,0,th+1,org?"carapace2":"trim"));
a.push(P_(BOXM(.14*e,.1*t,.75,.25),.24*e,0,th+1.7,"gunmetal"));
a.push(P_(CYL(.5,.7,8),-.46*e,-.28*t,th+1.7,"lightY",{e:1}));
a.push(P_(CYL(.5,.7,8),-.46*e,.28*t,th+1.7,"lightY",{e:1}));
if(n.twin){
a.push(P_(CYL(.16*t,1.3,12),-.14*e,0,th+2,org?"carapace2":"trim"));
a.push(P_(BOXM(.12*e,.09*t,.7,.25),-.22*e,0,th+2.6,"gunmetal"));
}
return a;
}
function transportHeli(t,fac){
const e=[],org="yuri"===fac;
e.push(P_(org?DOME(13,7,12):BOXM(26,10,9,3),2,0,10,"body"));
e.push(P_(org?DOME(6,4.5,10):DOME(6,5,10),15,0,11,org?"carapace":"glass"));
e.push(P_(BOXM(18,3,3,1),-20,0,11,org?"carapace2":"dark2"));
e.push(P_(BOXM(2,10,6,1),-28,0,11,org?"carapace2":"dark"));
const tandem="allied"===fac;
e.push(P_(CYL(.8,6,8),2,0,16,org?"psi":"gunmetal",{e:org}));
e.push(P_(CYL(tandem?.8:1.2,tandem?6:5,8),-28,0,tandem?16:13,org?"psi":"gunmetal",tandem?{e:org}:{ty:-PI2,e:org}));
for(const s of[-1,1])e.push(P_(CYL(.6,3.5,6),4,6*s,4,org?"carapace2":"gunmetal"));
return e;
}
function heliRotor(){const n=[];return n.push(P_(BOXM(24,1.6,.6,.3),0,0,0,"darkmetal")),n}
function heliTailRotor(){const n=[];return n.push(P_(BOXM(9,1.2,.5,.3),0,0,0,"darkmetal")),n}
function subHull(e,t,r,n){
n=n||{};
const a=[],rad=.42*t,org="yuri"===n.fac;
a.push(P_(CYL(rad,.86*e,12),0,0,rad,"body",{ty:-PI2}));
a.push(P_(CONE(rad,.25*rad,.2*e,10),.5*.86*e+.1*e,0,rad,org?"carapace2":"dark",{ty:-PI2}));
a.push(P_(CONE(rad,.15*rad,.16*e,10),-.5*.86*e-.08*e,0,rad,org?"carapace2":"dark",{ty:PI2}));
a.push(P_(org?DOME(.16*e,.5*rad,10):BOXM(.14*e,.22*t,1.3*rad,.4),.04*e,0,rad+.9*rad,org?"carapace":"armor2"));
a.push(P_(CYL(1.1,.7*rad,6),.04*e,0,rad+1.6*rad,org?"psi":"gunmetal",{e:org}));
a.push(P_(BOXM(.05*e,.5*t,.35,.15),-.44*e,0,rad,"dark"));
a.push(P_(BOXM(.09*e,.35,.32*t,.15),-.4*e,.22*t,rad,"dark"));
a.push(P_(BOXM(.09*e,.35,.32*t,.15),-.4*e,-.22*t,rad,"dark"));
return a;
}
function tankHull(e,t,r,n?){
const a=[],o=(n=n||{}).th||8.5;
n.deployed?deployedOutriggers(a,e,t,o):"yuri"===n.fac?legWalker(a,e,t,o,r,n.legs||6):n.wheeled?wheelUnit(a,e,t,o,r):trackUnit(a,e,t,o,r,n);
const s=.52*o,org="yuri"===n.fac;
const i=SLAB(hullProfile(.94*e,t+1.5,n.fac),6.5,1.8,"hl"+e.toFixed(1)+t.toFixed(1)+(n.fac||""));
a.push(P_(i,0,0,s,"body"));
if(org){
a.push(P_(DOME(.22*e,.42*t,10),.32*e,0,s+4.8,"dark"));
a.push(P_(CONE(.15*t,.04*t,3,8),.42*e,0,s+6.6,"carapace2",{e:1}));
}else{
a.push(P_(WEDGE(.24*e,.8*t,5.4,1.8),.36*e,0,s+5.6,"dark"));
a.push(P_(BOXM(.1*e,.62*t,3,.9),.46*e,0,s+5,"gunmetal"));
}
const l=SLAB(hullProfile(.64*e,.86*t,n.fac),5.6,2,"dk"+e.toFixed(1)+t.toFixed(1)+(n.fac||""));
a.push(P_(l,.04*-e,0,s+6.5,"trim"));
a.push(P_(CYL(.56*t,1.7,16),0,0,s+6.5,"dark2"));
if(org){
a.push(P_(DOME(.5*t,.62*t,16),0,0,s+7.9,"trim"));
a.push(P_(DOME(.3*t,.32*t,10),0,0,s+7.6,"carapace"));
}else{
a.push(P_(CYL(.5*t,.7,16),0,0,s+8.1,"trim"));
boltRing(a,0,0,s+7.9,.53*t,10,"darkmetal");
bolts(a,.3*e,-.34*t,s+5.9,.16*t,1.1,3,"steel");
bolts(a,.3*e,.34*t,s+5.9,.16*t,-1.1,3,"steel");
}
a.push(P_(BOXM(.16*e,.6*t,1.6,.6),.42*-e,0,s+2,"armor3"));
if(org){
const c=DOME(.46*t,.34*t,12);
a.push(P_(c,0,-(.5*t+1.6),s+3.4,"dark"));
a.push(P_(c,0,.5*t+1.6,s+3.4,"dark"));
}else{
const c=SLAB(roundRectProfile(.92*e,.5*t,2.2,2),1.4,.5,"fd"+e.toFixed(1)+t.toFixed(1));
a.push(P_(c,0,-(.5*t+2.4),s+5.4,"dark"));
a.push(P_(c,0,.5*t+2.4,s+5.4,"dark"));
}
a.push(P_(CYL(1.5,1.8,8),.44*e,.26*-t,s+7.4,"lightY",{e:1}));
a.push(P_(CYL(1.5,1.8,8),.44*e,.26*t,s+7.4,"lightY",{e:1}));
if(org){
a.push(P_(DOME(2.2,1.7,10),.48*-e,.34*-t,s+3.4,"carapace2"));
a.push(P_(DOME(2.2,1.7,10),.48*-e,.34*t,s+3.4,"carapace2"));
a.push(P_(CONE(1.1,.25,3.2,7),.5*-e,.36*-t,s+4.6,"psi",{e:1}));
a.push(P_(CONE(1.1,.25,3.2,7),.5*-e,.36*t,s+4.6,"psi",{e:1}));
}else{
a.push(P_(BOXM(3.6,2.6,1.8,.6),.48*-e,.34*-t,s+3,"darkmetal"));
a.push(P_(BOXM(3.6,2.6,1.8,.6),.48*-e,.34*t,s+3,"darkmetal"));
a.push(P_(CYL(1.4,4.6,8),.48*-e,.36*-t,s+4,"rust",{ty:-PI2}));
a.push(P_(CYL(1.4,4.6,8),.48*-e,.36*t,s+4,"rust",{ty:-PI2}));
a.push(P_(CYL(1,1.5,8),.53*-e,.36*-t,s+4,"glow",{ty:-PI2,e:1}));
a.push(P_(CYL(1,1.5,8),.53*-e,.36*t,s+4,"glow",{ty:-PI2,e:1}));
}
n.skirt&&(a.push(P_(BOXM(.82*e,1.8,7,.6),0,-(.5*t+4.6),s+1,"dark")),a.push(P_(BOXM(.82*e,1.8,7,.6),0,.5*t+4.6,s+1,"dark")));
if(org){
seams(a,.4*e,.48*t,s+5.4,"dark2");
}else{
bolts(a,.06*-e,0,s+6.7,.42*t,0,5,"steel");
seams(a,.42*e,.5*t,s+6.7,"dark");
pipeRun(a,.02*e,.4*t,.34*-e,.4*t,s+6.5,.45,"rust");
}
factionHullDetail(a,n.fac,e,t,s);
return a;
}function turretProfile(e,t,fac){const r=e/2,n=t/2;if("yuri"===fac){const p=[],segs=7;for(let i=0;i<segs;i++){const ang=i/segs*6.283+.15;p.push([Math.cos(ang)*r,Math.sin(ang)*n])}return p}if("allied"===fac){const p=[],segs=18;for(let i=0;i<segs;i++){const ang=i/segs*6.283;p.push([Math.cos(ang)*r*.96,Math.sin(ang)*n*.96])}return p}if("soviet"===fac)return roundRectProfile(.92*e,.86*t,.055*Math.min(e,t),1);return hexProfile(e,t)}function tankTurret(e,t,r,n){n=n||{};const a=[];a.push(P_(CYL(.95*t,2.4,12),0,0,e-2.2,"dark")),a.push(P_(SLAB(turretProfile(2.1*t,1.75*t,n.fac),6.2,2,"tt"+t.toFixed(1)+(n.fac||"")),.08*-t,0,e,"body")),a.push(P_(WEDGE(.7*t,1.45*t,5.4,2.4),.85*t,0,e,"dark")),a.push(P_(BOXM(3.6,1.15*t,5,1.1),1.15*t,0,e+1.4,"gunmetal"));const o=e+3.6;if(n.twin)for(const e of[-3,3])a.push(P_(CYL(1.5,r,9),1.25*t,e,o,"gunmetal",{ty:PI2})),a.push(P_(CYL(2.1,4,9),1.25*t+r-4,e,o,"steel",{ty:PI2}));else if(n.gat){a.push(P_(CYL(3.4,4.4,10),1.2*t,0,o,"steel",{ty:PI2}));for(let e=0;e<6;e++){const s=e*Math.PI/3+(n.f?.5:0);a.push(P_(CYL(.85,r,6),1.3*t,2.3*Math.cos(s),o+2.3*Math.sin(s),"gunmetal",{ty:PI2}))}}else if(n.beam)a.push(P_(CONE(3.6,2.2,6,8),.9*t,0,o-2.4,"crystal",{ty:PI2})),a.push(P_(CYL(1.9,r,8),1.3*t,0,o,"crystal",{ty:PI2,e:1}));else if(n.pods)for(const e of[-3.4,3.4])a.push(P_(BOXM(9,3.8,3.4,1),.5*t,e,o-.6,"steel")),a.push(P_(CONE(1.5,.4,2.4,7),.5*t+4.6,e,o+.4,"red",{ty:PI2}));else if(n.dome){a.push(P_(DOME(1.15*t,.95*t,12),0,0,e+6,"psi")),a.push(P_(DOME(.5*t,.5*t,10),0,0,e+6+.9*t,"glass",{e:1}));for(let r=0;r<4;r++){const n=r*PI2+.78;a.push(P_(CYL(.7,6.5,6),Math.cos(n)*t*.9,Math.sin(n)*t*.9,e+6.2,"crystal",{e:1}))}}else a.push(P_(CYL(1.75,r,10),1.25*t,0,o,"gunmetal",{ty:PI2})),a.push(P_(CYL(2.4,4.6,10),1.25*t+r-4.6,0,o,"steel",{ty:PI2})),a.push(P_(CYL(2.9,2.6,10),1.25*t+r-1.4,0,o,"darkmetal",{ty:PI2})),a.push(P_(BOXM(2.6,7,7,.4),1.25*t+r-.5,0,o,"gunmetal")),a.push(P_(BOXM(2.6,7,7,.4),1.25*t+r-3.4,0,o,"gunmetal"));return n.dome||(a.push(P_(CYL(2.9,2.6,10),.42*-t,0,e+6.2,"body")),a.push(P_(DOME(2.9,1.5,10),.42*-t,0,e+8.8,"trim")),a.push(P_(CYL(.6,5.2,6),.42*-t,.75*t,e+7,"gunmetal",{ty:PI2}))),a.push(P_(BOXM(.55*t,1.35*t,3.6,.9),1.2*-t,0,e+1.2,"armor3")),a.push(P_(CYL(.45,8.5,5),1.15*-t,.5*-t,e+5.5,"gunmetal")),a.push(P_(CYL(.22,16,5),1.1*-t,.62*t,e+5.5,"darkmetal",{tx:.12})),a.push(P_(BOXM(1.6,1.6,.6,.2),.15*-t,.7*t,e+2.4,"darkmetal")),seams(a,.8*t,.7*t,e+.2,"dark"),a}function harvesterSoviet(e){const t=[],r=46,n=22;trackUnit(t,r,n,11,e,{trkW:9,wheels:6});t.push(P_(SLAB(hullProfile(42,25,"soviet"),7.5,2,"hvS1"),0,0,5.5,"armor2"));t.push(P_(TSLAB(roundRectProfile(22,27,4,3),14,.86,"hopS"),-7,0,13,"armor3"));t.push(P_(BOXM(20,1.6,11.6,.5),-7,-13.8,14,"armor"));t.push(P_(BOXM(20,1.6,11.6,.5),-7,13.8,14,"armor"));for(let i=0;i<4;i++){const yy=-17+i*7.4;t.push(P_(BOXM(1.2,26.4,1.2,.2),yy,0,14,"rust"))}t.push(P_(BOXM(12,1.4,2,.4),-7,-14.5,24,"steel"));t.push(P_(BOXM(12,1.4,2,.4),-7,14.5,24,"steel"));t.push(P_(BOXM(2.4,26.8,14.4,.6),-18.6,0,13,"armor3"));if(2&e){const c=4&e?"tibB":"tibG",g=4&e?"tibBlit":"tibGlit";t.push(P_(SLAB(roundRectProfile(19.2,24.6,3,2),3.8,1,"ldS"),-7,0,25,c)),t.push(P_(CONE(5.6,1.2,6,8),-4,0,28.4,c)),t.push(P_(CONE(3.4,.7,4.2,7),-11,3.4,28.4,g,{e:1})),t.push(P_(CONE(3,.6,3.8,7),-10,-4,28.4,g,{e:1}))}t.push(P_(SLAB(roundRectProfile(11,19,1.6,2),12,1.4,"cabS"),12,0,13,"concrete2"));t.push(P_(BOXM(9.4,17,3.8,.4),12,0,22,"armor"));t.push(P_(BOXM(1.4,15.4,4.6,.4),16.6,0,17,"glassdark"));pipeRun(t,-2,-13.4,10,-13.4,17.6,.6,"rust");pipeRun(t,-2,13.4,10,13.4,17.6,.6,"rust");t.push(P_(CYL(1.4,2,8),10,.42*-n,26,"lightY",{e:1}));t.push(P_(CYL(1.4,2,8),10,.42*n,26,"lightY",{e:1}));t.push(P_(CYL(7.6,29,16),22.4,14.5,7.4,"gunmetal",{tx:PI2}));t.push(P_(CYL(8,2.2,16),22.4,-14.5,7.4,"darkmetal",{tx:PI2}));t.push(P_(CYL(8,2.2,16),22.4,14.5,7.4,"darkmetal",{tx:PI2}));for(let i=0;i<10;i++){const yy=-13+2.9*i;for(const ang of[0,1.57,3.14,4.71])t.push(P_(BOXM(1.6,1.6,4.6,.2),22.4+Math.cos(ang)*7.6,yy,7.4+Math.sin(ang)*7.6,"rust",{ty:ang}))}for(let k=0;k<8;k++){const ang=.393+k*.785;t.push(P_(CYL(.5,29,6),22.4+Math.cos(ang)*7.7,14.5,7.4+Math.sin(ang)*7.7,"darkmetal",{tx:PI2}))}t.push(P_(BOXM(10,3.2,3.2,1),.36*r,-13.6,8.4,"steel"));t.push(P_(BOXM(10,3.2,3.2,1),.36*r,13.6,8.4,"steel"));for(const s of[-8.2,8.2]){t.push(P_(CYL(1.8,11,8),-17,s,25,"darkmetal")),t.push(P_(CYL(2.1,2.6,8),-17,s,36,"rust")),t.push(P_(CYL(1.4,3,6),-17,s,38.6,"black"))}bolts(t,-7,-12.9,11,20,0,7,"steel");bolts(t,-7,12.9,11,20,0,7,"steel");seams(t,18,22,12,"dark");t.push(P_(BOXM(2.2,1.6,.9,.25),-15.8,-6.6,14.6,"darkmetal"));t.push(P_(BOXM(2.2,1.6,.9,.25),-15.8,6.6,14.6,"darkmetal"));return t}function harvesterAllied(e){const t=[],r=42,n=17;trackUnit(t,r,n,8.5,e,{trkW:6.6,wheels:6});t.push(P_(SLAB(hullProfile(38,19,"allied"),6.4,2.4,"hvA1"),0,0,5,"armor2"));t.push(P_(TSLAB(roundRectProfile(17,20,5,4),10,.9,"hopA"),-8,0,11.4,"armor2"));t.push(P_(BOXM(15,1.2,8.6,.4),-8,-10.2,12,"armor"));t.push(P_(BOXM(15,1.2,8.6,.4),-8,10.2,12,"armor"));t.push(P_(DOME(8.6,6,16),-8,0,20.4,"glass",{e:1}));t.push(P_(CYL(8.6,1.2,16),-8,0,20.4,"armor3"));t.push(P_(BOXM(9.6,1,.6,.15),-8,-8.4,20,"tesla",{e:1}));t.push(P_(BOXM(9.6,1,.6,.15),-8,8.4,20,"tesla",{e:1}));if(2&e){const c=4&e?"tibB":"tibG",g=4&e?"tibBlit":"tibGlit";t.push(P_(CONE(4.4,.9,5,10),-8,0,21.2,c)),t.push(P_(CONE(2.4,.4,3.2,7),-11,2.6,21.2,g,{e:1})),t.push(P_(CONE(2.2,.4,3,7),-5.4,-2.6,21.2,g,{e:1}))}t.push(P_(DOME(5.6,5,16),12,0,13.4,"glass",{e:1}));t.push(P_(CYL(5.6,1.3,16),12,0,13.4,"darkmetal"));t.push(P_(BOXM(30,1,.6,.2),0,-9.4,11.6,"tesla",{e:1}));t.push(P_(BOXM(30,1,.6,.2),0,9.4,11.6,"tesla",{e:1}));t.push(P_(CYL(1.2,1.6,8),9,.42*-n,13,"lightY",{e:1}));t.push(P_(CYL(1.2,1.6,8),9,.42*n,13,"lightY",{e:1}));for(const s of[-6.4,6.4])t.push(P_(CYL(3.1,15,10),19.4,s,7,"steel",{ty:PI2}));t.push(P_(CYL(1,15,10),19.4,0,10,"gunmetal",{ty:PI2}));t.push(P_(SLAB(roundRectProfile(9,15,3,3),2,.9,"scoopA"),22,0,4,"armor3"));t.push(P_(CYL(.4,8,6),-15,7,20.4,"darkmetal"));t.push(P_(CYL(1,1.2,10),-15,7,28.4,"tesla",{e:1}));bolts(t,-8,-9.6,11,15,0,3,"steel");bolts(t,-8,9.6,11,15,0,3,"steel");seams(t,15,17,10.6,"armor3");return t}function harvesterYuri(e){const t=[],r=40,n=20;legWalker(t,r,n,9.5,e,8);t.push(P_(SLAB(hullProfile(36,23,"yuri"),7,2.2,"hvY1"),1,0,5.2,"dark2"));t.push(P_(DOME(11,8,14),-8,2,13,"carapace"));t.push(P_(DOME(8,6.4,12),-9,-6,11.6,"dark2"));t.push(P_(DOME(6,5,10),-16,1,10.4,"carapace2"));for(let i=0;i<5;i++){const a=.55*i-1.1;t.push(P_(CONE(1,.15,3.4,6),-8+7*Math.cos(a),2+7*Math.sin(a),16.4,"psi",{e:1,r:a}))}if(2&e){const c=4&e?"tibB":"tibG",g=4&e?"tibBlit":"tibGlit";t.push(P_(CONE(4.6,.9,6,9),-8,2,17,c)),t.push(P_(CONE(2.6,.5,3.6,7),-12,5.4,20,g,{e:1})),t.push(P_(CONE(2.4,.4,3.2,7),-5,-1.4,20,g,{e:1}))}t.push(P_(DOME(6,5.4,14),11,-1,12.6,"carapace"));t.push(P_(DOME(2.4,2,10),13.6,-1,17,"psi",{e:1}));t.push(P_(CYL(1.1,1.6,8),9,-9,13,"lightY",{e:1}));t.push(P_(CYL(1.1,1.6,8),9,9.6,13,"lightY",{e:1}));const segs=[[15,7,3.8,2.6],[19.5,5.6,2.6,1.7],[23.5,4.4,1.7,.9]];for(const p of segs)t.push(P_(CONE(p[2],p[3],5,9),p[0],1.2,p[1],"dark2",{ty:PI2}));t.push(P_(DOME(1.6,1.4,10),27,1.2,3.6,"carapace",{ty:PI2}));t.push(P_(CYL(.4,4,6),27.2,1.2,3.6,"psi",{e:1,ty:PI2}));t.push(P_(CONE(2.4,3.4,5,10),-17.6,1,9,"dark2",{ty:-PI2}));for(let i=0;i<3;i++){const yy=-6+i*6;t.push(P_(DOME(1.4,1.1,8),-3+1.4*(i%2),yy,9.4,"psi",{e:1}))}seams(t,10,9,12,"black");return t}function harvesterModel(e,fac){return"soviet"===fac?harvesterSoviet(e):"yuri"===fac?harvesterYuri(e):harvesterAllied(e)}
function harvesterAugerModel(){
  const e=[],segs=4,augerR=3.4,topZ=15;
  e.push(P_(CYL(2,1.3,10),0,0,topZ,"darkmetal"));
  for(let i=0;i<segs;i++){
    const zz=topZ-1.8-3.2*i,rr=augerR*(1-i/segs*.55);
    e.push(P_(CYL(.42*rr,2.6,7),0,0,zz,"gunmetal"));
    e.push(P_(BOXM(rr,.24*rr,2.4,.14),0,0,zz,i%2?"tibG":"rust"));
  }
  e.push(P_(CONE(.85,.14,2,7),0,0,topZ-1.8-3.2*segs,"tibGlit",{e:1}));
  return e;
}const MINE_TOOL={drone:[()=>droneLaserModel(),5.5],miner_allied:[()=>harvesterDrumModel(),20]},MINE_DEFAULT=[()=>harvesterAugerModel(),22];
function harvesterDrumModel(){
const e=[],topZ=6,drumR=3.1,drumH=6.6;
e.push(P_(CYL(drumR,drumH,14),0,0,topZ,"steel"));
e.push(P_(CYL(drumR*.4,drumH+1.6,8),0,0,topZ,"gunmetal"));
for(let i=0;i<8;i++){
const a=i/8*6.283;
e.push(P_(BOXM(.55,drumH*.82,.4,.14),drumR*Math.cos(a),drumR*Math.sin(a),topZ,"darkmetal",{r:a}));
}
e.push(P_(CYL(drumR*.55,.8,14),0,0,topZ+drumH/2+.4,"trim"));
e.push(P_(CYL(drumR*.55,.8,14),0,0,topZ-drumH/2-.4,"trim"));
return e;
}
function droneLaserModel(){
const t=[],topZ=2.6;
t.push(P_(DOME(1.2,.9,8),0,0,topZ,"carapace2"));
t.push(P_(CYL(.4,.7,8),0,0,topZ+.9,"dark2"));
for(let i=0;i<2;i++){
const a=i?3.14159:0;
t.push(P_(CYL(.16,2.4,6),1.05*Math.cos(a),1.05*Math.sin(a),topZ+.4,"psi",{e:1,r:a,ty:1.5708}));
t.push(P_(CONE(.24,.05,1,6),2.3*Math.cos(a),2.3*Math.sin(a),topZ+.15,"psi",{e:1,r:a,ty:1.5708}));
}
return t;
}
function droneModel(e){const t=[];t.push(P_(DOME(3.4,2.6,10),0,0,3.4,"carapace2")),t.push(P_(DOME(1.8,1.4,8),0,0,5.6,"carapace")),t.push(P_(DOME(.9,.7,8),0,0,6.9,"psi",{e:1}));for(let i=0;i<4;i++){const a=i*PI2+.6;t.push(P_(CYL(.35,3.6,6),3.1*Math.cos(a),3.1*Math.sin(a),2.4,"carapace2",{r:a,ty:.6})),t.push(P_(DOME(.5,.4,6),4.8*Math.cos(a),4.8*Math.sin(a),.6,"carapace",{e:0}))}return t}function bastionModel(e){const t=[],r=40,n=16;trackUnit(t,r,n,9,e,{trkW:8,wheels:6});t.push(P_(SLAB(hullProfile(.9*r,n+2),6.5,1.8,"bstH"),0,0,5,"armor2")),t.push(P_(BOXM(1.3*r,10,7,.2),0,0,11,"armor3")),t.push(P_(CYL(3,10,10),-14,0,13,"gunmetal",{ty:PI2})),t.push(P_(CYL(3,10,10),14,0,13,"gunmetal",{ty:PI2})),t.push(P_(CYL(4,6,10),0,0,14,"armor"));return t}function mcvModel(e){const t=[],r=40,n=20;trackUnit(t,r,n,10,e,{trkW:8,wheels:6});t.push(P_(SLAB(hullProfile(36,24),7,2,"mcvH"),0,0,5.5,"armor2"));t.push(P_(BOXM(22,20,7,.6),-4,0,12.5,"armor"));t.push(P_(BOXM(17,15,4.4,.5),-4,0,19.5,"armor3"));t.push(P_(BOXM(11,10,3,.4),-4,0,23.7,"concrete2"));for(let i=0;i<3;i++){const x=-10+8*i;t.push(P_(BOXM(1,19.4,1,.15),x,0,12.9,"darkmetal"))}seams(t,10,9,20,"dark");bolts(t,-4,-9.6,13,20,0,6,"steel");bolts(t,-4,9.6,13,20,0,6,"steel");t.push(P_(BOXM(2,2,14,.3),13,7,10,"gunmetal",{ty:1.1}));t.push(P_(BOXM(1.8,1.8,1.8,.3),18.9,7,21.6,"darkmetal"));t.push(P_(CYL(1.4,4,10),13,-7,13,"darkmetal"));t.push(P_(CYL(1.6,1,10),13,-7,17,"gold"));hazard(t,-4,-11.4,4,20,0);t.push(P_(CYL(1.2,1.6,8),14,-8.5,6,"lightY",{e:1}));t.push(P_(CYL(1.2,1.6,8),14,8.5,6,"lightY",{e:1}));t.push(P_(CYL(.4,9,6),0,0,23.7,"darkmetal"));t.push(P_(CYL(1,1.2,10),0,0,32.7,"red",{e:1,a:{spin:1}}));return t}function weaponRig(e,t,r,n,a){const o=7.4+r,s=-2.1;return"none"===t?(e.push(P_(BOXM(3.2,2,2.4,.6),2,s,5.6+r,"gold")),void e.push(P_(CYL(.4,2.2,6),2,s,8+r,"darkmetal"))):"launcher"===t?(e.push(P_(CYL(1.05,8.4,9),.4,s,o+1.5,"gunmetal",{ty:PI2})),e.push(P_(CYL(1.35,1.6,9),8.2,s,o+1.5,"darkmetal",{ty:PI2})),void e.push(P_(BOXM(1.6,1.1,1.2,.3),3,s-.8,o+2.9,"steel"))):"rocket"===t?(e.push(P_(CYL(1.15,9.4,9),1.8,s-.2,o+5.4,"gunmetal",{ty:PI2})),e.push(P_(CYL(1.5,1.7,9),10.2,s-.2,o+5.4,"darkmetal",{ty:PI2})),e.push(P_(CYL(1,1.1,8),-5.2,s-.2,o+5.4,"steel",{ty:PI2})),void e.push(P_(BOXM(1.8,1.6,1.3,.3),-1,s+.7,o+3.6,"steel"))):"long"===t?(e.push(P_(CYL(.42,8,7),1.4,s,o,"gunmetal",{ty:PI2})),e.push(P_(BOXM(2.4,1.2,1.4,.35),.1,s,o-.3,"wood")),e.push(P_(CYL(.34,2.2,6),3.2,s,o+1.1,"darkmetal",{ty:PI2})),void e.push(P_(BOXM(.9,.9,1.5,.25),2.4,s,o-1.2,"darkmetal"))):"flamer"===t?(e.push(P_(CYL(.52,5.2,7),1.5,s,o,"gunmetal",{ty:PI2})),e.push(P_(CONE(.95,.45,1.6,7),6.5,s,o,"rust",{ty:PI2})),void e.push(P_(CYL(.3,3,5),.4,s-1,o-1.2,"darkmetal"))):(e.push(P_(CYL(.38,5.8,7),1.5,s,o,"gunmetal",{ty:PI2})),e.push(P_(BOXM(2.2,1.2,1.4,.35),.5,s,o-.4,"dark2")),e.push(P_(BOXM(.85,.85,1.6,.25),2.3,s,o-1.3,"darkmetal")),void e.push(P_(BOXM(1.2,.9,.7,.25),.8,s,o+1,"darkmetal")))}function infantry(e,t){const r=1.26,n=[],a=(t=t||{}).cloth||"body",o=t.gear||"dark",s=[0,1,0,-1][3&e],i=1&e?.34:0,l=.55*s;return n.push(P_(BOXM(3.2,2.9,1.3,.6),1.6*s,-2,0,"dark2")),n.push(P_(BOXM(3.2,2.9,1.3,.6),-1.6*s,2,0,"dark2")),n.push(P_(CYL(1.35,.7,7),1.2*s,-2,1.3,"dark2")),n.push(P_(CYL(1.35,.7,7),-1.2*s,2,1.3,"dark2")),n.push(P_(CYL(1.3,3.6,7),1.2*s,-2,1.5,o)),n.push(P_(CYL(1.3,3.6,7),-1.2*s,2,1.5,o)),n.push(P_(CYL(1.42,.6,7),.8*s,-2,4.5,o)),n.push(P_(CYL(1.42,.6,7),-.8*s,2,4.5,o)),n.push(P_(CYL(1.55,2.4,7),.8*s,-2,4.7,a)),n.push(P_(CYL(1.55,2.4,7),-.8*s,2,4.7,a)),n.push(P_(BOXM(4.6,5.6,1.8,1),0,0,6.5+i,a)),n.push(P_(TSLAB(roundRectProfile(5,5.6,1.8,2),4.8,.9,"inftor"),0,0,6.8+i,a)),n.push(P_(BOXM(3.9,5.9,2.1,.5),.3,0,8.2+i,o)),n.push(P_(BOXM(.6,3,1,.18),2.1,0,8.6+i,"trim")),n.push(P_(BOXM(2.9,3,1.9,.6),-.3,-3.3,11+i,o,{r:-.18*s})),n.push(P_(BOXM(2.9,3,1.9,.6),-.3,3.3,11+i,o,{r:.18*s})),n.push(P_(DOME(1.15,1.1,8),1-l,-2.8,8+i,a)),n.push(P_(DOME(1.15,1.1,8),1+l,2.8,8+i,a)),n.push(P_(BOXM(2.9,4.8,4.2,1),-2.5,0,8.2+i,t.pack||o)),t.tank&&(n.push(P_(CYL(1.15,5,8),-2.6,-1.7,8.8+i,t.tank)),n.push(P_(CYL(1.15,5,8),-2.6,1.7,8.8+i,t.tank)),n.push(P_(DOME(1.15,.9,8),-2.6,-1.7,13.8+i,"steel")),n.push(P_(DOME(1.15,.9,8),-2.6,1.7,13.8+i,"steel"))),n.push(P_(CYL(1.05,3.9,7),1-l,-2.8,8.1+i,a)),n.push(P_(CYL(1.05,3.9,7),1+l,2.8,8.1+i,a)),n.push(P_(CYL(.9,1.6,6),1.6-l,-2.6,6.8+i,"skin")),n.push(P_(CYL(.9,1.6,6),1.6+l,2.6,6.8+i,"skin")),n.push(P_(CYL(1.3,1.8,8),0,0,12+i,"skin")),n.push(P_(DOME(2.35,2.15,11),-.1,0,14.6+i,t.helmet||"armor3")),n.push(P_(CYL(2.4,1.3,11),-.1,0,13.6+i,t.helmet||"armor3")),n.push(P_(BOXM(1.2,3.2,1.1,.3),1.4,0,14.4+i,t.visor||"glass",{e:1})),t.beret&&n.push(P_(CYL(2.45,.9,11),.2,0,15.6+i,t.beret)),t.hood&&n.push(P_(CONE(2.9,1,4.8,9),-.2,0,14.4+i,t.hood)),n.push(P_(BOXM(1.1,1.3,1.5,.3),.9,-1.5,9+i,"dark2")),n.push(P_(BOXM(1.1,1.3,1.5,.3),.9,1.5,9+i,"dark2")),n.push(P_(CYL(.3,4.2,6),-1.7,-.4,13.9+i,"darkmetal",{tx:-.3})),weaponRig(n,t.weapon||"rifle",i,s,a),n.map(e=>Object.assign({},e,{x:e.x*r,y:e.y*r,z:e.z*r,sx:(e.sx||1)*r,sy:(e.sy||1)*r,sz:(e.sz||1)*r}))}function jet(e,t,r,fac){const n=[],fr="soviet"===fac?1.5:3.1,fs="soviet"===fac?2:4;n.push(P_(TSLAB(roundRectProfile(1.05*e,6,fr,fs),4.6,.55,"fus"+e+fac),0,0,-2.3,"body")),n.push(P_(CONE(2.9,.5,.24*e,9),.4*e,0,0,"dark",{ty:PI2})),n.push(P_(DOME(2.7,2.4,11),.16*e,0,1.9,"glass",{e:1})),n.push(P_(SLAB(filletPoly([[.18*e,0],[.02*e,.72*t],[.14*-e,.62*t],[.1*-e,0],[.14*-e,.62*-t],[.02*e,.72*-t]],.05*Math.min(e,t),2),2,.6,"wg"+e+t),.02*-e,0,0,"body")),n.push(P_(BOXM(.1*e,1.3*t,1,.3),.24*-e,0,.3,"dark")),n.push(P_(BOXM(.18*e,.5*t,1.7,.5),.4*-e,0,.4,"body"));for(const a of[-1,1])n.push(P_(WEDGE(.15*e,1.7,5.6,1.7),.4*-e,a*.18*t,1.5,"dark",{r:a*.16})),n.push(P_(BOXM(.2*e,.7,1.5,.22),.15*e,a*.18*t,1.8,"trim"));for(const a of[.26*-t,.26*t])n.push(P_(CYL(2.3,.36*e,10),.3*-e,a,-1.5,"steel",{ty:-PI2})),n.push(P_(CYL(1.7,1.8,8),.47*-e,a,-1.5,r?"glow":"rust",{ty:-PI2,e:r?1:0}));for(const r of[.4*-t,.4*t])n.push(P_(CYL(1.2,.34*e,8),.1*-e,r,-3.6,"white",{ty:PI2})),n.push(P_(CONE(1.3,.4,2.4,7),.25*e,r,-3.6,"red",{ty:PI2}));if("soviet"===fac)for(const r of[.5*-t,.5*t])n.push(P_(CYL(.85,3.6,8),.06*-e,r,-1.5,"rust",{ty:-PI2})),n.push(P_(CYL(.55,.7,7),.24*-e,r,-1.5,"black",{ty:-PI2}));else if("allied"===fac)for(const r of[.48*-t,.48*t])n.push(P_(CYL(.6,2.6,8),.1*-e,r,.3,"tesla",{e:1,ty:-PI2}));return n}function locustModel(t){const n=[],wa=13,wb=10,wc=8,wd=6.5,pulse=t?1.08:1;n.push(P_(DOME(.5,1,7),-11,0,0,"psi",{e:1})),n.push(P_(CONE(.35,2.6,6.5,10),-10.5,0,.2,"carapace2",{ty:PI2})),n.push(P_(CYL(2.6,5,10),-4,0,.2,"carapace2",{ty:PI2})),n.push(P_(CONE(2.6,1.3,4,10),1,0,.2,"carapace2",{ty:PI2})),n.push(P_(DOME(1.4,1.3,9),5.3,0,.3,"carapace")),n.push(P_(BOXM(.28,1.8,.5,.1),5.8,0,.6,"psi",{e:1})),n.push(P_(SLAB(filletPoly([[.18*wa,0],[.02*wa,.72*wb],[.14*-wa,.62*wb],[.1*-wa,0],[.14*-wa,.62*-wb],[.02*wa,.72*-wb]],.05*Math.min(wa,wb),2),1.2,.45,"locwgA"),-1,0,3,"glass",{sy:pulse})),n.push(P_(SLAB(filletPoly([[.18*wc,0],[.02*wc,.72*wd],[.14*-wc,.62*wd],[.1*-wc,0],[.14*-wc,.62*-wd],[.02*wc,.72*-wd]],.05*Math.min(wc,wd),2),1,.35,"locwgB"),-5.5,0,2.6,"glass",{sy:pulse})),n.push(P_(DOME(.9,.8,7),-1.5,0,-2.3,"psi",{e:1}));return n}function UMODEL_(e,t,extra){switch(e){case"mcv":return mcvModel(t);case"bastion":return bastionModel(t);case"hivetrans":return harvesterModel(t,"yuri");case"drone":return droneModel(t);case"miner_allied":return harvesterModel(t,"allied");case"miner_soviet":return harvesterModel(t,"soviet");case"miner_yuri":return harvesterModel(t,"yuri");case"grizzly":{if(extra&&extra.dep)return deployedPillar(PILLAR_H.grizzly,13,"allied");const p=tankHull(35,13,t,{fac:"allied"}),s=4.42;return p.push(P_(CYL(.35,2.4,6),.36*35,-4.6,s+6.2,"darkmetal",{ty:PI2,r:-.25})),p.push(P_(CYL(.35,2.4,6),.36*35,-3.2,s+6.2,"darkmetal",{ty:PI2,r:-.15})),p.push(P_(CYL(.35,2.4,6),.36*35,-1.8,s+6.2,"darkmetal",{ty:PI2,r:-.05})),p.push(P_(CYL(.13,9.5,5),-.4*35,4.4,s+9.8,"dark2")),p}case"lasher":{if(extra&&extra.dep)return deployedPillar(PILLAR_H.lasher,13,"yuri");const p=tankHull(34,13,t,{fac:"yuri",legs:6}),s=4.42;return[-8,-1,6].forEach(x=>p.push(P_(CONE(1.1,.15,2.8,7),x,0,s+8.2,"carapace2"))),p.push(P_(BOXM(16,.5,.4,.1),-1,0,s+8.3,"psi",{e:1})),p}case"rhino":{if(extra&&extra.dep)return deployedPillar(PILLAR_H.rhino,14.5,"soviet");const p=tankHull(38,14.5,t,{wheels:6,fac:"soviet"}),s=4.42;for(const sgn of[-1,1])p.push(P_(CYL(.55,3.2,8),-.46*38,sgn*2.6,s+7.6,"rust")),p.push(P_(CYL(.42,.7,6),-.46*38,sgn*2.6,s+10.8,"glow",{e:1})),p.push(P_(BOXM(4.2,1.2,1.6,.3),.05*38,sgn*(.5*14.5+.7),s+2.4,"darkmetal"));return p}case"apoc":{const p=tankHull(43,17.5,t,{wheels:6,skirt:!0,th:9.5,trkW:8,fac:"soviet"}),s=4.94;for(const sgn of[-1,1])for(const xo of[-10,5])p.push(P_(BOXM(3.4,.5,2.4,.2),xo,sgn*(.5*17.5+.4),s+5,"darkmetal",{r:sgn*.08}));return p.push(P_(CYL(.9,.6,8),.46*43,0,s+6,"lightY",{e:1,ty:PI2})),p}case"prism":{const p=tankHull(32,13,t,{fac:"allied",deployed:!!(extra&&extra.dep)}),s=4.42;return p.push(P_(DOME(1.3,1.1,8),.4*32,-3,s+7,"crystal",{e:1})),p.push(P_(DOME(1.3,1.1,8),.4*32,3,s+7,"crystal",{e:1})),p.push(P_(CONE(.6,.1,4,7),-.3*32,0,s+8,"crystal",{e:1})),p}case"gattling":{const p=tankHull(32,12.5,t,{fac:"yuri",legs:6}),s=4.42;for(const sgn of[-1,1])p.push(P_(CONE(1.4,.2,4.5,7),.42*32,sgn*2.6,s+4,"carapace2",{ty:PI2,r:sgn*.3}));return p.push(P_(CONE(1.6,.3,6,8),-.4*32,0,s+5,"carapace2",{ty:PI2})),p.push(P_(DOME(.9,.8,7),-.62*32,0,s+5,"psi",{e:1})),p}case"mastermind":{const p=tankHull(35,15,t,{skirt:!0,fac:"yuri",legs:8}),s=4.42;for(const sgn of[-1,1])p.push(P_(CYL(.25,7,6),0,sgn*4,s+8,"psi",{e:1,tx:sgn*.5}));return p.push(P_(BOXM(18,.4,.3,.1),-2,0,s+7,"psi",{e:1})),p}case"ifv":{const p=tankHull(26,12,t,{wheeled:!0,th:7,fac:"allied"}),s=3.64;return p.push(P_(BOXM(7,8,3,.6),-8,0,s+8.4,"armor3")),p.push(P_(BOXM(1.6,1.6,.5,.15),-6,-2.4,s+10,"darkmetal")),p.push(P_(BOXM(1.6,1.6,.5,.15),-6,2.4,s+10,"darkmetal")),p.push(P_(CYL(.1,8.5,5),-9,3,s+10.2,"dark2")),p}case"hover":{const e=[],t=30,r=13;e.push(P_(SLAB(roundRectProfile(1.02*t,r+7,5.5,3),5,1.6,"hvs"),0,0,1.2,"rubber")),e.push(P_(SLAB(hullProfile(t,r+1,"yuri"),6.2,1.8,"hvh"),0,0,6,"armor2")),e.push(P_(WEDGE(.22*t,.84*r,5.6,2),.34*t,0,12.2,"armor")),e.push(P_(SLAB(hullProfile(.58*t,.82*r,"yuri"),4.6,1.4,"hvd"),.04*-t,0,12.2,"armor")),e.push(P_(BOXM(.2*t,.66*r,2.4,.7),.34*-t,0,12.2,"armor3"));for(const n of[-1,1])e.push(P_(CYL(3,7,12),.36*-t,n*(.5*r+2),8,"gunmetal",{ty:-PI2})),e.push(P_(CYL(2.2,1.6,10),.36*-t-6.4,n*(.5*r+2),8,"glow",{ty:-PI2,e:1}));return e.push(P_(BOXM(.3*t,1.2,2.4,.4),0,-(.5*r+.6),12,"body")),e.push(P_(BOXM(.3*t,1.2,2.4,.4),0,.5*r+.6,12,"body")),e.push(P_(CYL(1.4,1.7,8),.4*t,.26*-r,13,"lightY",{e:1})),e.push(P_(CYL(1.4,1.7,8),.4*t,.26*r,13,"lightY",{e:1})),e}case"bulwark":{const p=tankHull(40,16.5,t,{wheels:7,skirt:!0,th:9.5,trkW:8,fac:"allied"}),s=4.94;return p.push(P_(BOXM(1.5,.85*16.5,4,.4),.46*40,0,s+3,"darkmetal")),p.push(P_(BOXM(3,2,2,.3),0,-(.5*16.5+1.2),s+7,"steel")),p.push(P_(BOXM(3,2,2,.3),0,.5*16.5+1.2,s+7,"steel")),p}case"hound":{const p=tankHull(24,11,t,{wheeled:!0,th:6.5,fac:"soviet"}),s=3.38;return p.push(P_(CYL(1,.3,8),-.36*24,0,s+7.6,"dark2",{ty:PI2})),p.push(P_(DOME(1,.45,8),-.36*24,0,s+7.6,"gunmetal",{ty:PI2})),p.push(P_(CYL(.5,1.6,6),.42*24,-3.4,s+6.4,"lightY",{e:1})),p.push(P_(CYL(.5,1.6,6),.42*24,3.4,s+6.4,"lightY",{e:1})),p}case"sledge":{const p=tankHull(36,15,t,{wheels:6,skirt:!0,th:9,fac:"soviet"}),s=4.68;for(const sgn of[-1,1])p.push(P_(BOXM(1.2,3,3.4,.3),-.48*36,sgn*5,s+1.5,"darkmetal"));return p.push(P_(BOXM(5,3,2,.3),.15*36,.5*15+.6,s+2.5,"olive")),p}case"shard":{const p=tankHull(34,14.5,t,{skirt:!0,fac:"yuri",legs:8}),s=4.42;return[-9,-2,6].forEach(x=>p.push(P_(CONE(1.6,.2,4.2,7),x,0,s+9,"crystal",{e:1}))),p.push(P_(DOME(1.1,1,7),0,0,-.4,"psi",{e:1})),p}case"longbow":return longbowModel(t);case"rift":return riftModel(t,extra);case"spore":{const e=[],r=32,n=14,a=8.5,dep=!!(extra&&extra.dep);dep?sandbagRing(e,.6*r,1.2):legWalker(e,r,n,a,t,6);const o=dep?.5*a-5:.5*a;e.push(P_(SLAB(hullProfile(.92*r,n+2,"yuri"),6.5,1.6,"sph"),0,0,o,"dark2")),e.push(P_(DOME(.52*n,8,10),.1*-r,0,o+6.5,"carapace")),e.push(P_(CONE(8.5,4,9,9),.14*r,0,o+6.5,"carapace2",{ty:-.55})),e.push(P_(DOME(4.4,4,8),.2*r,0,o+13.5,"psi",{e:1}));for(let t=0;t<4;t++){const n=t*PI2+.78;e.push(P_(CYL(1.1,6,6),.1*-r+5*Math.cos(n),5*Math.sin(n),o+12.5,"psi",{e:1}))}for(let t=0;t<3;t++){const x=-.15*r+.16*r*t;e.push(P_(DOME(2.6,2,8),x,.34*-n,o+3.2,"carapace",{ty:.3})),e.push(P_(DOME(2.6,2,8),x,.34*n,o+3.2,"carapace",{ty:-.3}))}return e}case"terror":{const e=[];e.push(P_(DOME(6.5,4.5,10),0,0,5,"carapace2")),e.push(P_(CYL(6.5,5,10),0,0,3,"dark2")),e.push(P_(DOME(4.2,3,9),0,0,8.6,"carapace")),e.push(P_(DOME(2.4,2,8),0,0,9.5,"glass",{e:1})),e.push(P_(CONE(1.6,.3,3,6),0,0,11.6,"psi",{e:1}));for(let r=0;r<4;r++){const n=r*PI2+.78,a=7.2*Math.cos(n),o=7.2*Math.sin(n),s=2.4*(1&t?r%2:1-r%2);e.push(P_(CYL(.85,11.5,6),a,o,3+.5*s,"steel",{r:n,ty:-1.25})),e.push(P_(CONE(1.3,.35,4,6),2.15*a,2.15*o,.2+s,"darkmetal",{r:n})),e.push(P_(DOME(.7,.6,6),1.55*a,1.55*o,2+s,"psi",{e:1}))}return e}case"v3":{const e=[],r=34,n=15,a=8.5,dep=!!(extra&&extra.dep),loaded=!extra||void 0===extra.l||extra.l;dep?deployedOutriggers(e,r,n,a):trackUnit(e,r,n,a,t,{wheels:5});const o=.5*a;e.push(P_(SLAB(hullProfile(.92*r,n+2,"soviet"),6.5,1.6,"v3h"),0,0,o,"armor2")),e.push(P_(SLAB(roundRectProfile(.3*r,n-1,2.5,2),9,2,"v3c"),.26*-r,0,o+6.5,"body")),e.push(P_(BOXM(1.6,n-4,4.4,.6),.12*-r,0,o+9.5,"glass",{e:1})),e.push(P_(BOXM(.5*r,.8*n,2.6,.8),.14*r,0,o+6.5,"armor3")),e.push(P_(CYL(1.3,.52*r,8),.1*-r,-5,o+9.4,"steel",{ty:PI2})),e.push(P_(CYL(1.3,.52*r,8),.1*-r,5,o+9.4,"steel",{ty:PI2})),loaded&&(e.push(P_(CYL(4.2,.52*r,12),.1*-r,0,o+13,"white",{ty:PI2})),e.push(P_(CONE(4.2,1.2,7,10),.42*r,0,o+13,"red",{ty:PI2})),[0,1,2,3].forEach(t=>{const n=t*PI2+.78;e.push(P_(BOXM(6,1,4.4,.4),.06*-r,4.2*Math.cos(n),o+13+4.2*Math.sin(n),"white",{r:0}))}));return e.push(P_(CYL(1.6,7,8),.42*-r,0,o+7,"rust",{ty:-PI2})),e}case"gi":return infantry(t,{helmet:"body",pack:"armor3",visor:"glass"});case"guardian":return infantry(t,{helmet:"body",pack:"armor3",weapon:"rocket"});case"conscript":return infantry(t,{helmet:"armor3",pack:"dark",gear:"dark",visor:"glow"});case"flak":return infantry(t,{helmet:"armor3",pack:"steel",gear:"dark",weapon:"launcher",visor:"glow"});case"initiate":return infantry(t,{cloth:"body",hood:"carapace2",tank:"psi",weapon:"flamer",visor:"psi"});case"virus":return infantry(t,{cloth:"carapace2",hood:"body",weapon:"long",pack:"carapace",visor:"psi"});case"engineer":return infantry(t,{cloth:"gold",helmet:"white",pack:"steel",weapon:"none",visor:"glass"});case"rogue":return infantry(t,{cloth:"olive",gear:"dark"});case"desolator":return infantry(t,{cloth:"green",helmet:"green",tank:"green",weapon:"flamer",visor:"glow"});case"chrono":return infantry(t,{cloth:"armor",helmet:"steel",pack:"crystal",weapon:"long",visor:"crystal"});case"tanya":return infantry(t,{cloth:"armor2",beret:"red",helmet:"dark2",weapon:"rifle",visor:"red"});case"reaper":return infantry(t,{cloth:"rust",beret:"dark2",helmet:"dark2",weapon:"rifle",visor:"red"});case"phantom":return infantry(t,{cloth:"carapace2",hood:"carapace",weapon:"rifle",visor:"crystal"});case"marksman":return infantry(t,{cloth:"armor3",helmet:"olive",pack:"olive",weapon:"launcher",visor:"glass"});case"bombard":return infantry(t,{cloth:"armor3",helmet:"armor3",pack:"red",weapon:"rocket",visor:"glow"});case"leech":return infantry(t,{cloth:"carapace2",hood:"carapace",tank:"crystal",weapon:"launcher",visor:"crystal"});case"brute":return infantry(t,{cloth:"carapace",hood:"body",weapon:"none",visor:"psi"}).map(e=>Object.assign({},e,{sx:1.3*(e.sx||1),sy:1.3*(e.sy||1),sz:1.2*(e.sz||1),z:1.2*e.z}));case"rocketeer":{const e=infantry(t,{cloth:"body",helmet:"glass",weapon:"none"});return e.push(P_(CYL(1.7,8,8),-3,-3.2,5.6,"steel")),e.push(P_(CYL(1.7,8,8),-3,3.2,5.6,"steel")),e.push(P_(CONE(1.6,.6,3.4,7),-3,-3.2,2.4,t?"glow":"red",{e:1,ty:Math.PI})),e.push(P_(CONE(1.6,.6,3.4,7),-3,3.2,2.4,t?"glow":"red",{e:1,ty:Math.PI})),e.push(P_(CYL(.8,8,6),3,-2.2,7.4,"darkmetal",{ty:PI2})),e.push(P_(CYL(.8,8,6),3,2.2,7.4,"darkmetal",{ty:PI2})),e}case"harrier":return jet(24,19,t,"allied");case"eagle":return jet(26,20,t,"soviet");case"kestrel":return jet(20,15,t,"allied");case"jackal":return jet(21,15,t,"soviet");case"locust":return locustModel(t);case"disc":{const e=[];e.push(P_(CONE(13,9,3.2,14),0,0,0,"dark")),e.push(P_(CONE(9,11,3,14),0,0,3.2,"body")),e.push(P_(DOME(6.5,5,12),0,0,6.2,"psi")),e.push(P_(DOME(3,2.6,10),0,0,10.4,"glass",{e:1})),e.push(P_(CONE(7,10,2.4,14),0,0,-2.4,"dark"));for(let r=0;r<4;r++){const n=r*PI2+(t?.5:0);e.push(P_(CYL(2,1.8,8),9*Math.cos(n),9*Math.sin(n),-1.2,t?"crystal":"psi",{e:1}))}return e}case"kirov":{const e=[],prof=[[-52,.6],[-44,9.5],[-34,18],[-21,26],[-7,32],[7,35],[21,31.5],[33,24],[43,13.5],[49,0]];for(let i=0;i<prof.length-1;i++){const x0=prof[i][0],r0=prof[i][1],x1=prof[i+1][0],r1=prof[i+1][1];e.push(P_(CONE(r0,r1,x1-x0,20),x0,0,12,"body",{ty:PI2}))}for(let i=1;i<prof.length-1;i++){const x=prof[i][0],r=prof[i][1];e.push(P_(CYL(r+1.3,2.2,20),x,0,12,"dark2",{ty:PI2}))}e.push(P_(BOXM(66,5,3.4,.6),-8,0,45,"trim"));for(let i=0;i<8;i++){const x=-42+11*i;e.push(P_(BOXM(2.6,2.6,2.8,.3),x,0,47,"dark"))}e.push(P_(BOXM(14,10,7,.9),9,0,44,"dark")),e.push(P_(BOXM(12,8,2.4,.3),9,0,48.4,"glass",{e:1})),bolts(e,9,-5.2,44,6.5,0,4,"steel"),bolts(e,9,5.2,44,6.5,0,4,"steel"),e.push(P_(CYL(.9,7,6),9,0,50.6,"trim")),e.push(P_(CYL(2,1.3,8),9,0,58,"glow",{e:1}));e.push(P_(DOME(9,7.5,12),42,0,12,"dark2")),e.push(P_(CYL(.8,7,6),47,0,12,"trim",{ty:PI2})),e.push(P_(CYL(1.4,1.2,8),54.3,0,12,"glow",{e:1,ty:PI2}));for(const r of[-37,37]){e.push(P_(CYL(6,20,12),-10,r,11,"steel",{ty:PI2})),e.push(P_(CYL(6.6,3.4,12),-19.5,r,11,"darkmetal",{ty:PI2})),e.push(P_(BOXM(3,r>0?24:5.4,r>0?5.4:24,.6),-6,r,11,"darkmetal")),e.push(P_(CYL(4.6,2,10),-21.2,r,11,"glow",{e:1,ty:PI2})),e.push(P_(BOXM(12,4,4,.5),5,r,11,"trim"))}for(const ang of[.52,-.52,2.62,-2.62])e.push(P_(BOXM(2.6,30,15,1.6),-56,0,12,"dark",{r:ang}));e.push(P_(CYL(3,12,10),-61,0,12,"darkmetal",{ty:PI2})),e.push(P_(SLAB(roundRectProfile(34,17,5,3),12,2.6,"kirg"),5,0,-19,"dark")),e.push(P_(BOXM(31,14,2,.6),5,0,-19.3,"trim"));for(let i=0;i<5;i++){const x=-9+7*i;e.push(P_(BOXM(4,14,2.1,.4),x,0,-13.2,"tesla",{e:1}))}return e.push(P_(DOME(6,5.4,10),13,0,-8,"glass",{e:1})),e.push(P_(BOXM(9,6.5,22,1.8),-38,0,5.5,"dark")),e.push(P_(BOXM(9,25,5,1.5),-38,0,16,"dark")),bolts(e,-38,0,17,10,PI2,5,"darkmetal"),bolts(e,-38,-4,5.5,8,0,3,"darkmetal"),bolts(e,-38,4,5.5,8,0,3,"darkmetal"),e}}if("interceptor"===e){const p=boatHull(30,11,t,{fac:"allied"}),th=6.5;return p.push(P_(CYL(.15,5,6),.1*30,0,th+6,"dark2")),p.push(P_(BOXM(.7,.7,.4,.1),.1*30,0,th+6.6,"gunmetal")),p.push(P_(CYL(.3,2.2,6),.44*30,-1.6,th+2.2,"gunmetal",{ty:PI2})),p.push(P_(CYL(.3,2.2,6),.44*30,1.6,th+2.2,"gunmetal",{ty:PI2})),p}if("riverine"===e){const p=boatHull(30,11,t,{fac:"soviet"}),th=6.5;for(const sgn of[-1,1])p.push(P_(BOXM(.5*30,.06*11,1.2,.2),-.05*30,sgn*.4*11,th+2.6,"darkmetal"));return p.push(P_(CYL(.5,3,7),-.15*30,0,th+2.5,"rust")),p}if("polyp"===e){const p=boatHull(30,11,t,{fac:"yuri"}),th=6.5;for(const sgn of[-1,1])p.push(P_(DOME(.6,.5,7),.15*30,sgn*.32*11,th+2.2,"psi",{e:1}));return p}if("frigate"===e){const p=boatHull(44,15,t,{twin:!0,fac:"allied"}),th=6.5;return p.push(P_(DOME(1.6,1.3,10),.3*44,0,th+4.5,"glass",{e:1})),p.push(P_(BOXM(6,5,.6,.2),-.05*44,0,th+2.3,"darkmetal")),p}if("destroyer"===e){const p=boatHull(44,15,t,{twin:!0,fac:"soviet"}),th=6.5;for(const sgn of[-1,1])p.push(P_(CYL(.35,4,6),0,sgn*3,th+1.7,"gunmetal",{ty:PI2}));return p.push(P_(CYL(1.2,4,8),-.1*44,0,th+3.5,"rust")),p}if("kraken"===e){const p=boatHull(44,15,t,{twin:!0,fac:"yuri"}),th=6.5;for(const sgn of[-1,1])p.push(P_(CONE(.9,.15,7,7),-.42*44,sgn*3,th+.5,"carapace2",{ty:PI2}));return p.push(P_(BOXM(20,.4,.3,.1),-.05*44,0,th+5.4,"psi",{e:1})),p}if("barracuda"===e){const p=subHull(38,12,t,{fac:"allied"}),rad=.42*12;p.push(P_(DOME(.9,.7,8),.04*38,0,rad+2.6*rad,"glass",{e:1}));for(const sgn of[-1,1])p.push(P_(BOXM(3,1,.3,.1),-.3*38,sgn*2,rad,"armor2"));return p}if("nautilus"===e){const p=subHull(38,12,t,{fac:"soviet"}),rad=.42*12;for(const sgn of[-1,1])p.push(P_(BOXM(2.4,1,.3,.1),-.44*38,sgn*1.6,rad,"darkmetal"));return p.push(P_(CYL(.3,3.6,6),-.4*38,0,rad+1.4,"rust")),p}if("squid"===e){const p=subHull(38,12,t,{fac:"yuri"}),rad=.42*12;for(const sgn of[-1,1])p.push(P_(CONE(.5,.08,5,6),-.46*38,sgn*1.5,rad,"carapace2",{ty:PI2}));return p.push(P_(DOME(.5,.4,7),.3*38,0,rad+.6,"psi",{e:1})),p}if("chinook"===e)return transportHeli(t,"allied");if("skyhauler"===e)return transportHeli(t,"soviet");if("gullet"===e)return transportHeli(t,"yuri");if("lst"===e){const p=boatHull(46,17,t,{fac:"allied"}),th=6.5;p.push(P_(WEDGE(.16*46,.7*17,3,.4),.46*46,0,th+.5,"steel"));for(const xo of[-8,0,8])p.push(P_(BOXM(4,4,3,.3),xo,-4,th+2.6,"rust"));return p}if("barge"===e){const p=boatHull(46,17,t,{fac:"soviet"}),th=6.5;p.push(P_(CYL(.4,6,6),-.4*46,0,th+3,"darkmetal")),p.push(P_(BOXM(8,.8,.5,.15),-.4*46+3,0,th+9,"darkmetal"));for(const xo of[-6,2])p.push(P_(BOXM(4,4,3,.3),xo,4,th+2.6,"olive"));return p}if("maw"===e){const p=boatHull(46,17,t,{fac:"yuri"}),th=6.5;p.push(P_(CONE(2.2,.3,4,9),.42*46,0,th+1,"dark",{ty:PI2})),p.push(P_(DOME(2,1.6,9),.44*46,0,th+1,"psi",{e:1}));for(const sgn of[-1,1])p.push(P_(CONE(.7,.1,5,6),-.4*46,sgn*2.5,th,"carapace2",{ty:PI2}));return p}return tankHull(30,13,t)}function UTURRET_(e,t){switch(e){case"miner_allied":return tankTurret(9,5.5,6.5,{pods:!0,fac:"allied"});case"grizzly":return tankTurret(11.5,9.2,17,{twin:!0,fac:"allied"});case"lasher":return tankTurret(11.5,9.2,16,{beam:!0,fac:"yuri"});case"rhino":return tankTurret(12.5,10.2,21,{fac:"soviet"});case"apoc":return tankTurret(14.5,12.2,23,{twin:!0,fac:"soviet"});case"ifv":return tankTurret(10,7,9,{pods:!0,fac:"allied"});case"prism":return tankTurret(11.5,9.2,16,{beam:!0,fac:"allied"});case"gattling":return tankTurret(11.5,8.2,15,{gat:!0,f:t,fac:"yuri"});case"mastermind":return tankTurret(12.5,9.5,0,{dome:!0,fac:"yuri"});case"hover":return tankTurret(9.5,6.6,8,{pods:!0,fac:"allied"});case"bulwark":return tankTurret(14,11.5,22,{twin:!0,fac:"allied"});case"hound":return tankTurret(8.5,6,11,{gat:!0,f:t,fac:"soviet"});case"sledge":return tankTurret(13,10.5,26,{fac:"soviet"});case"shard":return tankTurret(12,9.6,17,{beam:!0,fac:"yuri"});case"longbow":return longbowTurret();case"rift":return riftTurret();default:return null}}function muzzleDist(e){return"inf"===e.d.kind?e.d.radius+8:"v3"===e.key||"kirov"===e.key||"harrier"===e.key||"eagle"===e.key?e.d.radius+4:hasTurret(e.key)?e.d.radius+24:e.d.radius+10}const AFRAMES=e=>UNITS[e]&&"inf"===UNITS[e].kind?4:2,_hasT=new Map,_hasBT=new Map;function hasTurret(e){let t=_hasT.get(e);return void 0===t&&(t=!!UTURRET_(e,0),_hasT.set(e,t)),t}function hasBTurret(e,t){const r=e+"|"+t;let n=_hasBT.get(r);return void 0===n&&(n=!!BTURRET_(e,t,0),_hasBT.set(r,n)),n}function treeModel(e){
const t=[],isPine=1===e||5===e,isDead=3===e,barkMat=e%2==0?"bark":"bark2",
a=isPine?5===e?15:26:isDead?20:6===e?12:17;
t.push(P_(CONE(3.6,1.7,a,9),0,0,0,barkMat));
t.push(P_(DOME(4.2,1.4,8),0,0,0,barkMat));
for(let r=0;r<4;r++){const n=1.7*r+e;t.push(P_(CONE(1.3,.32,9+3*r%6,6),2.4*Math.cos(n),2.4*Math.sin(n),.5*a+r%2,barkMat,{r:n,ty:.7+.06*r}))}
if(isDead)return t;
const canopyCol=2===e?"olive":4===e?"green2":7===e?"autumn":6===e?"green3":isPine?"pine":"green";
if(isPine){
if(5===e){
for(let i=0;i<4;i++)t.push(P_(CONE(13-1.6*i,10-1.4*i,9,10),.5*Math.cos(2.4*i),.5*Math.sin(2.4*i),.5*a+5.4*i,canopyCol));
t.push(P_(CONE(4,.6,5,8),0,0,.5*a+21.6,canopyCol))
}else{
for(let i=0;i<5;i++)t.push(P_(CONE(12.4-2.1*i,9-1.9*i,9,10),.6*Math.cos(3*i),.6*Math.sin(3*i),.55*a+6.2*i,canopyCol));
t.push(P_(CONE(3.6,.5,6,8),0,0,.55*a+31,canopyCol))
}
}else if(6===e){
t.push(P_(DOME(6.5,6,10),0,0,.7*a,canopyCol));
t.push(P_(DOME(4.4,4,9),-2.6,2,.62*a,canopyCol));
t.push(P_(DOME(4,3.6,9),2.8,-1.6,.6*a,canopyCol))
}else{
t.push(P_(DOME(11.5,11,12),0,0,.74*a,canopyCol));
t.push(P_(DOME(7.8,7,11),-4.5,3.5,.64*a,canopyCol));
t.push(P_(DOME(7,6.2,11),5,-3,.6*a,canopyCol));
t.push(P_(DOME(5.6,5.2,10),-1,-5,.7*a,canopyCol));
4===e&&t.push(P_(DOME(6.2,5.6,10),2,5,.68*a,canopyCol))
}
return t}
function rockModel(e){const t=[],r=3+e%3;for(let n=0;n<r;n++){const r=2.1*n+e,a=n?4.6+2.8*n%4:0;t.push(P_(DOME(6.8-1.1*n,5.6-1*n,7+n%2),Math.cos(r)*a,Math.sin(r)*a,.3*(n%2),n%2?"rock2":"rock3",{r:r,tx:.12*(n%2?1:-1),ty:.08*n}))}for(let n=0;n<2;n++){const r=3.4*n+1.7*e;t.push(P_(DOME(1.6,1.2,6),4.4*Math.cos(r),4.4*Math.sin(r),0,n%2?"rock3":"rock2",{r:r}))}return t}function scrubModel(e){const t=[],r=e%2?"olive":"green";for(let n=0;n<3+e%2;n++){const a=1.9*n+e;t.push(P_(DOME(3.4-n%2*.8,2.6,7),3.2*Math.cos(a),3.2*Math.sin(a),0,r,{r:a,tx:.15}))}return t}function stoneModel(e){const t=[];for(let r=0;r<2+e%3;r++){const n=2.1*r+e;t.push(P_(DOME(2.2,1.5,6),2.6*Math.cos(n),2.6*Math.sin(n),0,r%2?"rock2":"sand",{r:n}))}return t}function fallModel(e){const t=[],h=20+7*(e%3);for(let r=0;r<3;r++)t.push(P_(CYL(1.6-.3*r,h-3*r,9),1.2*Math.cos(2.1*r+e)-1.2,1.2*Math.sin(2.1*r+e),0,"crystal",{r:.35*r,e:1}));return t.push(P_(DOME(5.5,3.2,10),0,0,0,"white")),t.push(P_(DOME(3.2,4,9),0,0,h-3,"tibBlit",{e:1})),t}function lampModel(){const e=[];return e.push(P_(CYL(1.4,1.6,10),0,0,0,"concrete2")),e.push(P_(CYL(.75,17,8),0,0,1.6,"darkmetal")),e.push(P_(BOXM(4.2,1,.9,.25),1.6,0,18.2,"darkmetal")),e.push(P_(BOXM(2.6,1.8,1,.3),3.4,0,17.4,"lightY",{e:1})),e}function towerModel(v){const e=[],w=26+10*(v%2),h=60+30*v,floors=Math.round(h/9);e.push(P_(BOXM(w,w,h,1.6),0,0,0,v%2?"concrete2":"dark2"));for(let f=1;f<floors;f++)f%2==0&&e.push(P_(BOXM(w-1.2,w+.4,1.6,.3),0,0,f*9,"trim"));for(let f=0;f<floors;f++){const z=4+f*9,lit=f%3==0;e.push(P_(BOXM(w*.7,.6,4.6,.15),0,-w/2-.3,z,lit?"glow":"glass",{e:lit?1:0})),e.push(P_(BOXM(w*.7,.6,4.6,.15),0,w/2+.3,z,lit?"glow":"glass",{e:lit?1:0})),e.push(P_(BOXM(.6,w*.7,4.6,.15),-w/2-.3,0,z,lit?"glow":"glass",{e:lit?1:0})),e.push(P_(BOXM(.6,w*.7,4.6,.15),w/2+.3,0,z,lit?"glow":"glass",{e:lit?1:0}))}return e.push(P_(BOXM(w*.8,w*.8,3,.6),0,0,h,"darkmetal")),v>1&&(e.push(P_(CYL(.6,14,6),0,0,h+3,"darkmetal")),e.push(P_(CYL(1,1.4,6),0,0,h+16,"red",{e:1}))),e}function carModel(v){const cols=["red","white","black","gunmetal"],col=cols[v%cols.length],e=[];e.push(P_(BOXM(16,7.4,4,1.2),0,0,2.3,col)),e.push(P_(BOXM(8.6,6.6,2.9,.8),-.6,0,5.4,"glass",{e:1}));for(const sx of[-5.2,5.2])for(const sy of[-3.4,3.4])e.push(P_(CYL(1.9,1.9,8),sx,sy,1.9,"dark2",{tx:PI2}));return e.push(P_(BOXM(1.2,6.8,.7,.2),7.6,0,3.6,"lightY",{e:1})),e}function PROPMODEL(e,t){const _a=getAssetModel(e);if(_a)return _a;return"tree"===e?treeModel(t):"rock"===e?rockModel(t):"scrub"===e?scrubModel(t):"lamp"===e?lampModel():"fall"===e?fallModel(t):"tower"===e?towerModel(t):"crater"===e?craterModel(t):"wreck"===e?wreckModel(t):"rubble"===e?rubbleModel(t):stoneModel(t)}
function craterModel(v){
const t=[],R=7+3*(v%3);
t.push(P_(DOME(R*.82,.35,12),0,0,0,"black"));
t.push(P_(DOME(R*.6,.5,10),0,0,.2,"scorch"));
const rimN=7+v%3;
for(let i=0;i<rimN;i++){const a=i/rimN*6.283+v,rr=R*(.85+.15*Math.sin(3*a+v));t.push(P_(DOME(2.4+1*(i%3),1.4+.6*(i%2),7),Math.cos(a)*rr,Math.sin(a)*rr,0,i%2?"rock2":"rock3",{r:a}))}
for(let i=0;i<3;i++){const a=2.1*i+v;t.push(P_(DOME(1.3,.8,6),Math.cos(a)*R*.35,Math.sin(a)*R*.35,.3,"rock2",{r:a}))}
return t}
function wreckModel(v){
const t=[],kind=v%3;
if(0===kind){
t.push(P_(BOXM(24,13,6,1.4),0,0,3,"wreck",{r:.3}));
t.push(P_(BOXM(9,7,4,1),3,4,7,"rust",{r:1.1}));
t.push(P_(CYL(3.4,2,8),3,4,9,"gunmetal",{r:1.1,tx:.5}));
t.push(P_(CYL(1.1,10,6),5,6,9,"darkmetal",{r:1.6,tx:.35}));
t.push(P_(BOXM(6,10,3,1),-8,-6,2,"wreck",{r:-.4}));
t.push(P_(DOME(5,3,8),0,0,6,"scorch"))
}else if(1===kind){
t.push(P_(BOXM(15,9,5,1.2),0,0,2.5,"wreck",{r:.6}));
t.push(P_(BOXM(5,7,3,.8),4,1,6,"rust",{r:.9}));
t.push(P_(CYL(2,7,8),-5,-3,4,"darkmetal",{tx:1.2}))
}else{
for(let i=0;i<6;i++){const a=1.1*i+v;t.push(P_(BOXM(4+2*(i%3),3+2*(i%2),2.5+1.5*(i%3),.5),Math.cos(a)*5,Math.sin(a)*5,.5*(i%2),i%2?"concrete2":"wreck",{r:a}))}
t.push(P_(DOME(6,2,8),0,0,0,"scorch"))
}
for(let i=0;i<3;i++)t.push(P_(DOME(1+.6*(i%2),.6,6),3*Math.cos(2*i+v),3*Math.sin(2*i+v),.2,"black"));
return t}
function rubbleModel(v){
const sizeIdx=v/4|0,variant=v%4,R=14+9*sizeIdx;
const t=[];
t.push(P_(DOME(R*.85,.4,12),0,0,0,"scorch"));
const chunks=7+2*sizeIdx;
for(let i=0;i<chunks;i++){const a=i/chunks*6.283+variant,rr=R*(.35+.5*Math.abs(Math.sin(2*a+variant))),cw=3.5+3*Math.abs(Math.cos(1.7*i+variant)),ch=2.5+2.5*Math.abs(Math.sin(1.3*i+variant));t.push(P_(BOXM(cw,.8*cw,ch,.3),Math.cos(a)*rr,Math.sin(a)*rr,.5+.5*ch,i%2?"concrete2":"wreck",{r:a}))}
for(let i=0;i<3+sizeIdx;i++){const a=2.4*i+variant;t.push(P_(DOME(1.6+1*(i%2),.9,6),Math.cos(a)*R*.4,Math.sin(a)*R*.4,.3,"black"))}
return t}
function crane(e,cx,cy,z,h,arm,mat){
mat=mat||"gunmetal";
const mast=Math.max(h,20),jib=Math.max(arm,24);
e.push(P_(BOXM(7,7,1.6,.45),cx,cy,z,"darkmetal"));
e.push(P_(BOXM(5.5,5.5,1.2,.3),cx,cy,z+1.6,mat));
const poleGap=2.4;
for(const side of[-1,1]){
const px=cx+side*poleGap;
e.push(P_(CYL(1.1,mast,10),px,cy-poleGap,z+2.8,mat));
e.push(P_(CYL(1.1,mast,10),px,cy+poleGap,z+2.8,mat));
e.push(P_(CYL(.7,mast*.3,8),px,cy-poleGap,z+2.8+mast,"gold",{a:{spin:.6}}));
e.push(P_(CYL(.7,mast*.3,8),px,cy+poleGap,z+2.8+mast,"gold",{a:{spin:.6}}));
for(let i=1;i<5;i++){
const zh=z+2.8+i*(mast/5);
e.push(P_(BOXM(poleGap*2+.4,.45,.45,.12),cx,cy-poleGap,zh,"darkmetal"));
e.push(P_(BOXM(poleGap*2+.4,.45,.45,.12),cx,cy+poleGap,zh,"darkmetal"));
e.push(P_(BOXM(.45,poleGap*2+.4,.45,.12),px,cy,zh,"darkmetal"));
}
}
const top=z+2.8+mast,sw={orbit:.4,amp:.5,pvx:cx,pvy:cy};
e.push(P_(BOXM(6.5,6.5,2,.4),cx,cy,top,mat));
e.push(P_(CYL(3.5,2,16),cx,cy,top+2,"gold",{a:sw}));
e.push(P_(BOXM(jib,2.2,2.2,.35),cx+jib*.42,cy,top+3.8,mat,{a:sw}));
e.push(P_(BOXM(jib*.35,2.4,2.4,.35),cx-jib*.2,cy,top+3.8,mat,{a:sw}));
e.push(P_(BOXM(4.2,3.6,2.6,.4),cx-jib*.28,cy,top+3,"darkmetal",{a:sw}));
e.push(P_(BOXM(3.2,2.8,2.2,.3),cx-jib*.28,cy,top+3.4,"glass",{e:1,a:sw}));
e.push(P_(BOXM(2.6,2.6,2.8,.3),cx+2.5,cy,top+3.2,"glow",{e:1,a:sw}));
for(let i=0;i<6;i++)e.push(P_(BOXM(jib*.14,.5,.5,.12),cx+jib*.1+i*jib*.14,cy,top+4.6,"darkmetal",{a:sw}));
e.push(P_(BOXM(jib*.85,.35,.35,.1),cx+jib*.38,cy,top+5.1,mat,{a:sw}));
const hx=cx+jib*.72;
e.push(P_(BOXM(3,2.6,1.8,.3),hx,cy,top+4.2,"gold",{a:sw}));
e.push(P_(CYL(.32,mast*.45,8),hx,cy,top+4.2-mast*.4,"darkmetal",{a:sw}));
e.push(P_(BOXM(2.6,2.6,2.2,.35),hx,cy,top+4.2-mast*.48,"darkmetal",{a:sw}));
e.push(P_(CYL(1.4,1.6,12),hx,cy,top+4.2-mast*.52,"glow",{e:1,a:sw}));
e.push(P_(BOXM(3.6,1.3,1.3,.25),hx,cy,top+4.2-mast*.58,"gold",{a:sw}));
}
function containerBox(e,cx,cy,z,w,d,h,mat,rot){rot=rot||0;e.push(P_(BOXM(w,d,h,.3),cx,cy,z,mat||"olive",{r:rot}));const rn=Math.max(2,Math.round(w/2.6)),co=Math.cos(rot),so=Math.sin(rot);for(let i=0;i<rn;i++){const lx=-.5*w+w*(i+.5)/rn;e.push(P_(BOXM(.3,d*.94,h*.82,.08),cx+lx*co,cy+lx*so,z+.09*h,"darkmetal",{r:rot}))}e.push(P_(BOXM(.5,d*.9,h*.72,.1),cx+.46*w*co,cy+.46*w*so,z+.14*h,"dark",{r:rot}))}function blockM(e,t,r,n,a,o,s,i,l,c){e.push(P_(SLAB(roundRectProfile(t,r,void 0===l?2.5:l,2),n,1.6,"bk"+c),a,o,s,i))}function bandLights(e,t,r,n,a,o){o=o||4;for(let s=0;s<o;s++){const i=.36*-t+.72*t*(1===o?.5:s/(o-1));e.push(P_(BOXM(.1*t,1.2,1.4,.3),i,.5*-r,n,a,{e:1})),e.push(P_(BOXM(.1*t,1.2,1.4,.3),i,.5*r,n,a,{e:1}))}}function glassBand(e,t,r,n,a){e.push(P_(BOXM(t,1.1,a,.3),0,.5*-r,n,"glass",{e:1})),e.push(P_(BOXM(t,1.1,a,.3),0,.5*r,n,"glass",{e:1})),e.push(P_(BOXM(1.1,r,a,.3),.5*-t,0,n,"glassdark")),e.push(P_(BOXM(1.1,r,a,.3),.5*t,0,n,"glassdark"))}function railing(e,t,r,n){e.push(P_(BOXM(t,.8,2.4,.3),0,.5*-r,n,"darkmetal")),e.push(P_(BOXM(t,.8,2.4,.3),0,.5*r,n,"darkmetal"))}function stack(e,t,r,n,a,o,s){e.push(P_(CYL(a,o,10),t,r,n,s||"rust")),e.push(P_(CYL(1.22*a,2.4,10),t,r,n+o-1.2,"darkmetal"))}function dish(e,t,r,n,a){e.push(P_(CYL(1.2,7,10),t,r,n,"steel")),e.push(P_(CYL(1.9,1.4,12),t,r,n+7,"darkmetal")),e.push(P_(CONE(a,.35*a,.55*a,14),t,r,n+8.4,"white",{ty:.55})),e.push(P_(CYL(.5,3.4,6),t,r,n+8.4+.4*a,"darkmetal")),e.push(P_(BOXM(.5*a,1,1,.2),t+.35*a,r,n+8.4+.3*a,"steel"))}function fan(e,t,r,n,a,o,s,i){e.push(P_(CYL(1.1*a,1.8,16),t,r,n,"darkmetal")),e.push(P_(CYL(.22*a,1.6,10),t,r,n+1.8,"gunmetal",{a:{spin:i||2.4}}));const l=o||5;for(let o=0;o<l;o++){const c=o/l*Math.PI*2;e.push(P_(BOXM(.92*a,.34*a,.5,.14),Math.cos(c)*a*.52+t,Math.sin(c)*a*.52+r,n+2.2,s||"steel",{r:c,ty:.42}))}}function drum(e,t,r,n,a,o,s,i){e.push(P_(CYL(a,o,18),t,r,n,s||"rust"));for(let s=0;s<6;s++){const l=1.047*s;e.push(P_(BOXM(1.2,.5*a,.92*o,.3),t+Math.cos(l)*a*.94,r+Math.sin(l)*a*.94,n+.04*o,"darkmetal",{r:l}))}e.push(P_(CYL(1.12*a,1.6,18),t,r,n,"darkmetal")),e.push(P_(CYL(1.12*a,1.6,18),t,r,n+o-1.6,"darkmetal"))}function spine(e,t,r,n,a,o,s){e.push(P_(CONE(2.2,.3,a,7),t,r,n,s||"dark",{r:Math.atan2(r,t),ty:o}))}function sandbagRing(e,t,r,cx?,cy?){cx=cx||0,cy=cy||0;for(let n=0;n<11;n++){const a=n/11*Math.PI*2;e.push(P_(BOXM(6,4.6,3,1.2),cx+Math.cos(a)*t,cy+Math.sin(a)*t,r,"sand",{r:a}))}}function ribs(e,t,r,n,a,o,s,i){for(let l=0;l<s;l++)e.push(P_(CYL(1.1*a,.9,16),t,r,n+o*(l+.7)/(s+.4),i||"darkmetal"))}function ladder(e,t,r,n,a,o){const s=Math.cos(o),i=Math.sin(o);e.push(P_(BOXM(.7,.7,a,.2),t-1.4*i,r+1.4*s,n,"darkmetal")),e.push(P_(BOXM(.7,.7,a,.2),t+1.4*i,r-1.4*s,n,"darkmetal"));for(let s=0;s<Math.max(2,a/3.2|0);s++)e.push(P_(BOXM(.5,3.2,.5,.15),t,r,n+1.6+3.2*s,"darkmetal",{r:o}))}function pipeRun(e,t,r,n,a,o,s,i){const l=n-t,c=a-r,d=Math.hypot(l,c),f=Math.atan2(c,l);e.push(P_(CYL(s,d,12),t,r,o,i||"rust",{r:f,ty:PI2})),e.push(P_(CYL(1.28*s,1.4,12),t,r,o,"darkmetal",{r:f,ty:PI2})),e.push(P_(CYL(1.28*s,1.4,12),n-1.4*Math.cos(f),a-1.4*Math.sin(f),o,"darkmetal",{r:f,ty:PI2}))}function vent(e,t,r,n,a,o,s){e.push(P_(BOXM(a,o,2.2,.5),t,r,n,s||"darkmetal"));const i=Math.max(3,o/2|0);for(let s=0;s<i;s++)e.push(P_(BOXM(.86*a,.7,.9,.2),t,r-.36*o+.72*o*s/(i-1),n+2,"gunmetal"))}function acUnit(e,t,r,n,a,o,s){e.push(P_(BOXM(a,o,3.4,.9),t,r,n,"steel",{r:s||0})),e.push(P_(CYL(.32*Math.min(a,o),.8,16),t,r,n+3.4,"gunmetal",{r:s||0})),e.push(P_(CYL(.3*Math.min(a,o),.5,6),t,r,n+4,"black",{r:s||0}))}function floodlight(e,t,r,n,a,o){e.push(P_(CYL(.85,a,10),t,r,n,"darkmetal")),e.push(P_(BOXM(3.4,2.6,2.4,.6),t+1.2*Math.cos(o),r+1.2*Math.sin(o),n+a,"steel",{r:o})),e.push(P_(CYL(1.15,.9,12),t+2.9*Math.cos(o),r+2.9*Math.sin(o),n+a+.9,"lightY",{r:o,ty:PI2,e:1}))}function railPosts(e,t,r,n,a){a=a||3,e.push(P_(BOXM(t,.55,.6,.18),0,.5*-r,n+a,"darkmetal")),e.push(P_(BOXM(t,.55,.6,.18),0,.5*r,n+a,"darkmetal")),e.push(P_(BOXM(.55,r,.6,.18),.5*-t,0,n+a,"darkmetal")),e.push(P_(BOXM(.55,r,.6,.18),.5*t,0,n+a,"darkmetal"));const o=Math.max(3,t/7|0);for(let s=0;s<o;s++){const i=.5*-t+t*s/(o-1);e.push(P_(BOXM(.6,.6,a,.18),i,.5*-r,n,"darkmetal")),e.push(P_(BOXM(.6,.6,a,.18),i,.5*r,n,"darkmetal"));const l=.5*-r+r*s/(o-1);e.push(P_(BOXM(.6,.6,a,.18),.5*-t,l,n,"darkmetal")),e.push(P_(BOXM(.6,.6,a,.18),.5*t,l,n,"darkmetal"))}}function hazard(e,t,r,n,a,o){const s=Math.max(3,a/3.2|0);for(let i=0;i<s;i++){const l=.5*-a+a*(i+.5)/s;e.push(P_(BOXM(a/s*.92,2.2,.5,.12),t+Math.cos(o)*l,r+Math.sin(o)*l,n,i%2?"black":"gold",{r:o}))}}function bolts(e,t,r,n,a,o,s,i){for(let l=0;l<s;l++){const c=.5*-a+a*(1===s?.5:l/(s-1));e.push(P_(CYL(.42,.42,6),t+Math.cos(o)*c,r+Math.sin(o)*c,n,i||"darkmetal"))}}function boltRing(e,t,r,n,a,o,s){for(let l=0;l<o;l++){const c=l/o*Math.PI*2;e.push(P_(CYL(.4,.4,6),t+Math.cos(c)*a,r+Math.sin(c)*a,n,s||"darkmetal"))}}function seams(e,t,r,n,a){e.push(P_(BOXM(t,.9,.55,.15),0,.22*-r,n,a||"armor3")),e.push(P_(BOXM(t,.9,.55,.15),0,.22*r,n,a||"armor3")),e.push(P_(BOXM(.9,r,.55,.15),.22*-t,0,n,a||"armor3")),e.push(P_(BOXM(.9,r,.55,.15),.22*t,0,n,a||"armor3"))}function catwalk(e,t,r,n,a,o,s){e.push(P_(SLAB(roundRectProfile(a,o,1.2,2),1.1,.3,"cwk"+a.toFixed(0)+o.toFixed(0)),t,r,n,"darkmetal",{r:s||0}));const i=Math.max(2,a/6|0);for(let l=0;l<i;l++){const c=.5*-a+a*l/(i-1),d=Math.cos(s||0),f=Math.sin(s||0);e.push(P_(BOXM(.55,.55,2.6,.15),t+d*c-f*o*.5,r+f*c+d*o*.5,n+1.1,"darkmetal")),e.push(P_(BOXM(.55,.55,2.6,.15),t+d*c+f*o*.5,r+f*c-d*o*.5,n+1.1,"darkmetal"))}e.push(P_(BOXM(a,.5,.5,.15),t,r-.5*o,n+3.6,"darkmetal",{r:s||0})),e.push(P_(BOXM(a,.5,.5,.15),t,r+.5*o,n+3.6,"darkmetal",{r:s||0}))}function crate(e,t,r,n,a,o,s){e.push(P_(BOXM(a,.8*a,.62*a,.1*a),t,r,n,o||"olive",{r:s||0})),e.push(P_(BOXM(.92*a,.6,.5,.15),t,r,n+.62*a,"darkmetal",{r:s||0}))}function barrel(e,t,r,n,a?){e.push(P_(CYL(2.1,5.4,14),t,r,n,a||"rust")),e.push(P_(CYL(2.3,.7,14),t,r,n+1.4,"darkmetal")),e.push(P_(CYL(2.3,.7,14),t,r,n+3.6,"darkmetal")),e.push(P_(CYL(1.9,.4,12),t,r,n+5.4,"darkmetal"))}function detailPass(e,t,r,n){if("civ1"===t||"civ2"===t||"civ3"===t||"civ4"===t||"civ5"===t||"hive"===t||"wall"===t||"gate"===t)return;const a="allied"===r,o="soviet"===r,s=.5*n-2.4,i=a?"armor3":o?"concrete2":"carapace2";for(const t of[-1,1])e.push(P_(BOXM(1.9,n-4.6,1.5,.4),t*s,0,3,i)),e.push(P_(BOXM(n-4.6,1.9,1.5,.4),0,t*s,3,i));for(const t of[-1,1])for(const r of[-1,1])e.push(P_(CYL(1.5,3.4,10),t*(s-1.2),r*(s-1.2),3.2,i)),e.push(P_(CYL(1,.6,10),t*(s-1.2),r*(s-1.2),6.6,"gold",{e:1}));hazard(e,0,1-s,3.7,.42*n,0);const l=n>=96;if(a)floodlight(e,s-3,3-s,3.6,l?13:9,-2.2),floodlight(e,3-s,s-3,3.6,l?13:9,.9),vent(e,5.5-s,6-s,3.6,6.5,7,"steel"),l&&acUnit(e,s-6.5,s-7,3.6,8,7,.4),bolts(e,0,2.6-s,3.9,.6*n,0,7,"steel");else if(o)floodlight(e,3-s,3-s,3.6,l?12:9,.8),barrel(e,s-4.5,5-s,3.6),barrel(e,s-4.5,9.6-s,3.6,"olive"),crate(e,6-s,s-5.5,3.6,6.5,"olive",.3),pipeRun(e,2-s,s-4,s-6,s-4,5.4,1.5,"rust"),bolts(e,0,s-2.6,3.9,.6*n,0,9,"rust"),l&&crate(e,6-s,s-13,3.6,6,"rust",-.2);else{for(let t=0;t<4;t++){const r=t*PI2+.78;e.push(P_(CYL(1.1,4.2,10),Math.cos(r)*(s-2),Math.sin(r)*(s-2),3.4,"carapace2")),e.push(P_(DOME(1.5,1.6,10),Math.cos(r)*(s-2),Math.sin(r)*(s-2),7.6,"psi",{e:1}))}e.push(P_(CYL(.3*n,.8,20),0,0,3.6,"carapace2"));for(let t=0;t<10;t++){const r=.628*t;e.push(P_(BOXM(2.6,.9,.5,.15),Math.cos(r)*n*.3,Math.sin(r)*n*.3,4.4,"psi",{r:r,e:1}))}}}function barrelRoofMesh(e,t,r,n?){const a=[];n=n||16;const o=[];for(let t=0;t<=n;t++){const a=Math.PI*t/n;o.push([Math.cos(a)*e/2,Math.sin(a)*r])}for(let s=0;s<n;s++){const n=[o[s][0],-t/2,o[s][1]],i=[o[s+1][0],-t/2,o[s+1][1]],l=[o[s+1][0],t/2,o[s+1][1]],c=[o[s][0],t/2,o[s][1]],d=nrm3(o[s][0]/(e/2),0,o[s][1]/r),f=nrm3(o[s+1][0]/(e/2),0,o[s+1][1]/r);pushTri(a,n,i,l,d,f,f),pushTri(a,n,l,c,d,f,d)}for(let e=0;e<n;e++){const r=[0,-1,0],n=[0,1,0];pushTri(a,[o[e][0],-t/2,o[e][1]],[0,-t/2,0],[o[e+1][0],-t/2,o[e+1][1]],r,r,r),pushTri(a,[o[e+1][0],t/2,o[e+1][1]],[0,t/2,0],[o[e][0],t/2,o[e][1]],n,n,n)}return a}const BARREL=(e,t,r)=>meshOf("BR"+e.toFixed(1)+"_"+t.toFixed(1)+"_"+r.toFixed(1),()=>barrelRoofMesh(e,t,r));function tier(e,t,r,n,a,o,s,i,l,c){const d=void 0===c?.94:c,f=roundRectProfile(t,r,.1*Math.min(t,r),3);e.push(P_(TSLAB(f,n,d,"tr"+l),a,o,s,i));const h=1-.46*(1-d);e.push(P_(BOXM(t*h*.995,r*h*.995,.7,.2),a,o,s+.46*n,"armor3"));const u=1-.9*(1-d);e.push(P_(BOXM(t*u*1.004,r*u*1.004,.085*n,.25),a,o,s+.855*n,"body")),e.push(P_(BOXM(t*u*1.006,r*u*1.006,.5,.15),a,o,s+.855*n+.085*n,"darkmetal"));if(t>10&&r>10){e.push(P_(BOXM(t*1.07,r*1.07,1.1,.35),a,o,s+.05,"concrete2"));const g=Math.max(4,Math.round(t/9)),m=Math.max(4,Math.round(r/9));for(let ci=0;ci<g;ci++){const cx=.5*-t+t*(ci+.5)/g;e.push(P_(BOXM(.8,.3,.88*n,.1),a+cx,o+.5*-r-.08,s+.46*n,"darkmetal")),e.push(P_(BOXM(.8,.3,.88*n,.1),a+cx,o+.5*r+.08,s+.46*n,"darkmetal"))}for(let ri=0;ri<m;ri++){const ry=.5*-r+r*(ri+.5)/m;e.push(P_(BOXM(.3,.8,.88*n,.1),a+.5*-t-.08,o+ry,s+.46*n,"darkmetal")),e.push(P_(BOXM(.3,.8,.88*n,.1),a+.5*t+.08,o+ry,s+.46*n,"darkmetal"))}bolts(e,a,o+.5*-r*.99,s+.855*n,.92*t,0,Math.max(4,Math.round(t/11)),"steel"),bolts(e,a,o+.5*r*.99,s+.855*n,.92*t,0,Math.max(4,Math.round(t/11)),"steel")}}function windows(e,t,r,n,a,o,s?){for(let i=0;i<o;i++){const l=.36*-t+.72*t*(1===o?.5:i/(o-1));e.push(P_(BOXM(.62*t/o+.5,1.9,a+.3,.2),l,.5*-r-.1,n,"darkmetal")),e.push(P_(BOXM(.62*t/o,1.6,a,.25),l,.5*-r,n,s||"glass",{e:1})),e.push(P_(BOXM(.5*t/o,.35,.3,.12),l,.5*-r-.22,n+.5*a+.2,"steel")),e.push(P_(BOXM(.62*t/o+.5,1.9,a+.3,.2),l,.5*r+.1,n,"darkmetal")),e.push(P_(BOXM(.62*t/o,1.6,a,.25),l,.5*r,n,s||"glassdark")),e.push(P_(BOXM(.5*t/o,.35,.3,.12),l,.5*r+.22,n+.5*a+.2,"steel"))}for(let i=0;i<o;i++){const l=.36*-r+.72*r*(1===o?.5:i/(o-1));e.push(P_(BOXM(1.9,.62*r/o+.5,a+.3,.2),.5*-t-.1,l,n,"darkmetal")),e.push(P_(BOXM(1.6,.62*r/o,a,.25),.5*-t,l,n,s||"glassdark")),e.push(P_(BOXM(.35,.5*r/o,.3,.12),.5*-t-.22,l,n+.5*a+.2,"steel")),e.push(P_(BOXM(1.9,.62*r/o+.5,a+.3,.2),.5*t+.1,l,n,"darkmetal")),e.push(P_(BOXM(1.6,.62*r/o,a,.25),.5*t,l,n,s||"glass",{e:1})),e.push(P_(BOXM(.35,.5*r/o,.3,.12),.5*t+.22,l,n+.5*a+.2,"steel"))}}function lattice(e,t,r,n,a,o,s){s=s||"steel";const i=[[-1,-1],[1,-1],[1,1],[-1,1]];for(const[l,c]of i)e.push(P_(BOXM(1.5,1.5,a,.4),t+l*o,r+c*o,n,s));const l=Math.max(2,a/7|0);for(let i=0;i<l;i++){const c=n+a*(i+.5)/l;e.push(P_(BOXM(2*o+1.5,1,.9,.25),t,r-o,c,s)),e.push(P_(BOXM(2*o+1.5,1,.9,.25),t,r+o,c,s)),e.push(P_(BOXM(1,2*o+1.5,.9,.25),t-o,r,c,s)),e.push(P_(BOXM(1,2*o+1.5,.9,.25),t+o,r,c,s));const d=Math.hypot(2*o,a/l);e.push(P_(BOXM(d,.8,.7,.2),t,r-o,c+a/l*.25,s,{ty:Math.atan2(a/l,2*o)})),e.push(P_(BOXM(d,.8,.7,.2),t,r+o,c+a/l*.25,s,{ty:-Math.atan2(a/l,2*o)}))}e.push(P_(SLAB(roundRectProfile(2.9*o,2.9*o,1.5,2),1.2,.3,"ltp"+o.toFixed(1)),t,r,n+a,"darkmetal")),railPosts(e,2.7*o,2.7*o,n+a+1.2,2.4)}function coolTower(e,t,r,n,a,o,s){for(let i=0;i<6;i++){const l=i/6,c=(i+1)/6,d=a*(1-.42*Math.sin(l*Math.PI)),f=a*(1-.42*Math.sin(c*Math.PI));e.push(P_(CONE(d,f,o/6,20),t,r,n+o*l,s||"concrete2"))}e.push(P_(CYL(.62*a,2.6,20),t,r,n+o,"darkmetal")),e.push(P_(CYL(.5*a,1.2,18),t,r,n+o+2.6,"black")),ribs(e,t,r,n+.1*o,.72*a,.5*o,3,"darkmetal"),ladder(e,t+.6*a,r,n,o,0)}function silo(e,t,r,n,a,o,s){e.push(P_(CYL(a,o,20),t,r,n,s||"steel")),ribs(e,t,r,n,a,o,4,"darkmetal"),e.push(P_(CONE(1.04*a,.3*a,.55*a,20),t,r,n+o,"darkmetal")),e.push(P_(CYL(.22*a,3.2,10),t,r,n+o+.55*a,"gunmetal")),e.push(P_(CYL(.3*a,.8,10),t,r,n+o+.55*a+3.2,"glow",{e:1})),ladder(e,t+.92*a,r,n,o,0)}function gantry(e,t,r,n,a,o,s){const i=Math.cos(s||0),l=Math.sin(s||0);for(const s of[.5*-a,.5*a])e.push(P_(BOXM(3,3,o,.8),t+i*s,r+l*s,n,"steel")),e.push(P_(BOXM(4.6,4.6,1.6,.5),t+i*s,r+l*s,n+o-1.6,"darkmetal"));e.push(P_(BOXM(a+4,3.4,3.2,.9),t,r,n+o,"steel",{r:s||0}));const trav={patrol:.15,pw:.5*a,ph:.3*o};e.push(P_(BOXM(5.5,4.2,2.6,.7),t+i*a*.14,r+l*a*.14,n+o-2.4,"gunmetal",{a:trav})),e.push(P_(CYL(.3,4.2,8),t+i*a*.14,r+l*a*.14,n+o-5.5,"darkmetal",{a:Object.assign({spin:.5},trav)})),e.push(P_(BOXM(3.6,3,1.6,.45),t+i*a*.14,r+l*a*.14,n+o-7,"darkmetal",{a:Object.assign({spin:.5},trav)})),e.push(P_(CYL(1,1.2,10),t+i*a*.14,r+l*a*.14,n+o-8,"glow",{e:1,a:Object.assign({spin:.5},trav)})),e.push(P_(BOXM(2.2,2.2,1,.3),t+i*a*.26,r+l*a*.26,n+o-1.4,"gold"))}function bioArm(e,cx,cy,z,arm,h,mat){mat=mat||"carapace2";const segs=4,segLen=arm/segs,swA={orbit:.55,amp:.5,pvx:cx,pvy:cy};e.push(P_(CYL(3.6,3.2,10),cx,cy,z,mat)),e.push(P_(DOME(3.8,3,10),cx,cy,z+3.2,"carapace"));let px=cx,py=cy;for(let k=0;k<segs;k++){const rad=2.6-.42*k;e.push(P_(CYL(rad,segLen*1.05,10),px,py,z+h,mat,{ty:PI2,a:swA})),px+=segLen}e.push(P_(DOME(1.7,2,10),px,py,z+h,"psi",{e:1,a:swA}))}function solarPanels(e,t,r,n,w,d){const rows=3,cols=2;for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const x=t-w*.35+j*(w*.35),y=r-d*.3+i*(d*.28);e.push(P_(BOXM(w*.3,d*.22,.4,.15),x,y,n,"darkmetal"));e.push(P_(BOXM(w*.28,d*.2,.25,.12),x,y,n+.4,"crystal",{e:1}));e.push(P_(BOXM(w*.26,d*.02,.15,.08),x,y,n+.55,"steel"));e.push(P_(BOXM(w*.02,d*.18,.15,.08),x,y,n+.55,"steel"))}}
function roofFarm(e,t,r,n,a){const o=e=>(43758.5453*Math.sin(12.9898*e+78.233*a)%1+1)%1,s=Math.max(4,Math.round(t*r/620));for(let a=0;a<s;a++){const s=(o(a)-.5)*t*.72,i=(o(a+40)-.5)*r*.72,l=o(a+80);l<.34?acUnit(e,s,i,n,6+5*o(a+9),5+4*o(a+3),1.5*o(a+7)):l<.62?vent(e,s,i,n,5+4*o(a+11),5+4*o(a+13),"steel"):l<.82?e.push(P_(BOXM(4.5,4.5,1.4,.4),s,i,n,"darkmetal")):e.push(P_(CYL(1.5,4.5,12),s,i,n,"gunmetal"))}for(let a=0;a<3;a++)pipeRun(e,.42*-t,.24*-r+a*r*.24,.42*t,.24*-r+a*r*.24,n+1.6,1.1,"rust")}function stairs(e,t,r,n,a,o){const s=Math.max(3,a/2.4|0),i=Math.cos(o),l=Math.sin(o);for(let c=0;c<s;c++)e.push(P_(BOXM(2.6,6,.8,.2),t+i*c*2.4,r+l*c*2.4,n+c*(a/s),"darkmetal",{r:o}));e.push(P_(BOXM(2.4*s,.6,.6,.15),t+i*s*1.2,r+l*s*1.2-3,n+.6*a,"darkmetal",{r:o,ty:-Math.atan2(a,2.4*s)})),e.push(P_(BOXM(2.4*s,.6,.6,.15),t+i*s*1.2,r+l*s*1.2+3,n+.6*a,"darkmetal",{r:o,ty:-Math.atan2(a,2.4*s)}))}function veins(e,t,r,n,a,o,s,i){for(let l=0;l<s;l++){const c=l/s*Math.PI*2;e.push(P_(BOXM(1.5,.1*a,o,.35),t+Math.cos(c)*a*.99,r+Math.sin(c)*a*.99,n,i||"psi",{r:c,e:1}))}}function plates(e,t,r,n,a,o,s,i?){for(let l=0;l<o;l++){const c=l/o*Math.PI*2+.2;e.push(P_(WEDGE(.46*a,.3*a,s,.22*s),t+Math.cos(c)*a*.8,r+Math.sin(c)*a*.8,n,i||"carapace2",{r:c+Math.PI}))}}function hive(e,t){const r=t,n=r.x||0,a=r.y||0,o=r.z,s=r.r,i=r.h,l=r.crown,c=r.seg||8;if(e.push(P_(TSLAB(circleProfile(s,c),i,.84,"hv"+s.toFixed(1)+i.toFixed(1)+c),n,a,o,"carapace2")),e.push(P_(TSLAB(circleProfile(.9*s,c),.22*i,.9,"hs"+s.toFixed(1)+i.toFixed(1)+c),n,a,o+i,"carapace")),e.push(P_(DOME(.8*s,l,c),n,a,o+i+.22*i,"carapace")),plates(e,n,a,o,s,c,.62*i),veins(e,n,a,o+.16*i,.86*s,.62*i,c,r.vein||"psi"),!1!==r.crest&&(e.push(P_(CONE(.3*s,.1*s,.72*l,c),n,a,o+i+.22*i+.72*l,"carapace2")),e.push(P_(DOME(.2*s,.24*s,c),n,a,o+i+.22*i+1.44*l,r.vein||"psi",{e:1}))),r.spines)for(let t=0;t<c;t++){const r=t/c*Math.PI*2+.4;spine(e,n+Math.cos(r)*s*.92,a+Math.sin(r)*s*.92,o+.5*i,i*(.55+t%3*.14),.46,"carapace2")}if(r.pods)for(let t=0;t<r.pods;t++){const l=t/r.pods*Math.PI*2+.6,c=n+Math.cos(l)*s*.86,d=a+Math.sin(l)*s*.86;e.push(P_(TSLAB(circleProfile(.2*s,6),.62*i,.8,"hp"+s.toFixed(1)),c,d,o,"carapace2")),e.push(P_(DOME(.17*s,.22*s,6),c,d,o+.62*i,"carapace")),e.push(P_(DOME(.08*s,.1*s,6),c,d,o+.62*i+.16*s,r.vein||"psi",{e:1}))}}function def1Bits(n,fac,cx,cy,z,rs,ks,full){if("allied"===fac){tier(n,.62*rs,.62*rs,.19*rs,cx,cy,z,"armor","d1v"+ks,.92),n.push(P_(CYL(.26*rs,.09*rs,18),cx,cy,z+.19*rs,"armor3")),n.push(P_(CYL(.045*rs,3.2,8),cx,cy+.24*rs,z+.19*rs,"darkmetal")),n.push(P_(CYL(.032*rs,.6,8),cx,cy+.24*rs,z+.19*rs+3.2,"glow",{e:1,a:{spin:.8}}));full&&bolts(n,cx,cy+.27*-rs,4.6,.42*rs,0,5,"steel")}else if("soviet"===fac){tier(n,.72*rs,.72*rs,.2*rs,cx,cy,z,"concrete","d1l"+ks,.9),n.push(P_(CYL(.28*rs,.08*rs,16),cx,cy,z+.2*rs,"armor2"));full&&(sandbagRing(n,.45*rs,z,cx,cy),stack(n,cx+.24*rs,cy-.24*rs,z,.045*rs,3.4,"rust"))}else{n.push(P_(CYL(.22*rs,.14*rs,16),cx,cy,z,"carapace2")),n.push(P_(DOME(.34*rs,.2*rs,16),cx,cy,z+.14*rs,"carapace")),veins(n,cx,cy,z+.05*rs,.25*rs,.1*rs,8,"psi");if(full)for(let e=0;e<4;e++){const t=e*PI2+.78;n.push(P_(CYL(1.2,3.4,8),cx+Math.cos(t)*rs*.25,cy+Math.sin(t)*rs*.25,5.6,"psi",{e:1}))}}}function aaBits(n,fac,cx,cy,z,rs,ks,full){if("allied"===fac){tier(n,.58*rs,.58*rs,.2*rs,cx,cy,z,"armor","aav"+ks,.92),n.push(P_(CYL(.22*rs,.07*rs,16),cx,cy,z+.2*rs,"armor3")),n.push(P_(CYL(.04*rs,2.6,8),cx-.22*rs,cy+.22*rs,z+.2*rs,"darkmetal")),n.push(P_(BOXM(.1*rs,.02*rs,.09*rs,.4),cx-.22*rs,cy+.22*rs,z+.2*rs+2.6,"steel",{a:{spin:1.4}}));full&&n.push(P_(BOXM(.2*rs,.14*rs,.09*rs,1),cx+.24*rs,cy+.24*-rs,z,"darkmetal"))}else if("soviet"===fac){tier(n,.66*rs,.66*rs,.2*rs,cx,cy,z,"concrete","aal"+ks,.9),n.push(P_(CYL(.24*rs,.07*rs,16),cx,cy,z+.2*rs,"armor2")),hazard(n,cx,cy+.34*-rs,z+.3,.4*rs,0);full&&(sandbagRing(n,.43*rs,z,cx,cy),crate(n,cx+.3*-rs,cy+.28*rs,z,5.2,"olive",.4))}else{n.push(P_(CONE(.3*rs,.2*rs,.24*rs,18),cx,cy,z,"carapace")),n.push(P_(CYL(.2*rs,.07*rs,16),cx,cy,z+.24*rs,"carapace2")),veins(n,cx,cy,z+.1*rs,.27*rs,.14*rs,6,"psi")}}function triGun(n,fac,cx,cy,z,rs){if("allied"===fac){n.push(P_(CYL(.07*rs,.55*rs,9),cx+.34*rs,cy,z,"gunmetal",{ty:PI2})),n.push(P_(CYL(.09*rs,.14*rs,9),cx+.58*rs,cy,z,"steel",{ty:PI2}))}else if("soviet"===fac){n.push(P_(CYL(.075*rs,.5*rs,8),cx+.3*rs,cy-.1*rs,z,"gunmetal",{ty:PI2})),n.push(P_(CYL(.075*rs,.5*rs,8),cx+.3*rs,cy+.1*rs,z,"gunmetal",{ty:PI2}))}else{n.push(P_(CONE(.16*rs,.06*rs,.38*rs,9),cx+.17*rs,cy,z,"body",{ty:PI2})),n.push(P_(CYL(.05*rs,.16*rs,7),cx+.5*rs,cy,z,"psi",{ty:PI2,e:1}))}}function triAA(n,fac,cx,cy,z,rs){if("allied"===fac){for(const s of[-1,1])n.push(P_(BOXM(.44*rs,.16*rs,.16*rs,.04*rs),cx+.14*rs,cy+s*.12*rs,z,"steel")),n.push(P_(CONE(.065*rs,.02*rs,.12*rs,7),cx+.4*rs,cy+s*.12*rs,z,"red",{ty:PI2}))}else if("soviet"===fac){for(const s of[-1,1])n.push(P_(CYL(.065*rs,.55*rs,8),cx+.2*rs,cy+s*.12*rs,z,"gunmetal",{ty:PI2}));n.push(P_(BOXM(.18*rs,.28*rs,.12*rs,.04*rs),cx-.12*rs,cy,z,"darkmetal"))}else for(let i=0;i<3;i++){const ang=2.094*i;n.push(P_(CYL(.04*rs,.48*rs,6),cx+.1*rs*Math.cos(ang),cy+.1*rs*Math.sin(ang),z,"psi",{ty:PI2,r:ang,e:1}))}}function triGunHead(fac){const n=[];return triGun(n,fac,0,0,3.6+.05*64+.22*16,16),n}function triAAHead(fac){const n=[];return triAA(n,fac,0,0,3.6+.05*64+.24*16,16),n}// Building keys whose model has staged construction reveal (see BMODEL_'s
// riseBucket below). render.ts calls this too, to decide whether to pass
// the live rise fraction through dep and tag the geometry cache key with
// it, instead of duplicating this key list in three places.
// "hive" and "super" are deliberately excluded: they already use the dep
// parameter for their own deploy-state toggle (see their cases below),
// which gates real gameplay (tickHive's drone spawning and superReady()'s
// fire-availability check, both in src/sim.ts) - routing the rise fraction
// through dep for them too would silently break those toggles.
function hasStagedBuild(e){return"conyard"===e||"factory"===e||"power"===e||"barracks"===e||"refinery"===e||"airfield"===e||"navalyard"===e||"lab"===e}
function BMODEL_(e,t,dep,cn,rot){cn=cn||0;const r=32*BLD[e].size,n=[],a="allied"===t,o="soviet"===t,d=!1!==dep;const s=.3*r,i=.24*r,l=3.6,c=l+s;
// Construction reveal stage (0=bare pad+crane, 4=fully built). Only keys in
// hasStagedBuild() actually vary this - render.ts passes the live rise
// fraction (0-1) via dep for them, and bakes the resulting bucket into the
// geometry cache key (like gateBucket does for gates) so each stage gets
// its own cached mesh. Every other building key gets bucket 4 (always
// fully built), so this is a no-op for them.
const riseBucket=hasStagedBuild(e)?Math.round(4*Math.max(0,Math.min(1,+dep||0))):4;
switch(e){case"triturret":{const fac=a?"allied":o?"soviet":"yuri",mat=a?"armor":o?"concrete2":"carapace",bz=l+.05*r,rs=16;n.push(P_(BOXM(1*r,.13*r,.09*r,.2),0,0,l,mat)),def1Bits(n,fac,-.34*r,0,bz,rs,"_tt",!1),aaBits(n,fac,0,0,bz,rs,"_tt",!1),def1Bits(n,fac,.34*r,0,bz,rs,"_tt",!1);break}case"wall":{const h=.68*r,thin=.08*r,half=.5*r,full=r,mat=a?"armor":o?"concrete2":"carapace",bev=a?.15:o?.2:.3,accent=a?"armor3":o?"rust":"carapace2";if(10===cn)n.push(P_(BOXM(full,thin,h,bev),0,0,l,mat));else if(5===cn)n.push(P_(BOXM(thin,full,h,bev),0,0,l,mat));else{n.push(P_(BOXM(thin,thin,h,bev),0,0,l,mat));1&cn&&n.push(P_(BOXM(thin,half,h,bev),0,-half/2,l,mat));2&cn&&n.push(P_(BOXM(half,thin,h,bev),half/2,0,l,mat));4&cn&&n.push(P_(BOXM(thin,half,h,bev),0,half/2,l,mat));8&cn&&n.push(P_(BOXM(half,thin,h,bev),-half/2,0,l,mat));0===cn&&n.push(P_(CYL(thin*.7,h*1.05,8),0,0,l,accent))}break}case"gate":{const h=.68*r,thin=.08*r,half=.5*r,full=r,p=Math.max(0,Math.min(1,+dep||0)),mat=a?"armor2":o?"concrete2":"carapace2",postMat=a?"armor":o?"rust":"carapace",leafMat=a?"gunmetal":o?"rust":"carapace2",horiz=2&cn||8&cn?!0:1&cn||4&cn?!1:Math.round((rot||0)/(Math.PI/2))%2==0;1&cn&&n.push(P_(BOXM(thin,half,h,.2),0,-half/2,l,mat));2&cn&&n.push(P_(BOXM(half,thin,h,.2),half/2,0,l,mat));4&cn&&n.push(P_(BOXM(thin,half,h,.2),0,half/2,l,mat));8&cn&&n.push(P_(BOXM(half,thin,h,.2),-half/2,0,l,mat));0===cn&&n.push(P_(CYL(thin*.7,h*1.05,8),0,0,l,postMat));n.push(P_(horiz?BOXM(full,thin,h,.18):BOXM(thin,full,h,.18),0,0,l-p*h*1.35,leafMat));break}case"oilDerek":{silo(n,0,.16*r,l,.32*r,.4*r,"rust"),n.push(P_(CYL(.05*r,1.5*r,8),-.22*r,-.18*r,l,"darkmetal")),n.push(P_(BOXM(.46*r,.1*r,.1*r,.3),-.22*r,-.18*r,l+1.2*r,"darkmetal",{r:.4})),pipeRun(n,0,.16*r,-.22*r,-.18*r,l,.06*r,"rust");break}case"paradropHangar":{n.push(P_(BOXM(.9*r,.6*r,.42*r,.15),0,0,l,"concrete2")),n.push(P_(CONE(.52*r,.05*r,.3*r,4),0,0,l+.42*r,"armor3",{r:PI2/8})),n.push(P_(CYL(.025*r,.5*r,6),.33*r,.18*r,l+.42*r,"darkmetal"));break}case"empTower":{n.push(P_(CYL(.22*r,.7*r,16),0,0,l,"darkmetal"));for(let e=0;e<3;e++)n.push(P_(CYL(.28*r,.06*r,16),0,0,l+.2*r+e*.22*r,"steel"));n.push(P_(DOME(.24*r,.18*r,10),0,0,l+.9*r,"crystal",{e:1}));break}case"rogueDen":{crate(n,-.22*r,-.18*r,l,.34*r,"olive",.3),crate(n,.2*r,-.1*r,l,.28*r,"rust",-.5),n.push(P_(CONE(.3*r,.02*r,.34*r,10),.05*r,.2*r,l,"sand")),n.push(P_(CYL(.03*r,.5*r,6),.28*r,.24*r,l,"darkmetal"));break}case"conyard":{
const CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]];
n.push(P_(SLAB(roundRectProfile(.92*r,.92*r,4,3),1.2,.5,"cypad"),0,0,l,"asphalt"));
if(a){
if(riseBucket>=1){
tier(n,.5*r,.5*r,.3*s,0,0,l,"armor","cyv1",.93);
windows(n,.46*r,.46*r,l+.13*s,.15*s,4);
railPosts(n,.5*r,.5*r,l+.3*s,2.6);
}
const z2=l+.3*s,drumH=.42*s;
if(riseBucket>=2){
n.push(P_(CYL(.3*r,.05*r,22),0,0,z2,"armor3"));
n.push(P_(CYL(.26*r,drumH,22),0,0,z2+.05*r,"armor2"));
glassBand(n,.48*r,.48*r,z2+.05*r+.5*drumH,.62*drumH);
railPosts(n,.42*r,.42*r,z2+.05*r+drumH,2.2);
}
const z3=z2+.05*r+drumH;
if(riseBucket>=3){
n.push(P_(CYL(.16*r,.13*r,18),0,0,z3,"steel"));
n.push(P_(DOME(.16*r,.11*r,18),0,0,z3+.13*r,"glass",{e:1}));
dish(n,.2*r,-.18*r,z3-.02*r,.065*r);
for(let e=0;e<4;e++){const ang=e*PI2+.5;n.push(P_(CYL(.012*r,.1*r,6),Math.cos(ang)*r*.25,Math.sin(ang)*r*.25,z2+.05*r+drumH*.2,"steel",{ty:PI2}))}
}
if(riseBucket>=4){
const z4=z3+.13*r+.11*r;
n.push(P_(CYL(.02*r,.16*r,10),0,0,z4,"darkmetal"));
n.push(P_(CYL(.04*r,.05*r,10),0,0,z4+.16*r,"glow",{e:1,a:{spin:.5}}));
}
}else if(o){
if(riseBucket>=1){
tier(n,.68*r,.68*r,.34*s,0,0,l,"concrete","cyl1",.95);
windows(n,.64*r,.64*r,l+.14*s,.14*s,4,"glassdark");
}
const z2=l+.34*s;
if(riseBucket>=2){
n.push(P_(BOXM(.56*r,.56*r,.06*r,.3),0,0,z2,"concrete2"));
n.push(P_(BOXM(.46*r,.46*r,.16*r,.4),0,0,z2+.06*r,"armor2"));
ribs(n,0,0,z2+.06*r,.23*r,.16*r,3,"darkmetal");
for(const cc of CORNERS)n.push(P_(CYL(.06*r,.24*r,10),cc[0]*.3*r,cc[1]*.3*r,z2,"concrete2"));
}
const z3=z2+.06*r+.16*r;
if(riseBucket>=3){
n.push(P_(CYL(.13*r,.46*r,16),0,0,z3,"darkmetal"));
for(const cc of CORNERS)n.push(P_(CYL(.08*r,.05*r,10),cc[0]*.3*r,cc[1]*.3*r,z2+.24*r,"armor2"));
}
if(riseBucket>=4){
n.push(P_(CYL(.09*r,.06*r,14),0,0,z3+.46*r,"rust"));
for(const cc of CORNERS)n.push(P_(CYL(.02*r,.05*r,8),cc[0]*.3*r,cc[1]*.3*r,z2+.29*r,"red",{e:1,a:{spin:1.4}}));
}
}else{
if(riseBucket>=1){
n.push(P_(TSLAB(circleProfile(.32*r,10),.08*s,.92,"cyfound"),0,0,l,"carapace2"));
}
if(riseBucket>=2){
hive(n,{x:0,y:0,z:l,r:.3*r,h:1.05*s,crown:.17*r,seg:10,spines:1,pods:5,crest:!0,vein:"psi"});
}
if(riseBucket>=3){
for(const cc of[[-1,-1],[1,1],[-1,1]])hive(n,{x:cc[0]*.32*r,y:cc[1]*.3*r,z:l,r:.09*r,h:.3*s,crown:.05*r,seg:7,crest:!1,vein:"psi"});
}
if(riseBucket>=4){
veins(n,0,0,l+2,.32*r,.4*s,10,"psi");
}
}
crane(n,.4*r,-.34*r,l,.55*r,.44*r,"gunmetal");
containerBox(n,.36*r,-.42*r,l,6,2.8,2.6,"rust",.15);
containerBox(n,.44*r,-.36*r,l,6,2.8,2.6,"olive",.15);
containerBox(n,.4*r,-.4*r,l+2.6,6,2.8,2.6,"body",.15);
crate(n,-.4*r,.34*r,l,4.2,"olive",.2);
crate(n,-.44*r,.4*r,l,3.8,"rust",-.25);
hazard(n,.3*r,.05*r,4,.36*r,0);
railPosts(n,.85*r,.85*r,l+1.2,2);
break;}
case"power":{
n.push(P_(SLAB(roundRectProfile(.88*r,.88*r,3,3),1.1,.5,"pwpad"),0,0,l,"asphalt"));
if(a){
if(riseBucket>=1){
n.push(P_(BOXM(.22*r,.18*r,.1*r,.25),0,0,l,"armor"));
railPosts(n,.24*r,.2*r,l+.1*r,1.6);
}
if(riseBucket>=2){
windows(n,.18*r,.14*r,l+.04*r,.05*r,2);
n.push(P_(CYL(.035*r,.16*r,10),0,0,l+.1*r,"steel"));
}
if(riseBucket>=3){
solarPanels(n,0,.22*r,l+.02*r,.5*r,.34*r);
}
if(riseBucket>=4){
n.push(P_(CYL(.025*r,.03*r,8),0,0,l+.26*r,"glow",{e:1}));
}
}else if(o){
if(riseBucket>=1){
n.push(P_(BOXM(.24*r,.18*r,.1*r,.3),0,0,l,"concrete"));
}
if(riseBucket>=2){
n.push(P_(BOXM(.1*r,.09*r,.07*r,.2),0,0,l+.1*r,"rust"));
pipeRun(n,-.16*r,-.06*r,.16*r,-.06*r,l+.08*r,1.3,"rust");
}
if(riseBucket>=3){
for(const e of[-1,1])coolTower(n,e*r*.22,.2*r,l,.1*r,.32*r,"concrete2");
}
if(riseBucket>=4){
for(const e of[-1,1])n.push(P_(CYL(.025*r,.04*r,8),e*r*.22,.2*r,l+.38*r,"glow",{e:1}));
}
}else{
if(riseBucket>=1){
n.push(P_(CYL(.11*r,.09*r,12),0,0,l,"carapace"));
}
if(riseBucket>=2){
n.push(P_(DOME(.12*r,.1*r,12),0,0,l+.09*r,"psi",{e:1,a:{spin:.5}}));
}
if(riseBucket>=3){
for(let e=0;e<4;e++){
const t=e*1.57+.4;
n.push(P_(CYL(.09*r,.14*r,12),Math.cos(t)*r*.24,Math.sin(t)*r*.24,l,"carapace2"));
n.push(P_(DOME(.09*r,.07*r,10),Math.cos(t)*r*.24,Math.sin(t)*r*.24,l+.14*r,"psi",{e:1,a:{spin:.65}}));
}
}
if(riseBucket>=4){
veins(n,0,0,l+2,.24*r,.16*r,8,"psi");
}
}
crate(n,.3*r,.3*r,l,4,"olive",.2);
hazard(n,.15*r,.35*r,3.5,.25*r,0);
break;}
case"refinery":{
n.push(P_(SLAB(roundRectProfile(.9*r,.9*r,3,3),1.1,.5,"rfpad"),0,0,l,"asphalt"));
if(a){
if(riseBucket>=1){
tier(n,.44*r,.34*r,.32*s,0,0,l,"armor","rfv1",.95);
}
const bz=l+.32*s;
if(riseBucket>=2){
windows(n,.4*r,.3*r,l+.13*s,.11*s,2);
n.push(P_(BOXM(.1*r,.08*r,.3,.15),0,-.19*r,bz,"darkmetal"));
n.push(P_(BOXM(.09*r,.07*r,.25,.12),0,-.19*r,bz+.3,"crystal",{e:1,ty:.28}));
}
if(riseBucket>=3){
silo(n,.28*r,-.3*r,l,.08*r,.3*r,"steel");
silo(n,.38*r,-.22*r,l,.07*r,.26*r,"steel");
drum(n,.24*r,.3*r,l+.08*r,.1*r,.12*r,"steel",1.5);
}
if(riseBucket>=4){
n.push(P_(CYL(1.8,2.8,12),.34*r,.18*r,l+.12*r,"steel",{a:{spin:2}}));
n.push(P_(CYL(1.8,2.8,12),.34*r,.28*r,l+.12*r,"crystal",{a:{spin:1.8}}));
}
}else if(o){
if(riseBucket>=1){
tier(n,.46*r,.36*r,.34*s,0,0,l,"concrete","rfl1",.96);
}
const bz=l+.34*s;
if(riseBucket>=2){
windows(n,.42*r,.32*r,l+.12*s,.09*s,2,"glassdark");
stack(n,0,-.2*r,bz,.03*r,.13*r,"rust");
}
if(riseBucket>=3){
silo(n,.28*r,-.3*r,l,.085*r,.32*r,"rust");
silo(n,.39*r,-.22*r,l,.075*r,.28*r,"rust");
drum(n,.22*r,.3*r,l+.08*r,.1*r,.13*r,"rust",1.4);
pipeRun(n,-.12*r,.16*r,.14*r,.16*r,l+.1*r,1.4,"rust");
}
if(riseBucket>=4){
n.push(P_(CYL(1.9,2.8,12),.34*r,.18*r,l+.12*r,"rust",{a:{spin:1.9}}));
n.push(P_(CYL(1.9,2.8,12),.34*r,.28*r,l+.12*r,"darkmetal",{a:{spin:1.7}}));
}
}else{
if(riseBucket>=1){
n.push(P_(TSLAB(circleProfile(.18*r,8),.08*s,.9,"rffound"),0,0,l,"carapace2"));
}
if(riseBucket>=2){
hive(n,{x:0,y:0,z:l,r:.16*r,h:.9*s,crown:.06*r,seg:8,pods:2,crest:!0,vein:"psi"});
}
if(riseBucket>=3){
for(let e=0;e<2;e++){
n.push(P_(CYL(.08*r,.2*r,12),.26*r+e*r*.12,.3*r,l,"carapace"));
n.push(P_(DOME(.08*r,.06*r,10),.26*r+e*r*.12,.3*r,l+.2*r,"psi",{e:1,a:{spin:1.1}}));
}
}
if(riseBucket>=4){
n.push(P_(CYL(2,2.5,12),.34*r,.18*r,l+.1*r,"psi",{e:1,a:{spin:1.6}}));
n.push(P_(CYL(1.6,2.2,10),.34*r,.28*r,l+.1*r,"carapace2",{a:{spin:1.4}}));
}
}
hazard(n,-.28*r,0,4,.2*r,0);
crate(n,-.34*r,.16*r,l,4.5,"olive",.2);
barrel(n,-.38*r,-.14*r,l);
break;}
case"hive":{
const hl=1.02*r,hw=.46*r,hh=.3*s;
n.push(P_(SLAB(roundRectProfile(.58*r,.42*r,3,3),1,.4,"hvpad"),0,0,l,"asphalt"));
const hprof=[[-.48,.2],[-.32,.6],[-.1,.9],[.12,.9],[.32,.58],[.48,.18]];
for(let i=0;i<hprof.length-1;i++){const x0=hprof[i][0]*hl,r0=hprof[i][1],x1=hprof[i+1][0]*hl,r1=hprof[i+1][1],cx=(x0+x1)/2,rm=(r0+r1)/2;
n.push(P_(BOXM(x1-x0+.5,rm*2*hw,rm*hh,.16*rm*hh),cx,0,l+.5*rm*hh,"carapace2"))}
n.push(P_(BOXM(.62*hl,.42*hw,.1*hh,.04*hh),.02*hl,0,l+.9*hh,"gunmetal"));
for(const side of[-1,1])for(let i=0;i<2;i++)n.push(P_(CYL(.075*r,.1*r,10),(-.28+.5*i)*hl,side*.56*hw,l+.075*r,"darkmetal",{r:1.5708}));
for(let i=0;i<5;i++){const sx=(-.36+.18*i)*hl;n.push(P_(CONE(.06*r,.015*r,.16*r,6),sx,0,l+.85*hh,"carapace2"))}
veins(n,.02*hl,0,l+.55*hh,.16*hl,.22*hh,8,"psi");
if(d){
n.push(P_(WEDGE(.4*r,.24*r,0,.9*hh),-.72*r,0,l,"darkmetal"));
n.push(P_(BOXM(.4*r,.018*r,.018*r,.007),-.72*r,-.11*r,l+.01,"gunmetal"));
n.push(P_(BOXM(.4*r,.018*r,.018*r,.007),-.72*r,.11*r,l+.01,"gunmetal"));
for(const sx of[-1,1])n.push(P_(DOME(.15*r,.14*r,12),sx*.2*hl,0,l+.9*hh,"crystal",{e:1}));
n.push(P_(CONE(.7,.12,2,7),.04*hl,0,l+.9*hh+.14*r+.7,"psi",{e:1}));
n.push(P_(DOME(.09*r,.08*r,10),0,0,l+.9*hh+.02*r,"psi",{e:1,a:{spin:.6}}));
}else{
for(const sx of[-1,1])n.push(P_(DOME(.12*r,.1*r,10),sx*.18*hl,0,l+.9*hh,"carapace2"));
n.push(P_(CONE(.4,.08,1,6),.04*hl,0,l+.9*hh+.1*r,"psi",{e:1,ty:.1}));
}
crate(n,-.1*r,.32*r,l,3.6,"carapace2",.18);
break;}
case"barracks":{
n.push(P_(SLAB(roundRectProfile(.88*r,.88*r,3,3),1.1,.5,"bkpad"),0,0,l,"asphalt"));
if(a){
if(riseBucket>=1){
tier(n,.5*r,.36*r,.42*s,0,0,l,"armor","bav1",.94);
}
const bz=l+.42*s;
if(riseBucket>=2){
windows(n,.46*r,.32*r,l+.16*s,.13*s,3);
railPosts(n,.5*r,.36*r,bz,2);
}
if(riseBucket>=3){
n.push(P_(BOXM(.1*r,.08*r,.28,.12),0,-.2*r,bz,"darkmetal"));
n.push(P_(BOXM(.09*r,.07*r,.22,.1),0,-.2*r,bz+.28,"crystal",{e:1,ty:.28}));
}
if(riseBucket>=4){
n.push(P_(CYL(.02*r,.16*r,8),.22*r,-.16*r,bz,"steel"));
n.push(P_(BOXM(.11*r,.02*r,.08*r,.1),.22*r,-.16*r,bz+.15*r,"glow",{e:1}));
}
}else if(o){
if(riseBucket>=1){
tier(n,.54*r,.4*r,.44*s,0,0,l,"concrete","bol1",.95);
}
const bz=l+.44*s;
if(riseBucket>=2){
windows(n,.5*r,.36*r,l+.15*s,.12*s,3,"glassdark");
}
if(riseBucket>=3){
sandbagRing(n,.34*r,l);
n.push(P_(CYL(.035*r,.1*r,8),.18*r,-.16*r,bz,"rust"));
}
if(riseBucket>=4){
n.push(P_(CYL(.03*r,.04*r,8),.18*r,-.16*r,bz+.1*r,"red",{e:1,a:{spin:1}}));
}
}else{
if(riseBucket>=1){
n.push(P_(TSLAB(circleProfile(.24*r,9),.06*s,.9,"bkfound"),0,0,l,"carapace2"));
}
if(riseBucket>=2){
hive(n,{x:0,y:0,z:l,r:.22*r,h:.7*s,crown:.09*r,seg:9,spines:1,vein:"psi"});
}
if(riseBucket>=3){
for(const cc of[[-1,0],[1,0]])hive(n,{x:cc[0]*.3*r,y:.02*r,z:l,r:.07*r,h:.22*s,crown:.04*r,seg:6,crest:!1,vein:"psi"});
}
if(riseBucket>=4){
veins(n,0,0,l+2,.22*r,.24*s,9,"psi");
}
}
n.push(P_(BOXM(2,1.8,1.5,.35),.3*r,.32*r,l+1.1,"darkmetal"));
n.push(P_(BOXM(.26*r,1.2,1.2,.3),.3*r,.32*r,l+1.1+1.5,"steel"));
hazard(n,.28*r,.32*r,3.5,.2*r,0);
crate(n,-.3*r,.3*r,l,4,"olive",.25);
crate(n,-.36*r,.24*r,l,3.5,"rust",-.2);
n.push(P_(CYL(1.1,2.2,10),-.3*r,-.28*r,l,"gunmetal",{a:{spin:1}}));
n.push(P_(CYL(.55,.9,8),-.3*r,-.28*r,l+2.2,"glow",{e:1,a:{spin:1}}));
{const yx=.28*r,yy=-.28*r,mr=.12*r,mcol=a?"body":o?"olive":"carapace2";
for(let mi=0;mi<4;mi++){
const mang=1.5708*mi,mx=yx+Math.cos(mang)*mr,my=yy+Math.sin(mang)*mr;
n.push(P_(BOXM(.9,.6,1.6,.15),mx,my,l+.9,mcol,{a:{orbit:.7,pvx:yx,pvy:yy}}));
n.push(P_(DOME(.5,.45,6),mx,my,l+1.85,"skin",{a:{orbit:.7,pvx:yx,pvy:yy}}));
}}
break;}
case"factory":{
const CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]];
n.push(P_(SLAB(roundRectProfile(.9*r,.9*r,3,3),1.1,.5,"fcpad"),0,0,l,"asphalt"));
if(a){
if(riseBucket>=1){
tier(n,.6*r,.42*r,.24*s,0,0,l,"armor","fav1",.95);
railPosts(n,.6*r,.42*r,l+.24*s,2.2);
}
const z2=l+.24*s;
if(riseBucket>=2){
n.push(P_(BOXM(.56*r,.38*r,.06*r,.3),0,0,z2,"armor3"));
windows(n,.54*r,.34*r,l+.11*s,.11*s,5);
n.push(P_(BOXM(.26*r,.02*r,.15*r,.15),0,-.21*r,l+.01*r,"black"));
}
if(riseBucket>=3){
n.push(P_(BOXM(.24*r,.015*r,.02*r,.1),0,-.215*r,l+.09*r,"glow",{e:1}));
for(let e=0;e<2;e++)fan(n,-.2*r+e*.4*r,0,z2+.06*r,3.4,4,"gunmetal",2.2);
n.push(P_(BOXM(.1*r,.08*r,.25,.12),.26*r,.16*r,z2,"darkmetal"));
n.push(P_(BOXM(.09*r,.07*r,.2,.1),.26*r,.16*r,z2+.25,"crystal",{e:1,ty:.25}));
}
if(riseBucket>=4){
n.push(P_(CYL(.02*r,.14*r,10),.28*r,-.16*r,z2+.06*r,"darkmetal"));
n.push(P_(CYL(.04*r,.05*r,8),.28*r,-.16*r,z2+.2*r,"glow",{e:1,a:{spin:.6}}));
}
}else if(o){
if(riseBucket>=1){
tier(n,.62*r,.44*r,.26*s,0,0,l,"concrete","fol1",.96);
}
const z2=l+.26*s;
if(riseBucket>=2){
n.push(P_(BOXM(.58*r,.4*r,.08*r,.3),0,0,z2,"concrete2"));
windows(n,.56*r,.36*r,l+.12*s,.1*s,5,"glassdark");
n.push(P_(BOXM(.28*r,.02*r,.16*r,.2),0,-.22*r,l+.01*r,"rust"));
}
if(riseBucket>=3){
for(const cc of CORNERS)n.push(P_(CYL(.03*r,.26*s,10),cc[0]*.26*r,cc[1]*.18*r,z2,"darkmetal"));
for(const e of[-1,1])stack(n,e*.24*r,.24*r,z2+.08*r,.035*r,.16*r,"rust");
}
if(riseBucket>=4){
n.push(P_(CYL(.03*r,.14*r,10),0,0,z2+.08*r,"darkmetal"));
n.push(P_(CYL(.05*r,.05*r,8),0,0,z2+.08*r+.14*r,"red",{e:1,a:{spin:1}}));
}
}else{
if(riseBucket>=1){
n.push(P_(TSLAB(circleProfile(.3*r,10),.07*s,.92,"fyfound"),0,0,l,"carapace2"));
}
if(riseBucket>=2){
hive(n,{x:0,y:0,z:l,r:.28*r,h:.85*s,crown:.1*r,seg:9,pods:4,crest:!1,vein:"psi"});
}
if(riseBucket>=3){
n.push(P_(CYL(1.8,2.6,10),0,0,l+.5*s,"psi",{e:1,a:{spin:1.2}}));
for(const cc of[[-1,0],[1,0]])hive(n,{x:cc[0]*.34*r,y:.04*r,z:l,r:.08*r,h:.28*s,crown:.045*r,seg:6,crest:!1,vein:"psi"});
}
if(riseBucket>=4){
veins(n,0,0,l+2,.28*r,.32*s,9,"psi");
}
}
gantry(n,.18*r,.3*r,l,.38*r,.22*r,0);
for(let e=0;e<4;e++)n.push(P_(CYL(1.6,2.5,12),.05*r+e*r*.09,.36*r,l+1.5,"steel",{a:{spin:1.5+.15*e}}));
hazard(n,.2*r,.3*r,4.2,.35*r,0);
crate(n,-.34*r,.28*r,l,5,"olive",-.2);
containerBox(n,-.36*r,.36*r,l,5.5,2.8,2.5,"rust",.25);
barrel(n,-.1*r,.4*r,l);
break;}
case"lab":if(a){
if(riseBucket>=1){tier(n,.66*r,.66*r,s,0,0,l,"armor","lbv1",.94),windows(n,.62*r,.62*r,l+.34*s,.32*s,4),railPosts(n,.64*r,.64*r,c,2.4)}
if(riseBucket>=2){n.push(P_(CYL(.3*r,.26*r,22),0,0,c,"body")),n.push(P_(CYL(.33*r,1.8,22),0,0,c,"armor3"))}
if(riseBucket>=3){for(let e=0;e<6;e++){const t=1.047*e;n.push(P_(BOXM(3.4,1.6,2.2,.4),Math.cos(t)*r*.31,Math.sin(t)*r*.31,c+1.8,"crystal",{r:t,e:1}))}dish(n,.24*r,.24*-r,c,8),acUnit(n,.24*-r,.24*r,c,8,7,.6)}
if(riseBucket>=4){n.push(P_(DOME(.3*r,.22*r,22),0,0,c+.26*r,"glass",{e:1})),lattice(n,.27*-r,.27*-r,c,.26*r,1.9,"steel")}
}else if(o){
if(riseBucket>=1){tier(n,.7*r,.7*r,s,0,0,l,"concrete","lbl1",.94),windows(n,.66*r,.66*r,l+.34*s,.3*s,4,"glassdark"),railPosts(n,.72*r,.72*r,c+3.2,2.6)}
if(riseBucket>=2){n.push(P_(SLAB(roundRectProfile(.76*r,.76*r,4,3),3.2,.88,"lblr"),0,0,c,"concrete2")),n.push(P_(CYL(.26*r,.3*r,20),0,0,c+3.2,"armor2")),ribs(n,0,0,c+3.2,.26*r,.3*r,3,"darkmetal")}
if(riseBucket>=3){for(let e=0;e<4;e++){const t=e*PI2+.78;n.push(P_(CYL(1.4,.16*r,10),Math.cos(t)*r*.24,Math.sin(t)*r*.24,c+3.2+.3*r,"steel"))}stack(n,.28*-r,.28*r,c+3.2,3.8,.16*r,"rust"),stairs(n,.26*r,.38*-r,l,s,0)}
if(riseBucket>=4){n.push(P_(DOME(.26*r,.2*r,20),0,0,c+3.2+.3*r,"armor3"));for(let e=0;e<4;e++){const t=e*PI2+.78;n.push(P_(CYL(1.9,1.3,10),Math.cos(t)*r*.24,Math.sin(t)*r*.24,c+3.2+.46*r,"tesla",{e:1}))}}
}else{
if(riseBucket>=1){hive(n,{x:0,y:0,z:l,r:.32*r,h:1.15*s,crown:.18*r,seg:6,spines:1,crest:!0,vein:"crystal"})}
if(riseBucket>=3){for(let e=0;e<3;e++){const t=2.09*e+.5;n.push(P_(CONE(2.2,.4,.4*r,6),Math.cos(t)*r*.24,Math.sin(t)*r*.24,l+1.2*s,"carapace2",{ty:.24,r:t}))}}
}break;case"airfield":{
n.push(P_(SLAB(roundRectProfile(.88*r,.88*r,5,3),1.4,.45,"afp"),0,0,2.6,"asphalt"));
if(riseBucket>=1){
for(let e=0;e<20;e++){const t=e/20*Math.PI*2;n.push(P_(BOXM(4.8,1.4,.35,.12),Math.cos(t)*r*.26,Math.sin(t)*r*.26,4,"white",{r:t+PI2}))}
hazard(n,0,-.38*r,4,.4*r,0);
}
if(riseBucket>=2){
for(let e=0;e<4;e++){const t=e*PI2+.78;n.push(P_(CYL(1.1,1.4,12),Math.cos(t)*r*.34,Math.sin(t)*r*.34,4,"glow",{e:1,a:{spin:.9}}))}
}
const tw=.24*r,td=.22*r,th=.4*r,tcx=-.35*r,tcy=.35*r;
if(a){
if(riseBucket>=3){
tier(n,tw,td,th,tcx,tcy,2.6,"armor","afv1",.94);
railPosts(n,tw,td,2.6+th,1.6);
}
if(riseBucket>=4){
n.push(P_(CYL(.05*r,.18*r,12),tcx,tcy,2.6+th,"steel"));
n.push(P_(SLAB(roundRectProfile(.13*r,.13*r,2,3),.08*r,.75,"afvc"),tcx,tcy,2.6+th+.18*r,"glass",{e:1}));
dish(n,tcx,tcy,2.6+th+.1*r,.07*r);
}
}else if(o){
if(riseBucket>=3){
tier(n,tw,td,th*.9,tcx,tcy,2.6,"concrete","afl1",.94);
}
if(riseBucket>=4){
n.push(P_(SLAB(roundRectProfile(tw*1.1,td*1.1,3,3),2,.65,"aflr"),tcx,tcy,2.6+th*.9,"concrete2"));
dish(n,tcx,tcy,2.6+th*.9,.065*r);
}
}else{
if(riseBucket>=3){
n.push(P_(CYL(.11*r,.16*r,14),tcx,tcy,2.6,"carapace2"));
}
if(riseBucket>=4){
n.push(P_(DOME(.15*r,.13*r,14),tcx,tcy,2.6+.16*r,"carapace"));
n.push(P_(DOME(.09*r,.11*r,12),tcx,tcy,2.6+.32*r,"psi",{e:1,a:{spin:1}}));
}
}
barrel(n,.32*r,-.32*r,2.6,"rust");
barrel(n,-.15*r,-.38*r,2.6,"olive");
crate(n,.28*r,.28*r,2.6,4,"olive",.2);
containerBox(n,.25*r,-.25*r,2.6,5.5,2.8,2.4,"body",.15);
break;}
case"def1":def1Bits(n,a?"allied":o?"soviet":"yuri",0,0,l,r,"",!0);break;case"aa":aaBits(n,a?"allied":o?"soviet":"yuri",0,0,l,r,"",!0);break;case"def2":if(a){tier(n,.52*r,.52*r,.24*r,0,0,l,"armor","d2v",.9),n.push(P_(CYL(.2*r,.34*r,18),0,0,l+.24*r,"armor3")),ribs(n,0,0,l+.24*r,.2*r,.34*r,3,"darkmetal"),windows(n,.19*r,.19*r,l+.3*r,.1*r,2,"glass"),railPosts(n,.5*r,.5*r,l+.6*r,1.6),n.push(P_(CONE(.17*r,.06*r,.36*r,14),0,0,l+.58*r,"crystal",{e:1}));for(let e=0;e<3;e++){const t=2.09*e;n.push(P_(CYL(1.3,.26*r,8),Math.cos(t)*r*.17,Math.sin(t)*r*.17,l+.28*r,"steel"))}}else if(o){tier(n,.58*r,.58*r,.26*r,0,0,l,"concrete","d2l",.9),n.push(P_(CYL(.16*r,.46*r,16),0,0,l+.26*r,"armor2")),hazard(n,0,.56*-r,l+.4,.66*r,0);for(let e=0;e<4;e++)n.push(P_(CYL(.2*r,1.9,16),0,0,l+.32*r+e*r*.11,"rust"));n.push(P_(CYL(.23*r,3.4,16),0,0,l+.72*r,"darkmetal"));for(let e=0;e<4;e++){const t=e*PI2+.78;n.push(P_(CYL(1.4,.2*r,8),5*Math.cos(t),5*Math.sin(t),l+.76*r,"steel"))}n.push(P_(DOME(4.6,4,14),0,0,l+.9*r,"glow",{e:1})),ladder(n,.17*r,0,l+.26*r,.46*r,0)}else{n.push(P_(CONE(.34*r,.18*r,.28*r,18),0,0,l,"carapace")),n.push(P_(CYL(.13*r,.38*r,14),0,0,l+.28*r,"carapace2")),veins(n,0,0,l+.32*r,.15*r,.2*r,8,"psi"),n.push(P_(DOME(.16*r,.18*r,16),0,0,l+.66*r,"psi",{e:1}));for(let e=0;e<6;e++){const t=1.047*e;spine(n,Math.cos(t)*r*.23,Math.sin(t)*r*.23,7.6,.3*r,.6,"carapace2")}}break;case"silo":{const e=.3*r;if(a){for(const t of[-1,1])silo(n,t*r*.2,0,l,.62*e,.5*r,"steel");pipeRun(n,.2*-r,0,.2*r,0,l+.34*r,1.6,"steel")}else o?(silo(n,0,0,l,.86*e,.52*r,"rust"),n.push(P_(BOXM(.3*r,.16*r,.16*r,1.2),.3*-r,.24*r,l,"concrete2")),ladder(n,.86*e,0,l,.52*r,0)):(n.push(P_(TSLAB(circleProfile(.9*e,7),.34*r,.8,"ysl"),0,0,l,"carapace2")),n.push(P_(DOME(.78*e,.3*r,7),0,0,l+.34*r,"carapace")),veins(n,0,0,6.6,.86*e,.26*r,7,"psi"));n.push(P_(BOXM(.36*r,.24*r,3.2,.8),.22*r,.24*-r,l,"darkmetal")),hazard(n,.22*r,.24*-r,l+3.2,.3*r,0);break}case"repair":{n.push(P_(SLAB(roundRectProfile(.86*r,.86*r,4,3),1.8,.6,"rpp"),0,0,l,"asphalt"));for(let e=0;e<20;e++){const t=e/20*Math.PI*2;n.push(P_(BOXM(4,1.4,.4,.12),Math.cos(t)*r*.3,Math.sin(t)*r*.3,5.5,"gold",{r:t+PI2}))}if(a||o){const e=a?"armor":"concrete";for(const t of[-1,1])n.push(P_(BOXM(.14*r,.14*r,.34*r,1.6),t*r*.34,.3*-r,l,e)),n.push(P_(BOXM(.14*r,.14*r,.34*r,1.6),t*r*.34,.3*r,l,e))}else for(const t of[-1,1])for(const u of[-1,1])hive(n,{x:t*r*.34,y:u*.3*r,z:l,r:.07*r,h:.3*r,crown:.045*r,seg:6,crest:!1,vein:"psi"});n.push(P_(BOXM(.8*r,.1*r,.09*r,1),0,.3*-r,l+.34*r,"steel")),n.push(P_(BOXM(.8*r,.1*r,.09*r,1),0,.3*r,l+.34*r,"steel")),n.push(P_(CYL(.06*r,.06*r,14),0,0,l+.38*r,"darkmetal")),n.push(P_(BOXM(.52*r,.09*r,.07*r,.9),.14*r,0,l+.42*r,"steel")),n.push(P_(BOXM(.1*r,.14*r,.12*r,.7),.36*r,0,l+.34*r,"gold")),n.push(P_(CYL(1.4,1.4,10),.36*r,0,l+.3*r,"glow",{e:1})),crate(n,.3*-r,.28*r,l,6.5,"olive",.3),barrel(n,.3*r,.3*r,l);break}case"super":if(a){tier(n,.62*r,.62*r,.9*s,0,0,l,"armor","swv",.93),windows(n,.58*r,.58*r,l+.34*s,.28*s,4),railPosts(n,.6*r,.6*r,l+.9*s,2.6),n.push(P_(CYL(.2*r,.34*r,18),0,0,l+.9*s,"armor3")),ribs(n,0,0,l+.9*s,.2*r,.34*r,4,"darkmetal");for(let e=0;e<6;e++){const t=1.047*e;n.push(P_(CYL(1.6,.46*r,8),Math.cos(t)*r*.2,Math.sin(t)*r*.2,l+.9*s,"steel")),n.push(P_(CYL(2,2,10),Math.cos(t)*r*.2,Math.sin(t)*r*.2,l+.9*s+.46*r,"crystal",{e:1}))}n.push(P_(CONE(.15*r,.05*r,.3*r,14),0,0,l+.9*s+.34*r,"crystal",{e:1,a:{spin:1.5}})),n.push(P_(DOME(.09*r,.11*r,12),0,0,l+.9*s+.64*r,"glass",{e:1})),lattice(n,.34*-r,.32*r,l,.34*r,2.2,"steel")}else if(o){tier(n,.9*r,.9*r,.62*s,0,0,l,"concrete","swl",.95),railPosts(n,.86*r,.86*r,l+.62*s,2.8),n.push(P_(CYL(.26*r,2.4,20),0,0,l+.62*s,"darkmetal")),n.push(P_(CYL(.22*r,3,20),0,0,l+.62*s-3,"black"));for(const e of[-1,1])n.push(P_(SLAB(roundRectProfile(.3*r,.16*r,2,2),2.2,.6,"swd"),e*r*.26,0,l+.62*s+1,"armor2",{ty:d?.9*e:.15*e}));if(d){n.push(P_(CYL(.115*r,.52*r,14),0,0,l+.62*s,"white")),n.push(P_(CONE(.115*r,.02*r,.2*r,14),0,0,l+.62*s+.52*r,"red"));for(let e=0;e<4;e++){const t=e*PI2+.78;n.push(P_(BOXM(.1*r,1.6,.14*r,.4),Math.cos(t)*r*.1,Math.sin(t)*r*.1,l+.62*s+.04*r,"red",{r:t}))}}for(const e of[-1,1])stack(n,e*r*.36,.34*-r,l+.62*s,3.6,.2*r,"rust");gantry(n,0,.34*r,l,.56*r,.3*r,0),sandbagRing(n,.5*r,l)}else{hive(n,{x:0,y:0,z:l,r:.34*r,h:.86*s,crown:.14*r,seg:8,spines:1,pods:4,crest:!1});const riseZ=d?.26*s:0,dg=d?{spin:.6,bob:1.3}:null,gz=l+1.02*s+riseZ,orbR=.26*r,mz0=l+.32*s,mastH=gz-mz0;n.push(P_(CYL(.08*r,mastH,10),0,0,mz0+mastH/2,"darkmetal")),n.push(P_(CYL(.14*r,.1*r,12),0,0,gz-.06*r,"armor2")),n.push(P_(DOME(orbR,orbR,18),0,0,gz,"psi",Object.assign({e:1},dg?{a:dg}:{}))),n.push(P_(CYL(1.35*orbR,.16*orbR,20),0,0,gz+.15*orbR,"crystal",Object.assign({e:1},dg?{a:{spin:1.8*-dg.spin}}:{})));for(let e=0;e<6;e++){const t=1.047*e;n.push(P_(CONE(2.2,.4,.34*r,6),Math.cos(t)*r*.16,Math.sin(t)*r*.16,l+1.02*s+.2*r+.3*riseZ,"crystal",d?{r:t,ty:.42,e:1,a:{spin:-1}}:{r:t,ty:.42,e:1}))}}
railPosts(n,.94*r,.94*r,l+1.2,2.4);
break;case"civ1":tier(n,.78*r,.72*r,.34*r,0,0,l,"neutral","cv1",.96),n.push(P_(SLAB(roundRectProfile(.86*r,.8*r,3,3),2.8,.8,"cv1r"),0,0,l+.34*r,"rust")),windows(n,.74*r,.68*r,l+.12*r,.1*r,3,"glassdark"),roofFarm(n,.6*r,.56*r,l+.34*r+2.8,71),n.push(P_(CYL(3,.16*r,14),.24*r,0,l+.34*r+2.8,"rust"));break;case"civ2":tier(n,.64*r,.64*r,.52*r,0,0,l,"neutral","cv2",.94),n.push(P_(SLAB(roundRectProfile(.72*r,.72*r,3,3),2.8,.8,"cv2r"),0,0,l+.52*r,"concrete2")),windows(n,.6*r,.6*r,l+.12*r,.1*r,3,"glassdark"),windows(n,.6*r,.6*r,l+.34*r,.1*r,3,"glassdark"),roofFarm(n,.46*r,.46*r,l+.52*r+2.8,81),n.push(P_(CYL(1.4,.12*r,10),.22*r,.22*-r,l+.52*r+2.8,"darkmetal"));break;case"navalyard":{
n.push(P_(SLAB(roundRectProfile(.88*r,.6*r,4,3),1.6,.6,"nydk"),0,-.1*r,l,"asphalt"));
if(a){
if(riseBucket>=1){
n.push(P_(BOXM(.24*r,.22*r,.46*r,1.2),-.16*r,-.06*r,l,"armor"));
n.push(P_(BOXM(.12*r,.14*r,.2*r,.8),-.02*r,.08*r,l,"armor2"));
}
if(riseBucket>=2){
n.push(P_(BOXM(.2*r,.19*r,.12*r,.6),-.16*r,-.06*r,l+.46*r,"armor3"));
windows(n,.19*r,.18*r,l+.46*r+.02*r,.055*r,2,"glass");
}
if(riseBucket>=3){
crane(n,.16*r,.02*r,l,.42*r,.34*r,"steel");
}
if(riseBucket>=4){
dish(n,-.16*r,-.24*r,l+.58*r+.06*r,.045*r);
}
}else if(o){
if(riseBucket>=1){
n.push(P_(BOXM(.44*r,.36*r,.2*r,1.4),-.14*r,-.04*r,l,"concrete"));
}
if(riseBucket>=2){
n.push(P_(BOXM(.38*r,.3*r,.05*r,1),-.14*r,-.04*r,l+.2*r,"concrete2"));
stack(n,-.32*r,-.22*r,l,.028*r,.18*r,"rust");
stack(n,-.32*r,.02*r,l,.026*r,.14*r,"rust");
}
if(riseBucket>=3){
crane(n,.16*r,-.02*r,l,.38*r,.3*r,"gunmetal");
}
if(riseBucket>=4){
n.push(P_(CYL(.03*r,1.4,8),-.32*r,-.22*r,l+.18*r+.7,"glow",{e:1,a:{spin:.8}}));
pipeRun(n,-.14*r,-.04*r,-.32*r,-.04*r,l+.02*r,.018*r,"rust");
}
}else{
if(riseBucket>=1){
n.push(P_(TSLAB(circleProfile(.22*r,8),.4*r,.84,"nyv1"),-.16*r,-.06*r,l,"carapace2"));
n.push(P_(DOME(.19*r,.16*r,10),-.16*r,-.06*r,l+.4*r,"carapace"));
}
if(riseBucket>=2){
n.push(P_(DOME(.1*r,.09*r,8),-.02*r,.08*r,l+.12*r,"carapace2"));
veins(n,-.16*r,-.06*r,l+.15*r,.16*r,.19*r,6,"psi");
}
if(riseBucket>=3){
bioArm(n,.12*r,0,l,.38*r,.2*r,"carapace2");
}
if(riseBucket>=4){
n.push(P_(DOME(.055*r,.05*r,10),-.16*r,-.06*r,l+.4*r+.16*r,"psi",{e:1,a:{spin:.6}}));
}
}
n.push(P_(CYL(.07*r,.24*r,10),.3*-r,.22*-r,l,o?"rust":"steel")),n.push(P_(CYL(.07*r,.24*r,10),.3*-r,.22*r,l,o?"rust":"steel")),n.push(P_(BOXM(.24*r,.9*r,.05*r,.3),.02*r,.02*r,l+.02*r,"wood"));
break;}case"civ4":for(const p of towerModel(1))n.push(p);break;case"civ5":for(const p of towerModel(2))n.push(p);break;case"civ3":for(const p of towerModel(3))n.push(p)}return detailPass(n,e,t,r),n}function BTURRET_(e,t,r){const n="allied"===t,a="soviet"===t;if("def1"===e){const e=[];return n?(e.push(P_(CYL(5.6,4.5,12),0,0,14.6,"armor")),e.push(P_(SLAB(hexProfile(11,9),5,1.6,"d1vt"),0,0,19.1,"body")),e.push(P_(CYL(1.5,15,9),5,0,21.6,"gunmetal",{ty:PI2})),e.push(P_(CYL(2,3.5,9),17,0,21.6,"steel",{ty:PI2}))):a?(e.push(P_(CYL(6.4,5,10),0,0,11.6,"armor2")),e.push(P_(SLAB(roundRectProfile(12,10,2,2),5.5,1.5,"d1lt"),0,0,16.6,"body")),e.push(P_(CYL(1.8,13,8),5,-2.2,19.1,"gunmetal",{ty:PI2})),e.push(P_(CYL(1.8,13,8),5,2.2,19.1,"gunmetal",{ty:PI2}))):(e.push(P_(DOME(6.5,5,12),0,0,9.6,"carapace")),e.push(P_(CONE(4,1.6,9,9),4,0,12.6,"body",{ty:PI2})),e.push(P_(CYL(1.2,4,7),13,0,12.6,"psi",{ty:PI2,e:1}))),e}if("aa"===e){const e=[],t=n?15.6:a?14.6:13.6;if(e.push(P_(CYL(5.2,4,12),0,0,t-4,"armor3")),n){e.push(P_(SLAB(hexProfile(10,9),4.5,1.4,"aavt"),0,0,t,"body"));for(const r of[-3.2,3.2])e.push(P_(BOXM(11,3.6,3.6,1),4,r,t+3.4,"steel")),e.push(P_(CONE(1.4,.4,2.6,7),10,r,t+3.4,"red",{ty:PI2}))}else if(a){e.push(P_(SLAB(roundRectProfile(11,10,2,2),5,1.4,"aalt"),0,0,t,"body"));for(const r of[-2.6,2.6])e.push(P_(CYL(1.5,14,8),4,r,t+4,"gunmetal",{ty:PI2,tx:0}));e.push(P_(BOXM(5,7,3,1),-4,0,t+4,"darkmetal"))}else{e.push(P_(CONE(5.5,2.5,7,10),0,0,t,"carapace"));for(let r=0;r<3;r++){const n=2.09*r;e.push(P_(CYL(.9,12,6),2,2.4*Math.cos(n),t+4+2.4*Math.sin(n),"psi",{ty:PI2,e:1}))}}return e}if("def2"===e&&"yuri"===t){const e=[P_(DOME(5.5,4.5,12),0,0,31.6,"psi",{e:1})];for(let t=0;t<3;t++){const n=2.09*t+(r?.5:0);e.push(P_(CYL(1,10,6),4*Math.cos(n),4*Math.sin(n),34,"crystal",{e:1}))}return e}return null}function UMODEL(e,t,extra){const _a=getAssetModel(e);return _a||UMODEL_(e,t||0,extra)}function UTURRET(e,t){return UTURRET_(e,t||0)}function BMODEL(e,t,d,cn,rot){const _a=getAssetModel(e);return _a||BMODEL_(e,t,d,cn,rot)}function BTURRET(e,t,r){return BTURRET_(e,t,r||0)}
/*
 * Optional external 3D asset loading (GLTF/GLB), with graceful fallback.
 *
 * Nothing is registered by default - every model is procedural, exactly as
 * before. Call registerModelAsset(key, url, scale?) to have that
 * unit/building/prop key load a real asset instead. The load happens
 * asynchronously in the background; until it resolves (or if it fails -
 * including simply being unreachable because the page was opened via
 * file://, where fetch is blocked), the existing procedural model is used
 * with no error and no visual gap. Once loaded, the converted model is
 * cached and reused for every future instance of that key.
 *
 * Models in this engine aren't a live THREE.js scene graph - every part is
 * baked into a flat triangle list (see P_/buildTris) that the software
 * rasterizer turns into a cached sprite. A loaded GLTF's mesh geometry is
 * converted into that same format here (partsFromGLTF), so an asset-backed
 * model flows through the exact same rendering path as a procedural one.
 * GLTF is Y-up by convention; this engine's model space is Z-up, so the
 * scene is wrapped in a group that rotates it into place before baking.
 */
const MODEL_ASSETS = {};
const MODEL_ASSET_SCALE = {};
const _assetCache = new Map();
let _gltfLoader = null;

function registerModelAsset(key, url, scale) {
  MODEL_ASSETS[key] = url;
  MODEL_ASSET_SCALE[key] = scale || 1;
  _assetCache.delete(key);
}

function unregisterModelAsset(key) {
  delete MODEL_ASSETS[key];
  delete MODEL_ASSET_SCALE[key];
  _assetCache.delete(key);
}

function _hexOfMaterial(mat) {
  const m = Array.isArray(mat) ? mat[0] : mat;
  return m && m.color && m.color.isColor ? "#" + m.color.getHexString() : "#9099a0";
}

function partsFromGLTF(scene, scale) {
  const wrapper = new THREE.Group();
  wrapper.add(scene);
  wrapper.rotation.x = Math.PI / 2;
  wrapper.scale.setScalar(scale || 1);
  wrapper.updateMatrixWorld(true);
  const parts = [];
  const pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3();
  const nA = new THREE.Vector3(), nB = new THREE.Vector3(), nC = new THREE.Vector3();
  wrapper.traverse(node => {
    if (!node.isMesh || !node.geometry) return;
    const geo = node.geometry;
    const posAttr = geo.attributes && geo.attributes.position;
    if (!posAttr) return;
    const nrmAttr = geo.attributes.normal;
    const idx = geo.index;
    const normalMat = new THREE.Matrix3().getNormalMatrix(node.matrixWorld);
    const count = idx ? idx.count : posAttr.count;
    const tris = [];
    for (let i = 0; i + 2 < count; i += 3) {
      const i0 = idx ? idx.getX(i) : i, i1 = idx ? idx.getX(i + 1) : i + 1, i2 = idx ? idx.getX(i + 2) : i + 2;
      pA.fromBufferAttribute(posAttr, i0).applyMatrix4(node.matrixWorld);
      pB.fromBufferAttribute(posAttr, i1).applyMatrix4(node.matrixWorld);
      pC.fromBufferAttribute(posAttr, i2).applyMatrix4(node.matrixWorld);
      let na = null, nb = null, nc = null;
      if (nrmAttr) {
        nA.fromBufferAttribute(nrmAttr, i0).applyMatrix3(normalMat).normalize();
        nB.fromBufferAttribute(nrmAttr, i1).applyMatrix3(normalMat).normalize();
        nC.fromBufferAttribute(nrmAttr, i2).applyMatrix3(normalMat).normalize();
        na = [nA.x, nA.y, nA.z]; nb = [nB.x, nB.y, nB.z]; nc = [nC.x, nC.y, nC.z];
      }
      pushTri(tris, [pA.x, pA.y, pA.z], [pB.x, pB.y, pB.z], [pC.x, pC.y, pC.z], na, nb, nc);
    }
    if (tris.length) parts.push({ m: tris, x: 0, y: 0, z: 0, c: _hexOfMaterial(node.material) });
  });
  return parts;
}

function getAssetModel(key) {
  const url = MODEL_ASSETS[key];
  if (!url) return null;
  const cached = _assetCache.get(key);
  if (cached === "loading" || cached === "failed") return null;
  if (cached) return cached;
  _assetCache.set(key, "loading");
  if (!_gltfLoader) {
    if (typeof THREE === "undefined" || typeof THREE.GLTFLoader !== "function") {
      _assetCache.set(key, "failed");
      return null;
    }
    _gltfLoader = new THREE.GLTFLoader();
  }
  _gltfLoader.load(
    url,
    (gltf) => {
      try {
        const parts = partsFromGLTF(gltf.scene, MODEL_ASSET_SCALE[key]);
        _assetCache.set(key, parts.length ? parts : "failed");
      } catch (err) {
        _assetCache.set(key, "failed");
      }
    },
    undefined,
    () => { _assetCache.set(key, "failed"); }
  );
  return null;
}

Object.assign(window, {
  cv, mm, cam, ctx, mctx, CYL, CONE, isoX, isoY, faceAng, PI2, ZH, MINE_TOOL, MINE_DEFAULT,
  roundRectProfile, circleProfile, polyProfile, triN, pushTri, fanCap, nrm3, wallMeshSG, wallMesh,
  boxMesh, cylMesh, coneMesh, domeMesh, slabMesh, wedgeMesh, taperSlabMesh, hexProfile, filletPoly,
  hullProfile, meshOf, P_, B_, w2sx, w2sy, s2w, setQuality, resize, clampCam, shade, sh, palette,
  colOf, projX, projY, boxCorners, boxCentre, shadeNormal, rgbOf, gritN, buildTris, triRasterG,
  creaseAO, buildShadowTris, makeShadow, makeSprite, sprite, blit, rows, oreDrillModel, crystalModel,
  blossomModel, trackUnit, drig, wheelUnit, strut3, legWalker, deployedOutriggers, deployedPillar,
  factionHullDetail, longbowModel, longbowTurret, riftModel, riftTurret, boatHull, transportHeli,
  subHull, tankHull, turretProfile, tankTurret, harvesterSoviet, harvesterAllied, harvesterYuri,
  harvesterModel, harvesterAugerModel, harvesterDrumModel, droneLaserModel, droneModel, bastionModel,
  mcvModel, weaponRig, infantry, jet, UMODEL_, UTURRET_, muzzleDist, hasTurret, hasBTurret, treeModel,
  hasStagedBuild,
  rockModel, scrubModel, stoneModel, fallModel, lampModel, towerModel, carModel, PROPMODEL, craterModel,
  wreckModel, rubbleModel, crane, containerBox, blockM, bandLights, glassBand, railing, stack, dish,
  fan, drum, spine, sandbagRing, ribs, ladder, pipeRun, vent, acUnit, floodlight, railPosts, hazard,
  bolts, boltRing, seams, catwalk, crate, barrel, detailPass, barrelRoofMesh, tier, windows, lattice,
  coolTower, silo, gantry, solarPanels, roofFarm, stairs, veins, plates, hive, def1Bits, aaBits,
  triGunHead, triAAHead, heliRotor, heliTailRotor,
  BMODEL_, BTURRET_, UMODEL, UTURRET, BMODEL, BTURRET, faceIdx,
  SPRITES, SHADOWS, MAT,
  registerModelAsset, unregisterModelAsset, getAssetModel, MODEL_ASSETS,
  PILLAR_H, TURRET_RISE,
});

Object.defineProperties(window, {
  camZTarget: { get: () => camZTarget, set: v => { camZTarget = v; }, configurable: true },
  zoomPivot: { get: () => zoomPivot, set: v => { zoomPivot = v; }, configurable: true },
  QUALITY: { get: () => QUALITY, configurable: true },
  CW: { get: () => CW, configurable: true },
  CH: { get: () => CH, configurable: true },
  DPR: { get: () => DPR, configurable: true },
});
