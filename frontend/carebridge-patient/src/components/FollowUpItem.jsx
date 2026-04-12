import StatusBadge from "./StatusBadge";

const STATUS_ICON_COLORS = {
  missing:  { bg: "#FEE2E2", icon: "#991B1B" },
  pending:  { bg: "#FEF3C7", icon: "#92400E" },
  done:     { bg: "#DBEAFE", icon: "#1E40AF" },
  completed:{ bg: "#DCFCE7", icon: "#14532D" },
};

function StatusIcon({ status }) {
  const colors = STATUS_ICON_COLORS[status] || STATUS_ICON_COLORS.pending;
  return (
    <div
      className="w-7 h-7 rounded-sm2 flex items-center justify-center shrink-0"
      style={{ backgroundColor: colors.bg }}
    >
      {status === "done" || status === "completed" ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 7l3 3 6-6" stroke={colors.icon} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : status === "missing" ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke={colors.icon} strokeWidth="1.5"/>
          <path d="M6.5 4v3M6.5 9v.5" stroke={colors.icon} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke={colors.icon} strokeWidth="1.5"/>
          <path d="M6.5 4v3.5l2 1.5" stroke={colors.icon} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );
}

export default function FollowUpItem({ item, last = false, showAction = false }) {
  return (
    <div
      className="flex items-start justify-between py-2.5 px-3"
      style={!last ? { borderBottom: "0.5px solid #F0E8D8" } : {}}
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <StatusIcon status={item.status} />
        <div className="min-w-0">
          <div className="font-semibold" style={{ fontSize: "12px", color: "#1E293B" }}>
            {item.type}
          </div>
          <div style={{ fontSize: "11px", color: "#7A6B52" }}>{item.source}</div>
          <div
            className="mt-0.5"
            style={{
              fontSize: "11px",
              color: item.status === "missing" ? "#991B1B" : item.status === "pending" ? "#92400E" : "#14532D",
            }}
          >
            {item.timeframe}
          </div>
        </div>
      </div>
      <div className="shrink-0 ml-3 mt-0.5">
        {showAction && item.action ? (
          <button
            className="text-xs font-medium px-3 py-1 rounded-pill"
            style={{ backgroundColor: "#1B5E3B", color: "#fff", fontSize: "11px" }}
          >
            {item.action}
          </button>
        ) : (
          <StatusBadge variant={item.status === "done" ? "done" : item.status === "pending" ? "pending" : "missing"} />
        )}
      </div>
    </div>
  );
}
