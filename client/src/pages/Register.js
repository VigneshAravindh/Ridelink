// src/pages/Signup.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Update display name in Firebase Auth
      await updateProfile(user, { displayName: name });

      // 3️⃣ Create Firestore profile document
      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        email: user.email,
        role: "rider", // ✅ Default role for new users
        createdAt: new Date(),
      });

      alert("✅ Account created successfully!");
      navigate("/"); // redirect to home
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="d-flex justify-content-center align-items-center flex-column"
     style={{ minHeight: "80vh" }}>
  <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
      <h3 className="text-center mb-4">Signup</h3>
      <form onSubmit={handleSignup}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Creating..." : "Signup"}
        </button>
      </form>
  </div>
</div>
  );
};

export default Signup;
