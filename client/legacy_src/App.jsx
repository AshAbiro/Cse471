import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Tours from "./pages/Tours.jsx";
import TourDetail from "./pages/TourDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DashboardUser from "./pages/DashboardUser.jsx";
import DashboardGuide from "./pages/DashboardGuide.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/user" element={<DashboardUser />} />
          <Route path="/dashboard/guide" element={<DashboardGuide />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
