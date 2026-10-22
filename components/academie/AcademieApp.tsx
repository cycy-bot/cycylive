"use client";

// Point d'entrée du prototype "L'Académie des Astres".
// Gère l'enchaînement des écrans, les transitions et la sauvegarde
// locale. Toute la logique de jeu vit dans lib/academie/ et tous
// les contenus dans data/academie/.

import "./academie.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chapitreDemo } from "@/data/academie/chapitres/demo";
import { personnageParDefaut } from "@/data/academie/personnalisation";
import { calculerMaison } from "@/lib/academie/ceremonie";
import { demarrer, type EtatScene } from "@/lib/academie/moteur";
import { charger, effacer, enregistrer, type Etape, type Sauvegarde } from "@/lib/academie/sauvegarde";
import EcranAccueil from "./EcranAccueil";
import CreateurPersonnage, { INDEX_RECAPITULATIF } from "./CreateurPersonnage";
import Ceremonie from "./Ceremonie";
import Revelation from "./Revelation";
import LecteurScene from "./LecteurScene";
import Synthese from "./Synthese";
import { BadgePrototype, MenuDemo } from "./ui";

type Etat = Omit<Sauvegarde, "version">;

const etatVierge: Etat = {
  etape: "accueil",
  etapeCreation: 0,
  personnage: personnageParDefaut,
  reponsesCeremonie: {},
  questionCeremonie: 0,
  maison: null,
  scene: null,
  reglages: { texteInstantane: false },
};

const DUREE_VOILE = 1100;
const DELAI_SAUVEGARDE = 400;

