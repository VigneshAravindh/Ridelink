import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      const user = auth.currentUser;
      if (!user) return setLoading(false);

      const q = query(collection(db, "rides"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // ✅ Sort rides by priority (pending → in_progress → assigned → completed → canceled)
      const statusPriority = {
        pending: 1,
        in_progress: 2,
        assigned: 3,
        completed: 4,
        canceled: 5,
      };

      data.sort((a, b) => {
        const statusA = statusPriority[a.status?.toLowerCase()] || 99;
        const statusB = statusPriority[b.status?.toLowerCase()] || 99;
        return statusA - statusB;
      });

      setRides(data);
      setLoading(false);
    };

    fetchRides();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
        <div className="spinner-border text-info" role="status"></div>
        <span className="ms-2 fw-semibold">Loading your rides...</span>
      </div>
    );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning text-dark glow-pulse";
      case "in_progress":
        return "bg-info text-dark glow-pulse";
      case "assigned":
        return "bg-primary text-light glow-pulse";
      case "completed":
        return "bg-success glow-soft";
      case "canceled":
        return "bg-danger glow-soft";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="rides-wrapper py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-gradient mb-2 animate-fade">🚖 My Rides</h2>
          <div className="gradient-bar mx-auto mb-3"></div>
          <p className="text-light-50 fs-5">
            Track your past and current rides — stay updated anytime, anywhere!
          </p>
        </div>

        {rides.length === 0 ? (
          <div className="text-center mt-5 animate-fade">
            <p className="text-muted fs-5">
              You haven't booked any rides yet 🚕
            </p>
          </div>
        ) : (
          <div className="row justify-content-center">
            {rides.map((ride, index) => (
              <div
                className="col-md-6 col-lg-5 mb-4 animate-card"
                key={ride.id}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div
                  className={`ride-card card border-0 shadow-lg rounded-4 h-100 ${
                    ride.status?.toLowerCase() === "pending"
                      ? "pending-card"
                      : ""
                  }`}
                >
                  <div className="card-body p-4">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="fw-bold text-dark mb-0">
                        🚕 {ride.rideType || "Cab Ride"}
                      </h5>
                      <span
                        className={`badge px-3 py-2 ${getStatusStyle(
                          ride.status
                        )}`}
                      >
                        {ride.status || "Pending"}
                      </span>
                    </div>

                    {ride.tripType && (
                      <small className="text-secondary d-block mb-2">
                        ({ride.tripType})
                      </small>
                    )}

                    <hr />

                    <div className="ride-info">
                      {ride.pickup?.address && (
                        <p className="mb-2">
                          <strong>📍 Pickup:</strong> {ride.pickup.address}
                        </p>
                      )}
                      {ride.drop?.address && (
                        <p className="mb-2">
                          <strong>🏁 Drop:</strong> {ride.drop.address}
                        </p>
                      )}
                      {ride.date && (
                        <p className="mb-2">
                          <strong>📅 Date:</strong> {ride.date}
                        </p>
                      )}
                      {ride.time && (
                        <p className="mb-2">
                          <strong>⏱ Time:</strong> {ride.time}
                        </p>
                      )}
                      {ride.fare && (
                        <p className="fw-bold text-success mb-3">
                          💰 Fare: ₹{ride.fare}
                        </p>
                      )}

                      {/* Driver Info */}
                      {ride.driverName && (
                        <div className="driver-card glass-card mt-3 p-3 rounded">
                          <h6 className="fw-bold text-primary mb-2">
                            👨‍✈️ Driver Details
                          </h6>
                          <p className="mb-1">
                            <strong>Name:</strong> {ride.driverName}
                          </p>
                          {ride.vehicle?.model && (
                            <p className="mb-1">
                              <strong>Car Model:</strong> {ride.vehicle.model}
                            </p>
                          )}
                          {ride.vehicle?.number && (
                            <p className="mb-1">
                              <strong>Car Number:</strong> {ride.vehicle.number}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-muted small mb-0 mt-3">
                        📦 Booked On:{" "}
                        {ride.createdAt?.toDate
                          ? ride.createdAt.toDate().toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .rides-wrapper {
          background: radial-gradient(circle at top left, #0f0f0f, #111);
          min-height: calc(100vh - 80px);
          color: #fff;
          margin: 0;
          padding: 0 1rem;
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

/* Ride Cards - Optimized to Prevent White Flicker */
.ride-card {
  position: relative;
  background: #f9f9f9; /* switched to solid background to reduce flicker */
  border-radius: 20px;
  border: 2px solid transparent;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transform: translateZ(0); /* trigger GPU compositing */
  will-change: transform, box-shadow;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  backface-visibility: hidden; /* prevent flashing during repaint */
  overflow: hidden; /* hides subpixel highlight during hover */
}

.ride-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 12px 28px rgba(0, 255, 204, 0.3);
  border-color: rgba(0, 255, 204, 0.2);
  background: #ffffff;
}

/* Smooth hover light layer without flicker */
.ride-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.ride-card:hover::after {
  opacity: 1;
}


        .pending-card {
          border: 2px solid #ffc107;
          box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: 0.3s;
        }

        .glass-card:hover {
          transform: scale(1.03);
        }

        .animate-card {
          animation: fadeInUp 0.8s ease both;
        }

        .animate-fade {
          animation: fadeInUp 1.2s ease both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glow-pulse {
          animation: glowPulse 2s infinite;
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 5px rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 15px rgba(255,255,0,0.5); }
        }

        .glow-soft {
          box-shadow: 0 0 10px rgba(0,255,204,0.4);
        }

        @media (max-width: 768px) {
          .rides-wrapper {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MyRides;
