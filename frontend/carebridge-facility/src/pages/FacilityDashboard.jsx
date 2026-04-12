import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AgentPanel from "../components/AgentPanel";
import { getCase, reviewCase, patchReview, approveCase } from "../api/cases";

// ── helpers ───────────────────────────────────────────────────────────────────
function severityBadge(severity = "medium") {
    const s = severity.toLowerCase();
    if (s === "critical" || s === "high")
        return { bg: "var(--status-critical-bg)", color: "var(--status-critical-text)", label: severity };
    if (s === "medium")
        return { bg: "var(--status-attention-bg)", color: "var(--status-attention-text)", label: severity };
    return { bg: "var(--status-normal-bg)", color: "var(--status-normal-text)", label: severity };
}

function timeFrameLabel(tf) {
    if (!tf) return "Ongoing";
    const map = { first_24h: "First 24 h", "24_to_72h": "24–72 h", day_3_to_7: "Day 3–7" };
    return map[tf] || tf;
}

function confidenceColor(v) {
    if (v >= 0.7) return "var(--status-normal-text)";
    if (v >= 0.4) return "var(--status-attention-text)";
    return "var(--status-critical-text)";
}

function Pill({ children, bg, color }) {
    return (
        <span style={{
            background: bg, color, padding: "4px 10px",
            borderRadius: "999px", fontSize: "11px", fontWeight: 500,
        }}>
            {children}
        </span>
    );
}

function Divider({ index, total }) {
    return index < total - 1
        ? <div style={{ borderBottom: "0.5px solid var(--border-light)" }} />
        : null;
}

const editInputStyle = {
    width: "100%", padding: "7px 10px", border: "0.5px solid var(--border)",
    borderRadius: 8, fontSize: 12, color: "var(--text-primary)",
    background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

// ── display sections ──────────────────────────────────────────────────────────
function MedicationsList({ medications }) {
    if (!medications?.length) return <p style={emptyStyle}>No medications extracted.</p>;
    return (
        <div>
            {medications.map((med, i) => (
                <div key={i}>
                    <div style={{ padding: "10px 0", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                            background: med.confidence >= 0.7 ? "var(--primary)" : "var(--status-attention-text)",
                        }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                                {med.name}{med.dose ? ` ${med.dose}` : ""}
                            </p>
                            <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text-muted)" }}>
                                {[med.route, med.frequency].filter(Boolean).join(" · ")}
                            </p>
                            {med.purpose && (
                                <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)" }}>{med.purpose}</p>
                            )}
                        </div>
                        <Pill bg="var(--bg-surface)" color="var(--text-muted)">
                            {Math.round((med.confidence ?? 1) * 100)}%
                        </Pill>
                    </div>
                    <Divider index={i} total={medications.length} />
                </div>
            ))}
        </div>
    );
}

function FollowUpsList({ followUps }) {
    if (!followUps?.length) return <p style={emptyStyle}>No follow-ups extracted.</p>;
    return (
        <div>
            {followUps.map((f, i) => (
                <div key={i}>
                    <div style={{ padding: "10px 0" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                            {f.provider_name || f.specialty || "Follow-up appointment"}
                        </p>
                        {f.specialty && f.provider_name && (
                            <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text-muted)" }}>{f.specialty}</p>
                        )}
                        {(f.appointment_date || f.appointment_time) && (
                            <p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--text-muted)" }}>
                                {[f.appointment_date, f.appointment_time].filter(Boolean).join(" at ")}
                            </p>
                        )}
                        {f.reason && (
                            <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)" }}>{f.reason}</p>
                        )}
                    </div>
                    <Divider index={i} total={followUps.length} />
                </div>
            ))}
        </div>
    );
}

