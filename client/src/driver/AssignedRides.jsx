import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

const AssignedRides = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("driverId", "==", uid), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      const rideData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ✅ Sort by status priority
      const statusPriority = {
        in_progress: 1,
        assigned: 2,
        pending: 3,
        completed: 4,
        canceled: 5,
      };

      rideData.sort((a, b) => {
        const statusA = statusPriority[a.status?.toLowerCase()] || 99;
        const statusB = statusPriority[b.status?.toLowerCase()] || 99;
        return statusA - statusB;
      });

      setRides(rideData);
    });

    return () => unsub();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return <span className="badge status-badge assigned">🧭 Assigned</span>;
      case "in_progress":
        return <span className="badge status-badge progress">🚗 In Progress</span>;
      case "completed":
        return <span className="badge status-badge completed">✅ Completed</span>;
      case "canceled":
        return <span className="badge status-badge canceled">❌ Canceled</span>;
      default:
        return <span className="badge status-badge">❔ Unknown</span>;
    }
  };

  return (
    <div className="assigned-wrapper py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-gradient mb-2 animate-fade">🚕 My Assigned Rides</h2>
          <div className="gradient-bar mx-auto mb-3"></div>
          <p className="text-light-50 fs-5">
            View your ongoing, assigned, and completed rides below
          </p>
        </div>

        {rides.length === 0 ? (
          <div className="text-center mt-5 animate-fade">
            <p className="text-muted fs-5">No assigned rides yet 🙌</p>
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
                  className={`card border-0 shadow-lg rounded-4 h-100 ride-card ${
                    ride.status === "in_progress"
                      ? "glow-progress"
                      : ride.status === "assigned"
                      ? "glow-assigned"
                      : ride.status === "completed"
                      ? "glow-completed"
                      : ""
                  }`}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="fw-bold text-dark mb-0">
                        🚘 {ride.rideType || "Ride"}
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

                    {ride.status === "in_progress" && (
                      <p className="text-primary fw-semibold mt-3">
                        🚗 Ride currently in progress...
                      </p>
                    )}
                    {ride.status === "assigned" && (
                      <p className="text-info fw-semibold mt-3">
                        🧭 Ready to start your next trip!
                      </p>
                    )}
                    {ride.status === "completed" && (
                      <p className="text-success fw-semibold mt-3">
                        ✅ Ride completed successfully!
                      </p>
                    )}
                    {ride.status === "canceled" && (
                      <p className="text-danger fw-semibold mt-3">
                        ❌ This ride was canceled
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .assigned-wrapper {
          background: radial-gradient(circle at top left, #0f0f0f, #111);
          min-height: calc(100vh - 80px);
          color: #fff;
          overflow-x: hidden;
        }

        /* Gradient Heading */
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

        /* Ride Card */
        .ride-card {
          background: rgba(255,255,255,0.95);
          transition: all 0.3s ease;
          border-radius: 20px;
        }

        .ride-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 10px 25px rgba(0,255,204,0.25);
        }

        /* Glows by Status */
        .glow-progress {
          border: 2px solid #007bff;
          box-shadow: 0 0 20px rgba(0,123,255,0.4);
        }
        .glow-assigned {
          border: 2px solid #0dcaf0;
          box-shadow: 0 0 20px rgba(13,202,240,0.4);
        }
        .glow-completed {
          border: 2px solid #28a745;
          box-shadow: 0 0 20px rgba(40,167,69,0.4);
        }

        /* Status Badge */
        .status-badge {
          padding: 6px 14px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.9rem;
          color: #fff;
        }

        .status-badge.assigned { background: #0dcaf0; color: #111; }
        .status-badge.progress { background: #007bff; }
        .status-badge.completed { background: #28a745; }
        .status-badge.canceled { background: #dc3545; }

        /* Animations */
        .animate-fade { animation: fadeInUp 1s ease both; }
        .animate-card { animation: fadeInUp 0.8s ease both; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .assigned-wrapper { padding: 2rem 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AssignedRides;
