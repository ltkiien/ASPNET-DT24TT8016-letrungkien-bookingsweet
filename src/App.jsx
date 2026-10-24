
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HotelManagement from "./pages/admin/HotelManagement";
import RoomManagement from "./pages/admin/RoomManagement";
import BookingManagement from "./pages/admin/BookingManagemeent";
import MyBookings from "./pages/MyBooking";
import Header from "./pages/Header";
import { I18nProvider } from "./pages/I18nProvider";
import { AuthProvider } from "./pages/AuthContext";

// Component này nằm bên trong BrowserRouter
function AppContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <Header
        LinkComponent={Link}
        currentPath={pathname}
        onLoginClick={() => navigate("/login")}
        onLoggedOut={() => navigate("/")}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route
          path="/admin/rooms"
          element={
            <AdminRoute>
              <RoomManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <BookingManagement />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>

  );
}

export default App;
