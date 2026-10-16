import AccentCosmique from "@/components/AccentCosmique";

export default function JeuxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-8 md:py-12">
      <AccentCosmique variante="planete" />
      {children}
    </div>
  );
}
