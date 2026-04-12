import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import MainTabs from "../components/MainTabs";
import CarePlansTab from "../components/tabs/CarePlansTab";
import MedicationsTab from "../components/tabs/MedicationsTab";
import FollowUpTab from "../components/tabs/FollowUpTab";
import ChatTab from "../components/tabs/ChatTab";
import usePatientData from "../hooks/usePatientData";

const TAB_COMPONENTS = {
  careplans: CarePlansTab,
  medications: MedicationsTab,
  followup: FollowUpTab,
  chat: ChatTab,
};

export default function PatientHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("careplans");
  const {
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
  } = usePatientData();

  useEffect(() => {
    const stored = localStorage.getItem("carebridge_user");
    if (!stored) {
      navigate("/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;

  const ActiveTab = TAB_COMPONENTS[activeTab] || CarePlansTab;

  const activeTabProps = {
    careplans: {
      carePlans,
      activePlans,
      pastPlans,
      activeMedicationCount,
      medConflictCount,
      missingItemsCount,
      followUpsDueCount,
    },
    medications: { carePlans },
    followup: { carePlans },
    chat: { aiContext },
  };

  return (
    <div className="min-h-screen" style={{ background: "#FDF6EC" }}>
      <NavBar user={user} />
      <MainTabs activeTab={activeTab} onTabChange={setActiveTab} missingFollowUpCount={missingFollowUpCount} />
      <div className={activeTab === "chat" ? "flex flex-col" : ""}>
        {loading ? (
          <div className="p-5 max-w-4xl mx-auto" style={{ color: "#7A6B52" }}>Loading your care data...</div>
        ) : error ? (
          <div className="p-5 max-w-4xl mx-auto" style={{ color: "#991B1B" }}>{error}</div>
        ) : (
          <ActiveTab {...activeTabProps[activeTab]} />
        )}
      </div>
    </div>
  );
}
