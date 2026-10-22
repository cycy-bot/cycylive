import os
"""Prépare les assets au format de la refonte (repo cycylive, branche academie-createur-apercu).

Sortie :
  TRAITE/<dossiers>  : PNG transparents prêts pour scripts/academie/preparer_avatar.py
  REPO/public/academie-des-astres/avatar/masques/... : masques de recoloration (RVB)
  REPO/public/academie-des-astres/avatar/bustes, accents : calques de tenue (portrait HD et maisons)
  REPO/data/academie/avatar/teintes.genere.ts : références de couleur, masques, poses des coiffures
"""
import sys, os, json, pickle, glob, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.environ.get('ADA_TRAVAIL', '.'))
from pieces import *

SCR = os.environ.get('ADA_TRAVAIL', '.') + '/'
Z2 = SCR + 'zip2/Personnalisation_avatar/'
TRAITE = SCR + 'traite/'
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..')) + '/'
PUB = REPO + 'public/academie-des-astres/avatar/'
shutil.rmtree(TRAITE, ignore_errors=True)
for d in ('masques', 'bustes', 'accents'): shutil.rmtree(PUB + d, ignore_errors=True)
P = pickle.load(open('pieces.pkl', 'rb')); R = pickle.load(open('pieces2.pkl', 'rb'))
F1 = P['faces'][FACES[0]]
rgb = lambda v: [round(float(x), 1) for x in v]
T = dict(peau={}, iris={}, cheveux={}, sourcils={}, poses={}, bustes={}, accents={})

def put(path, arr, mode='RGBA'):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode).save(path, optimize=True)
def mask(path, chans):
    arr = np.dstack([np.clip(c * 255, 0, 255) for c in chans] + [np.zeros_like(chans[0])] * (3 - len(chans)))
    put(PUB + 'masques/' + path, arr, 'RGB'); return 'masques/' + path

# ---------- visages : nez dessiné effacé (la catégorie Nez le remplace) ----------
for i, n in enumerate(FACES, 1):
    put(TRAITE + f'visages_avatar/{n}.png', R['faces_nn'][n])
    T['peau'][f'visages/{n}.png'] = dict(ref=rgb(P['faces'][n]['ref']))

# ---------- yeux & sourcils : découpés de la planche (nets), sans agrandissement ----------
for i, it in enumerate(sheet_items('yeux_avatar/yeux_avatar.png', True)):
    num = EYES_ORDER[i]; c = it['img']; sk, ir = eye_masks(c)
    name = os.path.basename(glob.glob(Z2 + f'yeux_avatar/{num:02d}_*.png')[0])
    put(TRAITE + 'yeux_avatar/' + name, c)
    m = mask('yeux/' + name, [sk, ir])
    T['peau']['yeux/' + name] = dict(ref=rgb(np.median(c[(sk > .7) & (c[..., 3] > 200)][:, :3], axis=0)), masque=m, canal=0)
    T['iris']['yeux/' + name] = dict(ref=rgb(np.median(c[ir > .5][:, :3], axis=0)), masque=m, canal=1)
for i, it in enumerate(sheet_items('sourcils_avatar/sourcils-avatar.png', True), 1):
    name = os.path.basename(glob.glob(Z2 + f'sourcils_avatar/{i:02d}_*.png')[0]); c = it['img']
    put(TRAITE + 'sourcils_avatar/' + name, c)
    T['sourcils']['sourcils/' + name] = dict(ref=rgb(np.median(c[c[..., 3] > 200][:, :3], axis=0)))

# ---------- nez : fichiers d'origine, recolorés vers la carnation ----------
for f in sorted(glob.glob(Z2 + 'nez_avatar/0[1-8]_*.png')):
    a = np.array(Image.open(f).convert('RGBA')).astype(np.float32)
    fill = (a[..., 3] > 60) & (a[..., :3].mean(2) > 170)
    put(TRAITE + 'nez_avatar/' + os.path.basename(f), a)
    T['peau']['nez/' + os.path.basename(f)] = dict(ref=rgb(np.median(a[fill][:, :3], axis=0)), res=.1)

# ---------- bouches ----------
for f in sorted(glob.glob(Z2 + 'bouches_avatar/academie_des_astres_bouches_feminines_corrigees/0*.png')):
    a = np.array(Image.open(f).convert('RGBA')).astype(np.float32); b = os.path.basename(f)
    put(TRAITE + 'bouches_feminines/' + b, a)
    T['peau']['bouches/existantes/' + b] = dict(mode='assombrir')
for f in sorted(glob.glob(Z2 + 'bouches_avatar/02_bouches_masculines/0*.png')):
    a = np.array(Image.open(f).convert('RGBA')).astype(np.float32); b = os.path.basename(f)
    L_ = a[..., :3].mean(2); mx = a[..., :3].max(2); mn = a[..., :3].min(2)
    dent = np.clip((mx - 200) / 25, 0, 1) * np.clip((40 - (mx - mn)) / 20, 0, 1)
    put(TRAITE + 'bouches_masculines/' + b, a)
    m = mask('bouches/masculines/' + b, [1 - dent])
    T['peau']['bouches/masculines/' + b] = dict(ref=[238, 200, 182], masque=m, canal=0, res=.1, hi=.9)

