// src/pages/BookRide/RideService.js
import { db, serverTime, auth } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

export async function saveRideToFirestore(ride) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const ridesRef = collection(db, "rides");

    // Construct ride document with driverId (important for driver system)
    const doc = {
      userId: user.uid,
      rideType: ride.rideType || "unknown", // e.g. "local", "oneway", "airport"
      pickup: ride.pickup || null,
      drop: ride.drop || null,
      airport: ride.airport || null,
      dates: {
        pickupDate: ride.date || null,
        returnDate: ride.returnDate || null,
      },
      time: ride.time || null,
      estimatedKm: ride.estimatedKm || null,
      fare: ride.fare || null,
      status: "pending",          // default status
      driverId: null,             // ✅ added: initially unassigned
      driverName: null,           // optional future use
      assignedAt: null,           // optional future use
      createdAt: serverTime(),    // Firestore server timestamp
      meta: {
        notes: ride.notes || "",
      },
    };

    const result = await addDoc(ridesRef, doc);
    console.log("✅ Ride saved:", result.id);

    return { success: true, id: result.id };
  } catch (err) {
    console.error("❌ saveRideToFirestore error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

