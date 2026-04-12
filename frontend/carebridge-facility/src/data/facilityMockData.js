const facilityMockData = {
    patient: {
        name: "Margaret Thompson",
        initials: "MT",
        ageSex: "83F",
        mrn: "MR-4472891",
        admitted: "Nov 15, 2024",
        discharged: "Nov 19, 2024",
        attending: "Dr. Sarah Chen",
        disposition: "SNF transfer",
        allergies: [
            { label: "Penicillin", severity: "critical" },
            { label: "Sulfa (anaphylaxis)", severity: "critical" },
        ],
        diagnoses: ["Diabetes T2", "Hypertension", "Post-op ORIF left hip"],
    },

    riskScore: 6.4,

    quickStats: {
        medications: 4,
        conflicts: 1,
        missingItems: 2,
        followUps: 2,
    },

    medSafety: {
        medications: [
            {
                name: "Lisinopril 20mg",
                details: "Oral, once daily — BP management",
                status: "Changed",
                tone: "attention",
            },
            {
                name: "Enoxaparin 40mg",
                details: "SubQ, once daily x 28 days — DVT prophylaxis",
                status: "New",
                tone: "normal",
            },
            {
                name: "Metformin 1000mg",
                details: "Oral, twice daily — DM2 management",
                status: "Resume",
                tone: "safe",
            },
            {
                name: "Oxycodone 5mg",
                details: "Oral, q6h PRN — pain management",
                status: "New",
                tone: "normal",
            },
        ],
        conflictTitle: "Potential interaction flagged",
        conflictText:
            "Lisinopril 20mg may elevate potassium levels. No potassium monitoring ordered post-discharge. Recommend checking BMP within 5–7 days. Cross-reference with pending lab results.",
    },

    missingInfo: [
        {
            text: 'PCP follow-up: no specific date given — only "within 1 week"',
            severity: "High",
            tone: "critical",
        },
        {
            text: 'Pre-admission med list references "home meds per PCP" — full list not included',
            severity: "Medium",
            tone: "attention",
        },
    ],

    carePlan: {
        overallProgressText: "3 of 17 tasks done",
        overallProgressPercent: 18,
        tabs: [
            {
                key: "24hr",
                label: "First 24 hours",
                range: "Nov 19 evening — Nov 20",
                progress: "3/8 complete",
                tasks: [
                    {
                        id: 1,
                        text: "Verify allergies: Penicillin (rash), Sulfa drugs (anaphylaxis)",
                        category: "Safety",
                        priority: "critical",
                        completed: true,
                        time: "Completed 6:12 PM",
                    },
                    {
                        id: 2,
                        text: "Review medication conflict: lisinopril 20mg + potassium monitoring needed",
                        category: "Med safety",
                        priority: "critical",
                        completed: true,
                        time: "Completed 6:15 PM",
                        note: "Called Dr. Chen — BMP order placed for Nov 25",
                    },
                    {
                        id: 3,
                        text: "Resume metformin 1000mg with evening meal",
                        category: "Meds",
                        priority: "attention",
                        completed: true,
                        time: "Completed 6:30 PM",
                    },
                    {
                        id: 4,
                        text: "Administer enoxaparin 40mg SubQ — rotate injection sites (abdomen)",
                        category: "Meds",
                        priority: "attention",
                        completed: false,
                        time: "Due by 9:00 PM",
                    },
                    {
                        id: 5,
                        text: "Administer lisinopril 20mg (note: increased from pre-admission 10mg)",
                        category: "Meds",
                        priority: "normal",
                        completed: false,
                        time: "Due tomorrow AM",
                    },
                    {
                        id: 6,
                        text: "Check blood sugar x4 — before meals and at bedtime. Report if above 250 or below 70.",
                        category: "Monitoring",
                        priority: "normal",
                        completed: false,
                        time: "Starting tonight",
                    },
                    {
                        id: 7,
                        text: "Assess surgical incision left hip — check for redness, swelling, drainage. Change dressing with sterile gauze.",
                        category: "Wound care",
                        priority: "normal",
                        completed: false,
                        time: "Every 48 hours",
                    },
                ],
            },
            {
                key: "72hr",
                label: "24–72 hours",
                range: "Nov 20 — Nov 22",
                progress: "0/5 complete",
                tasks: [
                    {
                        id: 8,
                        text: "Schedule PCP follow-up and document confirmed appointment date/time",
                        category: "Follow-up",
                        priority: "critical",
                        completed: false,
                        time: "Within 48 hours",
                    },
                    {
                        id: 9,
                        text: "Review pending CBC/BMP results when posted",
                        category: "Labs",
                        priority: "attention",
                        completed: false,
                        time: "When available",
                    },
                ],
            },
            {
                key: "7day",
                label: "Day 3–7",
                range: "Nov 22 — Nov 26",
                progress: "0/4 complete",
                tasks: [
                    {
                        id: 10,
                        text: "Confirm orthopedic follow-up for Dec 3 and arrange transportation",
                        category: "Follow-up",
                        priority: "attention",
                        completed: false,
                        time: "Before appointment week",
                    },
                ],
            },
        ],
    },

    chat: {
        contextTitle: "discharge_summary_thompson.pdf",
        contextMeta: "Margaret Thompson, 83F — All 5 agent outputs loaded as context",
        suggestions: [
            "Fall prevention protocol?",
            "Pending lab results?",
            "Diet restrictions?",
            "When to call surgeon?",
        ],
        messages: [
            {
                role: "user",
                text: "What changed from her pre-admission medications?",
            },
            {
                role: "assistant",
                text:
                    "Three medication changes from pre-admission: lisinopril increased from 10mg to 20mg daily due to elevated blood pressure during admission. Enoxaparin 40mg SubQ daily was added post-operatively for DVT prophylaxis. Metformin 1000mg was held perioperatively and should now be resumed at the facility with meals.",
                sources: ["Discharge medications, p.3", "Hospital course, p.2", "Agent 2 finding"],
                highlight:
                    "The lisinopril dose increase may elevate potassium. No post-discharge BMP was ordered. Consider checking within 5–7 days.",
            },
            {
                role: "user",
                text: "Are there any allergy risks with her current meds?",
            },
            {
                role: "assistant",
                text:
                    "Margaret has two documented allergies: penicillin, which causes rash, and sulfa drugs, which cause anaphylaxis. No current medications directly conflict with those allergies. If infection develops post-op, avoid penicillin-class antibiotics and avoid trimethoprim-sulfamethoxazole unless the prescriber explicitly addresses the allergy risk.",
                sources: ["Allergy list, p.1", "Agent 2 cross-ref"],
            },
        ],
    },
};

export default facilityMockData;