export default function MainTabs({ activeTab, onTabChange, missingFollowUpCount = 0 }) {
  const tabs = [
    { id: "careplans", label: "My care plans" },
    { id: "medications", label: "My medications" },
    { id: "followup", label: "Follow-up plan", badge: missingFollowUpCount },
    { id: "chat", label: "Ask CareBridge" },
  ];

  return (
    <div
      className="bg-white flex sticky z-40 overflow-x-auto"
      style={{ top: "57px", borderBottom: "1px solid #E0D5C0" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-1.5 px-5 py-3 font-medium whitespace-nowrap transition-colors"
            style={{
              fontSize: "13px",
              color: isActive ? "#1B5E3B" : "#7A6B52",
              borderBottom: isActive ? "2.5px solid #1B5E3B" : "2.5px solid transparent",
              background: "transparent",
            }}
          >
            {tab.label}
            {tab.badge ? (
              <span
                className="rounded-full text-white font-semibold"
                style={{
                  background: "#991B1B",
                  fontSize: "10px",
                  minWidth: "16px",
                  height: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
