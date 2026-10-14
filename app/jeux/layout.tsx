import AccentCosmique from "@/components/AccentCosmique";
import OngletsJeux from "@/components/arcade/OngletsJeux";

export default function JeuxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />
      <h1 className="text-3xl md:text-4xl font-semibold text-ink glow-text mb-3">Les jeux de Cycylive</h1>
      <p className="text-ink-soft leading-relaxed mb-6 max-w-3xl">
        Trois jeux gratuits, sans compte. <strong className="text-ink">Cycy Runner</strong> pour battre ton record et entrer au
        tableau des records, le <strong className="text-ink">ticket à gratter</strong> du jour et ton{" "}
        <strong className="text-ink">compagnon</strong> à chouchouter, qui te font gagner des récompenses sur le Discord.
      </p>
      <OngletsJeux />
      {children}
    </div>
  );
}
