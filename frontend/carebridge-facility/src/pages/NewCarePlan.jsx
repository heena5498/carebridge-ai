import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import apiClient from "../api/client";

export default function NewCarePlan() {
    const navigate = useNavigate();

    const [patientName, setPatientName] = useState("");
    const [patientEmail, setPatientEmail] = useState("");
    const [mrn, setMrn] = useState("");
    const [sourceHospital, setSourceHospital] = useState("");
    const [age, setAge] = useState("");
    const [dischargeDate, setDischargeDate] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    }

    async function handleGenerate() {
        if (!patientName.trim()) {
            alert("Please enter patient name.");
            return;
        }

        if (!patientEmail.trim()) {
            alert("Please enter patient email.");
            return;
        }

        if (!sourceHospital.trim()) {
            alert("Please enter source hospital.");
            return;
        }

        if (!age || Number.isNaN(Number(age))) {
            alert("Please enter a valid age.");
            return;
        }

        if (!dischargeDate) {
            alert("Please select a discharge date.");
            return;
        }

        if (!selectedFile) {
            alert("Please upload a discharge PDF.");
            return;
        }

        try {
            setLoading(true);
            const caseRes = await apiClient.post("/cases", {
                patient_name: patientName,
                patient_email: patientEmail,
                age: Number(age),
                source_hospital: sourceHospital,
                discharge_date: dischargeDate,
            });

            const formData = new FormData();
            formData.append("file", selectedFile);
            await apiClient.post(`/cases/${caseRes.data.id}/documents`, formData);

            // Run the full processing pipeline so dashboard and patient portal
            // are backed by the same generated care-plan data.
            await apiClient.post(`/cases/${caseRes.data.id}/extract`);
            await apiClient.get(`/cases/${caseRes.data.id}/review`);
            await apiClient.post(`/cases/${caseRes.data.id}/approve`);
            await apiClient.post(`/cases/${caseRes.data.id}/care-plan/generate`);

            navigate("/facility/dashboard", {
                state: {
                    caseId: caseRes.data.id,
                    patientName,
                    mrn,
                    fileName: selectedFile.name,
                },
            });
        } catch (error) {
            alert(error?.response?.data?.detail || "Failed to create case.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-shell">
            <div className="container">
                <Navbar />

                <div style={{ marginBottom: "20px" }}>
                    <h1 className="section-title">Create new care plan</h1>
                    <p className="section-subtitle">
                        Upload a discharge summary for a patient to generate a new intake dashboard,
                        care plan, and coordinator chat
                    </p>
                </div>

                <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
                    <h2
                        style={{
                            margin: "0 0 14px",
                            fontSize: "16px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                        }}
                    >
                        Patient details
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                        }}
                    >
                        <div>
                            <label style={labelStyle}>Patient name</label>
                            <input
                                type="text"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Enter patient full name"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>MRN (optional)</label>
                            <input
                                type="text"
                                value={mrn}
                                onChange={(e) => setMrn(e.target.value)}
                                placeholder="Enter MRN"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Patient email</label>
                            <input
                                type="email"
                                value={patientEmail}
                                onChange={(e) => setPatientEmail(e.target.value)}
                                placeholder="patient@example.com"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Source hospital</label>
                            <input
                                type="text"
                                value={sourceHospital}
                                onChange={(e) => setSourceHospital(e.target.value)}
                                placeholder="Enter source hospital"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Age</label>
                            <input
                                type="number"
                                min="0"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Enter age"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Discharge date</label>
                            <input
                                type="date"
                                value={dischargeDate}
                                onChange={(e) => setDischargeDate(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
                    <h2
                        style={{
                            margin: "0 0 14px",
                            fontSize: "16px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                        }}
                    >
                        Upload discharge summary
                    </h2>

                    <div
                        style={{
                            border: "1.5px dashed #C4B9A0",
                            borderRadius: "16px",
                            padding: "32px 20px",
                            textAlign: "center",
                            background: "#FFFDF8",
                        }}
                    >
                        <p
                            style={{
                                margin: "0 0 8px",
                                fontSize: "15px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                            }}
                        >
                            Upload PDF for this patient
                        </p>

                        <p
                            style={{
                                margin: "0 0 14px",
                                fontSize: "12px",
                                color: "var(--text-muted)",
                            }}
                        >
                            PDF, JPG, PNG up to 20 MB
                        </p>

                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

                        {selectedFile && (
                            <p
                                style={{
                                    marginTop: "12px",
                                    fontSize: "12px",
                                    color: "var(--primary)",
                                    fontWeight: 500,
                                }}
                            >
                                Selected: {selectedFile.name}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
                        {loading ? "Creating..." : "Generate care plan"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-primary)",
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "0.5px solid var(--border)",
    borderRadius: "12px",
    background: "var(--bg-white)",
    color: "var(--text-primary)",
    outline: "none",
};