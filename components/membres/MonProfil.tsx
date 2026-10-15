"use client";
// Espace « Mon profil » : connexion Discord, choix de ce qui est public, aperçu.
import { useEffect, useState } from "react";
import ProfilCycylien from "@/components/membres/ProfilCycylien";
import type { ProfilPublic } from "@/lib/membres";
import { apiMembre, ecrireJeton, lienConnexion, lireJeton, recupererRetourConnexion } from "@/lib/compteMembre";

type Reglages = { enabled: boolean; slug: string; sections: Record<string, boolean>; fields: string[]; bio: string };
type Donnees = { profil: ProfilPublic; reglages: Reglages; champs: { key: string; label: string; emoji: string }[]; sections: string[] };

const SECTIONS: Record<string, { label: string; aide: string }> = {
  orbite: { label: "🪐 Orbite et points", aide: "Ton niveau et ta place au classement" },
  passeport: { label: "🪪 Passeport", aide: "Seulement les infos que tu coches ci-dessous" },
  succes: { label: "🏅 Succès", aide: "Les succès que tu as débloqués" },
  cartes: { label: "🃏 Cartes Astrales", aide: "Ta collection et tes plus belles cartes" },
  compagnon: { label: "🐾 Compagnon", aide: "Ton compagnon du site (une fois connecté·e sur la page Compagnon)" },
  tampons: { label: "📜 Tampons", aide: "Les événements de la Chronique auxquels tu as participé" },
  twitch: { label: "🟣 Pseudo Twitch", aide: "Si ton compte Twitch est lié (/lier-twitch)" },
};

