import React, { useState, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { searchLocationNominatim } from "../../api/nominatim";
import { validateOneWay } from "./RideValidation";
import { haversineDistanceKm } from "../../utils/geo";
import { RATE_PER_KM } from "../../config";
import { saveRideToFirestore } from "./RideService";
import { useNavigate } from "react-router-dom";

const OneWayForm = () => {
  const [pickupInput, setPickupInput] = useState("");
  const [dropInput, setDropInput] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // Debounced search
  const searchPickup = useRef(
    debounce(async (q) => {
      const res = await searchLocationNominatim(q);
      setPickupSuggestions(res);
    }, 300)
  ).current;

  const searchDrop = useRef(
    debounce(async (q) => {
      const res = await searchLocationNominatim(q);
      setDropSuggestions(res);
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      searchPickup.cancel && searchPickup.cancel();
      searchDrop.cancel && searchDrop.cancel();
    };
  }, [searchPickup, searchDrop]);

  // Handlers
  const onPickupChange = (e) => {
    setPickupInput(e.target.value);
    setPickup(null);
    if (e.target.value.length >= 2) searchPickup(e.target.value);
    else setPickupSuggestions([]);
  };

  const onDropChange = (e) => {
    setDropInput(e.target.value);
    setDrop(null);
    if (e.target.value.length >= 2) searchDrop(e.target.value);
    else setDropSuggestions([]);
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

  const selectDrop = (item) => {
    setDrop({
      address: item.display_name,
      lat: item.lat,
      lng: item.lon,
      addressDetails: item.address,
    });
    setDropInput(item.display_name);
    setDropSuggestions([]);
  };

  // Fare calculation
  useEffect(() => {
    if (pickup && drop) {
      const d = haversineDistanceKm(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: drop.lat, lng: drop.lng }
      );
      const km = Math.max(0.1, d);
      const amount = Math.round(km * RATE_PER_KM);
      setFare({ km: km.toFixed(2), amount });
    } else {
      setFare(null);
    }
  }, [pickup, drop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    const data = {
      rideType: "oneway",
      pickup,
      drop,
      date,
      time,
      fare: fare ? fare.amount : null,
      estimatedKm: fare ? parseFloat(fare.km) : null,
    };

    const v = validateOneWay(data);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await saveRideToFirestore(data);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Ride booked successfully!");
      setPickup(null);
      setDrop(null);
      setPickupInput("");
      setDropInput("");
      setDate("");
      setTime("");
      setFare(null);
      navigate("/my-rides");
    } else {
      setErrors({ submit: res.error });
    }
  };

  return (
    <div className="oneway-form-container">
      <form onSubmit={handleSubmit}>
        {/* Pickup */}
        <div className="mb-3 position-relative">
          <label className="form-label fw-semibold text-dark">📍 From</label>
          <input
            className="form-control"
            placeholder="Enter pickup location"
            value={pickupInput}
            onChange={onPickupChange}
            autoComplete="off"
          />
          <small className="text-muted">Select from suggestions</small>
          {pickupSuggestions.length > 0 && (
            <ul
              className="list-group position-absolute"
              style={{
                zIndex: 9999,
                maxHeight: 200,
                overflowY: "auto",
                width: "100%",
              }}
            >
              {pickupSuggestions.map((s, i) => (
                <li
                  key={i}
                  className="list-group-item list-group-item-action"
                  onClick={() => selectPickup(s)}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Drop */}
        <div className="mb-3 position-relative">
          <label className="form-label fw-semibold text-dark">🏁 To</label>
          <input
            className="form-control"
            placeholder="Enter drop location"
            value={dropInput}
            onChange={onDropChange}
            autoComplete="off"
          />
          <small className="text-muted">Select from suggestions</small>
          {dropSuggestions.length > 0 && (
            <ul
              className="list-group position-absolute"
              style={{
                zIndex: 9999,
                maxHeight: 200,
                overflowY: "auto",
                width: "100%",
              }}
            >
              {dropSuggestions.map((s, i) => (
                <li
                  key={i}
                  className="list-group-item list-group-item-action"
                  onClick={() => selectDrop(s)}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date & Time */}
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

        {/* Fare Info */}
        {fare && (
          <div className="alert alert-info mt-3 text-center">
            <div>
              <strong>Estimated Distance:</strong> {fare.km} km
            </div>
            <div>
              <strong>Estimated Fare:</strong> ₹{fare.amount}
            </div>
            <small className="text-muted">Rate: ₹{RATE_PER_KM}/km</small>
          </div>
        )}

        {/* Error / Success */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="alert alert-danger mt-3">
            {Object.values(errors).map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mt-3 text-center">
            {successMsg}
          </div>
        )}

        {/* Button */}
        <button
          className="btn btn-primary mt-3 w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Booking..." : "Book One Way Ride"}
        </button>
      </form>

      {/* Map */}
      <div
        className="mt-4 rounded overflow-hidden shadow-sm"
        style={{ height: 300 }}
      >
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
          {drop && (
            <Marker position={[drop.lat, drop.lng]}>
              <Popup>Drop: {drop.address}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <style>{`
        .oneway-form-container {
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

export default OneWayForm;
