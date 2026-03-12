import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Coins,
  PiggyBank,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";

const stats = [
  { value: "2 400+", label: "familles actives" },
  { value: "4.8 ★", label: "note moyenne" },
  { value: "340 €", label: "économisés/mois" }
];

const tasks = [
  { task: "Faire les courses", member: "Sophie", cat: "Courses", color: "#6D5EF4", done: true },
  { task: "Promener Moka", member: "Emma", cat: "Animaux", color: "#56C7A1", done: true },
  { task: "Préparer les repas", member: "Lucas", cat: "Cuisine", color: "#FF8DB2", done: false }
];

export function FinalCta() {
  return (
    <section className="py-10 md:py-20">
      <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#6558f5_0%,#4a8eff_40%,#2ec5a1_100%)] px-8 py-14 text-white shadow-[0_48px_120px_rgba(101,88,245,0.3)] md:px-14 md:py-18">
        {/* Background orbs */}
        <div className="orb left-[-5%] top-[-20%] h-72 w-72 bg-[rgba(255,255,255,0.15)]" />
        <div className="orb bottom-[-10%] right-[-5%] h-80 w-80 bg-[rgba(255,126,107,0.2)]" />
        <div className="orb left-[40%] top-[30%] h-48 w-48 bg-[rgba(86,199,161,0.15)]" />

        <div className="relative z-10 grid gap-12 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          {/* Left: copy */}
          <div className="space-y-8">
            {/* Social proof */}
            <div className="flex flex-wrap gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-full border border-white/20 bg-white/12 px-4 py-2 backdrop-blur"
                >
                  <span className="text-sm font-bold">{s.value}</span>
                  <span className="ml-1.5 text-sm text-white/70">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <h2 className="max-w-2xl text-4xl font-semibold leading-[1.0] tracking-[-0.04em] md:text-6xl">
                Reprenez la main sur votre quotidien familial,{" "}
                <span className="italic font-serif">dès aujourd&apos;hui</span>.
              </h2>
              <p className="max-w-xl text-lg leading-8 text-white/80">
                Rejoignez 2 400 familles qui organisent mieux, dépensent moins et vivent plus sereinement ensemble. Gratuit pour commencer, sans carte bleue.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[var(--foreground)] shadow-[0_20px_40px_rgba(20,18,52,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_48px_rgba(20,18,52,0.28)]"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#modules"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-7 py-4 text-base font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                Voir les modules
              </Link>
            </div>

            {/* Trust */}
            <div className="flex flex-wrap gap-5">
              {["Sans carte bleue", "100 % RGPD", "Données privées"].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-sm text-white/75">
                  <CheckCircle2 className="h-4 w-4 text-white/90" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: mini app mockup */}
          <div className="panel-3d relative mx-auto flex w-full max-w-[480px] justify-center [perspective:1800px]">
            <div className="relative z-10 w-full rounded-[32px] border border-white/25 bg-white/10 p-4 shadow-[0_40px_100px_rgba(22,21,63,0.3)] backdrop-blur-[20px] [transform:rotateY(-10deg)_rotateX(5deg)]">
              {/* App header */}
              <div className="rounded-[22px] bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white/60">Famille Dupont · Cette semaine</p>
                    <p className="mt-0.5 text-lg font-bold">87 % des tâches ✓</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Score +12
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-2 w-[87%] rounded-full bg-white" />
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Tâches", value: "9", icon: CalendarRange, bg: "bg-white/15" },
                  { label: "Économies", value: "328 €", icon: Coins, bg: "bg-white/15" },
                  { label: "Membres", value: "4", icon: Users, bg: "bg-white/15" }
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-[16px] ${stat.bg} p-2.5 text-center`}>
                    <stat.icon className="mx-auto mb-1 h-4 w-4 text-white/80" />
                    <p className="text-sm font-bold">{stat.value}</p>
                    <p className="text-[10px] text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Task list */}
              <div className="mt-3 space-y-2">
                {tasks.map((item) => (
                  <div
                    key={item.task}
                    className="flex items-center justify-between rounded-[14px] bg-white/90 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className={`text-xs font-semibold text-[var(--foreground)] ${item.done ? "line-through opacity-40" : ""}`}>
                          {item.task}
                        </p>
                        <p className="text-[10px] text-[var(--foreground-subtle)]">{item.member} · {item.cat}</p>
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${item.done ? "bg-emerald-100" : "bg-gray-100"}`}>
                      {item.done
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        : <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom projection */}
              <div className="mt-3 rounded-[18px] bg-white/90 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-[var(--brand-primary)]" />
                    <p className="text-xs font-bold text-[var(--foreground)]">Projection annuelle</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-black text-[var(--foreground)]">3 936 € / an</p>
                <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">si les routines sont maintenues 📈</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
