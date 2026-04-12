import StatusBadge from "./StatusBadge";

export default function MedicationRow({ med, last = false }) {
  return (
    <div
      className="flex items-start justify-between py-2.5 px-3"
      style={!last ? { borderBottom: "0.5px solid #F0E8D8" } : {}}
    >
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold" style={{ fontSize: "12px", color: "#1E293B" }}>
            {med.name}
          </span>
          <StatusBadge variant={med.tag} />
        </div>
        <div className="mt-0.5" style={{ fontSize: "11px", color: "#7A6B52" }}>
          {med.purpose}
        </div>
        {med.note && (
          <div className="mt-0.5 italic" style={{ fontSize: "10px", color: "#A39880" }}>
            {med.note}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div style={{ fontSize: "11px", color: "#1E293B" }}>{med.dose}</div>
        <div style={{ fontSize: "10px", color: "#A39880" }}>{med.frequency}</div>
      </div>
    </div>
  );
}
