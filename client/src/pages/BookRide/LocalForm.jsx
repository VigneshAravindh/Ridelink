import React, { useState, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { searchLocationNominatim } from "../../api/nominatim";
import { validateLocal } from "./RideValidation";
import { RATE_PER_KM } from "../../config";
import { saveRideToFirestore } from "./RideService";
import { useNavigate } from "react-router-dom";

// Helper: centers map on location
const CenterOn = ({ point }) => {
  const map = useMap();
  useEffect(() => {
    if (point) map.setView([point.lat, point.lng], 12);
  }, [map, point]);
  return null;
};

// Dropdown suggestion list
const SuggestionList = ({ items, onSelect }) => {
  if (!items || items.length === 0) return null;
  return (
    <ul
      className="list-group position-absolute"
      style={{
        zIndex: 9999,
        maxHeight: 220,
        overflowY: "auto",
        width: "100%",
      }}
    >
      {items.map((s, i) => (
        <li
          key={i}
          className="list-group-item list-group-item-action"
          onClick={() => onSelect(s)}
        >
          {s.display_name}
        </li>
      ))}
    </ul>
  );
};

const LocalForm = () => {
  const [pickupInput, setPickupInput] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [pickup, setPickup] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [estimatedKm, setEstimatedKm] = useState(10);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const searchPickup = useRef(
    debounce(async (q) => {
      const res = await searchLocationNominatim(q);
      setPickupSuggestions(res);
    }, 300)
  ).current;

  const navigate = useNavigate();

  useEffect(() => {
    return () => searchPickup.cancel && searchPickup.cancel();
  }, [searchPickup]);

  const onPickupChange = (e) => {
    setPickupInput(e.target.value);
    setPickup(null);
    if (e.target.value.length >= 2) searchPickup(e.target.value);
    else setPickupSuggestions([]);
  };

  const selectPickup = (item) => {
    setPickup({
      address: item.display_name,
      lat: item.lat,
      lng: item.lon,
      addressDetails: item.address,
    });
    setPickupInput(item.display_name);
    setPickupSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    const payload = {
      rideType: "local",
      pickup: {
        address: pickupInput,
        lat: pickup?.lat,
        lng: pickup?.lng,
        addressDetails: pickup?.addressDetails,
      },
      city: pickup
        ? pickup.addressDetails.city ||
          pickup.addressDetails.town ||
          pickup.addressDetails.village ||
          ""
        : pickupInput,
      cityDetails: pickup?.addressDetails,
      date,
      time,
      estimatedKm,
    };
    const v = validateLocal(payload);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setLoading(true);
    const fare = Math.round(Number(estimatedKm) * RATE_PER_KM);
    const res = await saveRideToFirestore({ ...payload, fare });
    setLoading(false);
    if (res.success) {
      setSuccessMsg("Local ride booked successfully!");
      setPickup(null);
      setPickupInput("");
      setDate("");
      setTime("");
      setEstimatedKm(10);
      navigate("/my-rides");
    } else {
      setErrors({ submit: res.error });
    }
  };

  return (
    <div className="local-form-container">
      <form onSubmit={handleSubmit}>
        {/* Pickup Input */}
        <div className="mb-3 position-relative">
          <label className="form-label fw-semibold text-dark">
            📍 Pickup Location
          </label>
          <input
            className="form-control"
            value={pickupInput}
            onChange={onPickupChange}
            placeholder="Enter your pickup point"
            autoComplete="off"
          />
          <small className="text-muted">Select from suggestions</small>
          <SuggestionList items={pickupSuggestions} onSelect={selectPickup} />
        </div>

        {/* Date and Time */}
        <div className="row mt-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold text-dark">📅 Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold text-dark">⏰ Time</label>
            <input
              type="time"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Estimated Distance */}
        <div className="mt-3 mb-3">
          <label className="form-label fw-semibold text-dark">
            🚗 Estimated Distance (km)
          </label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={estimatedKm}
            onChange={(e) => setEstimatedKm(e.target.value)}
          />
        </div>

        <div className="alert alert-info text-center mt-3">
          Estimated Fare:{" "}
          <strong>₹{Math.round(Number(estimatedKm) * RATE_PER_KM)}</strong>
        </div>

        {/* Error or Success Messages */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="alert alert-danger mt-3">
            {Object.values(errors).map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success mt-3">{successMsg}</div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary mt-3 w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Local Ride"}
        </button>
      </form>

      {/* Map Section */}
      <div className="mt-4 rounded overflow-hidden shadow-sm" style={{ height: 320 }}>
        <MapContainer
          center={pickup ? [pickup.lat, pickup.lng] : [20.5937, 78.9629]}
          zoom={pickup ? 12 : 5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]}>
              <Popup>Pickup: {pickup.address}</Popup>
            </Marker>
          )}
          <CenterOn
            point={pickup ? { lat: pickup.lat, lng: pickup.lng } : null}
          />
        </MapContainer>
      </div>

      <style>{`
        .local-form-container {
          color: #222;
        }
        .form-label {
          font-size: 1rem;
        }
        input.form-control {
          border-radius: 10px;
          border: 1.5px solid #ccc;
          transition: all 0.2s ease;
        }
        input.form-control:focus {
          border-color: #00ffcc;
          box-shadow: 0 0 8px rgba(0, 255, 204, 0.4);
        }
        .alert-info {
          background: rgba(0,255,204,0.08);
          border: 1px solid rgba(0,255,204,0.3);
          color: #00665f;
        }
      `}</style>
    </div>
  );
};

export default LocalForm;
