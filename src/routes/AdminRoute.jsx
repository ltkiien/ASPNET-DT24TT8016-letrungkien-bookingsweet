import { Navigate } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";

function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth();
    console.log("isAuthenticated:", user, isAdmin);
    if (loading) {
        return <div>Đang kiểm tra đăng nhập...</div>;
    }
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (!isAdmin) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}

export default AdminRoute;