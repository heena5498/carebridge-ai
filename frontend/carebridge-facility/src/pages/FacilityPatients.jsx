import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import apiClient from "../api/client";

export default function FacilityPatients() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCases() {
            try {
                const res = await apiClient.get("/cases");
                setPatients(
                    res.data.map((item) => ({
                        id: item.id,
                        name: item.patient_name,
                        ageSex: "--",
                        mrn: `CASE-${item.id}`,
                        diagnosis: item.status,
                        risk:
                            item.risk_score >= 0.85
                                ? "Low"
                                : item.risk_score >= 0.6
                                  ? "Moderate"
                                  : "High",
                        updated: `Updated ${new Date(item.updated_at).toLocaleString()}`,
                    }))
                );
            } catch {
                setPatients([]);
            } finally {
                setLoading(false);
            }
        }

        fetchCases();
    }, []);

    function openPatient(patient) {
        navigate("/facility/dashboard", {
            state: {
                caseId: patient.id,
                patientName: patient.name,
                mrn: patient.mrn,
            },
        });
    }

    function riskStyle(risk) {
        if (risk === "High") {
            return {
                background: "var(--status-critical-bg)",
                color: "var(--status-critical-text)",
            };
        }
        if (risk === "Moderate") {
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

    const filteredPatients = useMemo(() => {
        const value = searchTerm.trim().toLowerCase();

        if (!value) return patients;

        return patients.filter((patient) => {
            return (
                patient.name.toLowerCase().includes(value) ||
                patient.mrn.toLowerCase().includes(value) ||
                patient.diagnosis.toLowerCase().includes(value)
            );
        });
    }, [searchTerm, patients]);

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
                        <h1 className="section-title">Patients</h1>
                        <p className="section-subtitle">
                            View existing care plans or upload a new discharge PDF to create one
                        </p>
                    </div>

                    <Link to="/facility/new-plan">
                        <button className="primary-btn">+ New care plan</button>
                    </Link>
                </div>

                <div
                    className="card"
                    style={{
                        padding: "16px",
                        marginBottom: "16px",
                    }}
                >
                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                        }}
                    >
                        Search existing patients
                    </label>

                    <input
                        type="text"
                        placeholder="Search by patient name, MRN, or diagnosis"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 14px",
                            border: "0.5px solid var(--border)",
                            borderRadius: "12px",
                            background: "var(--bg-white)",
                            color: "var(--text-primary)",
                            outline: "none",
                            fontSize: "14px",
                        }}
                    />

                    <p
                        style={{
                            margin: "8px 0 0",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                        }}
                    >
                        {filteredPatients.length} patient
                        {filteredPatients.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gap: "14px",
                    }}
                >
                    {loading ? (
                        <div className="card" style={{ padding: "20px", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
                                Loading patients...
                            </p>
                        </div>
                    ) : null}

                    {!loading && filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                            const badge = riskStyle(patient.risk);

                            return (
                                <button
                                    key={patient.id}
                                    onClick={() => openPatient(patient)}
                                    className="card"
                                    style={{
                                        padding: "18px",
                                        textAlign: "left",
                                        border: "0.5px solid var(--border)",
                                        background: "var(--bg-white)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div>
                                            <h2
                                                style={{
                                                    margin: "0 0 4px",
                                                    fontSize: "17px",
                                                    fontWeight: 500,
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                {patient.name}
                                            </h2>

                                            <p
                                                style={{
                                                    margin: "0 0 4px",
                                                    fontSize: "12px",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {patient.ageSex} — MRN: {patient.mrn}
                                            </p>

                                            <p
                                                style={{
                                                    margin: "0 0 6px",
                                                    fontSize: "13px",
                                                    color: "var(--text-body)",
                                                }}
                                            >
                                                {patient.diagnosis}
                                            </p>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: "11px",
                                                    color: "var(--text-faint)",
                                                }}
                                            >
                                                {patient.updated}
                                            </p>
                                        </div>

                                        <span
                                            style={{
                                                padding: "5px 10px",
                                                borderRadius: "999px",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                                ...badge,
                                            }}
                                        >
                      {patient.risk} risk
                    </span>
                                    </div>
                                </button>
                            );
                        })
                    ) : null}

                    {!loading && filteredPatients.length === 0 ? (
                        <div className="card" style={{ padding: "20px", textAlign: "center" }}>
                            <p
                                style={{
                                    margin: "0 0 6px",
                                    fontSize: "15px",
                                    fontWeight: 500,
                                    color: "var(--text-primary)",
                                }}
                            >
                                No patients found
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Try searching with a different patient name, MRN, or diagnosis.
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}