function Interrupteur({ actif, onChange, label }: { actif: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      onClick={() => onChange(!actif)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${actif ? "bg-violet" : "bg-white/15"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${actif ? "left-6" : "left-1"}`} />
    </button>
  );
}

export default function MonProfil() {
  const [etat, setEtat] = useState<"chargement" | "deconnecte" | "pret">("chargement");
  const [d, setD] = useState<Donnees | null>(null);
  const [r, setR] = useState<Reglages | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function charger() {
    try {
      const data = await apiMembre<Donnees>("/api/membre/moi");
      setD(data);
      setR(data.reglages);
      setEtat("pret");
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401) setEtat("deconnecte");
      else { setEtat(lireJeton() ? "pret" : "deconnecte"); setMessage({ ok: false, texte: err.message }); }
    }
  }

  useEffect(() => {
    const retour = recupererRetourConnexion();
    if (retour.erreur) setMessage({ ok: false, texte: retour.erreur });
    if (!lireJeton()) { setEtat("deconnecte"); return; }
    charger();
  }, []);

  useEffect(() => {
    if (!message?.ok) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  async function enregistrer(suivant: Reglages, texte = "Enregistré ✓") {
    setR(suivant);
    setEnCours(true);
    try {
      const res = await apiMembre<{ reglages: Reglages }>("/api/membre/moi", { method: "PUT", body: JSON.stringify(suivant) });
      setR(res.reglages);
      setMessage({ ok: true, texte });
    } catch (e) {
      setMessage({ ok: false, texte: (e as Error).message });
    } finally {
      setEnCours(false);
    }
  }

  function seDeconnecter() {
    ecrireJeton("");
    setD(null);
    setR(null);
    setEtat("deconnecte");
  }

  if (etat === "chargement") return <p className="text-ink-soft">Chargement…</p>;

  if (etat === "deconnecte" || !d || !r) {
    return (
      <div className="carte-holo rounded-3xl border border-violet/15 p-7 md:p-9 max-w-xl">
        <p className="text-4xl mb-3" aria-hidden>🪪</p>
        <h2 className="text-2xl font-semibold text-ink mb-2">Ton profil Cycylien·ne</h2>
        <p className="text-ink-soft mb-6">
          Connecte-toi avec ton compte Discord (celui du serveur Cycylive) pour créer ta page publique : orbite, succès, cartes, compagnon… C’est toi qui choisis ce qui est visible, et rien n’est public tant que tu ne l’as pas activé.
        </p>
        {message && !message.ok && <p className="text-sm text-red-300 mb-4" role="alert">{message.texte}</p>}
        <a href={lienConnexion(typeof window !== "undefined" ? window.location.origin + "/profil" : "https://cycylive.fr/profil")} className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#5865F2] text-white font-medium hover:brightness-110 transition-all">
          Se connecter avec Discord
        </a>
        <p className="text-xs text-ink-soft/60 mt-4">Seul ton identifiant Discord est demandé (pas tes messages ni ton e-mail).</p>
      </div>
    );
  }

  const lien = `/membres/${r.slug}`;
  const sections = (k: string, v: boolean) => enregistrer({ ...r, sections: { ...r.sections, [k]: v } });
  const champ = (k: string, v: boolean) => enregistrer({ ...r, fields: v ? [...r.fields, k] : r.fields.filter((x) => x !== k) });
  const remplis = new Set((d.profil.passeport || []).map((f) => f.key));
  // Aperçu tel que les visiteurs le verront
  const visible: ProfilPublic = {
    ...d.profil,
    bio: r.bio,
    orbite: r.sections.orbite ? d.profil.orbite : undefined,
    passeport: r.sections.passeport ? (d.profil.passeport || []).filter((f) => r.fields.includes(f.key)) : undefined,
    succes: r.sections.succes ? d.profil.succes : undefined,
    cartes: r.sections.cartes ? d.profil.cartes : undefined,
    compagnon: r.sections.compagnon ? d.profil.compagnon : undefined,
    tampons: r.sections.tampons ? d.profil.tampons : undefined,
    twitch: r.sections.twitch ? d.profil.twitch : undefined,
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
      <div className="space-y-5 lg:sticky lg:top-24">
        <div className="carte-holo rounded-3xl border border-violet/15 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-ink font-semibold">Profil public</p>
              <p className="text-xs text-ink-soft">{r.enabled ? "Visible par tout le monde" : "Privé : personne ne le voit"}</p>
            </div>
            <Interrupteur actif={r.enabled} label="Rendre mon profil public" onChange={(v) => enregistrer({ ...r, enabled: v }, v ? "Ton profil est en ligne 🎉" : "Ton profil est redevenu privé")} />
          </div>
          {r.enabled && (
            <div className="mt-4 flex gap-2 flex-wrap">
              <a href={lien} className="rounded-full px-4 py-2 bg-violet text-ink text-sm font-medium hover:bg-violet-light transition-all">Voir ma page →</a>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(window.location.origin + lien).then(() => setMessage({ ok: true, texte: "Lien copié ✓" }))}
                className="rounded-full px-4 py-2 border border-violet/30 text-ink-soft text-sm hover:bg-violet/10"
              >
                Copier le lien
              </button>
            </div>
          )}
        </div>

        <div className="carte-holo rounded-3xl border border-violet/15 p-5">
          <label htmlFor="bio" className="block text-ink font-semibold mb-2">Petite présentation</label>
          <textarea
            id="bio"
            maxLength={200}
            defaultValue={r.bio}
            onBlur={(e) => e.target.value !== r.bio && enregistrer({ ...r, bio: e.target.value })}
            placeholder="Une phrase sur toi (200 caractères max)"
            className="w-full min-h-[80px] rounded-xl bg-card border border-violet/20 px-3 py-2 text-ink text-sm outline-none focus:border-violet/60"
          />
        </div>

        <div className="carte-holo rounded-3xl border border-violet/15 p-5">
          <p className="text-ink font-semibold mb-3">Ce qui est visible</p>
          <ul className="space-y-3">
            {d.sections.map((k) => (
              <li key={k} className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm text-ink">{SECTIONS[k]?.label || k}</span>
                  <span className="block text-xs text-ink-soft/70">{SECTIONS[k]?.aide}</span>
                </span>
                <Interrupteur actif={r.sections[k] !== false} label={SECTIONS[k]?.label || k} onChange={(v) => sections(k, v)} />
              </li>
            ))}
          </ul>
        </div>

        {r.sections.passeport && (
          <div className="carte-holo rounded-3xl border border-violet/15 p-5">
            <p className="text-ink font-semibold mb-1">Infos du passeport à montrer</p>
            <p className="text-xs text-ink-soft/70 mb-3">Elles se remplissent sur Discord avec /passeport. Les infos vides n’apparaissent jamais.</p>
            <ul className="space-y-2">
              {d.champs.map((c) => (
                <li key={c.key}>
                  <label className={`flex items-center gap-3 text-sm ${remplis.has(c.key) ? "text-ink" : "text-ink-soft/50"}`}>
                    <input type="checkbox" checked={r.fields.includes(c.key)} disabled={!remplis.has(c.key)} onChange={(e) => champ(c.key, e.target.checked)} className="accent-violet h-4 w-4" />
                    {c.emoji} {c.label}{remplis.has(c.key) ? "" : " (vide)"}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" onClick={seDeconnecter} className="text-sm text-ink-soft hover:text-ink underline underline-offset-2">Se déconnecter de ce navigateur</button>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/60 mb-3">Aperçu de ta page{r.enabled ? "" : " (privée pour l’instant)"}</p>
        <ProfilCycylien p={visible} apercu />
      </div>

      {message && (
        <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <p role="status" className={`pointer-events-auto rounded-2xl border px-5 py-3 text-sm backdrop-blur-md ${message.ok ? "border-emerald-400/30 bg-void/90 text-emerald-200" : "border-red-400/40 bg-void/95 text-red-200"}`}>
            {message.texte} <button onClick={() => setMessage(null)} className="ml-2 text-ink-soft" aria-label="Fermer">✕</button>
          </p>
        </div>
      )}
      {enCours && <span className="sr-only">Enregistrement…</span>}
    </div>
  );
}
