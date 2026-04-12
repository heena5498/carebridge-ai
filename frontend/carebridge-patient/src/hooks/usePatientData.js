import { useEffect, useMemo, useState } from "react";

import { getMyCarePlan, getMyCases } from "../api/patientApi";

function mapStatus(caseStatus) {
  if (caseStatus === "care_plan_generated" || caseStatus === "approved") {
    return "active";
  }
  return "inactive";
}

function mapFollowUpStatus(followUp) {
  if (!followUp?.date) {
    return "missing";
  }
  return "pending";
}

function toPlan(baseCase, carePlan) {
  const meds = carePlan?.medications_schedule || [];
  const followUps = carePlan?.follow_up_reminders || [];
  const metrics = {
    activeMedications:
      carePlan?.active_medications_count ?? baseCase.active_medications_count ?? meds.length,
    medConflicts:
      carePlan?.med_conflicts_count ?? baseCase.med_conflicts_count ?? 0,
    missingItems:
      carePlan?.missing_items_count ?? baseCase.missing_items_count ?? 0,
    followUpsDue:
      carePlan?.follow_ups_due_count ?? baseCase.follow_ups_due_count ?? followUps.length,
  };

  return {
    id: String(baseCase.id),
    status: mapStatus(baseCase.status),
    condition: baseCase.patient_name,
    hospital: baseCase.source_hospital || "Hospital",
    department: "Discharge",
    doctor: "Care Team",
    admitted: baseCase.discharge_date || "N/A",
    discharged: baseCase.discharge_date || "N/A",
    duration: "N/A",
    insurance: "N/A",
    care_facility: null,
    follow_up_dots: followUps.map(() => "pending"),
    metrics,
    medications: meds.map((m) => ({
      name: m.name,
      purpose: m.special_instructions || "Medication",
      dose: m.dose,
      frequency: m.frequency,
      tag: "continuing",
    })),
    followups: followUps.map((f) => ({
      type: f.provider_name || "Follow-up",
      source: f.specialty || "Care team",
      timeframe: `${f.date || "Date TBD"}${f.time ? ` ${f.time}` : ""}`.trim(),
      status: mapFollowUpStatus(f),
      action: "Call to book",
    })),
  };
}

function buildAiContext(plans) {
  if (!plans.length) {
    return "No active care plans found for this patient.";
  }

  const snippets = plans.slice(0, 5).map((plan) => {
    const medCount = plan.medications.length;
    const followCount = plan.followups.length;
    return `${plan.condition} at ${plan.hospital}. Medications: ${medCount}. Follow-ups: ${followCount}.`;
  });
  return snippets.join(" ");
}

export default function usePatientData() {
  const [carePlans, setCarePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const cases = await getMyCases();

        const plans = await Promise.all(
          cases.map(async (item) => {
            let carePlan = null;
            try {
              carePlan = await getMyCarePlan(item.id);
            } catch {
              carePlan = item.care_plan_data || null;
            }
            return toPlan(item, carePlan);
          })
        );

        if (isMounted) {
          setCarePlans(plans);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load data");
          setCarePlans([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activePlans = useMemo(() => carePlans.filter((p) => p.status === "active"), [carePlans]);
  const pastPlans = useMemo(() => carePlans.filter((p) => p.status !== "active"), [carePlans]);
  const missingFollowUpCount = useMemo(
    () =>
      carePlans
        .flatMap((p) => p.followups)
        .filter((f) => f.status === "missing").length,
    [carePlans]
  );
  const aiContext = useMemo(() => buildAiContext(carePlans), [carePlans]);
  const activeMedicationCount = useMemo(
    () => carePlans.reduce((sum, plan) => sum + (plan.metrics?.activeMedications || 0), 0),
    [carePlans]
  );
  const medConflictCount = useMemo(
    () => carePlans.reduce((sum, plan) => sum + (plan.metrics?.medConflicts || 0), 0),
    [carePlans]
  );
  const missingItemsCount = useMemo(
    () => carePlans.reduce((sum, plan) => sum + (plan.metrics?.missingItems || 0), 0),
    [carePlans]
  );
  const followUpsDueCount = useMemo(
    () => carePlans.reduce((sum, plan) => sum + (plan.metrics?.followUpsDue || 0), 0),
    [carePlans]
  );

  return {
    carePlans,
    activePlans,
    pastPlans,
    missingFollowUpCount,
    activeMedicationCount,
    medConflictCount,
    missingItemsCount,
    followUpsDueCount,
    aiContext,
    loading,
    error,
  };
}