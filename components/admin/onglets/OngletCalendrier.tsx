"use client";

// Administration — rubrique « calendrier » (état partagé : components/admin/contexteAdmin.tsx)
import AdminCalendrier from "@/components/admin/AdminCalendrier";
import { useAdmin } from "@/components/admin/contexteAdmin";

export default function OngletCalendrier() {
  const { planning, calendrier, setCalendrier, enregistrement, setMessage, enregistrer } = useAdmin();
  return (
        <AdminCalendrier
          planning={planning}
          calendrier={calendrier}
          onChange={setCalendrier}
          enregistrement={enregistrement}
          onEnregistrer={() => {
            const sansTitre = calendrier.evenements.some((e) => !e.titre.trim());
            if (sansTitre) {
              setMessage({ type: "erreur", texte: "Donne un titre à chaque événement avant d'enregistrer." });
              return;
            }
            enregistrer("/api/calendrier", { calendrier }, "Calendrier enregistré ! CycyBot le récupère dans les 2 minutes.");
          }}
        />
  );
}
