import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearAuth } from "../utils/auth";

export default function ProtectedRoute() {
    const token = localStorage.getItem("auth_token");
    const location = useLocation();

    if (!token) {
        clearAuth();
        // Redirect to login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
