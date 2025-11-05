import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

const Home = () => {
  const [user, setUser] = useState(null);
  const [tagline, setTagline] = useState("Fast. Reliable. Affordable.");

  const taglines = [
    "Fast. Reliable. Affordable.",
    "Comfort that Moves You.",
    "Your City. Your Ride. Your Way.",
    "Book Smart. Travel Smarter.",
  ];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    const rotate = setInterval(() => {
      setTagline((prev) => {
        const currentIndex = taglines.indexOf(prev);
        return taglines[(currentIndex + 1) % taglines.length];
      });
    }, 3000);

    return () => {
      unsub();
      clearInterval(rotate);
    };
  }, []);

  return (
    <div className="home-container">
      <div className="animated-bg"></div>
      <div className="particles"></div>

      <div className="container text-center text-light py-5 position-relative hero-section">
        <div className="floating-taxi">🚖</div>

        <h1 className="main-heading text-gradient animate-slide">
          Your Ride, <span className="highlight">Your Way</span>
        </h1>

        <p className="tagline changing-tagline">{tagline}</p>

        <p className="subtext">
          Book fast. Travel smart. Experience comfort with{" "}
          <strong>VickyTaxi</strong>.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4 animate-fade">
          <Link to="/book" className="btn btn-primary btn-lg fw-bold glow-btn">
            Book a Ride
          </Link>
          {!user && (
            <Link
              to="/login"
              className="btn btn-outline-light btn-lg fw-bold glow-outline"
            >
              Login
            </Link>
          )}
        </div>

        <div className="mt-5 animate-float">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1995/1995574.png"
            alt="taxi"
            className="img-fluid hero-img"
          />
        </div>

        <div className="scroll-down animate-bounce">↓ Scroll to explore</div>
      </div>

      <div className="features container text-center text-light mt-5 mb-5">
        <h2 className="fw-bold text-gradient section-title animate-slide">
          Why Choose Us?
        </h2>
        <div className="row g-4">
          {[
            { icon: "⚡", title: "Speed", text: "Find rides instantly and travel faster." },
            { icon: "💎", title: "Comfort", text: "Every ride feels premium and relaxed." },
            { icon: "🌍", title: "Eco-Friendly", text: "Smarter, cleaner, and greener travel." },
          ].map((item, i) => (
            <div key={i} className="col-md-4 animate-card">
              <div className="feature-card p-4 rounded-4 shadow-lg">
                <h3 className="fw-bold">{item.icon} {item.title}</h3>
                <p className="feature-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        body, .home-container {
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        /* 🌈 Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, #00bcd4, #6610f2, #ff00cc, #00ffcc);
          background-size: 400% 400%;
          animation: gradientFlow 10s ease infinite;
          z-index: -2;
        }

        /* 🌟 Floating Particles */
        .particles::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 300vw;
          height: 300vh;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 3px);
          background-size: 80px 80px;
          animation: moveParticles 60s linear infinite;
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

        /* ✨ Hero Section */
        .hero-section {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .floating-taxi {
          font-size: 4.5rem;
          animation: float 3s ease-in-out infinite;
          margin-bottom: 1rem;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .main-heading {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: 1px;
          line-height: 1.2;
          animation: fadeIn 1s ease forwards;
        }

        .text-gradient {
          background: linear-gradient(90deg, #00ffcc, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .highlight {
          color: #00ffcc;
          text-shadow: 0 0 20px rgba(0, 255, 204, 0.7);
        }

        .tagline {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 10px;
          color: #ffffffcc;
          animation: fadeInUp 1.5s ease;
        }

        .subtext {
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 25px;
          color: #ddd;
          animation: fadeInUp 2s ease;
        }

        /* 🚘 Buttons */
        .glow-btn {
          border-radius: 50px;
          background: linear-gradient(45deg, #00ffcc, #007bff);
          border: none;
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.4);
          transition: all 0.4s ease;
        }

        .glow-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 0 25px rgba(0, 255, 204, 0.8);
        }

        .glow-outline {
          border-radius: 50px;
          border: 2px solid #fff;
          transition: all 0.3s ease;
        }

        .glow-outline:hover {
          background: rgba(255,255,255,0.2);
          box-shadow: 0 0 15px rgba(255,255,255,0.4);
          transform: scale(1.08);
        }

        /* 🚕 Hero Image */
        .hero-img {
          width: 300px;
          filter: drop-shadow(0 6px 20px rgba(0,0,0,0.4));
          animation: floatTaxi 4s ease-in-out infinite;
        }

        @keyframes floatTaxi {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* ↓ Scroll Indicator */
        .scroll-down {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 2rem;
          letter-spacing: 1px;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-bounce { animation: bounce 2.5s infinite; }

        /* 💎 Feature Section */
        .section-title {
          font-size: 2.4rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-10px) scale(1.03);
          box-shadow: 0 10px 30px rgba(0,255,204,0.3);
          background: rgba(255,255,255,0.15);
        }

        .feature-text {
          font-size: 1rem;
          color: #ddd;
          font-weight: 400;
          margin-top: 10px;
        }

        /* 🌀 Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade { animation: fadeInUp 1.2s ease forwards; }
        .animate-slide { animation: fadeInUp 1.5s ease forwards; }
        .animate-card { animation: fadeInUp 2s ease forwards; }

        /* 📱 Responsive */
        @media (max-width: 768px) {
          .main-heading {
            font-size: 2.4rem;
          }
          .tagline {
            font-size: 1.2rem;
          }
          .hero-img {
            width: 220px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
