import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookRide from "./pages/BookRide/BookRide";
import MyRides from "./pages/MyRides";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedDriverRoute from "./driver/ProtectedDriverRoute";
import DriverDashboard from "./driver/DriverDashboard";
import DriverProfile from "./driver/DriverProfile";
import AssignedRides from "./driver/AssignedRides";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <main>
          <Routes>
            {/* Fullscreen Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookRide />} />
            <Route path="/my-rides" element={<MyRides />} />

            {/* Compact Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />

            {/* Driver Pages */}
            <Route
              path="/driver"
              element={
                <ProtectedDriverRoute>
                  <DriverDashboard />
                </ProtectedDriverRoute>
              }
            />
            <Route
              path="/driver/profile"
              element={
                <ProtectedDriverRoute>
                  <DriverProfile />
                </ProtectedDriverRoute>
              }
            />
            <Route
              path="/driver/assigned"
              element={
                <ProtectedDriverRoute>
                  <AssignedRides />
                </ProtectedDriverRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
