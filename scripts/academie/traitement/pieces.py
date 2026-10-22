import os
"""Builds every avatar piece in the common PORTRAIT space (= face crop 1024 px space)."""
import sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
from common import *

FACES = ['01_feminin_ovale', '02_feminin_rond', '03_feminin_coeur', '04_feminin_allonge',
         '05_masculin_ovale', '06_masculin_carre', '07_masculin_rectangulaire', '08_masculin_machoire_anguleuse']
EYES_ORDER = [1, 6, 2, 7, 3, 8, 4, 9, 5, 10]   # sheet item i -> file number
EYE_NAMES = {1: 'feminin_ronds_doux', 2: 'feminin_amande', 3: 'feminin_etires', 4: 'feminin_tombants', 5: 'feminin_fins_mysterieux',
             6: 'masculin_classiques', 7: 'masculin_fins_allonges', 8: 'masculin_tombants', 9: 'masculin_ouverts', 10: 'masculin_percants'}

# ------------------------------------------------------------------ tunables (portrait space)
K = dict(eye=0.60, brow=0.47, mouth=0.36, hair_row=(3.20, 3.35))
ANCH = dict(eye=0.555, brow=0.47, mouth=0.42, eye_dx=0)   # see face_anchors()

def scale_rgba(a, s):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
    # premultiplied resize to avoid dark fringes
    arr = np.array(im).astype(np.float32); al = arr[..., 3:4] / 255
    pm = np.dstack([arr[..., :3] * al, arr[..., 3:]])
    w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    chans = [np.array(Image.fromarray(np.clip(pm[..., i], 0, 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)).astype(np.float32) for i in range(4)]
    pm2 = np.dstack(chans); al2 = pm2[..., 3:4] / 255
    rgb = np.where(al2 > 0.003, pm2[..., :3] / np.maximum(al2, 0.003), 0)
    return np.dstack([np.clip(rgb, 0, 255), pm2[..., 3]])

def smooth_alpha(al, s):
    """Upscaled hard-edged alpha -> smooth anti-aliased contour (no shape change)."""
    a = al.astype(np.float32) / 255
    b = cv2.GaussianBlur(a, (0, 0), max(0.6, s * 0.42))
    c = np.clip((b - 0.5) * 2.2 + 0.5, 0, 1)
    # keep soft/semi-transparent strands as drawn where the source was already soft
    soft = (a > 0.02) & (a < 0.85)
    c = np.where(soft & (c < a), a, c) * (a > 0.003)
    return c * 255

def scale_mask(m, s):
    im = Image.fromarray(np.clip(m * 255, 0, 255).astype(np.uint8))
    return np.array(im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)).astype(np.float32) / 255

# ------------------------------------------------------------------ faces
def face_info(name):
    a = load(f'visages_avatar/{name}.png')
    a = dehaze(a, 25)
    al = a[..., 3]; g = a[..., :3].mean(2)
    ys, xs = np.where(al > 128)
    crown = int(ys.min())
    row = np.where(al[300] > 128)[0]; cx = (row.min() + row.max()) / 2
    col = g[600:850, int(cx) - 2:int(cx) + 3].mean(1)
    chin = 600 + int(np.argmin(np.where(al[600:850, int(cx)] > 200, col, 999)))
    box = g[480:660, 440:585]; boxa = al[480:660, 440:585]
    ny, nx = np.unravel_index(np.argmin(np.where(boxa > 200, box, 999)), box.shape)
    nose = (440 + nx, 480 + ny)
    opaque = (al > 250) & (g > 150)
    ref = np.median(a[opaque][:, :3], axis=0)
    return dict(img=a, crown=crown, chin=chin, cx=cx, nose=nose, ref=ref)

