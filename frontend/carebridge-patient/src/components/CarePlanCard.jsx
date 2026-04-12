import StatusBadge from "./StatusBadge";

const DOT_COLORS = {
  done:    "#86EFAC",
  pending: "#FDE68A",
  missing: "#FCA5A5",
};

function FollowUpDots({ dots }) {
  return (
    <div className="flex items-center gap-1 mt-1.5">
      {dots.map((d, i) => (
        <span
          key={i}
          className="inline-block rounded-full"
          style={{ width: 7, height: 7, backgroundColor: DOT_COLORS[d] || "#E0D5C0" }}
          title={d}
        />
      ))}
    </div>
  );
}

export default function CarePlanCard({ plan, selected, onClick }) {
  const borderStyle = selected
    ? { border: "1.5px solid #1B5E3B" }
    : { border: "0.5px solid #E0D5C0" };

  return (
    <div
      className="bg-white rounded-card cursor-pointer transition-colors overflow-hidden"
      style={borderStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "#1B5E3B";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = "#E0D5C0";
      }}
    >
      <div className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold" style={{ fontSize: "13px", color: "#1E293B" }}>
            {plan.condition}
          </span>
          <StatusBadge variant={plan.status} />
        </div>
        <div className="mt-1" style={{ fontSize: "11px", color: "#7A6B52" }}>
          {plan.hospital}
        </div>
        <div style={{ fontSize: "11px", color: "#7A6B52" }}>{plan.doctor}</div>
        <FollowUpDots dots={plan.follow_up_dots} />
      </div>
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: "#F0E8D8", borderTop: "0.5px solid #E0D5C0" }}
      >
        <span style={{ fontSize: "10px", color: "#A39880" }}>
          {plan.admitted}
          {plan.discharged ? ` → ${plan.discharged}` : ""}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="#A39880" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
