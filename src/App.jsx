import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Hotels from "./pages/Hotels";
// import HotelDetail from "./pages/HotelDetail";
// import Booking from "./pages/Booking";
// import Profile from "./pages/Profile";
// import NotFound from "./pages/NotFound";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/" element={<Home />} /> */}

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/:id" element={<HotelDetail />} />

                <Route path="/booking/:id" element={<Booking />} />

                <Route path="/profile" element={<Profile />} />

                <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;