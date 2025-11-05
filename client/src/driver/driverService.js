// src/driver/driverService.js
import { db, auth, serverTime } from "../firebase";
import {
  doc,
  getDoc,
  getDocs,
  runTransaction,
  collection,
  query,
  where,
  limit,
} from "firebase/firestore";

export async function claimRideTransaction(rideId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not logged in" };

  const rideRef = doc(db, "rides", rideId);
  const driverRef = doc(db, "users", uid);

  try {
    await runTransaction(db, async (tx) => {
      // Fetch the ride and driver documents
      const [rideSnap, driverSnap] = await Promise.all([
        tx.get(rideRef),
        tx.get(driverRef),
      ]);

      if (!rideSnap.exists()) throw new Error("Ride not found");
      if (!driverSnap.exists()) throw new Error("Driver profile missing");

      const ride = rideSnap.data();
      const driver = driverSnap.data();

      // Check if ride is already taken
      if (ride.driverId) throw new Error("Ride already taken");
      if (ride.status !== "pending") throw new Error("Ride not available");

      // 🧠 Additional check: does this driver already have an active ride?
      const activeRideQuery = query(
        collection(db, "rides"),
        where("driverId", "==", uid),
        where("status", "in", ["assigned", "in_progress"]),
        limit(1)
      );
      const activeSnap = await getDocs(activeRideQuery);
      if (!activeSnap.empty) {
        throw new Error("You already have an active ride");
      }

      // ✅ Assign this ride to the driver
      tx.update(rideRef, {
        driverId: uid,
        driverName: driver.displayName || "Unknown Driver",
        vehicle: driver.vehicle || null,
        status: "assigned",
        assignedAt: serverTime(),
      });
    });

    return { success: true };
  } catch (err) {
    console.error("Claim ride error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Update ride status (assigned → in_progress → completed)
 */
export async function updateRideStatus(rideId, newStatus) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not logged in" };

  const rideRef = doc(db, "rides", rideId);

  try {
    await runTransaction(db, async (tx) => {
      const rideSnap = await tx.get(rideRef);
      if (!rideSnap.exists()) throw new Error("Ride not found");

      const ride = rideSnap.data();
      if (ride.driverId !== uid) throw new Error("Not your ride");

      tx.update(rideRef, { status: newStatus });
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Release a ride (unassign)
 */
export async function releaseRide(rideId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return { success: false, error: "Not logged in" };

  const rideRef = doc(db, "rides", rideId);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(rideRef);
      if (!snap.exists()) throw new Error("Ride not found");

      const ride = snap.data();
      if (ride.driverId !== uid) throw new Error("Not your ride");

      tx.update(rideRef, { driverId: null, status: "pending" });
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