export default function AcademieApp() {
  const [etat, setEtat] = useState<Etat>(etatVierge);
  const [pret, setPret] = useState(false);
  const [voile, setVoile] = useState(false);
  /** Étape à laquelle reprendre depuis l'écran d'accueil. */
  const [reprise, setReprise] = useState<Etape | null>(null);

  // Chargement de la sauvegarde : on revient toujours sur l'accueil,
  // avec un bouton "Reprendre" si une partie est en cours.
  useEffect(() => {
    const s = charger();
    if (s) {
      const { version: _v, ...reste } = s;
      setEtat({ ...reste, etape: "accueil" });
      if (s.etape !== "accueil") setReprise(s.etape);
    }
    setPret(true);
  }, []);

  // Sauvegarde automatique, différée pour éviter une écriture à chaque
  // frappe ou à chaque clic ; elle est forcée quand l'onglet se ferme.
  const aEcrire = useRef<Etat | null>(null);
  useEffect(() => {
    if (!pret) return;
    aEcrire.current = reprise && etat.etape === "accueil" ? { ...etat, etape: reprise } : etat;
    const t = setTimeout(() => {
      if (aEcrire.current) enregistrer(aEcrire.current);
      aEcrire.current = null;
    }, DELAI_SAUVEGARDE);
    return () => clearTimeout(t);
  }, [etat, pret, reprise]);
  useEffect(() => {
    const vider = () => {
      if (aEcrire.current) enregistrer(aEcrire.current);
      aEcrire.current = null;
    };
    const siCache = () => document.visibilityState === "hidden" && vider();
    window.addEventListener("pagehide", vider);
    document.addEventListener("visibilitychange", siCache);
    return () => {
      vider();
      window.removeEventListener("pagehide", vider);
      document.removeEventListener("visibilitychange", siCache);
    };
  }, []);

  // Le prototype s'affiche en plein écran, au-dessus du site.
  useEffect(() => {
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = avant;
    };
  }, []);

  const maj = useCallback((partiel: Partial<Etat>) => setEtat((e) => ({ ...e, ...partiel })), []);

  const allerA = useCallback(
    (etape: Etape, partiel: Partial<Etat> = {}) => {
      setVoile(true);
      setTimeout(() => {
        setReprise(null);
        setEtat((e) => ({ ...e, ...partiel, etape }));
      }, DUREE_VOILE / 2);
      setTimeout(() => setVoile(false), DUREE_VOILE);
    },
    []
  );

  const resultat = useMemo(() => calculerMaison(etat.reponsesCeremonie), [etat.reponsesCeremonie]);
  const ctx = useMemo(() => ({ personnage: etat.personnage, maison: etat.maison }), [etat.personnage, etat.maison]);
  const scene = chapitreDemo.scenes[0];

  const recommencerDemo = useCallback(() => {
    effacer();
    allerA("accueil", etatVierge);
  }, [allerA]);

  const lancerScene = useCallback(() => {
    allerA("scene", { scene: demarrer(scene, ctx) });
  }, [allerA, scene, ctx]);

  const refaireCeremonie = useCallback(() => {
    allerA("ceremonie", { reponsesCeremonie: {}, questionCeremonie: 0, maison: null, scene: null });
  }, [allerA]);

  const terminerCeremonie = useCallback(() => {
    allerA("revelation", { maison: calculerMaison(etat.reponsesCeremonie).maison });
  }, [allerA, etat.reponsesCeremonie]);

  if (!pret) return <div className="fixed inset-0 z-[100] bg-[#07061a]" />;

  return (
    <div className="ada-racine fixed inset-0 z-[100] overflow-hidden bg-[#07061a]">
      <div key={etat.etape} className="absolute inset-0 ada-fondu">
        {etat.etape === "accueil" && (
          <EcranAccueil
            partieEnCours={!!reprise}
            onCommencer={() => {
              effacer();
              allerA("creation", { ...etatVierge });
            }}
            onReprendre={() => reprise && allerA(reprise)}
          />
        )}

        {etat.etape === "creation" && (
          <CreateurPersonnage
            personnage={etat.personnage}
            etape={etat.etapeCreation}
            onChange={(personnage) => maj({ personnage })}
            onEtape={(etapeCreation) => maj({ etapeCreation })}
            onRetourAccueil={() => allerA("accueil")}
            onTerminer={() => allerA("ceremonie")}
          />
        )}

        {etat.etape === "ceremonie" && (
          <Ceremonie
            reponses={etat.reponsesCeremonie}
            position={etat.questionCeremonie}
            onPosition={(questionCeremonie) => maj({ questionCeremonie })}
            onRepondre={(q, r) => setEtat((e) => ({ ...e, reponsesCeremonie: { ...e.reponsesCeremonie, [q]: r } }))}
            onRetourCreation={() => allerA("creation", { etapeCreation: INDEX_RECAPITULATIF })}
            onTerminer={terminerCeremonie}
          />
        )}

        {etat.etape === "revelation" && etat.maison && (
          <Revelation personnage={etat.personnage} resultat={{ ...resultat, maison: etat.maison }} onContinuer={lancerScene} onRefaire={refaireCeremonie} />
        )}

        {etat.etape === "scene" && etat.scene && (
          <LecteurScene
            titreChapitre={chapitreDemo.titre}
            scene={scene}
            etat={etat.scene}
            ctx={ctx}
            texteInstantane={etat.reglages.texteInstantane}
            onEtat={(s: EtatScene) => maj({ scene: s })}
            onTexteInstantane={(v) => maj({ reglages: { ...etat.reglages, texteInstantane: v } })}
            onFin={() => allerA("synthese")}
            onRejouer={lancerScene}
            onRecommencerDemo={recommencerDemo}
          />
        )}

        {etat.etape === "synthese" && etat.scene && (
          <Synthese
            scene={scene}
            etat={etat.scene}
            ctx={ctx}
            onRejouerScene={lancerScene}
            onRefaireCeremonie={refaireCeremonie}
            onRecommencerDemo={recommencerDemo}
          />
        )}
      </div>

      {/* Menu global (le lecteur de scène a le sien) */}
      {etat.etape !== "scene" && (
        <div className="absolute right-3 top-3 z-[105] flex items-center gap-2 sm:right-4 sm:top-4">
          <BadgePrototype />
          <MenuDemo onRecommencer={recommencerDemo} />
        </div>
      )}

      {voile && <div className="pointer-events-auto absolute inset-0 z-[115] ada-voile" />}
    </div>
  );
}
