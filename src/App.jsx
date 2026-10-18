import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HotelManagement from "./pages/admin/HotelManagement";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                 {/* Admin */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/hotels"
                    element={
                        <AdminRoute>
                            <HotelManagement />
                        </AdminRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;