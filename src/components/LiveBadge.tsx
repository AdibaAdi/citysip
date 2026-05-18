import { cn, formatLiveLabel } from "@/lib/utils";

export default function LiveBadge({
  status,
  size = "md"
}: {
  status: { active: boolean; endsInMin?: number; startsInMin?: number };
  size?: "sm" | "md";
}) {
  const label = formatLiveLabel(status);
  const hot = status.active && (status.endsInMin ?? 999) < 60;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        status.active
          ? hot
            ? "bg-coral/15 text-coral border border-coral/40"
            : "bg-ember-500/15 text-ember-200 border border-ember-500/40"
          : status.startsInMin != null
            ? "bg-white/[0.04] text-white/60 border border-white/10"
            : "bg-white/[0.03] text-white/40 border border-white/[0.06]"
      )}
    >
      {status.active && (
        <span className={cn(
          "inline-block w-1.5 h-1.5 rounded-full",
          hot ? "bg-coral animate-pulse-slow" : "bg-ember-400 animate-pulse-slow"
        )} />
      )}
      {label}
    </span>
  );
}
