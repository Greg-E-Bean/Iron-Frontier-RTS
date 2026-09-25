#!/usr/bin/env python3
# Rebuilds fmv/<character>.webp from fmv/source/cast-sheet.jpg: crops each panel,
# cuts the character out (GrabCut), then upscales, crisps the ink, grades per faction,
# adds faction insignia and hive tint/eye glow. Needs: pip install opencv-python-headless numpy pillow
import os;os.chdir(os.path.join(os.path.dirname(__file__),"..","fmv","source"));os.makedirs("cut",exist_ok=True)
import cv2,numpy as np
im=cv2.imread('cast-sheet.jpg')
cols=[(20,286),(296,561),(572,836),(847,1112),(1122,1388)];rows=[(49,355),(412,715)]
names=['thorne','ward','nikolai','rostova','liwei','denton','reed','aisha','liam','jiro']
k=0
for (y0,y1) in rows:
  for (x0,x1) in cols:
    p=im[y0+2:y1,x0+2:x1-2].copy();h,w=p.shape[:2]
    m=np.full((h,w),cv2.GC_PR_BGD,np.uint8)
    # definite background: top band and upper side margins
    m[:6,:]=cv2.GC_BGD; m[:int(h*.5),:8]=cv2.GC_BGD; m[:int(h*.5),w-8:]=cv2.GC_BGD
    m[:int(h*.12),:int(w*.2)]=cv2.GC_BGD; m[:int(h*.12),int(w*.8):]=cv2.GC_BGD
    # probable foreground: head+torso region; definite fg: face centre and chest
    cv2.ellipse(m,(w//2,int(h*.36)),(int(w*.2),int(h*.24)),0,0,360,cv2.GC_PR_FGD,-1)
    cv2.rectangle(m,(int(w*.12),int(h*.62)),(int(w*.88),h-1),cv2.GC_PR_FGD,-1)
    cv2.ellipse(m,(w//2,int(h*.36)),(int(w*.1),int(h*.13)),0,0,360,cv2.GC_FGD,-1)
    cv2.rectangle(m,(int(w*.3),int(h*.8)),(int(w*.7),h-1),cv2.GC_FGD,-1)
    if names[k] in ('ward','liwei'):
      cx=137 if names[k]=='ward' else 130
      cv2.ellipse(m,(cx,80),(46,62),0,0,360,cv2.GC_FGD,-1)
    bg=np.zeros((1,65),np.float64);fg=np.zeros((1,65),np.float64)
    cv2.grabCut(p,m,None,bg,fg,8,cv2.GC_INIT_WITH_MASK)
    a=np.where((m==cv2.GC_FGD)|(m==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    # keep the largest component, fill holes, soften edge
    n,lab,st,_=cv2.connectedComponentsWithStats(a);
    if n>1: big=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); a=np.where(lab==big,255,0).astype(np.uint8)
    ff=a.copy();msk=np.zeros((h+2,w+2),np.uint8);cv2.floodFill(ff,msk,(0,0),255);a=a|cv2.bitwise_not(ff)
    a=cv2.morphologyEx(a,cv2.MORPH_OPEN,np.ones((3,3),np.uint8));a=cv2.GaussianBlur(a,(3,3),0)
    rgba=cv2.cvtColor(p,cv2.COLOR_BGR2BGRA);rgba[:,:,3]=a
    cv2.imwrite('cut/%s.png'%names[k],rgba);cv2.imwrite('cut/%s_src.png'%names[k],p);k+=1

import cv2,numpy as np,math
from PIL import Image,ImageDraw,ImageFilter
CAST={ # source panel -> game character, faction
 'denton':('reyes','van'),'reed':('hale','van'),'ward':('ghost','van'),
 'rostova':('draganov','leg'),'liwei':('volkova','leg'),'thorne':('bogdan','leg'),'nikolai':('reaper','leg'),
 'jiro':('voice','syn'),'aisha':('senna','syn'),'liam':('phantom','syn')}
INK=(18,16,16,255)
def star(d,cx,cy,r,fill):
  pts=[(cx+math.cos(-math.pi/2+i*math.pi/5)*(r if i%2==0 else r*.42),cy+math.sin(-math.pi/2+i*math.pi/5)*(r if i%2==0 else r*.42)) for i in range(10)]
  d.polygon(pts,fill=fill)
def patch(d,x,y,w,h,col,shape='shield',emb=None):
  x,y,w,h=[2*v for v in (x,y,w,h)]
  if shape=='shield': pts=[(x,y),(x+w,y),(x+w,y+h*.65),(x+w/2,y+h),(x,y+h*.65)]
  else: pts=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
  d.polygon(pts,fill=INK); s=3
  inner=[(px+(s if px<x+w/2 else -s),py+(s if py<y+h/2 else -s)) for px,py in pts]; d.polygon(inner,fill=col)
  d.line([inner[0],inner[1]],fill=tuple(min(255,c+40) for c in col[:3])+(255,),width=2)
  if emb=='star': star(d,x+w/2,y+h*.45,min(w,h)*.3,(236,196,70,255))
  if emb=='chev':
    for k in range(2): d.line([(x+w*.22,y+h*(.3+.2*k)),(x+w/2,y+h*(.48+.2*k)),(x+w*.78,y+h*(.3+.2*k))],fill=(230,236,240,255),width=4)
  if emb=='bar': d.rectangle([x+w*.15,y+h*.35,x+w*.85,y+h*.65],fill=(230,236,240,255))
RED=(176,32,30,255);BLUE=(46,112,170,255)
DECALS={
 'rostova':[(95,158,14,10,RED,'rect','star'),(150,158,14,10,RED,'rect','star'),(2,218,24,30,RED,'shield','star'),(55,196,36,8,(150,40,40,255),'rect',None),(55,205,36,8,(200,160,60,255),'rect',None),(10,170,26,8,(200,160,60,255),'rect',None)],
 'liwei':[(114,164,14,12,RED,'rect','star'),(150,164,14,12,RED,'rect','star'),(12,210,22,28,RED,'shield','star')],
 'thorne':[(138,212,26,40,RED,'shield','star'),(95,160,14,10,RED,'rect',None),(158,160,14,10,RED,'rect',None)],
 'nikolai':[(100,158,14,10,RED,'rect',None),(148,158,14,10,RED,'rect',None),(228,222,22,28,RED,'shield','star')],
 'denton':[(208,212,22,28,BLUE,'shield','chev'),(96,222,56,11,(40,52,70,255),'rect','bar')],
 'reed':[(222,212,22,28,BLUE,'shield','chev')],
 'ward':[(14,218,24,28,BLUE,'shield','chev')],
}
EYES={'jiro':[(126,94),(169,93)],'liam':[(115,89),(161,89)],'aisha':[(107,90),(152,90)]}
GRADE={'van':(.93,1.0,1.08),'leg':(1.08,.98,.88),'syn':(.98,.96,1.06)}
for src,(who,fac) in CAST.items():
  im=cv2.imread('cut/%s.png'%src,cv2.IMREAD_UNCHANGED)[:-4]
  im=cv2.resize(im,None,fx=2,fy=2,interpolation=cv2.INTER_CUBIC)
  bgr,a=im[:,:,:3],im[:,:,3]
  a=cv2.GaussianBlur(cv2.erode(a,np.ones((3,3),np.uint8),iterations=1),(3,3),0)
  # Syndicate: pull warm browns and greens toward the hive's violet
  if fac=='syn':
    hsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV).astype(np.float32);h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
    target=128
    fm=np.ones(h.shape,np.float32)
    if src=='aisha':
      yy,xx=np.mgrid[0:h.shape[0],0:h.shape[1]];dd=((xx-260)/70.)**2+((yy-215)/95.)**2;fm=np.clip((dd-.8)/.5,0,1).astype(np.float32) # violet in OpenCV hue (0-180)
    w=np.clip((s-35)/80,0,1)*(.6 if src=='aisha' else .65)*fm
    hsv[...,0]=np.where(w>0,(h+(((target-h+90)%180)-90)*w)%180,h);hsv[...,1]=s*(1-.25*w)
    bgr=cv2.cvtColor(hsv.astype(np.uint8),cv2.COLOR_HSV2BGR)
  # local contrast + crisper ink: less airbrushed
  lab=cv2.cvtColor(bgr,cv2.COLOR_BGR2LAB);l=lab[...,0]
  lab[...,0]=cv2.createCLAHE(clipLimit=1.8,tileGridSize=(6,6)).apply(l);bgr=cv2.cvtColor(lab,cv2.COLOR_LAB2BGR)
  bl=cv2.GaussianBlur(bgr,(0,0),1.3);bgr=cv2.addWeighted(bgr,1.7,bl,-.7,0)
  ink=cv2.cvtColor(bgr,cv2.COLOR_BGR2GRAY)<45;bgr[ink]=(bgr[ink]*.55).astype(np.uint8)
  # faction grade, deeper shadows
  f=bgr.astype(np.float32)/255;gr=GRADE[fac];f[...,2]*=gr[0];f[...,1]*=gr[1];f[...,0]*=gr[2]
  f=np.clip(f,0,1)**1.08
  # fine film grain (fixed per image) breaks up the smooth gradients
  rng=np.random.default_rng(7);n=rng.normal(0,.022,f.shape[:2])[...,None];f=np.clip(f+n,0,1)
  bgr=(f*255).astype(np.uint8)
  out=Image.fromarray(cv2.cvtColor(np.dstack([bgr,a]),cv2.COLOR_BGRA2RGBA))
  d=ImageDraw.Draw(out)
  for (x,y,w,h,col,shape,emb) in DECALS.get(src,[]): patch(d,x,y,w,h,col,shape,emb)
  if src in EYES:
    gl=Image.new('RGBA',out.size,(0,0,0,0));gd=ImageDraw.Draw(gl)
    for (x,y) in EYES[src]:
      r=9 if src!='aisha' else 5; gd.ellipse([2*x-r*2,2*y-r,2*x+r*2,2*y+r],fill=(210,140,255,150 if src!='aisha' else 90))
    gl=gl.filter(ImageFilter.GaussianBlur(5));out=Image.alpha_composite(out,gl)
    d=ImageDraw.Draw(out)
    if src!='aisha':
      for (x,y) in EYES[src]: d.ellipse([2*x-7,2*y-3,2*x+7,2*y+3],fill=(250,225,255,255))
  out.putalpha(Image.fromarray(a))
  out.save('../%s.webp'%who,'WEBP',quality=88,method=6)
print('ok')
