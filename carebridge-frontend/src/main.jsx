import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./styles/theme.css";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import FacilityPatients from "./pages/FacilityPatients";
import FacilityDashboard from "./pages/FacilityDashboard";
import CarePlan from "./pages/CarePlan";
import CoordinatorChat from "./pages/CoordinatorChat";
import NewCarePlan from "./pages/NewCarePlan";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/facility/patients" element={<FacilityPatients />} />
        <Route path="/facility/dashboard" element={<FacilityDashboard />} />
        <Route path="/facility/care-plan" element={<CarePlan />} />
        <Route path="/facility/chat" element={<CoordinatorChat />} />
        <Route path="/facility/new-plan" element={<NewCarePlan />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
