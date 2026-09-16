import { liens } from "@/data/liens";

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 py-16 text-ink-soft leading-relaxed">
      <h1 className="text-3xl font-semibold text-ink mb-10">Mentions légales</h1>

      <p className="mb-8 text-sm text-ink-soft/70">
        Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004
        pour la confiance dans l'économie numérique (LCEN), il est précisé
        aux utilisateurs du site cycylive.fr l'identité des différents
        intervenants dans le cadre de sa réalisation et de son suivi.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">1. Éditrice du site</h2>
      <p className="mb-2">
        Le présent site est édité, à titre non professionnel, par une
        personne physique exerçant sous le pseudonyme <strong className="text-ink">« Cycy »</strong>,
        domiciliée en région Provence-Alpes-Côte d'Azur (France).
      </p>
      <p className="mb-4">
        Conformément à l'article 6-III de la LCEN, les éditeurs de sites
        non professionnels sont autorisés à ne pas rendre publiques leurs
        coordonnées personnelles complètes, à condition d'avoir communiqué
        ces données à leur hébergeur. Ces informations peuvent être
        obtenues sur demande auprès des autorités judiciaires compétentes.
      </p>
      <p className="mb-4">
        Contact : <a href={`mailto:${liens.mailPro}`} className="text-violet-light hover:text-lilac">{liens.mailPro}</a>
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">2. Directrice de la publication</h2>
      <p className="mb-4">
        La directrice de la publication du site est la personne mentionnée
        à l'article 1 ci-dessus, exerçant sous le pseudonyme « Cycy ».
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">3. Hébergement</h2>
      <p className="mb-1">Le site cycylive.fr est hébergé par :</p>
      <p className="mb-1">Vercel Inc.</p>
      <p className="mb-1">440 North Barranca Avenue, Suite 4133</p>
      <p className="mb-1">Covina, California 91723, États-Unis</p>
      <p className="mb-4">
        Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-violet-light hover:text-lilac">vercel.com</a>
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">4. Nom de domaine</h2>
      <p className="mb-4">
        Le nom de domaine cycylive.fr est enregistré auprès d'IONOS SARL,
        7 place de la Gare, 57200 Sarreguemines, France.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">5. Propriété intellectuelle</h2>
      <p className="mb-4">
        L'ensemble des contenus présents sur ce site (textes, logo, charte
        graphique, photographies, éléments visuels) est la propriété
        exclusive de Cycy, sauf mention contraire, et est protégé par le
        droit d'auteur. Toute reproduction, représentation, modification ou
        exploitation, totale ou partielle, de ces contenus, sans
        autorisation préalable, est interdite et constitutive d'une
        contrefaçon au sens des articles L.335-2 et suivants du Code de la
        propriété intellectuelle.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">6. Liens hypertextes</h2>
      <p className="mb-4">
        Le site cycylive.fr contient des liens vers des plateformes tierces
        (Twitch, TikTok, Instagram, YouTube, Discord, Linktree). Cycy
        n'exerce aucun contrôle sur ces sites externes et décline toute
        responsabilité quant à leur contenu, leur disponibilité ou leurs
        propres pratiques en matière de données personnelles.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">7. Limitation de responsabilité</h2>
      <p className="mb-4">
        Cycy s'efforce d'assurer l'exactitude et la mise à jour des
        informations diffusées sur ce site (planning des lives, contenus,
        statut de connexion Twitch), mais ne peut garantir l'absence
        d'erreurs, d'interruptions ou de délais de mise à jour, notamment
        concernant les horaires de live qui peuvent être modifiés à tout
        moment.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">8. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont soumises au droit français. En
        cas de litige, et à défaut d'accord amiable, les tribunaux français
        seront seuls compétents.
      </p>
    </div>
  );
}
