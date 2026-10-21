"use client";

// Administration — rubrique « planning » : semaines à venir (date par date) et semaine type.
// État partagé : components/admin/contexteAdmin.tsx
import PlanningSemaines from "@/components/admin/PlanningSemaines";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletPlanning() {
  const { planning, calendrier, setCalendrier, enregistrement, modifierJour, enregistrer, setMessage } = useAdmin();
  return (
    <PlanningSemaines
      planning={planning}
      calendrier={calendrier}
      modifierJour={modifierJour}
      setCalendrier={setCalendrier}
      enregistrement={enregistrement}
      onEnregistrer={async () => {
        if (calendrier.evenements.some((e) => !e.titre.trim())) {
          setMessage({ type: "erreur", texte: "Un événement du calendrier n'a pas de titre : complète-le dans Calendrier avant d'enregistrer." });
          return;
        }
        await enregistrer("/api/planning", { planning }, "Semaine type enregistrée…");
        await enregistrer("/api/calendrier", { calendrier }, "Planning enregistré et visible sur le site ! CycyBot le récupère dans les 2 minutes.");
      }}
    />
  );
}
