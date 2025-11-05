// src/pages/BookRide/RideValidation.js
import { haversineDistanceKm } from "../../utils/geo";

function isFutureDatetime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const dt = new Date(`${dateStr}T${timeStr}`);
  return dt.getTime() > Date.now();
}

// simple India-only city check: rely on Nominatim address.country_code === 'in'
export function validateOneWay(data) {
  const errors = {};
  if (!data.pickup?.address) errors.pickup = "Pickup location required";
  if (!data.drop?.address) errors.drop = "Drop location required";

  if (data.pickup?.lat && data.drop?.lat) {
    // ensure not same coordinates (threshold)
    const d = haversineDistanceKm(
      { lat: data.pickup.lat, lng: data.pickup.lng },
      { lat: data.drop.lat, lng: data.drop.lng }
    );
    if (d < 0.1) errors.same = "Pickup and drop cannot be the same location";
  }

  if (!isFutureDatetime(data.date, data.time)) errors.datetime = "Pickup date/time must be in the future";
  // address country check (if provided in address details)
  if (data.pickup?.addressDetails && data.pickup.addressDetails.country_code !== "in") {
    errors.pickupCountry = "Pickup must be in India";
  }
  if (data.drop?.addressDetails && data.drop.addressDetails.country_code !== "in") {
    errors.dropCountry = "Drop must be in India";
  }
  return errors;
}

export function validateRoundTrip(data) {
  const errors = validateOneWay(data);
  if (!data.returnDate) errors.returnDate = "Return date required";
  if (data.date && data.returnDate) {
    const d1 = new Date(data.date);
    const d2 = new Date(data.returnDate);
    if (d2 < d1) errors.returnDate = "Return date must be same or after pickup date";
  }
  return errors;
}

// export function validateLocal(data) {
//   const errors = {};
//   if (!data.city) errors.city = "City is required";
//   if (!isFutureDatetime(data.date, data.time)) errors.datetime = "Pickup date/time must be in the future";
//   // optional: ensure city is in India - if cityDetails provided
//   if (data.cityDetails && data.cityDetails.country_code !== "in") errors.city = "City must be in India";
//   // ensure estimatedKm present
//   if (!data.estimatedKm || isNaN(data.estimatedKm) || data.estimatedKm <= 0) {
//     errors.estimatedKm = "Estimated kilometres required (positive number)";
//   }
//   return errors;
// }
export function validateLocal(data) {
  const errors = {};

  if (!data.pickup?.address) {
    errors.city = "Pickup city is required";
  }

  if (!data.date) errors.date = "Date is required";
  if (!data.time) errors.time = "Time is required";

  const dateTime = new Date(`${data.date}T${data.time}`);
  if (isNaN(dateTime.getTime()) || dateTime <= new Date()) {
    errors.datetime = "Pickup date/time must be future";
  }

  if (data.pickup?.addressDetails?.country_code !== "in") {
    errors.cityCountry = "City must be in India";
  }

  return errors;
}



// export const validateAirport = (data) => {
//   const e = {};

//   if (!data.pickup) e.pickup = "Pickup location is required.";
//   if (!data.drop) e.drop = "Airport is required.";
//   if (!data.date) e.date = "Pick up date required.";
//   if (!data.time) e.time = "Pick up time required.";
//   if (!data.estimatedKm) e.estimatedKm = "Distance missing. Select locations again.";

//   return e;
// };

export function validateAirport(data) {
  const errors = {};

  if (!data.tripType) errors.tripType = "Trip type is required";

  // For both airport pickup and drop cases, validate pickup and drop fields
  if (!data.pickup?.address) errors.pickup = "Pickup location is required";
  if (!data.drop?.address) errors.drop = "Airport location is required";

  if (!data.date) errors.date = "Date is required";
  if (!data.time) errors.time = "Time is required";

  // Future date/time
  const dateTime = new Date(`${data.date}T${data.time}`);
  if (isNaN(dateTime.getTime()) || dateTime <= new Date()) {
    errors.datetime = "Pickup date/time must be in the future";
  }

  // ✅ Country validation only when address details exist
  if (data.pickup?.addressDetails?.country_code !== "in") {
    errors.pickupCountry = "Pickup must be inside India";
  }

  return errors;
}
