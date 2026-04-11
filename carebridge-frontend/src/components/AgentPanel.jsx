import { useState } from "react";

export default function AgentPanel({
                                       number,
                                       title,
                                       badgeText,
                                       badgeType = "safe",
                                       defaultOpen = false,
                                       children,
                                   }) {
    const [open, setOpen] = useState(defaultOpen);

    const badgeStyles = {
        safe: {
            background: "var(--primary-light)",
            color: "var(--primary)",
        },
        attention: {
            background: "var(--status-attention-bg)",
            color: "var(--status-attention-text)",
        },
        critical: {
            background: "var(--status-critical-bg)",
            color: "var(--status-critical-text)",
        },
    };

    const currentBadge = badgeStyles[badgeType] || badgeStyles.safe;

    return (
        <div className="card" style={{ overflow: "hidden", marginBottom: "12px" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%",
                    border: "none",
                    background: "var(--bg-white)",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    textAlign: "left",
                }}
            >
        <span
            style={{
                fontSize: "11px",
                fontWeight: 500,
                padding: "3px 9px",
                borderRadius: "999px",
                background: currentBadge.background,
                color: currentBadge.color,
                minWidth: "28px",
                textAlign: "center",
            }}
        >
          {number}
        </span>

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                        }}
                    >
                        {title}
                    </div>
                </div>

                {badgeText && (
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: currentBadge.background,
                            color: currentBadge.color,
                        }}
                    >
            {badgeText}
          </span>
                )}

                <span
                    style={{
                        fontSize: "14px",
                        color: "var(--text-faint)",
                        marginLeft: "4px",
                    }}
                >
          {open ? "⌄" : "›"}
        </span>
            </button>

            {open && (
                <div
                    style={{
                        borderTop: "0.5px solid var(--border-light)",
                        padding: "16px",
                        background: "var(--bg-white)",
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}