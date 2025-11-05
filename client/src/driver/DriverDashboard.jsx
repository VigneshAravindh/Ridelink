import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { claimRideTransaction, updateRideStatus, releaseRide } from "./driverService";

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const allRides = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const visibleRides = allRides.filter(
        (r) =>
          (r.status === "pending" && !r.driverId) || r.driverId === uid
      );

      // ✅ Sort by priority (Pending → Assigned → In Progress → Completed)
      const statusPriority = {
        pending: 1,
        assigned: 2,
        in_progress: 3,
        completed: 4,
      };

      visibleRides.sort((a, b) => {
        const statusA = statusPriority[a.status?.toLowerCase()] || 99;
        const statusB = statusPriority[b.status?.toLowerCase()] || 99;
        return statusA - statusB;
      });

      setRides(visibleRides);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleClaim = async (rideId) => {
    const res = await claimRideTransaction(rideId);
    if (!res.success) alert(res.error);
  };

  const handleStart = async (rideId) => {
    const res = await updateRideStatus(rideId, "in_progress");
    if (!res.success) alert(res.error);
  };

  const handleComplete = async (rideId) => {
    const res = await updateRideStatus(rideId, "completed");
    if (!res.success) alert(res.error);
  };

  const handleRelease = async (rideId) => {
    const res = await releaseRide(rideId);
    if (!res.success) alert(res.error);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <span className="badge status-badge pending">⏳ Pending</span>;
      case "assigned":
        return <span className="badge status-badge assigned">🧭 Assigned</span>;
      case "in_progress":
        return <span className="badge status-badge progress">🚗 In Progress</span>;
      case "completed":
        return <span className="badge status-badge completed">✅ Completed</span>;
      default:
        return <span className="badge status-badge">❔ Unknown</span>;
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
        <div className="spinner-border text-info me-2"></div>
        Loading rides...
      </div>
    );

  return (
    <div className="driver-dashboard py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-gradient mb-2 animate-fade">
            🚖 Driver Dashboard
          </h2>
          <div className="gradient-bar mx-auto mb-3"></div>
          <p className="text-light-50 fs-5">
            Manage your rides efficiently — accept, start, or complete with ease!
          </p>
        </div>

        {rides.length === 0 ? (
          <div className="text-center mt-5 animate-fade">
            <h5 className="text-muted">No rides available right now 🚗</h5>
          </div>
        ) : (
          <div className="row justify-content-center">
            {rides.map((ride, index) => (
              <div
                key={ride.id}
                className="col-md-6 col-lg-5 mb-4 animate-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`card border-0 rounded-4 ride-card ${
                    ride.status === "pending" ? "glow-pending" : ""
                  }`}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="fw-bold text-dark mb-0">
                        🚕 {ride.rideType || "Ride"}
                      </h5>
                      {getStatusBadge(ride.status)}
                    </div>
                    <hr />
                    <p className="mb-2">
                      <strong>📍 Pickup:</strong> {ride.pickup?.address || "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>🏁 Drop:</strong> {ride.drop?.address || "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>📅 Date:</strong> {ride.date || "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>💰 Fare:</strong> ₹{ride.fare || "N/A"}
                    </p>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {ride.status === "pending" && (
                        <button
                          className="btn btn-success btn-sm px-3 shadow-sm glow-btn"
                          onClick={() => handleClaim(ride.id)}
                        >
                          Accept
                        </button>
                      )}

                      {ride.driverId === auth.currentUser?.uid &&
                        ride.status === "assigned" && (
                          <button
                            className="btn btn-primary btn-sm px-3 shadow-sm glow-btn"
                            onClick={() => handleStart(ride.id)}
                          >
                            Start Ride
                          </button>
                        )}

                      {ride.driverId === auth.currentUser?.uid &&
                        ride.status === "in_progress" && (
                          <button
                            className="btn btn-warning btn-sm px-3 shadow-sm glow-btn"
                            onClick={() => handleComplete(ride.id)}
                          >
                            Complete Ride
                          </button>
                        )}

                      {ride.driverId === auth.currentUser?.uid && (
                        <button
                          className="btn btn-outline-danger btn-sm px-3 shadow-sm"
                          onClick={() => handleRelease(ride.id)}
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .driver-dashboard {
          background: radial-gradient(circle at top left, #0f0f0f, #111);
          min-height: calc(100vh - 80px);
          color: #fff;
          overflow-x: hidden;
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

        .text-gradient {
          background: linear-gradient(90deg, #00ffcc, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Ride Cards */
       /* Ride Cards */
.ride-card {
  background: rgba(255, 255, 255, 0.93);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border: 2px solid transparent;
  border-radius: 20px;
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.ride-card:hover {
  transform: translateY(-6px) scale(1.02);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 20px rgba(0,255,204,0.2);  
  border-color: rgba(0,255,204,0.2);
}

/* Prevent hover flicker */
.ride-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: transparent;
  pointer-events: none;
}


        .glow-pending {
          border: 2px solid #ffc107;
          box-shadow: 0 0 20px rgba(255,193,7,0.5);
        }

        /* Status Badges */
        .status-badge {
          border-radius: 20px;
          padding: 6px 14px;
          font-weight: 600;
          color: #fff;
          font-size: 0.9rem;
        }

        .status-badge.pending {
          background: #ffc107;
          color: #111;
          animation: pulse 2s infinite;
        }

        .status-badge.assigned {
          background: #0dcaf0;
          color: #111;
        }

        .status-badge.progress {
          background: #007bff;
        }

        .status-badge.completed {
          background: #28a745;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(255,193,7,0); }
          50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(255,193,7,0.4); }
        }

        /* Buttons */
        .glow-btn {
          border-radius: 30px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .glow-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 0 15px rgba(0,255,204,0.6);
        }

        .animate-fade {
          animation: fadeInUp 1s ease both;
        }

        .animate-card {
          animation: fadeInUp 0.8s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .driver-dashboard {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;
