import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientHome from "./pages/PatientHome";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("carebridge_access_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <PatientHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            localStorage.getItem("carebridge_access_token")
              ? <Navigate to="/home" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
