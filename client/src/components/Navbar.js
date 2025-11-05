import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // mobile menu state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role);
          if (!currentUser.displayName && data.displayName)
            currentUser.displayName = data.displayName;
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const brandLink = role === "driver" ? "/driver" : "/";

  // close mobile menu when navigation happens (also when a nav link clicked)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // small helper to decide which nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar custom-navbar sticky-top">
      <div className="nav-inner container d-flex align-items-center justify-content-between">
        <Link className="brand d-flex align-items-center gap-2" to={brandLink} onClick={() => setIsOpen(false)}>
          <div className="brand-icon"><i className="bi bi-taxi-front-fill"></i></div>
          <div className="brand-text">
            <span className="brand-title">Vicky Taxi</span>
            <small className="brand-sub">Ride your way</small>
          </div>
        </Link>

        {/* toggler */}
        <button
          className={`toggler ${isOpen ? "open" : ""}`}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((s) => !s)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* menu */}
        <div className={`menu ${isOpen ? "show" : ""}`}>
          <ul className="nav-list">
            {role === "rider" && (
              <>
                <li><Link className={`nav-link ${isActive("/") ? "active" : ""}`} to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
                <li><Link className={`nav-link ${isActive("/book") ? "active" : ""}`} to="/book" onClick={() => setIsOpen(false)}>Book Ride</Link></li>
                <li><Link className={`nav-link ${isActive("/my-rides") ? "active" : ""}`} to="/my-rides" onClick={() => setIsOpen(false)}>My Rides</Link></li>
              </>
            )}

            {role === "driver" && (
              <>
                <li><Link className={`nav-link ${isActive("/driver") ? "active" : ""}`} to="/driver" onClick={() => setIsOpen(false)}>Dashboard</Link></li>
                <li><Link className={`nav-link ${isActive("/driver/assigned") ? "active" : ""}`} to="/driver/assigned" onClick={() => setIsOpen(false)}>Assigned</Link></li>
                <li><Link className={`nav-link ${isActive("/driver/profile") ? "active" : ""}`} to="/driver/profile" onClick={() => setIsOpen(false)}>Profile</Link></li>
              </>
            )}

            {!role && (
              // default links for unauthenticated or unknown role
              <>
                <li><Link className={`nav-link ${isActive("/") ? "active" : ""}`} to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
                <li><Link className={`nav-link ${isActive("/book") ? "active" : ""}`} to="/book" onClick={() => setIsOpen(false)}>Book</Link></li>
              </>
            )}

            {/* auth actions */}
            {user ? (
              <>
                <li className="user-item">
                  <div className="user-badge" title={user.email}>
                    <i className="bi bi-person-circle me-1"></i>
                    <span>{user.displayName || "User"}</span>
                  </div>
                </li>
                <li>
                  <button className="btn-logout" onClick={handleLogout} title="Logout">
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link className={`btn btn-sm btn-outline-light nav-cta`} to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
                <li><Link className={`btn btn-sm btn-primary nav-cta`} to="/signup" onClick={() => setIsOpen(false)}>Signup</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .custom-navbar {
          background: rgba(11,11,11,0.85);
          backdrop-filter: blur(6px);
          padding: 0.35rem 0;
          border-bottom: 0;
          z-index: 1100;
          box-shadow: 0 6px 22px rgba(0,0,0,0.45);
        }

        .nav-inner { gap: 1rem; }

        /* Brand */
        .brand { text-decoration: none; color: inherit; }
        .brand-icon { font-size: 1.6rem; color: transparent; background: linear-gradient(135deg,#00ffcc,#ff00ff); -webkit-background-clip: text; }
        .brand-title { font-weight: 700; font-size: 1.05rem; background: linear-gradient(90deg,#00ffcc,#ff00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .brand-sub { display:block; font-size:0.65rem; color: #9aa3b2; margin-top: -3px; }

        /* Toggler (hamburger) */
        .toggler {
          width: 44px; height: 36px; display: inline-grid; place-items:center;
          background: transparent; border: none; cursor: pointer; padding: 0;
          margin-left: 8px;
        }
        .toggler span {
          display:block; width:22px; height:2px; margin:3px 0; border-radius:2px;
          background: #dfe6ee; transition: transform .28s cubic-bezier(.2,.9,.2,1), opacity .2s, background .2s;
        }
        .toggler.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .toggler.open span:nth-child(2) { opacity: 0; transform: scaleX(0.2); }
        .toggler.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Menu */
        .menu { display:flex; align-items:center; gap: 0; }
        .nav-list { list-style:none; display:flex; gap:1rem; align-items:center; margin:0; padding:0; }
        .nav-link { color: #d6e2eb; text-decoration:none; padding:8px 12px; border-radius:8px; font-weight:600; transition: all .18s ease; }
        .nav-link:hover { color:#00ffcc; background: rgba(255,255,255,0.04); transform: translateY(-2px); text-shadow: 0 0 8px rgba(0,255,204,0.12); }
        .nav-link.active { position: relative; color:#00ffcc; }
        .nav-link.active::after {
          content: ""; position:absolute; left:50%; transform: translateX(-50%); bottom:-8px;
          width:36px; height:3px; border-radius:3px; background: linear-gradient(90deg,#00ffcc,#007bff,#ff00ff);
          box-shadow: 0 6px 18px rgba(0,255,204,0.12);
        }

        .nav-cta { margin-left: .25rem; }
        .btn-primary { background: linear-gradient(45deg,#00ffcc,#007bff); border: none; color: #021; }
        .btn-outline-light { border-color: rgba(255,255,255,0.12); color: #dff; }

        .user-badge { display:flex; align-items:center; gap:.5rem; background: rgba(255,255,255,0.04); padding:6px 10px; border-radius:20px; color:#cfe7ff; font-weight:600; }

        .btn-logout { border-radius:50%; border:2px solid #00ffcc; background: transparent; color:#00ffcc; width:40px; height:40px; display:inline-grid; place-items:center; cursor:pointer; }
        .btn-logout:hover { background:#00ffcc; color:#001; transform: scale(1.06); box-shadow: 0 6px 20px rgba(0,255,204,0.18); }

        /* Responsive behavior: collapse into panel on small screens */
        @media (max-width: 991px) {
          .menu {
            position: fixed;
            right: 1rem;
            top: 72px;
            z-index: 1200;
            min-width: 220px;
            max-width: calc(100% - 40px);
            background: linear-gradient(180deg, rgba(15,15,20,0.96), rgba(10,10,12,0.96));
            border-radius: 12px;
            box-shadow: 0 18px 60px rgba(2,8,20,0.6);
            padding: 10px;
            transform: translateY(-6px) scale(.98);
            opacity: 0;
            pointer-events: none;
            transition: all .28s cubic-bezier(.2,.9,.2,1);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.03);
          }

          .menu.show {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
          }

          .nav-list { flex-direction: column; gap: 10px; align-items: stretch; padding: 6px; }
          .nav-link { padding: 12px 14px; border-radius: 10px; display:block; }
          .nav-cta { width: 100%; display: block; text-align:center; }
          .user-badge { justify-content:center; width:100%; }
          .btn-logout { margin-left: auto; }
          .brand-sub { display:none; }
        }

        /* Desktop minor layout */
        @media (min-width: 992px) {
          .toggler { display:none; }
          .menu { display:flex !important; }
        }

        /* small accessibility focus */
        .nav-link:focus, .btn-logout:focus, .toggler:focus { outline: 3px solid rgba(0,255,204,0.12); outline-offset: 2px; }
      `}</style>
    </nav>
  );
}

export default Navbar;
