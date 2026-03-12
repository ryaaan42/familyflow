import { type LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";

const toneConfig = {
  default: {
    gradient: "from-violet-400/15 to-transparent",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    label: "Actif",
    trend: "neutral" as const
  },
  coral: {
    gradient: "from-rose-400/15 to-transparent",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    label: "À surveiller",
    trend: "down" as const
  },
  mint: {
    gradient: "from-emerald-400/15 to-transparent",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    label: "Positif",
    trend: "up" as const
  },
  yellow: {
    gradient: "from-amber-400/15 to-transparent",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    label: "En cours",
    trend: "neutral" as const
  }
};

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "coral" | "mint" | "yellow";
  icon?: LucideIcon;
}) {
  const cfg = toneConfig[tone];
  const TrendIcon =
    cfg.trend === "up" ? ArrowUpRight : cfg.trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${cfg.gradient}`}>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">{value}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {Icon && (
              <div className={`rounded-xl p-2.5 ${cfg.iconBg}`}>
                <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
              </div>
            )}
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}
            >
              <TrendIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
        </div>
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">{hint}</p>
      </div>
    </Card>
  );
}
