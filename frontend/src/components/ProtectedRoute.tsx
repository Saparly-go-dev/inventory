import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const token = localStorage.getItem("auth_token");
    const location = useLocation();

    if (!token) {
        // Redirect to login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
