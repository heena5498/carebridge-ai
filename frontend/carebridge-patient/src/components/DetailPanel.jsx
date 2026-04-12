import { useState, useEffect, useRef } from "react";
import MedicationRow from "./MedicationRow";
import FollowUpItem from "./FollowUpItem";

function InfoCell({ label, value }) {
  return (
    <div className="rounded-sm2 px-3 py-2" style={{ background: "#FDF6EC", border: "0.5px solid #E0D5C0" }}>
      <div style={{ fontSize: "10px", color: "#7A6B52" }}>{label}</div>
      <div className="font-medium mt-0.5" style={{ fontSize: "12px", color: "#1E293B" }}>{value}</div>
    </div>
  );
}

function OverviewTab({ plan }) {
  const fields = [
    { label: "Hospital", value: plan.hospital },
    { label: "Department", value: plan.department },
    { label: "Doctor", value: plan.doctor },
    { label: "Admitted", value: plan.admitted },
    { label: "Discharged", value: plan.discharged || "Ongoing" },
    { label: "Duration", value: plan.duration },
    { label: "Insurance", value: plan.insurance },
  ];
  if (plan.care_facility) fields.push({ label: "Care facility", value: plan.care_facility });
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {fields.map((f) => <InfoCell key={f.label} {...f} />)}
    </div>
  );
}

function MedicationsTab({ plan }) {
  return (
    <div className="p-3">
      <div className="bg-white rounded-card overflow-hidden" style={{ border: "0.5px solid #E0D5C0" }}>
        {plan.medications.map((med, i) => (
          <MedicationRow key={med.name} med={med} last={i === plan.medications.length - 1} />
        ))}
      </div>
    </div>
  );
}

function FollowUpTab({ plan }) {
  return (
    <div className="p-3">
      <div className="bg-white rounded-card overflow-hidden" style={{ border: "0.5px solid #E0D5C0" }}>
        {plan.followups.map((item, i) => (
          <FollowUpItem key={i} item={item} last={i === plan.followups.length - 1} />
        ))}
      </div>
    </div>
  );
}

const INNER_TABS = ["Overview", "Medications", "Follow-up"];

export default function DetailPanel({ plan, onClose }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const panelRef = useRef(null);
  const isActive = plan.status === "active";
  const headerBg = isActive ? "#1B5E3B" : "#5F5E5A";

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [plan.id]);

  return (
    <div
      ref={panelRef}
      className="col-span-2 rounded-card overflow-hidden mt-1"
      style={{ border: "0.5px solid #E0D5C0" }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ background: headerBg }}>
        <div className="flex items-start justify-between">
          <span className="font-bold text-white" style={{ fontSize: "14px" }}>
            {plan.condition}
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,0.2)", fontSize: "14px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {[
            ["Hospital", plan.hospital],
            ["Doctor", plan.doctor],
            ["Admitted", plan.admitted],
            ["Discharged", plan.discharged || "Ongoing"],
            ["Duration", plan.duration],
            ["Insurance", plan.insurance],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <span className="text-white" style={{ fontSize: "10px", opacity: 0.7 }}>{lbl} </span>
              <span className="text-white font-medium" style={{ fontSize: "12px" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inner tab bar */}
      <div className="flex border-b bg-white" style={{ borderColor: "#E0D5C0" }}>
        {INNER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              fontSize: "13px",
              color: activeTab === tab ? "#1B5E3B" : "#7A6B52",
              borderBottom: activeTab === tab ? "2px solid #1B5E3B" : "2px solid transparent",
              background: activeTab === tab ? "#E8F0E4" : "transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white">
        {activeTab === "Overview" && <OverviewTab plan={plan} />}
        {activeTab === "Medications" && <MedicationsTab plan={plan} />}
        {activeTab === "Follow-up" && <FollowUpTab plan={plan} />}
      </div>
    </div>
  );
}
