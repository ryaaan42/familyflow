import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
  tone = "default"
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "coral" | "mint" | "yellow";
}) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,242,255,0.92))]">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{value}</p>
          </div>
          <Badge variant={tone}>
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            {tone === "mint" ? "Positif" : tone === "coral" ? "A surveiller" : "Actif"}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">{hint}</p>
      </div>
    </Card>
  );
}
