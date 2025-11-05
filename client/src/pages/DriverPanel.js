// driver accepts a ride
import { doc, updateDoc } from "firebase/firestore";

await updateDoc(doc(db, "rides", rideId), {
  driverId: auth.currentUser.uid,
  status: "accepted",
  updatedAt: serverTime()
});
