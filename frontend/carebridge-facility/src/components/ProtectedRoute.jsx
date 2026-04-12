import { Navigate } from "react-router-dom";
import { clearAuth, getUser, isAuthenticated } from "../utils/authStorage";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth?role=facility" replace />;
  }

  const user = getUser();
  if (!user || user.role !== "facility") {
    clearAuth();
    return <Navigate to="/auth?role=facility" replace />;
  }

  return children;
}
