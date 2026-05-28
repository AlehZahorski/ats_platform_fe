import { Wallet, ShieldCheck, Zap, Heart } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Wallet,
    title: "Transparentne wynagrodzenia",
    desc: "Większość ofert z widełkami płacowymi",
  },
  {
    icon: ShieldCheck,
    title: "Zweryfikowane firmy",
    desc: "Każda firma przechodzi weryfikację",
  },
  {
    icon: Zap,
    title: "Szybka aplikacja",
    desc: "Aplikuj w 2 minuty",
  },
  {
    icon: Heart,
    title: "Obserwuj oferty",
    desc: "Dostawaj powiadomienia o nowych ofertach",
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/30 mt-12">
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} wakanta.pl — wszystkie prawa zastrzeżone</div>
          <div className="flex items-center gap-4">
            <a href="/polityka-prywatnosci" className="hover:text-foreground">Polityka prywatności</a>
            <a href="/regulamin" className="hover:text-foreground">Regulamin</a>
            <a href="/kontakt" className="hover:text-foreground">Kontakt</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
