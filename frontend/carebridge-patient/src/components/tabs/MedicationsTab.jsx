import MedicationRow from "../MedicationRow";
import StatusBadge from "../StatusBadge";

const GROUP_STATUS = {
  active: "active",
  meds_continue: "meds_continue",
  inactive: "inactive",
};

export default function MedicationsTab({ carePlans = [] }) {
  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="font-semibold text-xl" style={{ color: "#1E293B" }}>All medications</h1>
        <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A6B52" }}>
          Current and historical medications across all care plans
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {carePlans.map((plan) => (
          <div key={plan.id}>
            {/* Group header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-t-card"
              style={{ background: "#FDF6EC", border: "0.5px solid #E0D5C0", borderBottom: "none" }}
            >
              <div>
                <div className="font-semibold" style={{ fontSize: "13px", color: "#1E293B" }}>
                  {plan.condition}
                </div>
                <div style={{ fontSize: "11px", color: "#7A6B52" }}>
                  {plan.hospital} · {plan.doctor}
                </div>
              </div>
              <StatusBadge variant={GROUP_STATUS[plan.status] || "inactive"} />
            </div>

            {/* Medications card */}
            <div
              className="bg-white rounded-b-card overflow-hidden"
              style={{ border: "0.5px solid #E0D5C0", borderTop: "none" }}
            >
              {plan.medications.map((med, i) => (
                <MedicationRow
                  key={med.name}
                  med={med}
                  last={i === plan.medications.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
