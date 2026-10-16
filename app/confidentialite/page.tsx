import EntetePage from "@/components/EntetePage";
import { liens } from "@/data/liens";

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 py-8 md:py-12 text-ink-soft leading-relaxed">
      <EntetePage surtitre="📄 Informations" titre="Politique de confidentialité" />

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
        La page Contact te permet d'envoyer un message à Cycy (ton nom, ton
        email, la catégorie de ta demande, le sujet et ton message). Le
        message est transmis par email grâce au service d'envoi{" "}
        <a
          href="https://resend.com/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lilac hover:text-ink underline underline-offset-4"
        >
          Resend
        </a>
        , qui l'achemine jusqu'à {liens.mailPro}.
      </p>
      <p className="mb-4">
        <strong className="text-ink">
          Le site n'enregistre pas ton message dans une base de données.
        </strong>{" "}
        Il est conservé dans la messagerie de Cycy le temps nécessaire au
        traitement de ta demande (partenariat, collaboration, question,
        etc.), puis supprimé ou archivé selon les pratiques habituelles de
        gestion d'une boîte mail. Resend agit comme prestataire technique
        d'envoi et ne conserve les informations que le temps nécessaire à
        l'acheminement et au suivi de l'envoi.
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
      <p className="mb-4">
        Les pages Cycy_Bot affichent des informations publiques fournies par
        le bot de la chaîne : la liste des commandes, des compteurs
        (cartes, expéditions…) et, sur le leaderboard, le pseudo et
        l'avatar Twitch des viewers les plus actifs dans le chat. Le site
        lui-même n'en stocke aucune. Pour retirer ton pseudo du classement,
        écris à {liens.mailPro}.
      </p>
      <p className="mb-4">
        Sur les jeux à records (Cycy Runner et la salle d'arcade, /jeux), le pseudo que tu choisis librement
        est enregistré avec ton meilleur score et sa date, pour l'afficher
        au tableau des records (stockage Upstash). Aucun compte n'est créé.
        Pour limiter les abus, ton adresse IP sert à compter les parties et
        les envois pendant une heure, puis ce compteur est effacé. Ton
        pseudo et ton record sont aussi gardés dans ton navigateur pour
        pré-remplir le champ. Pour retirer un pseudo du classement, écris à{" "}
        {liens.mailPro}.
      </p>
      <p className="mb-4">
        Pour le ticket à gratter, CycyBot (bot.cycylive.fr) garde une empreinte
        chiffrée de ton adresse IP pendant la journée, uniquement pour limiter à
        un ticket par jour. Le gain est lié à ton compte Discord seulement quand
        tu tapes /gratter sur le serveur.
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
