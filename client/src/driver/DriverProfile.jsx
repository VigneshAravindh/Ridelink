import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const DriverProfile = () => {
  const uid = auth.currentUser?.uid;
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const driverRef = doc(db, "users", uid);
    const unsub = onSnapshot(driverRef, (snap) => {
      if (snap.exists()) setDriver(snap.data());
    });
    return () => unsub();
  }, [uid]);

  const toggleAvailability = async () => {
    if (!uid || !driver) return;
    const driverRef = doc(db, "users", uid);
    await updateDoc(driverRef, { available: !driver.available });
  };

  if (!driver)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-primary fw-semibold">
        <div className="spinner-border text-primary me-2"></div> Loading Driver Profile...
      </div>
    );

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center">
      <div
        className="profile-card shadow-lg border-0 rounded-4 p-4 text-center"
        style={{
          width: "380px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
          animation: "fadeInUp 0.8s ease both",
        }}
      >
        <div className="avatar mb-3">
          <div
            className="rounded-circle mx-auto d-flex justify-content-center align-items-center"
            style={{
              width: "100px",
              height: "100px",
              background:
                driver.available
                  ? "linear-gradient(135deg, #00c853, #b2ff59)"
                  : "linear-gradient(135deg, #ff3d00, #ff8a65)",
              color: "#fff",
              fontSize: "42px",
              fontWeight: "bold",
              boxShadow: "0 0 25px rgba(0,0,0,0.2)",
              transition: "0.4s ease",
            }}
          >
            {driver.displayName?.[0]?.toUpperCase() || "D"}
          </div>
        </div>

        <h4 className="fw-bold mb-2 text-shadow">{driver.displayName || "Unnamed Driver"}</h4>
        <p className="text-light mb-1">🚖 {driver.vehicle?.model || "Unknown Vehicle"}</p>
        <p className="text-secondary mb-3">#{driver.vehicle?.number || "N/A"}</p>

        <div
          className="availability-toggle d-flex justify-content-center align-items-center mt-4"
          onClick={toggleAvailability}
          style={{ cursor: "pointer" }}
        >
          <div
            className={`availability-indicator me-2 ${
              driver.available ? "available" : "not-available"
            }`}
          ></div>
          <span className="fw-semibold">
            {driver.available ? "Available for rides" : "🔴 Not available"}
          </span>
        </div>

        <hr className="my-4 border-light" />

        <div className="driver-stats mt-3 text-start">
          <p className="mb-2">
            <strong>📅 Joined:</strong>{" "}
            {driver.createdAt?.toDate
              ? driver.createdAt.toDate().toLocaleDateString()
              : "N/A"}
          </p>
          <p className="mb-2">
            <strong>🚗 Rides Completed:</strong> {driver.completedRides || 0}
          </p>
          <p className="mb-0">
            <strong>⭐ Rating:</strong>{" "}
            {driver.rating ? `${driver.rating} / 5` : "Not Rated"}
          </p>
        </div>
      </div>

      <style>{`
        body {
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          min-height: 100vh;
        }

        .profile-card {
          position: relative;
          overflow: hidden;
        }

        .profile-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(255,255,255,0.05), transparent 60%);
          animation: rotateBackground 10s linear infinite;
        }

        .text-shadow {
          text-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        .availability-indicator {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        .availability-indicator.available {
          background: #00e676;
          box-shadow: 0 0 10px #00e676;
        }

        .availability-indicator.not-available {
          background: #ff5252;
          box-shadow: 0 0 10px #ff5252;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotateBackground {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DriverProfile;
