import os
"""New hair set: register each new hairstyle on the validated old one (same id), clean, export data."""
import sys, os, pickle, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.environ.get('ADA_TRAVAIL', '.'))
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
from pieces import face_anchors, scale_rgba, smooth_alpha
Z2 = os.environ['ADA_SOURCE'] + '/coiffures_avatar/'
P = pickle.load(open('pieces.pkl', 'rb'))
F = P['faces']['01_feminin_ovale']; A = face_anchors(F)
H, W = 1700, 1024; OY = 200        # template canvas with room above the crown

def old_mask(k):
    h = P['hairs'][k]; m = np.zeros((H, W), np.float32)
    x0 = int(round(A['hair'][0] - h['ax'])); y0 = int(round(A['hair'][1] - h['ay'])) + OY
    im = h['img'][..., 3] / 255; hh, ww = im.shape
    xs0, ys0 = max(0, x0), max(0, y0); xs1, ys1 = min(W, x0 + ww), min(H, y0 + hh)
    m[ys0:ys1, xs0:xs1] = im[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    return m

def clean_new(a):
    """keep the main hair mass, drop fragments of neighbouring cells."""
    al = a[..., 3] > 25
    lab, n = ndi.label(ndi.binary_dilation(al, iterations=3))
    if n > 1:
        sz = ndi.sum(al, lab, range(1, n + 1)); main = 1 + int(np.argmax(sz))
        keep = np.zeros_like(al)
        ys, xs = np.where(lab == main); cy0, cy1, cx0, cx1 = ys.min(), ys.max(), xs.min(), xs.max()
        for i in range(n):
            comp = lab == i + 1
            if i + 1 == main: keep |= comp; continue
            ys, xs = np.where(comp)
            # small strands touching the main bounding box are kept, fragments on the canvas border are not
            on_border = ys.min() < 4 or xs.min() < 4 or xs.max() > a.shape[1] - 5 or ys.max() > a.shape[0] - 5
            near = (cx0 - 15 <= xs.mean() <= cx1 + 15) and (cy0 - 15 <= ys.mean() <= cy1 + 15)
            above = ys.max() < cy0 + 40          # piece of the neighbouring row of the sheet
            if near and not on_border and not above and sz[i] > 30: keep |= comp
        a = a.copy(); a[..., 3] *= keep
    # lateral fragments of the sheet row above the hairline
    al = a[..., 3] > 25
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndi.sum(al, lab, range(1, n + 1)); main = lab == 1 + int(np.argmax(sz))
        ys, xs = np.where(main); cx = (xs.min() + xs.max()) / 2
        col = main[:, int(cx)]; top = np.argmax(col); hl = top + np.argmax(~col[top:])   # hairline at the centre
        for i in range(n):
            comp = lab == i + 1
            if comp is main or sz[i] == sz.max(): continue
            yy, xx = np.where(comp)
            if yy.max() < hl and abs(xx.mean() - cx) > 120: a[..., 3][comp] = 0
    main = ndi.binary_dilation(lab == 1 + int(np.argmax(sz)), iterations=6) if n > 1 else al
    a[..., 3] = np.where((a[..., 3] <= 25) & ~ndi.binary_dilation(a[..., 3] > 25, iterations=4), 0, a[..., 3])
    return a

def register(k, new, fixed_s=None):
    tgt = old_mask(k)
    na = new[..., 3] / 255
    f = 0.25
    t_s = cv2.resize(tgt, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    n_s = cv2.resize(na, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    # weight the upper part (crown / forehead) more: it is what sits on the skull
    ys = np.arange(t_s.shape[0])[:, None]
    crown = (F['crown'] + OY) * f; chin = (F['chin'] + OY) * f
    wgt = np.where(ys < chin, 1.0, 0.35).astype(np.float32)
    fa = np.zeros((H, W), np.float32); fa[OY:OY + 1024, :] = F['img'][..., 3] / 255
    capy = F['crown'] + 0.22 * (F['chin'] - F['crown']) + OY
    fa[int(capy):, :] = 0
    skull = cv2.resize(fa, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    best = None
    def score(s, tx, ty):
        M = np.float32([[s, 0, tx], [0, s, ty]])
        w = cv2.warpAffine(n_s, M, (t_s.shape[1], t_s.shape[0]))
        inter = (np.minimum(w, t_s) * wgt).sum(); uni = (np.maximum(w, t_s) * wgt).sum()
        bald = (skull * (1 - np.clip(w, 0, 1))).sum() / max(skull.sum(), 1)
        return inter / max(uni, 1e-6) - 1.2 * bald
    # initial guess from bounding boxes (top & centre)
    ty_, tx_ = np.where(t_s > .3); ny_, nx_ = np.where(n_s > .3)
    for s in ([fixed_s] if fixed_s else np.arange(0.70, 1.90, 0.04)):
        tx = tx_.mean() - nx_.mean() * s; ty = ty_.min() - ny_.min() * s
        for dx in range(-20, 21, 2):
            for dy in range(-24, 25, 2):
                sc = score(s, tx + dx, ty + dy)
                if best is None or sc > best[0]: best = (sc, s, tx + dx, ty + dy)
    sc, s, tx, ty = best
    for _ in range(2):    # refine
        for ds in ([0.0] if fixed_s else np.linspace(-.03, .03, 7)):
            for dx in np.linspace(-1.5, 1.5, 7):
                for dy in np.linspace(-1.5, 1.5, 7):
                    v = score(s + ds, tx + dx, ty + dy)
                    if v > best[0]: best = (v, s + ds, tx + dx, ty + dy)
        sc, s, tx, ty = best
    return dict(iou=sc, s=s, tx=tx / f, ty=ty / f - OY)    # full-res: new pixel -> template = s*p + t

if __name__ == '__main__':
    files = [f for f in sorted(glob.glob(Z2 + '[0-9][0-9]_*.png')) if not os.path.basename(f).startswith('00')]
    out = {}
    for fpath in files:
        if os.path.basename(fpath).startswith('13_'): continue   # dessin de trois-quarts : incompatible
        k = int(os.path.basename(fpath)[:2])
        a = np.array(Image.open(fpath).convert('RGBA')).astype(np.float32)
        a = clean_new(a)
        r = register(k, a, fixed_s=1.0 if k <= 8 else 1.10)
        print(k, os.path.basename(fpath), 'IoU %.3f scale %.3f' % (r['iou'], r['s']))
        # crop + scale into template space
        ys, xs = np.where(a[..., 3] > 6); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        crop = a[y0:y1, x0:x1].copy()
        cut = (a[1010:, :, 3] > 25).any() or y1 >= 960     # mèches coupées par le bord de la planche
        if cut:
            fade = np.clip((np.arange(crop.shape[0]) - (crop.shape[0] - 60)) / 60, 0, 1)
            crop[..., 3] *= (1 - fade ** 1.5)[:, None]
        img = scale_rgba(crop, r['s'])
        op = crop[..., 3] > 200
        ref = np.median(crop[op][:, :3], axis=0)
        # hair anchor: template position of the crop's top-left
        out[k] = dict(img=img, X=x0 * r['s'] + r['tx'], Y=y0 * r['s'] + r['ty'], ref=ref, coupe=bool(cut), iou=r['iou'], s=r['s'], src=os.path.basename(fpath))
    pickle.dump(out, open('hairs2.pkl', 'wb'))
