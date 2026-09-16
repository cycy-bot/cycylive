// ============================================================
// CIEL ANIMÉ — calque d'étoiles scintillantes + étoiles filantes
// ============================================================
// Présent sur tout le site (voir app/layout.tsx). Positions fixes
// (pas de Math.random()) pour éviter les décalages d'affichage
// entre le serveur et le navigateur.

const ETOILES = [
  { top: "6%", left: "10%", taille: 2, delai: "0s", duree: "3.4s" },
  { top: "12%", left: "82%", taille: 1.5, delai: "0.8s", duree: "2.8s" },
  { top: "22%", left: "35%", taille: 1.5, delai: "1.6s", duree: "3.8s" },
  { top: "9%", left: "58%", taille: 2, delai: "0.4s", duree: "3s" },
  { top: "31%", left: "92%", taille: 1.5, delai: "2.1s", duree: "3.4s" },
  { top: "40%", left: "6%", taille: 2, delai: "1.1s", duree: "2.6s" },
  { top: "48%", left: "70%", taille: 1.5, delai: "0.2s", duree: "3.6s" },
  { top: "55%", left: "20%", taille: 1.5, delai: "1.8s", duree: "3s" },
  { top: "63%", left: "88%", taille: 2, delai: "0.9s", duree: "2.9s" },
  { top: "70%", left: "45%", taille: 1.5, delai: "2.4s", duree: "3.3s" },
  { top: "78%", left: "15%", taille: 2, delai: "0.6s", duree: "3.7s" },
  { top: "85%", left: "65%", taille: 1.5, delai: "1.3s", duree: "2.7s" },
  { top: "90%", left: "30%", taille: 1.5, delai: "1.9s", duree: "3.1s" },
  { top: "3%", left: "25%", taille: 1.5, delai: "2.6s", duree: "3.5s" },
  { top: "18%", left: "5%", taille: 1.5, delai: "0.3s", duree: "2.5s" },
  { top: "60%", left: "55%", taille: 1.5, delai: "1.5s", duree: "3.2s" },
];

const ETOILES_FILANTES = [
  { top: "8%", left: "78%", delai: "0s", duree: "9s" },
  { top: "38%", left: "92%", delai: "5s", duree: "12s" },
  { top: "65%", left: "60%", delai: "10s", duree: "10.5s" },
];

export default function CielAnime() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {ETOILES.map((e, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-ink"
          style={{
            top: e.top,
            left: e.left,
            width: e.taille,
            height: e.taille,
            animation: `scintille ${e.duree} ease-in-out ${e.delai} infinite`,
          }}
        />
      ))}

      {ETOILES_FILANTES.map((e, i) => (
        <span
          key={i}
          className="absolute h-px w-16 rounded-full"
          style={{
            top: e.top,
            left: e.left,
            background:
              "linear-gradient(90deg, rgba(245,241,255,0.9), rgba(245,241,255,0))",
            animation: `file ${e.duree} linear ${e.delai} infinite`,
          }}
        />
      ))}
    </div>
  );
}
