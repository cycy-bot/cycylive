import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Z = os.environ.get('ADA_SOURCE_V1', 'Personnalisation_avatar_v1') + '/'
def load(p): return np.array(Image.open(Z+p).convert('RGBA')).astype(np.float32)
def dehaze(a, lo=40):
    a=a.copy(); al=a[...,3]
    al=np.clip((al-lo)/(255-lo),0,1)*255
    a[...,3]=al; return a
def hair_items():
    a=dehaze(load('coiffures_avatar/cheveux_avatar.png'))
    A=a[...,3]>20
    lab,n=ndi.label(ndi.binary_dilation(A,iterations=2))
    sz=ndi.sum(A,lab,range(1,n+1)); sl=ndi.find_objects(lab)
    comps=[(sl[i],i+1) for i in range(n) if sz[i]>2000]
    # holes = face windows, one per hair: use them to define hair centres
    fill=ndi.binary_fill_holes(A); hole=fill&~A
    hl,hn=ndi.label(hole); hs=ndi.sum(hole,hl,range(1,hn+1))
    holes=[]
    for i in range(hn):
        if hs[i]>1500:
            ys,xs=np.where(hl==i+1); bot=ys.max(); cx=xs[ys>=bot-3].mean()
            holes.append(dict(cx=cx, chin=bot, top=ys.min(), row=int(bot>400)))
    holes.sort(key=lambda h:(h['row'],h['cx']))
    items=[]
    for k,h in enumerate(holes):
        # ownership: pixels belong to the hair whose hole centre is nearest in x, same row
        same=[o for o in holes if o['row']==h['row']]
        xs_c=[o['cx'] for o in same]; idx=xs_c.index(h['cx'])
        x0=0 if idx==0 else (xs_c[idx-1]+h['cx'])/2
        x1=a.shape[1] if idx==len(same)-1 else (xs_c[idx+1]+h['cx'])/2
        y0,y1=(0,400) if h['row']==0 else (380,a.shape[0])
        m=np.zeros(A.shape,bool); m[y0:y1,:]=True
        # take components whose majority is in [x0,x1]; split merged ones at the boundary
        own=np.zeros(A.shape,bool)
        for s,li in comps:
            comp=(lab==li)&m
            if not comp.any(): continue
            ys,xs=np.where(comp)
            frac=((xs>=x0)&(xs<x1)).mean()
            if frac>0.8: own|=comp
            elif frac>0.2:
                band=comp.copy(); band[:,:int(x0)]=False; band[:,int(x1):]=False; own|=band
        items.append((k+1,h,own))
    return a,items

def clean_hair(a, own, h):
    """Remove the thin template lines (jaw, ears) left around the face window."""
    A=(a[...,3]>20)&own
    st=np.ones((3,3),bool)
    mass=ndi.binary_opening(A,structure=st,iterations=1)
    mass=ndi.binary_dilation(mass,iterations=1)&A
    thin=A&~mass
    lab,n=ndi.label(thin,structure=np.ones((3,3)))
    ys,xs=np.where(own)
    hx0,hx1=xs.min(),xs.max()
    remove=np.zeros_like(A)
    sl=ndi.find_objects(lab)
    for i,s in enumerate(sl):
        cy=(s[0].start+s[0].stop)/2
        if h['top']-5 <= cy <= h['chin']+12:
            remove[s]|=(lab[s]==i+1)
    # also the faint jaw line itself can be 3px thick: anything inside the dilated face window that is thin-ish
    win=ndi.binary_fill_holes(A)&~A
    winband=ndi.binary_dilation(win,iterations=4)
    jaw=A&winband&~ndi.binary_opening(A,structure=np.ones((5,5)),iterations=1)
    lowhalf=np.zeros_like(A); lowhalf[int(h['top']+(h['chin']-h['top'])*0.45):int(h['chin'])+8,:]=True
    remove|=jaw&lowhalf
    out=a.copy(); out[...,3]=np.where(own&~remove,a[...,3],0)
    # drop tiny islands left behind
    B=out[...,3]>20; l2,n2=ndi.label(B); 
    if n2:
        sz=ndi.sum(B,l2,range(1,n2+1)); small=np.isin(l2,[i+1 for i in range(n2) if sz[i]<25]); out[...,3][small]=0
    return out, remove

def remove_template_ears(a, h, reach=30):
    import cv2
    out=a.copy(); A=out[...,3]>20
    win=ndi.binary_fill_holes(A)&~A
    lab_w,n=ndi.label(win)
    # window component containing the chin point
    cy,cx=int(h['chin'])-6,int(round(h['cx']))
    wid=lab_w[cy,cx]
    if wid==0: return out, np.zeros_like(A)
    W=lab_w==wid
    L=cv2.cvtColor(np.clip(out[...,:3],0,255).astype(np.uint8),cv2.COLOR_RGB2LAB)[...,0].astype(float)
    top,chin=h['top'],h['chin']; H=chin-top
    rem=np.zeros_like(A)
    for y in range(int(top+0.22*H), int(top+0.80*H)):
        xs=np.where(W[y])[0]
        if not len(xs): continue
        xl,xr=xs.min(),xs.max()
        for x0,x1 in ((xl-reach,xl+1),(xr,xr+reach+1)):
            seg=slice(max(0,x0),x1)
            m=A[y,seg]&(L[y,seg]>118)
            rem[y,seg]|=m
    # the light ear fill is a compact blob touching the window: keep only blobs that touch the window edge
    lab_r,nr=ndi.label(rem)
    touch=ndi.binary_dilation(W,iterations=3)
    keep=np.zeros_like(rem)
    for i in range(1,nr+1):
        b=lab_r==i
        if (b&touch).any() and b.sum()>15: keep|=b
    keep=ndi.binary_dilation(keep,iterations=1)&A
    out[...,3][keep]=0
    return out, keep

def sheet_items(path, pairs, min_px=400, lo=40):
    """Return list of (rgba crop, centre_x, centre_y) in row-major order. pairs=True groups 2 comps."""
    a=dehaze(load(path),lo)
    A=a[...,3]>20
    lab,n=ndi.label(ndi.binary_dilation(A,iterations=3))
    sz=ndi.sum(A,lab,range(1,n+1)); sl=ndi.find_objects(lab)
    comps=[dict(s=sl[i],id=i+1,cx=(sl[i][1].start+sl[i][1].stop)/2,cy=(sl[i][0].start+sl[i][0].stop)/2) for i in range(n) if sz[i]>min_px]
    # rows by y clustering
    comps.sort(key=lambda c:c['cy']); rows=[]
    for c in comps:
        if rows and abs(rows[-1][-1]['cy']-c['cy'])<40: rows[-1].append(c)
        else: rows.append([c])
    groups=[]
    for r in rows:
        r.sort(key=lambda c:c['cx'])
        if pairs:
            for i in range(0,len(r),2): groups.append(r[i:i+2])
        else:
            for c in r: groups.append([c])
    out=[]
    for g in groups:
        m=np.zeros(A.shape,bool)
        for c in g: m|=(lab==c['id'])
        m&=A|(a[...,3]>0)
        ys,xs=np.where(m); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
        crop=a[y0:y1,x0:x1].copy(); crop[...,3]*=m[y0:y1,x0:x1]
        out.append(dict(img=crop, w=x1-x0, h=y1-y0, cx=(x1-x0)/2, cy=(y1-y0)/2, n=len(g)))
    return out
