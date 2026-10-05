const BUTTON_VARIANTS = {
  primary: "bg-accent text-accent-ink hover:enabled:bg-accent-strong",
  ghost: "border border-line text-ink hover:enabled:bg-surface-2"
};
const BUTTON_SIZES = {
  md: "h-[42px] px-[1.1rem]",
  sm: "h-[34px] px-3 text-sm"
};

export const buttonClass = ({ variant = "primary", size = "md", block = false, className = "" } = {}) =>
  [
    "inline-flex items-center justify-center gap-1.5 rounded-[10px] font-semibold whitespace-nowrap cursor-pointer",
    "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    block && "w-full",
    className
  ].filter(Boolean).join(" ");

export function Button({ variant, size, block, className, ...props }) {
  return <button className={buttonClass({ variant, size, block, className })} {...props} />;
}

export const inputClass =
  "h-11 px-3.5 rounded-[10px] bg-bg text-ink border border-line outline-none transition " +
  "focus:border-accent focus:ring-3 focus:ring-accent/20";

export function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5 mb-4">
      <span className="text-sm text-muted">{label}</span>
      <input className={inputClass} {...props} />
    </label>
  );
}

const ALERT_TYPES = {
  error: "text-danger border-danger/35 bg-danger/8",
  success: "text-accent border-accent/35 bg-accent/8",
  info: "text-muted border-line bg-surface"
};

export function Alert({ type = "info", children }) {
  return (
    <div role={type === "error" ? "alert" : "status"} className={`px-3.5 py-3 mb-4 rounded-[10px] border text-sm ${ALERT_TYPES[type]}`}>
      {children}
    </div>
  );
}

export const Spinner = () => (
  <div className="size-7 rounded-full border-3 border-line border-t-accent animate-spin" />
);

export const Panel = ({ as: Tag = "div", className = "", ...props }) => (
  <Tag className={`p-6 mb-6 bg-surface border border-line rounded-xl ${className}`} {...props} />
);

export function PageHeader({ title, subtitle, children }) {
  return (
    <header className="flex justify-between items-start gap-4 mb-6">
      <div>
        <h1 className="text-[1.6rem] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
