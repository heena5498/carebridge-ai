import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import FacilityPatients from "./pages/FacilityPatients";
import NewCarePlan from "./pages/NewCarePlan";
import FacilityDashboard from "./pages/FacilityDashboard";
import CarePlan from "./pages/CarePlan";
import CoordinatorChat from "./pages/CoordinatorChat";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/facility/patients"
          element={
            <ProtectedRoute>
              <FacilityPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facility/new-plan"
          element={
            <ProtectedRoute>
              <NewCarePlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facility/dashboard"
          element={
            <ProtectedRoute>
              <FacilityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facility/care-plan"
          element={
            <ProtectedRoute>
              <CarePlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facility/chat"
          element={
            <ProtectedRoute>
              <CoordinatorChat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
