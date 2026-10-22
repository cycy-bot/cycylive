import os
"""Second asset pass: faces without nose, noses, new mouths, new hairs, house accents."""
import sys, os, glob, pickle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.environ.get('ADA_TRAVAIL', '.'))
from pieces import *
Z2 = os.environ['ADA_SOURCE'] + '/'
P = pickle.load(open('pieces.pkl', 'rb'))
NEZ_S = 0.27

def face_sans_nez(f):
    a = f['img'].copy(); nx, ny = f['nose']
    rgb = np.clip(a[..., :3], 0, 255).astype(np.uint8)
    m = np.zeros(rgb.shape[:2], np.uint8)
    cv2.ellipse(m, (int(nx), int(ny - 40)), (34, 78), 0, 0, 360, 1, -1)
    out = cv2.inpaint(rgb, m, 12, cv2.INPAINT_TELEA)
    out = cv2.inpaint(out, m, 12, cv2.INPAINT_TELEA)
    soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 3)[..., None]
    a[..., :3] = a[..., :3] * (1 - soft) + out.astype(np.float32) * soft
    return a

def noses():
    out = {}
    for f in sorted(glob.glob(Z2 + 'nez_avatar/0[1-8]_*.png')):
        k = int(os.path.basename(f)[:2])
        a = np.array(Image.open(f).convert('RGBA')).astype(np.float32)
        al = a[..., 3]; fill = (al > 60) & (a[..., :3].mean(2) > 170)
        ref = np.median(a[fill][:, :3], axis=0)
        mul = np.clip(a[..., :3] / ref * 255, 0, 255)          # 255 = no change, darker = shading / line
        lay = np.dstack([mul, al])
        ys, xs = np.where(al > 6); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        crop = lay[y0:y1, x0:x1]
        img = scale_rgba(crop, NEZ_S)
        out[k] = dict(img=img, ax=img.shape[1] / 2, ay=img.shape[0], src=os.path.basename(f))
    return out

def mouths():
    out = {}
    sets = [('bouches_avatar/academie_des_astres_bouches_feminines_corrigees/', 0, 124 / 627.0),
            ('bouches_avatar/02_bouches_masculines/', 8, 118 / 199.0)]
    for d, off, s in sets:
        files = sorted(glob.glob(Z2 + d + '0[1-8]_*.png'))
        a0 = np.array(Image.open(files[0]).convert('RGBA'))[..., 3]
        ys, xs = np.where(a0 > 20); acx, acy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2   # neutral centre = anchor of the set
        for i, f in enumerate(files, 1):
            a = np.array(Image.open(f).convert('RGBA')).astype(np.float32)
            ys, xs = np.where(a[..., 3] > 6); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            crop = a[y0:y1, x0:x1]
            img = scale_rgba(crop, s)
            out[off + i] = dict(img=img, ax=(acx - x0) * s, ay=(acy - y0) * s, style='fin' if off else 'marque', src=os.path.basename(f))
    return out

HOUSE_DIR = {'lion': '02_variantes_lion', 'cygne': '03_variantes_cygne', 'dragon': '04_variantes_dragon'}
QO, QS = (152, 98), 1.42
def house_accents():
    U = Z2 + 'uniformes_portraits_maisons/'
    out = {}
    for i, n in enumerate(TENUES, 1):
        neu = np.array(Image.open(U + f'01_portraits_neutres/{n}_portrait.png').convert('RGBA')).astype(np.float32)
        for h, d in HOUSE_DIR.items():
            v = np.array(Image.open(U + f'{d}/{n}_{h}.png').convert('RGBA')).astype(np.float32)
            diff = np.abs(v[..., :3] - neu[..., :3]).max(2) * (v[..., 3] > 0) / 255
            m = np.clip((diff - 0.06) / 0.12, 0, 1)
            m = cv2.GaussianBlur(ndi.binary_dilation(m > 0.2, iterations=1).astype(np.float32), (0, 0), 0.7) * np.maximum(m, 0.6)
            lay = np.dstack([v[..., :3], m * 255])
            small = scale_rgba(lay, 1 / QS)               # back to full-body scale
            ys, xs = np.where(small[..., 3] > 6)
            x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            out[(i, h)] = dict(img=small[y0:y1, x0:x1], x=QO[0] + x0, y=QO[1] + y0)
    return out

if __name__ == '__main__':
    R = dict(faces_nn={n: face_sans_nez(P['faces'][n]) for n in FACES}, noses=noses(), mouths=mouths(),
             hairs=pickle.load(open('hairs2.pkl', 'rb')), accents=house_accents())
    pickle.dump(R, open('pieces2.pkl', 'wb'))
    for k, v in R['mouths'].items(): print('bouche', k, v['src'], v['img'].shape[:2])
    print('accents', len(R['accents']))
