// Connexion des membres sur le site (côté navigateur).
// Le jeton signé par Cycy_Bot est gardé dans ce navigateur uniquement ;
// il ne sert qu'à régler son propre profil public.
import { CYCYBOT_URL_PUBLIC } from "@/lib/cycybot";

const CLE = "cycylive-membre-jeton";

export function lireJeton(): string {
  try {
    return localStorage.getItem(CLE) || "";
  } catch {
    return "";
  }
}

export function ecrireJeton(jeton: string) {
  try {
    if (jeton) localStorage.setItem(CLE, jeton);
    else localStorage.removeItem(CLE);
  } catch {}
}

/** Récupère le jeton (ou l'erreur) laissé dans l'adresse au retour de Discord. */
export function recupererRetourConnexion(): { jeton?: string; erreur?: string } {
  const h = window.location.hash;
  if (!h.startsWith("#cycy")) return {};
  const params = new URLSearchParams(h.slice(1));
  history.replaceState(null, "", window.location.pathname + window.location.search);
  const jeton = params.get("cycytoken") || "";
  if (jeton) ecrireJeton(jeton);
  return { jeton: jeton || undefined, erreur: params.get("cycyerreur") || undefined };
}

export function lienConnexion(retour: string) {
  return `${CYCYBOT_URL_PUBLIC}/compte/login?retour=${encodeURIComponent(retour)}`;
}

export async function apiMembre<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const jeton = lireJeton();
  const r = await fetch(`${CYCYBOT_URL_PUBLIC}${chemin}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}), ...(init.headers || {}) },
  });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) ecrireJeton("");
  if (!r.ok) throw Object.assign(new Error((data as { error?: string }).error || "Erreur"), { status: r.status });
  return data as T;
}
