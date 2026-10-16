// Identifiant aléatoire de l'appareil, gardé dans le navigateur.
// CycyBot donne un ticket / une récompense du compagnon par APPAREIL et par jour :
// sans cet identifiant, deux joueurs sur la même connexion (même box, même réseau
// mobile) recevaient le même code, et le deuxième ne pouvait pas l'utiliser.
const CLE = "cycylive-appareil";

export function idAppareil(): string {
  try {
    let id = localStorage.getItem(CLE) || "";
    if (!/^[a-zA-Z0-9_-]{16,64}$/.test(id)) {
      const octets = new Uint8Array(18);
      crypto.getRandomValues(octets);
      id = Array.from(octets, (b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(CLE, id);
    }
    return id;
  } catch {
    // Navigation privée stricte : un identifiant pour cette visite seulement
    const octets = new Uint8Array(18);
    crypto.getRandomValues(octets);
    return Array.from(octets, (b) => b.toString(16).padStart(2, "0")).join("");
  }
}
