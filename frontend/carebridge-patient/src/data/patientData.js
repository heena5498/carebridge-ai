export const patient = {
  name: "Margaret Louise Williams",
  firstName: "Margaret",
  age: 74,
  mrn: "MGH-774-2291",
  initials: "MW",
  allergies: ["Penicillin (anaphylaxis)", "Sulfa (rash)"],
};

export const carePlans = [
  {
    id: "hf",
    status: "active",
    condition: "Heart failure",
    hospital: "Mercy General Hospital",
    department: "Cardiology",
    doctor: "Dr. Anita Patel, MD",
    admitted: "March 14, 2024",
    discharged: "March 19, 2024",
    duration: "5 nights",
    insurance: "Medicare Part A & B",
    care_facility: "Sunrise Gardens Senior Living",
    follow_up_dots: ["missing", "missing", "pending"],
    medications: [
      { name: "Furosemide (Lasix)", purpose: "Removes excess fluid from your body", dose: "40mg", frequency: "Once daily in the morning", tag: "new" },
      { name: "Spironolactone", purpose: "Helps heart and balances fluid", dose: "25mg", frequency: "Once daily", tag: "new" },
      { name: "Metoprolol succinate", purpose: "Slows and steadies your heartbeat", dose: "50mg", frequency: "Once daily", tag: "changed", note: "Dose increased from 25mg" },
      { name: "Lisinopril", purpose: "Relaxes blood vessels, eases heart workload", dose: "10mg", frequency: "Once daily", tag: "continuing" },
      { name: "Atorvastatin", purpose: "Lowers your cholesterol", dose: "40mg", frequency: "Every night", tag: "continuing" },
      { name: "Metformin", purpose: "Controls your blood sugar", dose: "500mg", frequency: "Twice daily with meals", tag: "continuing" },
      { name: "Aspirin", purpose: "Protects your heart", dose: "81mg", frequency: "Once daily", tag: "continuing" },
    ],
    followups: [
      { type: "Cardiology appointment (Dr. Patel)", source: "Heart failure · Mercy General", timeframe: "Must be seen within 7 days (due Mar 26)", status: "missing", action: "Call to book", phone: "617-555-0192" },
      { type: "Potassium blood test", source: "Heart failure · No lab order at discharge", timeframe: "Within 5–7 days — needed due to new medications", status: "missing", action: "Ask care team" },
      { type: "Urine culture result", source: "Heart failure · Collected March 18", timeframe: "Expected from Mercy General lab: 617-555-0192", status: "pending", action: "Check result" },
    ],
  },
  {
    id: "dm",
    status: "active",
    condition: "Type 2 diabetes",
    hospital: "Riverside Medical Clinic",
    department: "Endocrinology",
    doctor: "Dr. Susan Chen, MD",
    admitted: "January 2023 (ongoing)",
    discharged: null,
    duration: "Ongoing management",
    insurance: "Medicare Part B",
    care_facility: null,
    follow_up_dots: ["done", "pending"],
    medications: [
      { name: "Metformin", purpose: "Controls your blood sugar", dose: "500mg", frequency: "Twice daily with meals", tag: "continuing" },
      { name: "Atorvastatin", purpose: "Lowers your cholesterol", dose: "40mg", frequency: "Every night", tag: "continuing" },
      { name: "Aspirin", purpose: "Protects your heart", dose: "81mg", frequency: "Once daily", tag: "continuing" },
    ],
    followups: [
      { type: "HbA1c blood test", source: "Type 2 diabetes · Riverside Clinic", timeframe: "Completed Feb 12, 2024", status: "done" },
      { type: "Endocrinology 3-month review", source: "Type 2 diabetes · Dr. Susan Chen", timeframe: "Scheduled: May 2024", status: "pending" },
    ],
  },
  {
    id: "hip",
    status: "meds_continue",
    condition: "Hip fracture (right)",
    hospital: "St. Augustine Orthopedic Center",
    department: "Orthopedic Surgery",
    doctor: "Dr. James Okafor, MD",
    admitted: "November 10, 2023",
    discharged: "November 16, 2023",
    duration: "6 nights",
    insurance: "Medicare Advantage — BlueCross",
    care_facility: "Cedar Brook Manor SNF",
    follow_up_dots: ["done", "done", "done"],
    medications: [
      { name: "Calcium + Vitamin D3", purpose: "Strengthens your bones — still required after fracture", dose: "600mg/400IU", frequency: "Twice daily with meals", tag: "still_active" },
      { name: "Enoxaparin", purpose: "Prevented blood clots after surgery", dose: "40mg", frequency: "Course completed November 2023", tag: "stopped" },
      { name: "Oxycodone/Acetaminophen", purpose: "Post-surgical pain relief", dose: "5/325mg", frequency: "Course completed", tag: "stopped" },
      { name: "Gabapentin", purpose: "Post-surgical nerve pain", dose: "300mg", frequency: "Course completed", tag: "stopped" },
    ],
    followups: [
      { type: "Surgical wound check", source: "Hip fracture · Dr. Okafor", timeframe: "Completed November 30, 2023", status: "done" },
      { type: "Orthopedic X-ray review", source: "Hip fracture · Hip healing assessment", timeframe: "Completed December 15, 2023", status: "done" },
      { type: "Physical therapy sign-off", source: "Hip fracture · Gait and mobility clearance", timeframe: "Completed January 10, 2024", status: "done" },
    ],
  },
  {
    id: "uti",
    status: "inactive",
    condition: "Urinary tract infection",
    hospital: "Oakwood Medical Center",
    department: "Geriatric Medicine",
    doctor: "Dr. Patricia Huang, MD",
    admitted: "March 13, 2023",
    discharged: "March 18, 2023",
    duration: "5 nights",
    insurance: "Medicare Part A & B",
    care_facility: null,
    follow_up_dots: ["done", "done"],
    medications: [
      { name: "TMP-SMX DS (Bactrim)", purpose: "Antibiotic that treated the UTI", dose: "1 tablet", frequency: "Course fully completed March 2023", tag: "stopped" },
    ],
    followups: [
      { type: "Urine culture repeat", source: "UTI · Confirmed infection cleared", timeframe: "Completed March 30, 2023", status: "done" },
      { type: "PCP post-discharge check-in", source: "UTI · General recovery review", timeframe: "Completed April 2, 2023", status: "done" },
    ],
  },
];

export const aiContext = `Patient is Margaret Williams, 74F. She has 4 care plans: (1) Heart failure — Mercy General, Dr. Patel, discharged March 19 2024. 7 medications including new furosemide, spironolactone, and increased metoprolol. Allergies: Penicillin anaphylaxis, Sulfa rash. Missing: cardiology appointment and potassium lab. (2) Type 2 diabetes — Riverside Clinic, Dr. Chen, ongoing. Medications: metformin, atorvastatin, aspirin. (3) Hip fracture Nov 2023 — fully resolved, but calcium + Vitamin D still ongoing. (4) UTI March 2023 — fully completed. Total 9 active medications. 3 pending/missing follow-up actions.`;

export const activePlans = carePlans.filter((p) => p.status === "active");
export const pastPlans = carePlans.filter((p) => p.status !== "active");
export const missingFollowUpCount = carePlans
  .filter((p) => p.status === "active")
  .flatMap((p) => p.followups)
  .filter((f) => f.status === "missing").length;
