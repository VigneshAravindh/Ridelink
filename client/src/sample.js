import React, { useState } from "react";
import OneWayForm from "./OneWayForm";
import RoundTripForm from "./RoundTripForm";
import LocalForm from "./LocalForm";
import AirportForm from "./AirportForm";

const BookRide = () => {
  const [rideType, setRideType] = useState("oneway");

  return (
    <div className="bookride-page">
      <div className="animated-bg"></div>
      <div className="particles"></div>

      <div className="container text-light text-center py-5 position-relative">
        {/* Floating Emoji */}
        <div className="floating-taxi">🚖</div>

        <h1 className="fw-bold display-5 mb-3 text-gradient animate-fade">
          Book Your Ride <span className="highlight">Now</span>
        </h1>
        <div className="gradient-bar mx-auto mb-4"></div>

        <p className="subtext animate-fade">
          Choose your ride type and travel with comfort, safety, and style ✨
        </p>

        {/* Ride Type Buttons */}
        <div className="ride-type-selector d-flex flex-wrap justify-content-center gap-3 my-5">
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
              <span className="ride-icon">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Animated Form Container */}
        <div className="form-container mx-auto animate-slide">
          {rideType === "oneway" && <OneWayForm />}
          {rideType === "roundtrip" && <RoundTripForm />}
          {rideType === "local" && <LocalForm />}
          {rideType === "airport" && <AirportForm />}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        body, .bookride-page {
          font-family: 'Poppins', sans-serif;
        }

        /* 🌈 Background */
        .bookride-page {
          position: relative;
          min-height: calc(100vh - 80px);
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .animated-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0a0a0a, #111122, #0b0b0b);
          background-size: 400% 400%;
          animation: gradientFlow 10s ease infinite;
          z-index: -2;
        }

        /* ✨ Floating Particles */
        .particles::before {
          content: "";
          position: absolute;
          width: 250%;
          height: 250%;
          top: -50%;
          left: -50%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 2px);
          background-size: 60px 60px;
          animation: moveParticles 80s linear infinite;
          z-index: -1;
        }

        @keyframes moveParticles {
          from { transform: translate(0, 0); }
          to { transform: translate(-50%, -50%); }
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 🚖 Floating Emoji */
        .floating-taxi {
          font-size: 4rem;
          animation: float 3s ease-in-out infinite;
          margin-bottom: 10px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* 🪩 Text Styles */
        .text-gradient {
          background: linear-gradient(90deg, #00ffcc, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .highlight {
          color: #00ffcc;
          text-shadow: 0 0 12px rgba(0, 255, 204, 0.8);
        }

        .subtext {
          color: #ccc;
          font-size: 1.2rem;
          letter-spacing: 0.3px;
          max-width: 700px;
          margin: 0 auto;
          animation: fadeInUp 1.5s ease;
        }

        /* 🎨 Ride Type Buttons */
        .ride-btn {
          background: rgba(255,255,255,0.08);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 50px;
          padding: 14px 32px;
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.5px;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease-in-out;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .ride-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 0 18px rgba(0,255,204,0.3);
          border-color: rgba(0,255,204,0.5);
        }

        .ride-btn.active {
          background: linear-gradient(90deg, #00ffcc, #007bff);
          box-shadow: 0 0 25px rgba(0,255,204,0.6);
          transform: scale(1.08);
        }

        .ride-icon {
          font-size: 1.3rem;
          margin-right: 8px;
        }

        /* 💎 Form Container */
        .form-container {
          max-width: 700px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 255, 204, 0.2);
          padding: 2.5rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.9s ease;
        }

        .form-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 35px rgba(0, 255, 204, 0.35);
        }

        /* Gradient bar under heading */
        .gradient-bar {
          width: 120px;
          height: 4px;
          border-radius: 10px;
          background: linear-gradient(90deg, #00ffcc, #ff00ff, #007bff);
          background-size: 200% 200%;
          animation: gradientMove 6s linear infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 🌀 Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade { animation: fadeInUp 1s ease forwards; }
        .animate-slide { animation: fadeInUp 0.9s ease forwards; }

        /* 📱 Responsive */
        @media (max-width: 768px) {
          .ride-btn {
            font-size: 1rem;
            padding: 10px 22px;
          }
          .form-container {
            padding: 1.5rem;
          }
          .subtext {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BookRide;
