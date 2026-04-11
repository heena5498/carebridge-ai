import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function NewCarePlan() {
    const navigate = useNavigate();

    const [patientName, setPatientName] = useState("");
    const [mrn, setMrn] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    }

    function handleGenerate() {
        if (!patientName.trim()) {
            alert("Please enter patient name.");
            return;
        }

        if (!selectedFile) {
            alert("Please upload a discharge PDF.");
            return;
        }

        navigate("/facility/dashboard", {
            state: {
                patientName,
                mrn,
                fileName: selectedFile.name,
            },
        });
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
                            gridTemplateColumns: "2fr 1fr",
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
                    <button className="primary-btn" onClick={handleGenerate}>
                        Generate care plan
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