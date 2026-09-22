import { obtenirAnnoncesDiscord } from "@/lib/discordAnnonces";

function formaterDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export default async function AnnoncesDiscord({ limite = 3 }: { limite?: number }) {
  const annonces = await obtenirAnnoncesDiscord(limite);
  if (annonces.length === 0) return null;

  return (
    <div className="space-y-3">
      {annonces.map((a) => (
        <a
          key={a.id}
          href={a.lien}
          target="_blank"
          rel="noopener noreferrer"
          className="block carte-holo rounded-2xl p-4 border border-violet/12 hover:border-violet/30 hover:shadow-glow-sm transition-all"
        >
          <div className="flex items-center gap-2 mb-2.5">
            {a.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.avatar} alt={a.auteur} className="h-6 w-6 rounded-full" loading="lazy" />
            ) : (
              <span className="h-6 w-6 rounded-full bg-violet/20" />
            )}
            <span className="text-xs text-ink-soft/70">{a.auteur}</span>
            <span className="text-xs text-ink-soft/40">· {formaterDate(a.dateISO)}</span>
          </div>

          {a.contenuHtml && (
            <div
              className="text-sm text-ink-soft mb-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: a.contenuHtml }}
            />
          )}

          {a.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.image}
              alt=""
              loading="lazy"
              className="w-full max-h-52 object-cover rounded-xl mb-2"
            />
          )}

          {a.sondage && (
            <div className="rounded-xl bg-white/[0.03] p-3 mt-1">
              <p className="text-sm text-ink font-medium mb-2">📊 {a.sondage.question}</p>
              <div className="space-y-1.5">
                {a.sondage.options.map((o, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-ink-soft">
                    <span>{o.texte}</span>
                    {o.votes !== null && (
                      <span className="text-violet-light">{o.votes} vote{o.votes === 1 ? "" : "s"}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
