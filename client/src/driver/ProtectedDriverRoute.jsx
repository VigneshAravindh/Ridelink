// src/driver/ProtectedDriverRoute.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";

const ProtectedDriverRoute = ({ children }) => {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return setAllowed(false);

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().role === "driver") setAllowed(true);
      else setAllowed(false);
    };
    checkRole();
  }, []);

  if (allowed === null) return <h4>Loading...</h4>;
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedDriverRoute;
