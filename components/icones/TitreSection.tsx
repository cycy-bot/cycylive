// Titre de section précédé de sa pastille d'icône (remplace les emojis en début de titre).
import { Pastille, type Teinte } from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";

export default function TitreSection({
  icone,
  teinte = "violet",
  niveau = 2,
  id,
  className = "",
  taille = "sm",
  children,
}: {
  icone: NomIcone;
  teinte?: Teinte;
  niveau?: 2 | 3;
  id?: string;
  className?: string;
  taille?: "xs" | "sm" | "md";
  children: React.ReactNode;
}) {
  const Balise = niveau === 2 ? "h2" : "h3";
  const texte = niveau === 2 ? "text-2xl md:text-3xl" : "text-lg";
  return (
    <Balise id={id} className={`flex items-center gap-3 font-semibold text-ink ${texte} ${className}`}>
      <Pastille nom={icone} teinte={teinte} taille={taille} />
      <span className="min-w-0">{children}</span>
    </Balise>
  );
}
