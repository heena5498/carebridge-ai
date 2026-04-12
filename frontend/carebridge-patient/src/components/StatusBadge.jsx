const VARIANTS = {
  new:          { bg: "#DCFCE7", text: "#14532D", label: "New" },
  changed:      { bg: "#FEF3C7", text: "#92400E", label: "Changed" },
  continuing:   { bg: "#DBEAFE", text: "#1E40AF", label: "Continuing" },
  stopped:      { bg: "#FEE2E2", text: "#991B1B", label: "Stopped" },
  still_active: { bg: "#FEF3C7", text: "#92400E", label: "Continuing" },
  done:         { bg: "#DBEAFE", text: "#1E40AF", label: "Done" },
  pending:      { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  missing:      { bg: "#FEE2E2", text: "#991B1B", label: "Not scheduled" },
  active:       { bg: "#DCFCE7", text: "#14532D", label: "Active" },
  inactive:     { bg: "#F1EFE8", text: "#5F5E5A", label: "Completed" },
  meds_continue:{ bg: "#FEF3C7", text: "#92400E", label: "Meds continue" },
  completed:    { bg: "#DCFCE7", text: "#14532D", label: "Completed" },
  scheduled:    { bg: "#DBEAFE", text: "#1E40AF", label: "Scheduled" },
};

export default function StatusBadge({ variant, label, className = "" }) {
  const v = VARIANTS[variant] || VARIANTS.inactive;
  const displayLabel = label || v.label;
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${className}`}
      style={{ backgroundColor: v.bg, color: v.text, fontSize: "11px" }}
    >
      {displayLabel}
    </span>
  );
}
