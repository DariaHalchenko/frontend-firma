import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import TootajaPage from "./pages/TootajaPage";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="Admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tootaja"
          element={
            <ProtectedRoute role="Töötaja">
              <TootajaPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h2>404: Lehte ei leitud</h2>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
