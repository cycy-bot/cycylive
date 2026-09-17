// Affiche un texte enregistré depuis /admin (via EditeurRiche), en
// conservant la mise en forme (gras, italique, souligné) et les
// retours à la ligne. Le contenu ne vient que de l'admin protégée
// par mot de passe, jamais des visiteurs du site.
export default function TexteRiche({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
