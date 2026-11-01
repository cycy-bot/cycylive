// Les jeux écoutent le clavier sur toute la page : on ignore les touches tapées
// dans un champ (pseudo du classement, recherche…), sinon « a », « z », espace…
// seraient avalés par le jeu et impossibles à écrire.
export function dansUnChamp(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
}
