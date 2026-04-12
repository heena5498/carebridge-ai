import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import facilityMockData from "../data/facilityMockData";

export default function CarePlan() {
    const tabs = facilityMockData.carePlan.tabs;

    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const [taskState, setTaskState] = useState(() => {
        const state = {};
        tabs.forEach((tab) => {
            tab.tasks.forEach((task) => {
                state[task.id] = task.completed;
            });
        });
        return state;
    });

    const currentTab = tabs.find((tab) => tab.key === activeTab);

    const groupedTasks = useMemo(() => {
        return {
            critical: currentTab.tasks.filter((task) => task.priority === "critical"),
            attention: currentTab.tasks.filter((task) => task.priority === "attention"),
            normal: currentTab.tasks.filter((task) => task.priority === "normal"),
        };
    }, [currentTab]);

    const totalTasks = tabs.reduce((sum, tab) => sum + tab.tasks.length, 0);
    const completedTasks = Object.values(taskState).filter(Boolean).length;
    const progressPercent =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    function toggleTask(taskId) {
        setTaskState((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    }

    function handleExport() {
        window.print();
    }

    function priorityColor(priority) {
        if (priority === "critical") return "#DC2626";
        if (priority === "attention") return "#D97706";
        return "#2563EB";
    }

    function priorityTitle(priority) {
        if (priority === "critical") return "Critical — do first";
        if (priority === "attention") return "Medications";
        return "Monitoring";
    }

    function categoryStyle(priority) {
        if (priority === "critical") {
            return {
                background: "var(--status-critical-bg)",
                color: "var(--status-critical-text)",
            };
        }
        if (priority === "attention") {
            return {
                background: "var(--status-attention-bg)",
                color: "var(--status-attention-text)",
            };
        }
        return {
            background: "var(--status-normal-bg)",
            color: "var(--status-normal-text)",
        };
    }

    function renderTaskGroup(title, tasks, priority) {
        if (!tasks.length) return null;

        return (
            <div style={{ marginBottom: "18px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                        paddingBottom: "6px",
                        borderBottom: "0.5px solid var(--border-light)",
                    }}
                >
          <span
              style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: priorityColor(priority),
              }}
          />
                    <p
                        style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-muted)",
                        }}
                    >
                        {title}
                    </p>
                </div>

                {tasks.map((task) => {
                    const checked = taskState[task.id];
                    const tagStyle = categoryStyle(priority);

                    return (
                        <div
                            key={task.id}
                            className="card"
                            style={{
                                marginBottom: "8px",
                                padding: 0,
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ display: "flex" }}>
                                <div
                                    style={{
                                        width: "5px",
                                        background: priorityColor(priority),
                                        flexShrink: 0,
                                    }}
                                />

                                <div
                                    style={{
                                        flex: 1,
                                        padding: "12px 14px",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                        opacity: checked ? 0.6 : 1,
                                    }}
                                >
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            borderRadius: "4px",
                                            border: checked
                                                ? "1.5px solid var(--primary)"
                                                : "1.5px solid #C4B9A0",
                                            background: checked ? "var(--primary)" : "white",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            marginTop: "2px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {checked ? "✓" : ""}
                                    </button>

                                    <div style={{ flex: 1 }}>
                                        <p
                                            style={{
                                                margin: "0 0 6px",
                                                fontSize: "13px",
                                                lineHeight: 1.5,
                                                color: checked ? "var(--text-faint)" : "var(--text-primary)",
                                                textDecoration: checked ? "line-through" : "none",
                                            }}
                                        >
                                            {task.text}
                                        </p>

                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "8px",
                                                alignItems: "center",
                                                marginBottom: task.note ? "8px" : "0",
                                            }}
                                        >
                      <span
                          style={{
                              padding: "3px 9px",
                              borderRadius: "999px",
                              fontSize: "10px",
                              fontWeight: 500,
                              background: tagStyle.background,
                              color: tagStyle.color,
                          }}
                      >
                        {task.category}
                      </span>

                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    color: "var(--text-faint)",
                                                }}
                                            >
                        {task.time}
                      </span>
                                        </div>

                                        {task.note && (
                                            <div
                                                style={{
                                                    marginTop: "6px",
                                                    background: "var(--bg-surface)",
                                                    borderRadius: "8px",
                                                    padding: "8px 10px",
                                                    fontSize: "11px",
                                                    color: "var(--text-muted)",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                📝 {task.note}
                                            </div>
                                        )}

                                        {!task.note && (
                                            <button
                                                style={{
                                                    marginTop: "6px",
                                                    border: "none",
                                                    background: "transparent",
                                                    color: "var(--primary)",
                                                    fontSize: "11px",
                                                    fontWeight: 500,
                                                    padding: 0,
                                                }}
                                            >
                                                + Add note
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="container">
                <Navbar />

                <div
                    style={{
                        marginBottom: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1 className="section-title">Intake care plan</h1>
                        <p className="section-subtitle">
                            Interactive 24hr, 72hr, and 7-day checklist for facility staff
                        </p>
                    </div>

                    <div style={{ minWidth: "220px" }}>
                        <p
                            style={{
                                margin: "0 0 6px",
                                fontSize: "12px",
                                color: "var(--text-muted)",
                            }}
                        >
                            {completedTasks} of {totalTasks} tasks done
                        </p>

                        <div
                            style={{
                                height: "8px",
                                background: "var(--border-light)",
                                borderRadius: "999px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${progressPercent}%`,
                                    height: "100%",
                                    background: "var(--primary)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: "16px", marginBottom: "18px" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "8px",
                        }}
                    >
                        {tabs.map((tab) => {
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        border: active
                                            ? "0.5px solid var(--primary)"
                                            : "0.5px solid var(--border)",
                                        background: active ? "#F6FAF6" : "var(--bg-white)",
                                        borderRadius: "12px",
                                        padding: "12px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            margin: "0 0 3px",
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {tab.label}
                                    </p>
                                    <p
                                        style={{
                                            margin: "0 0 6px",
                                            fontSize: "11px",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {tab.range}
                                    </p>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "11px",
                                            fontWeight: 500,
                                            color: active
                                                ? "var(--status-attention-text)"
                                                : "var(--text-muted)",
                                        }}
                                    >
                                        {tab.progress}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    {renderTaskGroup(
                        priorityTitle("critical"),
                        groupedTasks.critical,
                        "critical"
                    )}
                    {renderTaskGroup(
                        priorityTitle("attention"),
                        groupedTasks.attention,
                        "attention"
                    )}
                    {renderTaskGroup(
                        priorityTitle("normal"),
                        groupedTasks.normal,
                        "normal"
                    )}
                </div>

                <div
                    style={{
                        marginTop: "24px",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <button className="primary-btn" onClick={handleExport}>
                        Export care plan
                    </button>
                </div>
            </div>
        </div>
    );
}