function RisksList({ risks }) {
    if (!risks?.length) return <p style={emptyStyle}>No risks identified.</p>;
    return (
        <div>
            {risks.map((r, i) => {
                const badge = severityBadge(r.severity);
                return (
                    <div key={i}>
                        <div style={{ padding: "10px 0", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                                        {r.category?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                    </p>
                                    <Pill bg={badge.bg} color={badge.color}>{badge.label}</Pill>
                                </div>
                                <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--text-body)", lineHeight: 1.5 }}>{r.description}</p>
                                {r.action_needed && (
                                    <p style={{ margin: 0, fontSize: 11, color: "var(--primary)", fontWeight: 500 }}>
                                        Action: {r.action_needed}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Divider index={i} total={risks.length} />
                    </div>
                );
            })}
        </div>
    );
}

function CareTasksList({ careTasks }) {
    if (!careTasks?.length) return <p style={emptyStyle}>No care tasks extracted.</p>;
    const groups = careTasks.reduce((acc, t) => {
        const key = t.time_frame || "ongoing";
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
    }, {});
    return (
        <div style={{ display: "grid", gap: 12 }}>
            {Object.entries(groups).map(([tf, tasks]) => (
                <div key={tf}>
                    <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {timeFrameLabel(tf)}
                    </p>
                    {tasks.map((t, i) => {
                        const badge = severityBadge(t.priority);
                        return (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0" }}>
                                <div style={{ width: 14, height: 14, border: "1px solid var(--text-faint)", borderRadius: 3, marginTop: 3, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--text-body)", lineHeight: 1.5 }}>{t.task}</p>
                                    <p style={{ margin: 0, fontSize: 10, color: "var(--text-faint)" }}>{t.category}</p>
                                </div>
                                <Pill bg={badge.bg} color={badge.color}>{t.priority}</Pill>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function WarningSignsList({ warningSigns }) {
    if (!warningSigns?.length) return <p style={emptyStyle}>No warning signs noted.</p>;
    return (
        <div>
            {warningSigns.map((w, i) => (
                <div key={i}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0" }}>
                        <span style={{ color: "var(--status-critical-text)", fontSize: 14, marginTop: 1 }}>⚠</span>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-body)", lineHeight: 1.5 }}>{w}</p>
                    </div>
                    <Divider index={i} total={warningSigns.length} />
                </div>
            ))}
        </div>
    );
}

function MissingInfoList({ missingInfo }) {
    if (!missingInfo?.length) return <p style={emptyStyle}>No missing information flagged.</p>;
    return (
        <div>
            {missingInfo.map((m, i) => {
                const badge = severityBadge(m.severity);
                return (
                    <div key={i}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0" }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{m.field_name}</p>
                                <p style={{ margin: 0, fontSize: 12, color: "var(--text-body)", lineHeight: 1.5 }}>{m.reason}</p>
                            </div>
                            <Pill bg={badge.bg} color={badge.color}>{badge.label}</Pill>
                        </div>
                        <Divider index={i} total={missingInfo.length} />
                    </div>
                );
            })}
        </div>
    );
}

// ── edit sections ─────────────────────────────────────────────────────────────
function AllergiesEdit({ allergies, onChange }) {
    const [draft, setDraft] = useState("");
    const add = () => {
        const v = draft.trim();
        if (v) { onChange([...allergies, v]); setDraft(""); }
    };
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {allergies.map((a, i) => (
                    <span key={i} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "var(--status-critical-bg)", color: "var(--status-critical-text)",
                        padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 500,
                    }}>
                        {a}
                        <button onClick={() => onChange(allergies.filter((_, j) => j !== i))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 14, lineHeight: 1, padding: "0 0 0 2px" }}>×</button>
                    </span>
                ))}
                {allergies.length === 0 && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>No allergies listed</span>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
                <input value={draft} onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && add()}
                    placeholder="Add allergy and press Enter"
                    style={{ ...editInputStyle, flex: 1 }} />
                <button onClick={add} style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Add</button>
            </div>
        </div>
    );
}

function MedicationsEdit({ medications, onChange }) {
    const update = (i, field, val) => {
        const m = [...medications];
        m[i] = { ...m[i], [field]: val };
        onChange(m);
    };
    const remove = (i) => onChange(medications.filter((_, j) => j !== i));
    const add = () => onChange([...medications, { name: "", dose: "", route: "", frequency: "", purpose: "" }]);

    return (
        <div>
            {medications.map((med, i) => (
                <div key={i} style={{ border: "0.5px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10, background: "var(--bg-surface)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px", gap: 8, marginBottom: 8 }}>
                        <div>
                            <label style={labelStyle}>Name</label>
                            <input value={med.name || ""} onChange={e => update(i, "name", e.target.value)} style={editInputStyle} placeholder="Medication name" />
                        </div>
                        <div>
                            <label style={labelStyle}>Dose</label>
                            <input value={med.dose || ""} onChange={e => update(i, "dose", e.target.value)} style={editInputStyle} placeholder="e.g. 10mg" />
                        </div>
                        <div>
                            <label style={labelStyle}>Route</label>
                            <input value={med.route || ""} onChange={e => update(i, "route", e.target.value)} style={editInputStyle} placeholder="oral" />
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                            <label style={labelStyle}>Frequency</label>
                            <input value={med.frequency || ""} onChange={e => update(i, "frequency", e.target.value)} style={editInputStyle} placeholder="e.g. twice daily" />
                        </div>
                        <div>
                            <label style={labelStyle}>Purpose</label>
                            <input value={med.purpose || ""} onChange={e => update(i, "purpose", e.target.value)} style={editInputStyle} placeholder="Purpose / notes" />
                        </div>
                    </div>
                    <button onClick={() => remove(i)} style={{ fontSize: 11, color: "var(--status-critical-text)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Remove medication
                    </button>
                </div>
            ))}
            <button onClick={add} style={{ color: "var(--primary)", background: "none", border: "0.5px dashed var(--primary)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", width: "100%" }}>
                + Add medication
            </button>
        </div>
    );
}

function FollowUpsEdit({ followUps, onChange }) {
    const update = (i, field, val) => {
        const f = [...followUps];
        f[i] = { ...f[i], [field]: val };
        onChange(f);
    };
    const remove = (i) => onChange(followUps.filter((_, j) => j !== i));
    const add = () => onChange([...followUps, { provider_name: "", specialty: "", appointment_date: "", appointment_time: "", reason: "" }]);

    return (
        <div>
            {followUps.map((f, i) => (
                <div key={i} style={{ border: "0.5px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10, background: "var(--bg-surface)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                            <label style={labelStyle}>Provider name</label>
                            <input value={f.provider_name || ""} onChange={e => update(i, "provider_name", e.target.value)} style={editInputStyle} placeholder="Dr. Smith" />
                        </div>
                        <div>
                            <label style={labelStyle}>Specialty</label>
                            <input value={f.specialty || ""} onChange={e => update(i, "specialty", e.target.value)} style={editInputStyle} placeholder="Cardiology" />
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <input value={f.appointment_date || ""} onChange={e => update(i, "appointment_date", e.target.value)} style={editInputStyle} placeholder="YYYY-MM-DD" />
                        </div>
                        <div>
                            <label style={labelStyle}>Time</label>
                            <input value={f.appointment_time || ""} onChange={e => update(i, "appointment_time", e.target.value)} style={editInputStyle} placeholder="10:00 AM" />
                        </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <label style={labelStyle}>Reason</label>
                        <input value={f.reason || ""} onChange={e => update(i, "reason", e.target.value)} style={editInputStyle} placeholder="Reason for visit" />
                    </div>
                    <button onClick={() => remove(i)} style={{ fontSize: 11, color: "var(--status-critical-text)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Remove follow-up
                    </button>
                </div>
            ))}
            <button onClick={add} style={{ color: "var(--primary)", background: "none", border: "0.5px dashed var(--primary)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", width: "100%" }}>
                + Add follow-up
            </button>
        </div>
    );
}

function RisksEdit({ risks, onChange }) {
    const SEVERITIES = ["low", "medium", "high", "critical"];
    const update = (i, field, val) => {
        const r = [...risks];
        r[i] = { ...r[i], [field]: val };
        onChange(r);
    };
    const remove = (i) => onChange(risks.filter((_, j) => j !== i));
    const add = () => onChange([...risks, { category: "", description: "", severity: "medium", action_needed: "" }]);

    return (
        <div>
            {risks.map((r, i) => (
                    <div key={i} style={{ border: "0.5px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 10, background: "var(--bg-surface)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, marginBottom: 8 }}>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <input value={r.category || ""} onChange={e => update(i, "category", e.target.value)} style={editInputStyle} placeholder="e.g. fall_risk" />
                            </div>
                            <div>
                                <label style={labelStyle}>Severity</label>
                                <select value={r.severity || "medium"} onChange={e => update(i, "severity", e.target.value)}
                                    style={{ ...editInputStyle, appearance: "none" }}>
                                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={labelStyle}>Description</label>
                            <textarea value={r.description || ""} onChange={e => update(i, "description", e.target.value)}
                                style={{ ...editInputStyle, resize: "vertical", minHeight: 60 }} placeholder="Describe the risk" />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={labelStyle}>Action needed</label>
                            <input value={r.action_needed || ""} onChange={e => update(i, "action_needed", e.target.value)} style={editInputStyle} placeholder="Recommended action" />
                        </div>
                        <button onClick={() => remove(i)} style={{ fontSize: 11, color: "var(--status-critical-text)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            Remove risk
                        </button>
                    </div>
            ))}
            <button onClick={add} style={{ color: "var(--primary)", background: "none", border: "0.5px dashed var(--primary)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", width: "100%" }}>
                + Add risk
            </button>
        </div>
    );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function FacilityDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const caseId = location.state?.caseId;

    const [extraction, setExtraction] = useState(null);
    const [loading, setLoading] = useState(!!caseId);
    const [error, setError] = useState(null);

    // review / edit / approve state
    const [approved, setApproved] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [approving, setApproving] = useState(false);
    const [reviewReady, setReviewReady] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [editedData, setEditedData] = useState({ allergies: [], medications: [], follow_ups: [], risks: [] });

    useEffect(() => {
        if (!caseId) { setError("No case ID provided."); setLoading(false); return; }
        getCase(caseId)
            .then(data => {
                if (data.extraction_data) setExtraction(data.extraction_data);
                else setError("This case has not been extracted yet.");
                if (["approved", "care_plan_generated"].includes(data.status)) {
                    setApproved(true);
                }
                if (["in_review", "approved", "care_plan_generated"].includes(data.status)) {
                    setReviewReady(true);
                }
            })
            .catch(err => setError(err.message || "Failed to load case data."))
            .finally(() => setLoading(false));
    }, [caseId]);

    const handleEdit = async () => {
        setActionError(null);
        if (!reviewReady) {
            try {
                await reviewCase(caseId);
                setReviewReady(true);
            } catch (e) {
                setActionError(e?.response?.data?.detail || "Failed to initialize review.");
                return;
            }
        }
        setEditedData({
            allergies: [...(extraction?.allergies || [])],
            medications: JSON.parse(JSON.stringify(extraction?.medications || [])),
            follow_ups: JSON.parse(JSON.stringify(extraction?.follow_ups || [])),
            risks: JSON.parse(JSON.stringify(extraction?.risks || [])),
        });
        setEditMode(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setActionError(null);
        try {
            await patchReview(caseId, editedData);
            const updated = await getCase(caseId);
            if (updated.extraction_data) setExtraction(updated.extraction_data);
            setEditMode(false);
        } catch (e) {
            setActionError(e?.response?.data?.detail || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => { setEditMode(false); setActionError(null); };

    const handleApprove = async () => {
        setApproving(true);
        setActionError(null);
        try {
            if (!reviewReady) {
                await reviewCase(caseId);
                setReviewReady(true);
            }
            await approveCase(caseId);
            setApproved(true);
            navigate("/facility/care-plan", { state: { caseId } });
        } catch (e) {
            setActionError(e?.response?.data?.detail || "Failed to approve case.");
        } finally {
            setApproving(false);
        }
    };

    const patientName = extraction?.patient_name || location.state?.patientName || "Patient";
    const initials = patientName.split(" ").map(p => p[0]).slice(0, 2).join("");
    const confidence = extraction?.overall_confidence ?? null;
    const confidencePct = confidence !== null ? Math.round(confidence * 100) : null;

    if (loading) {
        return (
            <div className="page-shell"><div className="container"><Navbar />
                <div className="card" style={{ padding: 40, textAlign: "center", marginTop: 20 }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>Loading case data…</p>
                </div>
            </div></div>
        );
    }

    if (error) {
        return (
            <div className="page-shell"><div className="container"><Navbar />
                <div className="card" style={{ padding: 24, marginTop: 20, background: "var(--status-critical-bg)" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--status-critical-text)" }}>{error}</p>
                </div>
            </div></div>
        );
    }

    return (
        <div className="page-shell">
            <div className="container">
                <Navbar />

                {/* Page header + action bar */}
                <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div>
                        <h1 className="section-title">Facility intake dashboard</h1>
                        <p className="section-subtitle">Command center for care coordinators receiving a new patient</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <button
                            onClick={() => navigate(`/facility/chat?case_id=${caseId}`)}
                            className="outline-btn"
                            style={{ fontSize: 13 }}
                        >
                            Chat
                        </button>
                        {approved ? (
                            <span style={{ background: "var(--status-normal-bg)", color: "var(--status-normal-text)", padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
                                ✓ Approved
                            </span>
                        ) : (
                            <>
                                {editMode ? (
                                    <>
                                        <button onClick={handleCancel} className="outline-btn" style={{ fontSize: 13 }}>Cancel</button>
                                        <button onClick={handleSave} className="primary-btn" style={{ fontSize: 13 }} disabled={saving}>
                                            {saving ? "Saving…" : "Save changes"}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={handleEdit} className="outline-btn" style={{ fontSize: 13 }}>
                                        ✏ Edit
                                    </button>
                                )}
                                <button
                                    onClick={handleApprove}
                                    className="primary-btn"
                                    style={{ fontSize: 13, opacity: editMode || approving ? 0.6 : 1 }}
                                    disabled={editMode || approving}
                                >
                                    {approving ? "Approving…" : "Approve"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Action error */}
                {actionError && (
                    <div style={{ marginBottom: 16, background: "var(--status-critical-bg)", color: "var(--status-critical-text)", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>
                        {actionError}
                    </div>
                )}

                {/* Edit mode banner */}
                {editMode && (
                    <div style={{ marginBottom: 16, background: "var(--status-attention-bg)", color: "var(--status-attention-text)", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                        Editing mode — modify fields below and click Save changes when done.
                    </div>
                )}

                {/* Patient header + confidence */}
                <div className="grid-2" style={{ marginBottom: 16 }}>
                    <div className="card" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: "50%",
                                background: "var(--primary-light)", color: "var(--primary)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 500, flexShrink: 0, fontSize: 16,
                            }}>{initials}</div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>
                                    {patientName}
                                </h2>

                                {/* Allergies — editable */}
                                {editMode ? (
                                    <>
                                        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Allergies</p>
                                        <AllergiesEdit
                                            allergies={editedData.allergies}
                                            onChange={a => setEditedData(p => ({ ...p, allergies: a }))}
                                        />
                                    </>
                                ) : (
                                    extraction?.allergies?.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                            {extraction.allergies.map((a, i) => (
                                                <Pill key={i} bg="var(--status-critical-bg)" color="var(--status-critical-text)">
                                                    Allergy: {a}
                                                </Pill>
                                            ))}
                                        </div>
                                    )
                                )}

                                {extraction?.clinical_summary && !editMode && (
                                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                                        {extraction.clinical_summary.length > 180
                                            ? extraction.clinical_summary.slice(0, 180) + "…"
                                            : extraction.clinical_summary}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Confidence score */}
                    <div className="card" style={{
                        padding: 16, textAlign: "center",
                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                    }}>
                        <div style={{
                            width: 76, height: 76, borderRadius: "50%",
                            border: `5px solid ${confidencePct !== null ? confidenceColor(confidence) : "var(--border)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
                        }}>
                            <span style={{ fontSize: 22, fontWeight: 500, color: confidencePct !== null ? confidenceColor(confidence) : "var(--text-muted)" }}>
                                {confidencePct !== null ? `${confidencePct}%` : "—"}
                            </span>
                        </div>
                        <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-muted)" }}>Extraction confidence</p>
                        <Pill
                            bg={confidencePct === null ? "var(--bg-surface)" : confidencePct >= 70 ? "var(--status-normal-bg)" : confidencePct >= 40 ? "var(--status-attention-bg)" : "var(--status-critical-bg)"}
                            color={confidencePct === null ? "var(--text-muted)" : confidencePct >= 70 ? "var(--status-normal-text)" : confidencePct >= 40 ? "var(--status-attention-text)" : "var(--status-critical-text)"}
                        >
                            {confidencePct === null ? "Pending" : confidencePct >= 70 ? "High" : confidencePct >= 40 ? "Moderate" : "Low"}
                        </Pill>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid-4" style={{ marginBottom: 20 }}>
                    {[
                        { value: extraction?.medications?.length ?? 0, label: "Medications", color: "var(--text-primary)" },
                        { value: extraction?.risks?.length ?? 0, label: "Risks identified", color: "var(--status-critical-text)" },
                        { value: extraction?.follow_ups?.length ?? 0, label: "Follow-ups", color: "var(--status-normal-text)" },
                        { value: extraction?.missing_information?.length ?? 0, label: "Missing items", color: "var(--status-attention-text)" },
                    ].map(({ value, label, color }) => (
                        <div key={label} className="card" style={{ padding: 14, textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 24, fontWeight: 500, color }}>{value}</p>
                            <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                <AgentPanel number="1" title="Clinical summary" badgeType="safe" badgeText="Summary" defaultOpen={true}>
                    {extraction?.clinical_summary
                        ? <p style={{ margin: 0, fontSize: 13, color: "var(--text-body)", lineHeight: 1.7 }}>{extraction.clinical_summary}</p>
                        : <p style={emptyStyle}>No clinical summary available.</p>
                    }
                </AgentPanel>

                <AgentPanel number="2" title="Medications"
                    badgeType={extraction?.medications?.length ? "attention" : "safe"}
                    badgeText={`${extraction?.medications?.length ?? 0} medications`}
                    defaultOpen={true}>
                    {editMode ? (
                        <MedicationsEdit
                            medications={editedData.medications}
                            onChange={m => setEditedData(p => ({ ...p, medications: m }))}
                        />
                    ) : (
                        <MedicationsList medications={extraction?.medications} />
                    )}
                </AgentPanel>

                <AgentPanel number="3" title="Follow-ups"
                    badgeType={extraction?.follow_ups?.length ? "attention" : "safe"}
                    badgeText={`${extraction?.follow_ups?.length ?? 0} scheduled`}>
                    {editMode ? (
                        <FollowUpsEdit
                            followUps={editedData.follow_ups}
                            onChange={f => setEditedData(p => ({ ...p, follow_ups: f }))}
                        />
                    ) : (
                        <FollowUpsList followUps={extraction?.follow_ups} />
                    )}
                </AgentPanel>

                <AgentPanel number="4" title="Risks"
                    badgeType={extraction?.risks?.some(r => ["critical", "high"].includes(r.severity?.toLowerCase())) ? "critical" : extraction?.risks?.length ? "attention" : "safe"}
                    badgeText={`${extraction?.risks?.length ?? 0} identified`}>
                    {editMode ? (
                        <RisksEdit
                            risks={editedData.risks}
                            onChange={r => setEditedData(p => ({ ...p, risks: r }))}
                        />
                    ) : (
                        <RisksList risks={extraction?.risks} />
                    )}
                </AgentPanel>

                <AgentPanel number="5" title="Care tasks"
                    badgeType={extraction?.care_tasks?.length ? "attention" : "safe"}
                    badgeText={`${extraction?.care_tasks?.length ?? 0} tasks`}>
                    <CareTasksList careTasks={extraction?.care_tasks} />
                </AgentPanel>

                <AgentPanel number="6" title="Warning signs"
                    badgeType={extraction?.warning_signs?.length ? "critical" : "safe"}
                    badgeText={`${extraction?.warning_signs?.length ?? 0} signs`}>
                    <WarningSignsList warningSigns={extraction?.warning_signs} />
                </AgentPanel>

                <AgentPanel number="7" title="Missing information"
                    badgeType={extraction?.missing_information?.length ? "attention" : "safe"}
                    badgeText={`${extraction?.missing_information?.length ?? 0} gaps`}>
                    <MissingInfoList missingInfo={extraction?.missing_information} />
                </AgentPanel>

                {/* Bottom approve button */}
                {!approved && !editMode && (
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button onClick={handleEdit} className="outline-btn">✏ Edit</button>
                        <button onClick={handleApprove} className="primary-btn" disabled={approving}>
                            {approving ? "Approving…" : "Approve & generate care plan"}
                        </button>
                    </div>
                )}
                {editMode && (
                    <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button onClick={handleCancel} className="outline-btn">Cancel</button>
                        <button onClick={handleSave} className="primary-btn" disabled={saving}>
                            {saving ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const emptyStyle = { margin: 0, fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" };
const labelStyle = { display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 };
