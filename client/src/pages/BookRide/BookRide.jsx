import React, { useState } from "react";
import OneWayForm from "./OneWayForm";
import RoundTripForm from "./RoundTripForm";
import LocalForm from "./LocalForm";
import AirportForm from "./AirportForm";

const BookRide = () => {
  const [rideType, setRideType] = useState("oneway");

  return (
    <div className="bookride-page">
      {/* Background Animation */}
      <div className="animated-bg"></div>

      {/* Main Section */}
      <div className="container-fluid text-light py-5 px-md-5 position-relative">
        <div className="text-center mb-5 animate-fade">
          <h1 className="fw-bold text-gradient display-5 mb-2">
            🚖 Book Your Ride
          </h1>
          <div className="gradient-bar mx-auto mb-3"></div>
          <p className="text-light-50 fs-5 fw-medium fade-slow">
            Choose your ride type and travel with style & comfort ✨
          </p>
        </div>

        {/* Ride Type Selector */}
        <div className="ride-type-selector d-flex flex-wrap justify-content-center gap-3 mb-5">
          {[
            { id: "oneway", label: "One Way", icon: "➡️" },
            { id: "roundtrip", label: "Round Trip", icon: "🔁" },
            { id: "local", label: "Local", icon: "🏙️" },
            { id: "airport", label: "Airport", icon: "✈️" },
          ].map((r) => (
            <button
              key={r.id}
              className={`ride-btn ${rideType === r.id ? "active" : ""}`}
              onClick={() => setRideType(r.id)}
            >
              <span className="ride-icon">{r.icon}</span> {r.label}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <div className="form-container mx-auto animate-slide">
          {rideType === "oneway" && <OneWayForm />}
          {rideType === "roundtrip" && <RoundTripForm />}
          {rideType === "local" && <LocalForm />}
          {rideType === "airport" && <AirportForm />}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .bookride-page {
          font-family: 'Poppins', sans-serif;
          position: relative;
          min-height: calc(100vh - 80px); /* no bottom gap */
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        /* Animated Background */
        .animated-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(120deg, #0a0a0a, #111122, #0b0b0b);
          background-size: 400% 400%;
          animation: gradientFlow 10s ease infinite;
          z-index: -1;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Heading */
        .text-gradient {
          background: linear-gradient(90deg, #00ffcc, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gradient-bar {
          width: 120px;
          height: 4px;
          background: linear-gradient(90deg, #00ffcc, #007bff, #ff00ff);
          border-radius: 10px;
          animation: gradientMove 6s linear infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Ride Type Buttons */
        .ride-type-selector {
          animation: fadeInUp 1s ease forwards;
        }

        .ride-btn {
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 50px;
          padding: 12px 30px;
          color: #fff;
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: 0.5px;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .ride-btn:hover {
          background: rgba(255,255,255,0.25);
          transform: scale(1.08);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
        }

        .ride-btn.active {
          background: linear-gradient(90deg, #00ffcc, #007bff);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.7);
          transform: scale(1.1);
        }

        .ride-icon {
          font-size: 1.3rem;
          margin-right: 8px;
        }

        /* Form Container */
        .form-container {
          max-width: 700px;
          background: rgba(255,255,255,0.96);
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,255,204,0.15);
          padding: 2.5rem;
          animation: fadeInUp 0.9s ease forwards;
          transition: all 0.3s ease;
        }

        .form-container:hover {
          box-shadow: 0 10px 35px rgba(0,255,204,0.25);
          transform: translateY(-4px);
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade { animation: fadeInUp 1s ease forwards; }
        .animate-slide { animation: fadeInUp 0.8s ease forwards; }

        .fade-slow { opacity: 0; animation: fadeInUp 2s ease forwards; }

        @media (max-width: 768px) {
          .ride-btn {
            font-size: 1rem;
            padding: 10px 22px;
          }
          .form-container {
            padding: 1.8rem;
          }
          .display-5 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BookRide;
