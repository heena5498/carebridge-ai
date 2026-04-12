import { useState } from "react";
import StatCard from "../StatCard";
import CarePlanCard from "../CarePlanCard";
import DetailPanel from "../DetailPanel";

function SectionLabel({ text, badge, badgeStyle }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="font-semibold tracking-wider" style={{ fontSize: "11px", color: "#7A6B52" }}>
        {text}
      </span>
      <span
        className="rounded-pill px-2 py-0.5 font-medium"
        style={{ fontSize: "10px", ...badgeStyle }}
      >
        {badge}
      </span>
    </div>
  );
}

export default function CarePlansTab({
  carePlans = [],
  activePlans = [],
  pastPlans = [],
  activeMedicationCount = 0,
  medConflictCount = 0,
  missingItemsCount = 0,
  followUpsDueCount = 0,
}) {
  const [selectedId, setSelectedId] = useState(null);

  const missingCount = carePlans
    .filter((p) => p.status === "active")
    .flatMap((p) => p.followups)
    .filter((f) => f.status === "missing").length;

  const handleCardClick = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectedPlan = carePlans.find((p) => p.id === selectedId);

  const renderGrid = (plans, opacity = 1) => {
    const rows = [];
    for (let i = 0; i < plans.length; i += 2) {
      const pair = [plans[i], plans[i + 1]].filter(Boolean);
      rows.push(
        <div key={i} className="grid grid-cols-2 gap-3">
          {pair.map((plan) => (
            <CarePlanCard
              key={plan.id}
              plan={plan}
              selected={selectedId === plan.id}
              onClick={() => handleCardClick(plan.id)}
            />
          ))}
          {selectedPlan && pair.some((p) => p.id === selectedId) && (
            <DetailPanel
              plan={selectedPlan}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      );
    }
    return <div style={{ opacity }}>{rows}</div>;
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="font-semibold text-xl" style={{ color: "#1E293B" }}>Your care history</h1>
        <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A6B52" }}>
          All hospital stays and ongoing care on record
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard number={activeMedicationCount} label="Active medications" />
        <StatCard number={medConflictCount} label="Med conflicts" numberColor="#991B1B" />
        <StatCard number={missingItemsCount} label="Missing items" numberColor="#92400E" />
        <StatCard number={followUpsDueCount} label="Follow-ups due" numberColor="#1E40AF" />
      </div>

      <div className="flex gap-3 mb-6">
        <StatCard number={activePlans.length} label="Active care plans" />
        <StatCard number={pastPlans.length} label="Past care plans" />
        <StatCard number={missingCount} label="Follow-ups pending" numberColor="#991B1B" />
      </div>

      <div className="mb-6">
        <SectionLabel
          text="ACTIVE"
          badge={`${activePlans.length} ongoing`}
          badgeStyle={{ background: "#E8F0E4", color: "#1B5E3B" }}
        />
        {renderGrid(activePlans)}
      </div>

      <div>
        <SectionLabel
          text="PAST RECORDS"
          badge={`${pastPlans.length} completed`}
          badgeStyle={{ background: "#F1EFE8", color: "#5F5E5A" }}
        />
        {renderGrid(pastPlans, 0.72)}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5" style={{ fontSize: "10px", color: "#A39880" }}>
        {[["#86EFAC","Done"],["#FDE68A","Pending"],["#FCA5A5","Missing"]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="rounded-full inline-block" style={{ width: 7, height: 7, background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