# ---------- coiffures : recalées sur le crâne, nettoyées ----------
H = {}
for k in range(1, 17):
    if k in R['hairs']:
        h = R['hairs'][k]; H[k] = (h['img'], h['X'], h['Y'], h['ref'])
    else:   # 13 : nouveau dessin de trois-quarts, l'ancienne version de face est gardée
        o = P['hairs'][k]; A = face_anchors(F1); H[k] = (o['img'], A['hair'][0] - o['ax'], A['hair'][1] - o['ay'], o['ref'])
Y0 = int(min(v[2] for v in H.values())) - 12
for k, (img, X, Y, ref) in H.items():
    name = os.path.basename(glob.glob(Z2 + f'coiffures_avatar/{k:02d}_*.png')[0])
    hh = int(np.ceil(Y - Y0 + img.shape[0])) + 4
    can = np.zeros((hh, 1024, 4), np.float32)
    x0, y0 = int(round(X)), int(round(Y - Y0))
    xs0, xs1 = max(0, x0), min(1024, x0 + img.shape[1])
    can[y0:y0 + img.shape[0], xs0:xs1] = img[:, xs0 - x0:xs1 - x0]
    put(TRAITE + 'coiffures_avatar/' + name, can)
    T['cheveux']['cheveux/' + name] = dict(ref=rgb(ref))
    T['poses']['cheveux/' + name] = dict(x=0, y=round(Y0 - F1['crown'], 1))   # origine du canevas, relative au sommet du crâne

# ---------- tenues plein pied : peau recolorable ----------
for i, n in enumerate(TENUES, 1):
    t = build_tenue(n); raw = np.array(Image.open(Z2 + f'tenues_avatar/{n}.png').convert('RGBA')).astype(np.float32)
    clean = t['img'].copy(); clean[:BODY['chin'] + 1, 430:600] = raw[:BODY['chin'] + 1, 430:600]   # tête chauve conservée (masquée par le jeu)
    put(TRAITE + f'tenues_avatar/{n}.png', clean)
    m = mask(f'tenues/{n}.png', [t['skin']])
    T['peau'][f'tenues/{n}.png'] = dict(ref=rgb(t['ref']), masque=m, canal=0)

# ---------- bustes portrait HD et couleurs des maisons ----------
U = Z2 + 'uniformes_portraits_maisons/'
HD = {'lion': '02_variantes_lion', 'cygne': '03_variantes_cygne', 'dragon': '04_variantes_dragon'}
QO, QS = (152, 98), 1.42
for i, n in enumerate(TENUES, 1):
    q = np.array(Image.open(U + f'01_portraits_neutres/{n}_portrait.png').convert('RGBA')).astype(np.float32)
    q[..., 3] = np.clip((q[..., 3] - 60) / 195, 0, 1) * 255
    sk = tenue_skin_mask(q); op = (sk > .8) & (q[..., 3] > 220)
    Lq = q[..., :3].mean(2); warm = (q[..., 0] - q[..., 2]) > 12
    grow = ndi.binary_dilation(sk > .3, iterations=3) & warm & (Lq > 90)
    sk = np.maximum(sk, cv2.GaussianBlur(grow.astype(np.float32), (0, 0), 1.0))
    put(PUB + f'bustes/{n}.png', q)
    m = mask(f'bustes/{n}.png', [sk])
    T['peau'][f'bustes/{n}.png'] = dict(ref=rgb(np.median(q[op][:, :3], axis=0)), masque=m, canal=0)
    T['bustes'][f'tenues/{n}.png'] = dict(fichier=f'bustes/{n}.png', l=1024, h=1024, origine=list(QO), echelle=round(1 / QS, 6), maisons={})
    for h, d in HD.items():
        v = np.array(Image.open(U + f'{d}/{n}_{h}.png').convert('RGBA')).astype(np.float32)
        diff = np.abs(v[..., :3] - q[..., :3]).max(2) * (v[..., 3] > 0) / 255
        mm = np.clip((diff - 0.06) / 0.12, 0, 1)
        mm = cv2.GaussianBlur(ndi.binary_dilation(mm > .2, iterations=1).astype(np.float32), (0, 0), .8) * np.maximum(mm, .6)
        put(PUB + f'accents/bustes/{n}_{h}.png', np.dstack([v[..., :3], mm * 255]))
        T['bustes'][f'tenues/{n}.png']['maisons'][h] = f'accents/bustes/{n}_{h}.png'
        ac = R['accents'][(i, h)]; can = np.zeros((1024, 1024, 4), np.float32)
        ih, iw = ac['img'].shape[:2]; can[ac['y']:ac['y'] + ih, ac['x']:ac['x'] + iw] = ac['img']
        put(PUB + f'accents/tenues/{n}_{h}.png', can)
        T['accents'].setdefault(f'tenues/{n}.png', {})[h] = f'accents/tenues/{n}_{h}.png'

ts = ("// FICHIER GÉNÉRÉ par scripts/academie/traitement/traiter_pour_repo.py — ne pas modifier à la main.\n"
      "// Recoloration de l'aperçu : couleur de référence de chaque calque, masques (R/V = zones teintables),\n"
      "// pose des coiffures (origine du canevas relative au sommet du crâne), bustes HD et couleurs des maisons.\n\n"
      'import type { DonneesTeintes } from "./types";\n\n'
      f"export const donneesTeintes: DonneesTeintes = {json.dumps(T, indent=1, ensure_ascii=False)};\n")
open(REPO + 'data/academie/avatar/teintes.genere.ts', 'w').write(ts)
print('ok', {k: len(v) for k, v in T.items()})
