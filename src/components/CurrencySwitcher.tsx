import { useSettings, Currency } from "@/hooks/use-settings";
import { DollarSign, Coins, Globe } from "lucide-react";

interface CurrencySwitcherProps {
  pageKey?: string;
  className?: string;
  compact?: boolean;
}

const currencies: { code: Currency; labelAr: string; symbol: string; flag: string }[] = [
  { code: "EGP", labelAr: "جنيه مصري", symbol: "ج.م", flag: "🇪🇬" },
  { code: "USD", labelAr: "دولار أمريكي", symbol: "$", flag: "🇺🇸" },
  { code: "SSP", labelAr: "جنيه جنوب سوداني", symbol: "ج.ج.س", flag: "🇸🇸" },
];

export function CurrencySwitcher({
  pageKey,
  className = "",
  compact = false,
}: CurrencySwitcherProps) {
  const { currency, changeCurrency } = useSettings(pageKey);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1 bg-muted/60 border border-border p-1 rounded-xl ${className}`}
        dir="rtl"
      >
        {currencies.map((c) => {
          const isActive = currency === c.code;
          return (
            <button
              key={c.code}
              onClick={() => changeCurrency(c.code)}
              title={`عرض هذه الصفحة بـ ${c.labelAr}`}
              className={`px-2 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-2xl shadow-sm ${className}`}
      dir="rtl"
    >
      <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground shrink-0">
        <Coins size={14} className="text-primary" />
        <span className="hidden sm:inline">عملة العرض:</span>
      </div>
      <div className="flex items-center gap-1">
        {currencies.map((c) => {
          const isActive = currency === c.code;
          return (
            <button
              key={c.code}
              onClick={() => changeCurrency(c.code)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
