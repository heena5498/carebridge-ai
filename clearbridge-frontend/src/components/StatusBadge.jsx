export default function StatusBadge({ type = "normal", label }) {
    const styles = {
        normal: {
            background: "var(--status-normal-bg)",
            color: "var(--status-normal-text)",
            icon: "✓",
        },
        attention: {
            background: "var(--status-attention-bg)",
            color: "var(--status-attention-text)",
            icon: "!",
        },
        critical: {
            background: "var(--status-critical-bg)",
            color: "var(--status-critical-text)",
            icon: "⚠",
        },
        safe: {
            background: "var(--primary-light)",
            color: "var(--primary)",
            icon: "✓",
        },
    };

    const current = styles[type] || styles.normal;

    return (
        <span
            className="badge"
            style={{
                background: current.background,
                color: current.color,
            }}
        >
      <span style={{ fontSize: "11px", lineHeight: 1 }}>{current.icon}</span>
      <span>{label}</span>
    </span>
    );
}