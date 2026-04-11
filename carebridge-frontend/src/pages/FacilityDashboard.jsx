import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import AgentPanel from "../components/AgentPanel";
import facilityMockData from "../data/facilityMockData";

export default function FacilityDashboard() {
    const location = useLocation();

    const { patient, riskScore, quickStats, medSafety, missingInfo, carePlan, chat } =
        facilityMockData;

    const passedPatientName = location.state?.patientName;
    const passedMrn = location.state?.mrn;
    const passedFileName = location.state?.fileName;

    const displayPatientName = passedPatientName || patient.name;
    const displayMrn = passedMrn || patient.mrn;
    const displayFileName = passedFileName || "discharge_summary_thompson.pdf";

    return (
        <div className="page-shell">
            <div className="container">
                <Navbar />

                <div style={{ marginBottom: "20px" }}>
                    <h1 className="section-title">Facility intake dashboard</h1>
                    <p className="section-subtitle">
                        Command center for care coordinators receiving a new patient
                    </p>
                </div>

                <div className="grid-2" style={{ marginBottom: "16px" }}>
                    <div className="card" style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 500,
                                    flexShrink: 0,
                                }}
                            >
                                {(displayPatientName || "P")
                                    .split(" ")
                                    .map((part) => part[0])
                                    .slice(0, 2)
                                    .join("")}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h2
                                    style={{
                                        margin: "0 0 4px",
                                        fontSize: "18px",
                                        fontWeight: 500,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {displayPatientName}
                                </h2>

                                <p
                                    style={{
                                        margin: "0 0 4px",
                                        fontSize: "12px",
                                        color: "var(--text-muted)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {patient.ageSex} — MRN: {displayMrn} — Admitted {patient.admitted} —
                                    Discharged {patient.discharged}
                                </p>

                                <p
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: "12px",
                                        color: "var(--text-muted)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Attending: {patient.attending} — Disposition: {patient.disposition}
                                </p>

                                <p
                                    style={{
                                        margin: "0 0 10px",
                                        fontSize: "11px",
                                        color: "var(--text-faint)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Source file: {displayFileName}
                                </p>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {patient.allergies.map((item) => (
                                        <span
                                            key={item.label}
                                            style={{
                                                background: "var(--status-critical-bg)",
                                                color: "var(--status-critical-text)",
                                                padding: "4px 10px",
                                                borderRadius: "999px",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                            }}
                                        >
                      Allergy: {item.label}
                    </span>
                                    ))}

                                    {patient.diagnoses.map((item) => (
                                        <span
                                            key={item}
                                            style={{
                                                background: "var(--status-normal-bg)",
                                                color: "var(--status-normal-text)",
                                                padding: "4px 10px",
                                                borderRadius: "999px",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                            }}
                                        >
                      {item}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="card"
                        style={{
                            padding: "16px",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "76px",
                                height: "76px",
                                borderRadius: "50%",
                                border: "5px solid var(--status-attention-text)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "8px",
                            }}
                        >
              <span
                  style={{
                      fontSize: "24px",
                      fontWeight: 500,
                      color: "var(--status-attention-text)",
                  }}
              >
                {riskScore}
              </span>
                        </div>

                        <p
                            style={{
                                margin: "0 0 8px",
                                fontSize: "12px",
                                color: "var(--text-muted)",
                            }}
                        >
                            Risk score / 10
                        </p>

                        <StatusBadge type="attention" label="Moderate" />
                    </div>
                </div>

                <div className="grid-4" style={{ marginBottom: "20px" }}>
                    <div className="card" style={{ padding: "14px", textAlign: "center" }}>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                            }}
                        >
                            {quickStats.medications}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                            Active medications
                        </p>
                    </div>

                    <div className="card" style={{ padding: "14px", textAlign: "center" }}>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                fontWeight: 500,
                                color: "var(--status-critical-text)",
                            }}
                        >
                            {quickStats.conflicts}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                            Med conflict
                        </p>
                    </div>

                    <div className="card" style={{ padding: "14px", textAlign: "center" }}>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                fontWeight: 500,
                                color: "var(--status-attention-text)",
                            }}
                        >
                            {quickStats.missingItems}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                            Missing items
                        </p>
                    </div>

                    <div className="card" style={{ padding: "14px", textAlign: "center" }}>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "24px",
                                fontWeight: 500,
                                color: "var(--status-normal-text)",
                            }}
                        >
                            {quickStats.followUps}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                            Follow-ups due
                        </p>
                    </div>
                </div>

                <AgentPanel
                    number="2"
                    title="Medication safety"
                    badgeText="1 conflict"
                    badgeType="critical"
                    defaultOpen={true}
                >
                    <div>
                        {medSafety.medications.map((med, index) => (
                            <div
                                key={med.name}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    padding: "10px 0",
                                    borderBottom:
                                        index !== medSafety.medications.length - 1
                                            ? "0.5px solid var(--border-light)"
                                            : "none",
                                }}
                            >
                                <div
                                    style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background:
                                            med.tone === "attention"
                                                ? "var(--status-attention-text)"
                                                : med.tone === "safe"
                                                    ? "var(--primary)"
                                                    : "var(--status-normal-text)",
                                        marginTop: "7px",
                                        flexShrink: 0,
                                    }}
                                />

                                <div style={{ flex: 1 }}>
                                    <p
                                        style={{
                                            margin: "0 0 2px",
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {med.name}
                                    </p>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "11px",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {med.details}
                                    </p>
                                </div>

                                <StatusBadge type={med.tone} label={med.status} />
                            </div>
                        ))}

                        <div
                            style={{
                                marginTop: "12px",
                                background: "#FEF2F2",
                                border: "0.5px solid #FECACA",
                                borderRadius: "12px",
                                padding: "12px",
                            }}
                        >
                            <p
                                style={{
                                    margin: "0 0 6px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    color: "var(--status-critical-text)",
                                }}
                            >
                                ⚠ {medSafety.conflictTitle}
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "12px",
                                    color: "#7F1D1D",
                                    lineHeight: 1.6,
                                }}
                            >
                                {medSafety.conflictText}
                            </p>
                        </div>
                    </div>
                </AgentPanel>

                <AgentPanel
                    number="3"
                    title="Missing information"
                    badgeText="2 gaps"
                    badgeType="attention"
                >
                    <div>
                        {missingInfo.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    padding: "10px 0",
                                    borderBottom:
                                        index !== missingInfo.length - 1
                                            ? "0.5px solid var(--border-light)"
                                            : "none",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "13px",
                                            color: "var(--text-primary)",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {item.text}
                                    </p>
                                </div>

                                <StatusBadge type={item.tone} label={item.severity} />
                            </div>
                        ))}
                    </div>
                </AgentPanel>

                <AgentPanel
                    number="4"
                    title="Care plan"
                    badgeText="Generated"
                    badgeType="safe"
                >
                    <div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                gap: "8px",
                                marginBottom: "12px",
                            }}
                        >
                            {carePlan.tabs.map((tab, index) => (
                                <div
                                    key={tab.key}
                                    style={{
                                        border: index === 0 ? "0.5px solid var(--primary)" : "0.5px solid var(--border)",
                                        background: index === 0 ? "#F6FAF6" : "var(--bg-white)",
                                        borderRadius: "12px",
                                        padding: "10px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: "0 0 2px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {tab.label}
                                    </p>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "10px",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {tab.tasks.length} tasks
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            {carePlan.tabs[0].tasks.slice(0, 4).map((task, index) => (
                                <div
                                    key={task.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                        padding: "8px 0",
                                        borderBottom:
                                            index !== 3 ? "0.5px solid var(--border-light)" : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "14px",
                                            height: "14px",
                                            border: "1px solid var(--text-faint)",
                                            borderRadius: "3px",
                                            marginTop: "3px",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "12px",
                                            color: "var(--text-body)",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {task.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Link to="/facility/care-plan" state={location.state}>
                            <button className="primary-btn">Open full care plan</button>
                        </Link>
                    </div>
                </AgentPanel>

                <AgentPanel
                    number="5"
                    title="Coordinator chat"
                    badgeText="Ready"
                    badgeType="safe"
                >
                    <div
                        style={{
                            background: "var(--bg-surface)",
                            borderRadius: "12px",
                            padding: "12px",
                            marginBottom: "12px",
                        }}
                    >
                        <p
                            style={{
                                margin: "0 0 6px",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "var(--primary)",
                            }}
                        >
                            What changed from pre-admission meds?
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "12px",
                                color: "var(--text-body)",
                                lineHeight: 1.6,
                            }}
                        >
                            Lisinopril was increased from 10mg to 20mg. Enoxaparin and oxycodone
                            were added post-operatively. Metformin should now be resumed.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            marginBottom: "14px",
                        }}
                    >
                        {chat.suggestions.map((item) => (
                            <span
                                key={item}
                                style={{
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                }}
                            >
                {item}
              </span>
                        ))}
                    </div>

                    <Link to="/facility/chat" state={location.state}>
                        <button className="outline-btn">Open chat</button>
                    </Link>
                </AgentPanel>
            </div>
        </div>
    );
}