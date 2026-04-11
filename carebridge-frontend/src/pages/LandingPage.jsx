import { Link } from "react-router-dom";
import logo from "../assets/icon.png";

export default function LandingPage() {
    return (
        <div className="page-shell">
            <div className="container">
                <div
                    className="card"
                    style={{
                        marginBottom: "20px",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                            src={logo}
                            alt="CareBridge logo"
                            style={{
                                width: "36px",
                                height: "36px",
                                objectFit: "contain",
                                borderRadius: "8px",
                            }}
                        />

                        <div>
                            <div
                                style={{
                                    fontWeight: 500,
                                    color: "var(--primary)",
                                    fontSize: "18px",
                                    marginBottom: "2px",
                                }}
                            >
                                CareBridge
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
            <span
                style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                }}
            >
              How it works
            </span>

                        <span
                            style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                            }}
                        >
              About
            </span>

                        <Link to="/auth?role=facility">
                            <button className="primary-btn">Upload PDF</button>
                        </Link>
                    </div>
                </div>

                <div
                    style={{
                        textAlign: "center",
                        padding: "42px 20px 34px",
                    }}
                >
                    <div
                        style={{
                            display: "inline-block",
                            fontSize: "11px",
                            padding: "5px 12px",
                            borderRadius: "999px",
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            fontWeight: 500,
                            marginBottom: "14px",
                        }}
                    >
                        AI-powered care transition platform
                    </div>

                    <h1
                        style={{
                            margin: "0 0 12px",
                            fontSize: "34px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            lineHeight: 1.25,
                        }}
                    >
                        One discharge packet.
                        <br />
                        Two people who can&apos;t make sense of it.
                        <br />
                        <span style={{ color: "var(--primary)" }}>CareBridge fixes both.</span>
                    </h1>

                    <p
                        style={{
                            margin: "0 auto 26px",
                            maxWidth: "660px",
                            fontSize: "15px",
                            lineHeight: 1.7,
                            color: "var(--text-secondary)",
                        }}
                    >
                        Upload a discharge summary and get instant, plain-language explanations
                        for patients and actionable intake checklists for facility staff.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "14px",
                            maxWidth: "720px",
                            margin: "0 auto 34px",
                        }}
                    >
                        <Link to="/auth?role=patient" style={{ textAlign: "left" }}>
                            <div
                                className="card"
                                style={{
                                    padding: "18px",
                                    cursor: "pointer",
                                    height: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "10px",
                                        background: "var(--status-normal-bg)",
                                        color: "var(--status-normal-text)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "18px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    👤
                                </div>

                                <p
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: "15px",
                                        fontWeight: 500,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    I&apos;m a patient
                                </p>

                                <p
                                    style={{
                                        margin: "0 0 12px",
                                        fontSize: "12px",
                                        lineHeight: 1.6,
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Understand your discharge summary in plain language
                                </p>

                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        color: "var(--primary)",
                                    }}
                                >
                  Get started →
                </span>
                            </div>
                        </Link>

                        <Link to="/auth?role=facility" style={{ textAlign: "left" }}>
                            <div
                                className="card"
                                style={{
                                    padding: "18px",
                                    cursor: "pointer",
                                    height: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        borderRadius: "10px",
                                        background: "var(--status-attention-bg)",
                                        color: "var(--status-attention-text)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "18px",
                                        marginBottom: "12px",
                                    }}
                                >
                                    🏥
                                </div>

                                <p
                                    style={{
                                        margin: "0 0 6px",
                                        fontSize: "15px",
                                        fontWeight: 500,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    I&apos;m facility staff
                                </p>

                                <p
                                    style={{
                                        margin: "0 0 12px",
                                        fontSize: "12px",
                                        lineHeight: 1.6,
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Get AI-powered intake analysis and care plans
                                </p>

                                <span
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        color: "var(--primary)",
                                    }}
                                >
                  Get started →
                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div
                    style={{
                        height: "0.5px",
                        background: "var(--border)",
                        margin: "0 0 28px",
                    }}
                />

                <div style={{ padding: "0 0 28px" }}>
                    <p
                        style={{
                            margin: "0 0 6px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "var(--primary)",
                            letterSpacing: "0.4px",
                        }}
                    >
                        How it works
                    </p>

                    <h2
                        style={{
                            margin: "0 0 22px",
                            textAlign: "center",
                            fontSize: "24px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                        }}
                    >
                        From PDF to clarity in under 30 seconds
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                            <div
                                style={{
                                    width: "26px",
                                    height: "26px",
                                    borderRadius: "50%",
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                }}
                            >
                                1
                            </div>
                            <p
                                style={{
                                    margin: "0 0 4px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "var(--text-primary)",
                                }}
                            >
                                Upload
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    lineHeight: 1.6,
                                    color: "var(--text-muted)",
                                }}
                            >
                                Drop your discharge summary PDF into CareBridge
                            </p>
                        </div>

                        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                            <div
                                style={{
                                    width: "26px",
                                    height: "26px",
                                    borderRadius: "50%",
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                }}
                            >
                                2
                            </div>
                            <p
                                style={{
                                    margin: "0 0 4px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "var(--text-primary)",
                                }}
                            >
                                AI analysis
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    lineHeight: 1.6,
                                    color: "var(--text-muted)",
                                }}
                            >
                                5 specialized agents parse, validate, and flag risks
                            </p>
                        </div>

                        <div className="card" style={{ padding: "16px", textAlign: "center" }}>
                            <div
                                style={{
                                    width: "26px",
                                    height: "26px",
                                    borderRadius: "50%",
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                }}
                            >
                                3
                            </div>
                            <p
                                style={{
                                    margin: "0 0 4px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "var(--text-primary)",
                                }}
                            >
                                Act
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    lineHeight: 1.6,
                                    color: "var(--text-muted)",
                                }}
                            >
                                Patients get plain answers. Staff get care plans.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ paddingBottom: "28px" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: "1px",
                            background: "var(--border)",
                            borderRadius: "12px",
                            overflow: "hidden",
                            marginBottom: "28px",
                        }}
                    >
                        <div
                            style={{
                                background: "var(--bg-white)",
                                padding: "18px",
                                textAlign: "center",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "24px",
                                    fontWeight: 500,
                                    color: "var(--primary)",
                                }}
                            >
                                $26B
                            </p>
                            <p
                                style={{
                                    margin: "5px 0 0",
                                    fontSize: "11px",
                                    lineHeight: 1.5,
                                    color: "var(--text-muted)",
                                }}
                            >
                                Annual cost of preventable readmissions
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--bg-white)",
                                padding: "18px",
                                textAlign: "center",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "24px",
                                    fontWeight: 500,
                                    color: "var(--primary)",
                                }}
                            >
                                1 in 5
                            </p>
                            <p
                                style={{
                                    margin: "5px 0 0",
                                    fontSize: "11px",
                                    lineHeight: 1.5,
                                    color: "var(--text-muted)",
                                }}
                            >
                                Patients readmitted within 30 days of discharge
                            </p>
                        </div>

                        <div
                            style={{
                                background: "var(--bg-white)",
                                padding: "18px",
                                textAlign: "center",
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "24px",
                                    fontWeight: 500,
                                    color: "var(--primary)",
                                }}
                            >
                                80%
                            </p>
                            <p
                                style={{
                                    margin: "5px 0 0",
                                    fontSize: "11px",
                                    lineHeight: 1.5,
                                    color: "var(--text-muted)",
                                }}
                            >
                                Of medical errors linked to care transitions
                            </p>
                        </div>
                    </div>

                    <p
                        style={{
                            margin: "0 0 6px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "var(--primary)",
                        }}
                    >
                        Live preview
                    </p>

                    <h2
                        style={{
                            margin: "0 0 16px",
                            textAlign: "center",
                            fontSize: "24px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                        }}
                    >
                        See what CareBridge finds
                    </h2>

                    <div
                        className="card"
                        style={{
                            padding: "20px",
                            maxWidth: "760px",
                            margin: "0 auto",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "14px",
                            }}
                        >
                            <div
                                style={{
                                    width: "42px",
                                    height: "50px",
                                    borderRadius: "6px",
                                    background: "var(--border-light)",
                                    border: "0.5px solid var(--border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    color: "var(--text-muted)",
                                }}
                            >
                                PDF
                            </div>

                            <div>
                                <p
                                    style={{
                                        margin: "0 0 2px",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    discharge_summary_thompson.pdf
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "11px",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Sample discharge — hip fracture, 83yo female
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                marginBottom: "14px",
                            }}
                        >
              <span
                  style={{
                      background: "var(--status-normal-bg)",
                      color: "var(--status-normal-text)",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 500,
                  }}
              >
                ✓ 2 normal
              </span>

                            <span
                                style={{
                                    background: "var(--status-attention-bg)",
                                    color: "var(--status-attention-text)",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                }}
                            >
                ! 1 needs attention
              </span>

                            <span
                                style={{
                                    background: "var(--status-critical-bg)",
                                    color: "var(--status-critical-text)",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                }}
                            >
                ⚠ 1 medication conflict
              </span>
                        </div>

                        <div>
                            {[
                                ["Lisinopril dose changed", "10mg to 20mg"],
                                ["Enoxaparin (new)", "40mg daily x 28 days"],
                                ["Metformin held — resume", "1000mg twice daily"],
                                ["Missing: PCP follow-up date", "No date specified"],
                            ].map(([label, value], index) => (
                                <div
                                    key={label}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "10px 0",
                                        borderBottom:
                                            index !== 3 ? "0.5px solid var(--border-light)" : "none",
                                        gap: "16px",
                                    }}
                                >
                  <span
                      style={{
                          fontSize: "12px",
                          color: "var(--text-primary)",
                      }}
                  >
                    {label}
                  </span>
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            color:
                                                label === "Missing: PCP follow-up date"
                                                    ? "var(--status-attention-text)"
                                                    : "var(--text-muted)",
                                        }}
                                    >
                    {value}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        background: "var(--primary)",
                        borderRadius: "16px",
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
          <span
              style={{
                  fontSize: "11px",
                  color: "#A3C9B0",
              }}
          >
            CareBridge AI — Not medical advice. Always consult your provider.
          </span>

                    <div
                        style={{
                            display: "flex",
                            gap: "14px",
                            flexWrap: "wrap",
                        }}
                    >
                        <span style={{ fontSize: "11px", color: "#D4E8DB" }}>Privacy</span>
                        <span style={{ fontSize: "11px", color: "#D4E8DB" }}>About</span>
                        <span style={{ fontSize: "11px", color: "#D4E8DB" }}>AHRQ sources</span>
                    </div>
                </div>
            </div>
        </div>
    );
}