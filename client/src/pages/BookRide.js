// src/pages/BookRide.js
import React, { useState } from "react";
import { db, auth, serverTime } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

export default function BookRide() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ridesRef = collection(db, "rides");
      await addDoc(ridesRef, {
        pickup: { address: pickup },
        drop: { address: drop },
        userId: auth.currentUser.uid,
        status: "pending",
        createdAt: serverTime()
      });
      alert("Ride requested!");
      setPickup(""); setDrop("");
    } catch (err) {
      console.error(err);
      alert("Error booking ride: " + err.message);
    }
  };

  return (
    <div className="col-md-6 offset-md-3">
      <h3>Book a Ride</h3>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Pickup address" value={pickup} onChange={e=>setPickup(e.target.value)} required/>
        <input className="form-control mb-2" placeholder="Drop address" value={drop} onChange={e=>setDrop(e.target.value)} required/>
        <button className="btn btn-success">Request Ride</button>
      </form>
    </div>
  );
}
