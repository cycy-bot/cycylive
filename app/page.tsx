import { liens } from "@/data/liens";

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 py-16 text-ink-soft leading-relaxed">
      <h1 className="text-3xl font-semibold text-ink mb-10">
        Politique de confidentialité
      </h1>

      <p className="mb-8 text-sm text-ink-soft/70">
        Cette politique de confidentialité explique quelles données sont
        collectées sur cycylive.fr, pourquoi, et comment tu peux exercer tes
        droits, conformément au Règlement Général sur la Protection des
        Données (RGPD).
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">1. Responsable du traitement</h2>
      <p className="mb-4">
        Le responsable du traitement des données est Cycy, éditrice du site
        cycylive.fr. Pour toute question relative à tes données
        personnelles, tu peux la contacter à l'adresse :{" "}
        <a href={`mailto:${liens.mailPro}`} className="text-violet-light hover:text-lilac">
          {liens.mailPro}
        </a>
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">2. Aucun cookie, aucun traceur</h2>
      <p className="mb-4">
        Ce site n'utilise <strong className="text-ink">aucun cookie de suivi</strong>,
        aucun outil d'analyse d'audience (type Google Analytics), aucun
        pixel publicitaire et n'affiche aucune publicité. Aucune donnée de
        navigation n'est collectée à des fins statistiques ou commerciales.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">3. Formulaire de contact</h2>
      <p className="mb-4">
        La page Contact te permet d'envoyer un message via ta propre
        messagerie électronique (le formulaire ouvre directement ton
        logiciel ou application mail, pré-rempli avec ton nom, ton email,
        ta catégorie de demande, le sujet et ton message).
      </p>
      <p className="mb-4">
        <strong className="text-ink">
          Aucune de ces informations n'est enregistrée ni stockée sur un
          serveur ou une base de données.
        </strong>{" "}
        Elles transitent uniquement par email, exactement comme si tu
        écrivais directement à {liens.mailPro}. Elles sont ensuite
        conservées dans la messagerie de Cycy le temps nécessaire au
        traitement de ta demande (partenariat, collaboration, question,
        etc.), puis supprimées ou archivées selon les pratiques habituelles
        de gestion d'une boîte mail.
      </p>
      <p className="mb-4">
        La base légale de ce traitement est l'intérêt légitime de Cycy à
        répondre aux demandes qui lui sont adressées, avec ton consentement
        explicite au moment où tu choisis d'envoyer le message.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">4. Statut Twitch en direct</h2>
      <p className="mb-4">
        Le site interroge l'API publique de Twitch pour savoir si Cycy est
        actuellement en live et afficher le titre, la catégorie et le
        nombre de spectateurs. Cette fonctionnalité ne collecte ni ne
        traite aucune donnée personnelle des visiteurs du site.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">5. Hébergement et transfert de données</h2>
      <p className="mb-4">
        Le site est hébergé par Vercel Inc., société basée aux États-Unis
        (voir les{" "}
        <a href="/mentions-legales" className="text-violet-light hover:text-lilac">
          mentions légales
        </a>{" "}
        pour les coordonnées complètes). L'hébergement d'un site en dehors
        de l'Union Européenne peut impliquer un transfert de données
        techniques (adresse IP, requêtes serveur) encadré par des garanties
        contractuelles conformes au RGPD. Comme indiqué ci-dessus, aucune
        donnée personnelle issue du formulaire de contact n'est concernée
        par ce transfert : elle ne quitte jamais ta messagerie et celle de
        Cycy.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">6. Tes droits</h2>
      <p className="mb-4">
        Conformément au RGPD, tu disposes d'un droit d'accès, de
        rectification, d'effacement, de limitation et d'opposition
        concernant tes données personnelles, ainsi que d'un droit à la
        portabilité. Tu peux exercer ces droits à tout moment en écrivant à{" "}
        <a href={`mailto:${liens.mailPro}`} className="text-violet-light hover:text-lilac">
          {liens.mailPro}
        </a>.
      </p>
      <p className="mb-4">
        Si tu estimes que tes droits ne sont pas respectés, tu peux
        introduire une réclamation auprès de la Commission Nationale de
        l'Informatique et des Libertés (CNIL) :{" "}
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-light hover:text-lilac"
        >
          www.cnil.fr
        </a>
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">7. Mineurs</h2>
      <p className="mb-4">
        Ce site s'adresse à un public familier de l'univers du streaming et
        du gaming. Il ne collecte, comme précisé ci-dessus, aucune donnée
        personnelle en dehors d'un envoi volontaire par email via le
        formulaire de contact.
      </p>

      <h2 className="text-xl font-semibold text-ink mt-10 mb-3">8. Modification de cette politique</h2>
      <p>
        Cette politique de confidentialité peut être mise à jour, notamment
        si de nouvelles fonctionnalités venaient à collecter des données
        (par exemple une newsletter). Toute modification substantielle sera
        reflétée sur cette page.
      </p>
    </div>
  );
}
