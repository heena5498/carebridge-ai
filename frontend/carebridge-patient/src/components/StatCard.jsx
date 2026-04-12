export default function StatCard({ number, label, numberColor = "#1B5E3B" }) {
  return (
    <div
      className="bg-white rounded-card px-4 py-3 flex-1"
      style={{ border: "0.5px solid #E0D5C0" }}
    >
      <div className="text-2xl font-semibold" style={{ color: numberColor }}>
        {number}
      </div>
      <div className="text-xs mt-0.5" style={{ color: "#7A6B52" }}>
        {label}
      </div>
    </div>
  );
}
