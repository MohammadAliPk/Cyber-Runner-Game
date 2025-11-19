"use client";

const baseStyles =
  "relative overflow-hidden rounded-full px-6 py-3 font-semibold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";

const variants = {
  primary:
    "bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white shadow-lg shadow-cyan-500/30 hover:brightness-110",
  secondary:
    "bg-transparent border border-white/30 text-white hover:border-cyan-400 hover:text-cyan-200",
  ghost: "bg-white/5 text-white hover:bg-white/15 border border-white/10"
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function NeonButton({
  children,
  className = "",
  variant = "primary",
  onHoverSound,
  ...props
}) {
  return (
    <button
      className={cx(baseStyles, variants[variant], className)}
      onMouseEnter={onHoverSound}
      {...props}
    >
      <span className="relative z-10">
        {children}
      </span>
      <span className="absolute inset-0 -z-0 opacity-60 blur-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />
    </button>
  );
}
