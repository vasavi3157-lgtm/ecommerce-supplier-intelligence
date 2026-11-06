import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    // Not logged in at all
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in, but wrong role (e.g. customer trying to see supplier dashboard)
    return <Navigate to="/" replace />;
  }

  return children;
}