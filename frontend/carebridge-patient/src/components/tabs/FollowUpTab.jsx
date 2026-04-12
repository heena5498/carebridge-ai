import FollowUpItem from "../FollowUpItem";

function SummaryStat({ count, label, bg, color }) {
  return (
    <div className="flex-1 rounded-card px-4 py-3" style={{ background: bg, border: "0.5px solid transparent" }}>
      <div className="text-2xl font-semibold" style={{ color }}>{count}</div>
      <div className="text-xs mt-0.5 font-medium" style={{ color }}>{label}</div>
    </div>
  );
}

function SectionHeader({ icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: color + "20" }}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="5.5" r="4.5" stroke={color} strokeWidth="1.5" />
        </svg>
      </div>
      <span className="font-semibold tracking-wider" style={{ fontSize: "11px", color }}>
        {label}
      </span>
    </div>
  );
}

function ItemCard({ item, opacity = 1 }) {
  return (
    <div
      className="bg-white rounded-card mb-2"
      style={{ border: "0.5px solid #E0D5C0", opacity }}
    >
      <FollowUpItem item={item} last showAction />
    </div>
  );
}

export default function FollowUpTab({ carePlans = [] }) {
  const allFollowups = carePlans.flatMap((plan) =>
    plan.followups.map((f) => ({ ...f, planCondition: plan.condition }))
  );
  const notScheduled = allFollowups.filter((f) => f.status === "missing");
  const upcoming = allFollowups.filter((f) => f.status === "pending");
  const completed = allFollowups.filter((f) => f.status === "done");

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="font-semibold text-xl" style={{ color: "#1E293B" }}>Your follow-up plan</h1>
        <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A6B52" }}>
          All appointments and actions across every care plan
        </p>
      </div>

      {/* Summary stats */}
      <div className="flex gap-3 mb-6">
        <SummaryStat count={notScheduled.length} label="Not scheduled" bg="#FEE2E2" color="#991B1B" />
        <SummaryStat count={upcoming.length} label="Upcoming" bg="#FEF3C7" color="#92400E" />
        <SummaryStat count={completed.length} label="Completed" bg="#DCFCE7" color="#14532D" />
      </div>

      {/* Not scheduled */}
      {notScheduled.length > 0 && (
        <div className="mb-6">
          <SectionHeader icon="alert" label="ACTION NEEDED — NOT SCHEDULED" color="#991B1B" />
          {notScheduled.map((item, i) => <ItemCard key={i} item={item} />)}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <SectionHeader icon="clock" label="UPCOMING" color="#92400E" />
          {upcoming.map((item, i) => <ItemCard key={i} item={item} />)}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <SectionHeader icon="check" label="COMPLETED" color="#14532D" />
          {completed.map((item, i) => <ItemCard key={i} item={item} opacity={0.7} />)}
        </div>
      )}
    </div>
  );
}