def face_anchors(f):
    H = f['chin'] - f['crown']
    eye_y = f['crown'] + ANCH['eye'] * H
    return dict(
        eye=(f['cx'] + ANCH['eye_dx'], eye_y),
        brow=(f['cx'], eye_y - 0.085 * H),
        mouth=(f['cx'], f['nose'][1] + ANCH['mouth'] * (f['chin'] - f['nose'][1])),
        hair=(f['cx'], f['crown'] + 671),     # virtual template chin, anchored on the cranium
    )

# ------------------------------------------------------------------ eyes with masks
def eye_masks(c):
    rgb = c[..., :3]; al = c[..., 3] / 255
    hsv = cv2.cvtColor(np.clip(rgb, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    L = cv2.cvtColor(np.clip(rgb, 0, 255).astype(np.uint8), cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32)
    sat = hsv[..., 1] / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # iris: grey disc, darker than the white, low saturation
    cand = (al > 0.6) & (sat < 0.16) & (L > 45) & (L < 175)
    lab, n = ndi.label(cand)
    iris = np.zeros(cand.shape, bool)
    if n:
        sizes = ndi.sum(cand, lab, range(1, n + 1))
        order = np.argsort(sizes)[::-1][:2]     # one per eye
        for o in order:
            blob = lab == o + 1
            if sizes[o] < 150: continue
            blob = ndi.binary_fill_holes(ndi.binary_closing(blob, iterations=3))
            cnts, _ = cv2.findContours(blob.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            hull = cv2.convexHull(max(cnts, key=cv2.contourArea))
            m = np.zeros(blob.shape, np.uint8); cv2.fillPoly(m, [hull], 1)
            iris |= m.astype(bool)
    iris_w = cv2.GaussianBlur(iris.astype(np.float32), (0, 0), 1.0)
    # pupil & catch-light are kept as drawn
    keep = np.clip((L - 38) / 30, 0, 1) * np.clip((228 - L) / 20, 0, 1)
    iris_w *= keep
    # warm skin (lids, shading)
    warm = np.clip((r - b - 14) / 28, 0, 1) * np.clip((L - 70) / 40, 0, 1)
    skin_w = warm * (1 - np.clip(iris_w * 3, 0, 1))
    return skin_w, iris_w

def build_eyes():
    out = {}
    for i, it in enumerate(sheet_items('yeux_avatar/yeux_avatar.png', True)):
        num = EYES_ORDER[i]
        c = it['img']; s_, i_ = eye_masks(c)
        sc = K['eye']
        out[num] = dict(img=scale_rgba(c, sc), skin=scale_mask(s_, sc), iris=scale_mask(i_, sc),
                        iris_ref=np.median(c[(i_ > 0.5)][:, :3], axis=0) if (i_ > 0.5).any() else np.array([128, 128, 128.]),
                        skin_ref=np.median(c[(s_ > 0.7) & (c[..., 3] > 200)][:, :3], axis=0) if ((s_ > 0.7) & (c[..., 3] > 200)).any() else np.array([235, 190, 170.]))
    return out

def build_simple(path, pairs, k, order=None):
    out = {}
    for i, it in enumerate(sheet_items(path, pairs)):
        num = (order[i] if order else i + 1)
        c = it['img']
        op = c[..., 3] > 200
        out[num] = dict(img=scale_rgba(c, k), ref=np.median(c[op][:, :3], axis=0))
    return out

def build_hairs():
    a, items = hair_items()
    out = {}
    for k, h, own in items:
        c0 = a.copy(); c0[..., 3] *= own
        c1, _ = remove_template_ears(c0, h, reach=42)
        c2, _ = clean_hair(c1, own, h)
        # islands sitting inside the face window (template remnants) go away
        Wf = ndi.binary_fill_holes(c0[..., 3] > 20) & ~(c0[..., 3] > 20)
        Wf = ndi.binary_dilation(Wf, iterations=6)
        B = c2[..., 3] > 15
        lb, nb = ndi.label(B, structure=np.ones((3, 3)))
        if nb:
            szs = ndi.sum(B, lb, range(1, nb + 1))
            inside = ndi.sum(Wf, lb, range(1, nb + 1))
            bad = [i + 1 for i in range(nb) if szs[i] < 2500 and inside[i] > 0.5 * szs[i]]
            c2[..., 3][np.isin(lb, bad)] = 0
        ys, xs = np.where(c2[..., 3] > 8)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        # window of the face (computed on the uncut hair, where it is still closed)
        A0 = (c0[..., 3] > 20)
        win = ndi.binary_fill_holes(A0) & ~A0
        lw, _ = ndi.label(win); wid = lw[int(h['chin']) - 6, int(round(h['cx']))]
        W = (lw == wid) if wid else np.zeros_like(win)
        op = c2[..., 3] > 200
        ref = np.median(c2[op & own][:, :3], axis=0)
        # tone down the light rim drawn along the hairline / face window
        band = ndi.binary_dilation(W, iterations=5) & (c2[..., 3] > 0)
        L = c2[..., :3] @ np.array([.299, .587, .114], np.float32)
        rl = float(ref @ np.array([.299, .587, .114]))
        fac = np.where(band & (L > rl), rl / np.maximum(L, 1), 1.0)
        c2[..., :3] *= fac[..., None]
        crop = c2[y0:y1, x0:x1]
        s = K['hair_row'][h['row']]
        img = scale_rgba(crop, s)
        a_raw = img[..., 3].copy()
        img[..., 3] = smooth_alpha(a_raw, s)
        Wb = scale_mask(ndi.binary_dilation(W, iterations=11)[y0:y1, x0:x1].astype(np.float32), s)
        Wb = cv2.GaussianBlur(Wb, (0, 0), 3)
        strong = cv2.GaussianBlur(a_raw / 255, (0, 0), s * 1.35)
        strong = np.clip((strong - 0.5) * 2.6 + 0.5, 0, 1) * 255
        img[..., 3] = img[..., 3] * (1 - Wb) + np.minimum(strong, np.maximum(img[..., 3], strong * 0)) * Wb
        out[k] = dict(img=img, ax=(h['cx'] - x0) * s, ay=(h['chin'] - y0) * s, ref=ref)
    return out

TENUES = ['01_feminin_classique', '02_feminin_elegant', '03_feminin_alternatif_chic', '04_masculin_classique', '05_masculin_soigne', '06_masculin_decontracte_chic']
BODY = dict(crown=14, chin=139, cx=511.75, s=0.187)

def tenue_skin_mask(a):
    rgb = np.clip(a[..., :3], 0, 255).astype(np.uint8)
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    L, A_, B_ = lab[..., 0], lab[..., 1] - 128, lab[..., 2] - 128
    r, g, b = [a[..., i] for i in range(3)]
    warm = np.clip((A_ - 5) / 8, 0, 1) * np.clip((B_ - 6) / 10, 0, 1)
    light = np.clip((L - 70) / 40, 0, 1)
    m = warm * light * (a[..., 3] > 10)
    hard = m > 0.25
    region = ndi.binary_fill_holes(ndi.binary_closing(hard, iterations=4)) & (a[..., 3] > 10)
    m = np.where(region & (L > 45), np.maximum(m, 0.97), m)
    return cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.7)

def build_tenue(name):
    a = load(f'tenues_avatar/{name}.png')
    a = dehaze(a, 60)
    # white keying residue on the outer edge: fade very light pixels that touch the background
    al = a[..., 3] > 20
    edge = al & ~ndi.binary_erosion(al, iterations=2)
    Lg = a[..., :3].mean(2)
    a[..., 3] = np.where(edge & (Lg > 205), 0, a[..., 3])
    # remove the bald head (it is replaced by the composed portrait head)
    a[:BODY['chin'] + 1, 430:600, 3] = 0
    skin = tenue_skin_mask(a)
    op = (skin > 0.8) & (a[..., 3] > 220)
    ref = np.median(a[op][:, :3], axis=0)
    return dict(img=a, skin=skin, ref=ref)
