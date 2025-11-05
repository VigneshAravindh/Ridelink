// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Fetch Firestore user profile
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        setError("No profile found for this account.");
        setLoading(false);
        return;
      }

      const userData = snap.data();

      // 3️⃣ Redirect based on role
      if (userData.role === "driver") {
        navigate("/driver"); // 🚖 Driver dashboard
      } else {
        navigate("/");   // 👤 Rider home page
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="d-flex justify-content-center align-items-center flex-column"
     style={{ minHeight: "80vh" }}>
  <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
      <h3 className="text-center mb-4">Login</h3>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      </div>
</div>

  );
};

export default Login;
