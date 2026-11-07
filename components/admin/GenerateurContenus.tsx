"use client";

// 🎬 Studio montage : l'accueil (mes projets) ↔ l'éditeur d'un projet.
import { useRef, useState } from "react";
import ProjetsMontage from "@/components/admin/montage/ProjetsMontage";
import EditeurMontage, { type ProjetOuvert } from "@/components/admin/montage/EditeurMontage";
import { lireEtatBrouillon, lireFichierBrouillon, type BrouillonInfo } from "@/lib/brouillonsMontage";
import type { ClipTwitch } from "@/lib/montage/projet";

const nomSansExt = (n: string) => n.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Nouveau projet";

export default function GenerateurContenus() {
  const [ouvert, setOuvert] = useState<ProjetOuvert | null>(null);
  const [message, setMessage] = useState("");
  const [cle, setCle] = useState(0); // recharge la liste en revenant
  const [reimport, setReimport] = useState<{ info: BrouillonInfo; exporter?: boolean } | null>(null);
  const entree = useRef<HTMLInputElement>(null);

  function nouveau(f: File, clip: ClipTwitch | null) {
    setMessage("");
    const maint = Date.now();
    setOuvert({ id: "p" + maint.toString(36) + Math.random().toString(36).slice(2, 6), nom: clip?.titre || nomSansExt(f.name), nomFichier: f.name, cree: maint, archive: false, fichier: f, etat: null, fichierEnLigne: false, clip, nouveau: true });
  }
  async function ouvrir(b: BrouillonInfo, opts?: { exporter?: boolean }) {
    setMessage("Ouverture du projet…");
    try {
      const info = await lireEtatBrouillon(b);
      const fichier = await lireFichierBrouillon(b.id, info);
      if (!fichier) { setMessage(""); setReimport({ info, exporter: opts?.exporter }); return; }
      lancer(info, fichier, true, opts?.exporter);
    } catch (e) { setMessage("Impossible d’ouvrir ce projet : " + (e instanceof Error ? e.message : String(e))); }
  }
  function lancer(info: BrouillonInfo, fichier: Blob, enLigne: boolean, exporter?: boolean) {
    setMessage("");
    const etat = (info.etat || {}) as Record<string, unknown>;
    setOuvert({ id: info.id, nom: info.nom, nomFichier: info.nomFichier, cree: info.cree || info.maj, archive: Boolean(info.archive), fichier, etat, fichierEnLigne: enLigne, clip: (etat.clipChoisi as ClipTwitch) || null, nouveau: false, exporter });
  }

  if (ouvert) return <EditeurMontage key={ouvert.id} projet={ouvert} onFermer={() => { setOuvert(null); setCle((k) => k + 1); }} />;
  return (
    <>
      <ProjetsMontage key={cle} onNouveau={nouveau} onOuvrir={ouvrir} message={message} />
      {reimport && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-violet/30 bg-[#1a1033] p-5 shadow-2xl">
            <p className="text-lg font-semibold">La vidéo de ce projet est introuvable</p>
            <p className="mt-1 text-sm text-ink-soft">Le montage de « {reimport.info.nom} » est bien là, mais sa vidéo ({reimport.info.nomFichier}) n’est ni sur cet appareil ni en ligne. Choisis-la à nouveau : tout ton montage sera remis dessus.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setReimport(null)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Annuler</button>
              <label className="cursor-pointer rounded-full bg-violet px-4 py-2 text-sm font-semibold text-white">
                Choisir la vidéo
                <input ref={entree} type="file" accept="video/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f && reimport) { const r = reimport; setReimport(null); lancer(r.info, f, false, r.exporter); } }} />
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
