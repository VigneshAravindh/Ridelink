import React, { useState, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { searchLocationNominatim } from "../../api/nominatim";
import { validateAirport } from "./RideValidation";
import { haversineDistanceKm } from "../../utils/geo";
import { RATE_PER_KM } from "../../config";
import { saveRideToFirestore } from "./RideService";
import { useNavigate } from "react-router-dom";

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

// helper to center map
const CenterOn = ({ point }) => {
  const map = useMap();
  useEffect(() => {
    if (point) map.setView([point.lat, point.lng], 12);
  }, [map, point]);
  return null;
};

const AirportForm = () => {
  const [tripType, setTripType] = useState("drop");
  const [pickupInput, setPickupInput] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [airportInput, setAirportInput] = useState("");
  const [airportSuggestions, setAirportSuggestions] = useState([]);
  const [airport, setAirport] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fare, setFare] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const searchPickup = useRef(
    debounce(async (q) => {
      const res = await searchLocationNominatim(q);
      setPickupSuggestions(res);
    }, 300)
  ).current;

  const searchAirport = useRef(
    debounce(async (q) => {
      const res = await searchLocationNominatim(q + " airport");
      setAirportSuggestions(res);
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      searchPickup.cancel && searchPickup.cancel();
      searchAirport.cancel && searchAirport.cancel();
    };
  }, [searchPickup, searchAirport]);

  const onPickupChange = (e) => {
    setPickupInput(e.target.value);
    setPickup(null);
    if (e.target.value.length >= 2) searchPickup(e.target.value);
    else setPickupSuggestions([]);
  };

  const onAirportChange = (e) => {
    setAirportInput(e.target.value);
    setAirport(null);
    if (e.target.value.length >= 2) searchAirport(e.target.value);
    else setAirportSuggestions([]);
  };

  const selectPickup = (item) => {
    setPickup({
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      addressDetails: item.address,
    });
    setPickupInput(item.display_name);
    setPickupSuggestions([]);
  };

  const selectAirport = (item) => {
    setAirport({
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      addressDetails: item.address,
    });
    setAirportInput(item.display_name);
    setAirportSuggestions([]);
  };

  // fare calc
  useEffect(() => {
    if (!pickup || !airport) {
      setFare(null);
      return;
    }
    const d = haversineDistanceKm(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: airport.lat, lng: airport.lng }
    );
    const km = Math.max(1, d);
    setFare({ km: km.toFixed(2), amount: Math.round(km * RATE_PER_KM) });
  }, [pickup, airport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    const payload = {
      rideType: "airport",
      tripType,
      pickup: tripType === "drop" ? pickup : airport,
      drop: tripType === "drop" ? airport : pickup,
      date,
      time,
      fare: fare ? fare.amount : null,
      estimatedKm: fare ? parseFloat(fare.km) : null,
    };

    const v = validateAirport(payload);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setErrors({});
    setLoading(true);
    const res = await saveRideToFirestore(payload);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Airport ride booked successfully!");
      navigate("/my-rides");
      setPickup(null);
      setAirport(null);
      setPickupInput("");
      setAirportInput("");
      setDate("");
      setTime("");
      setFare(null);
    } else {
      setErrors({ submit: res.error });
    }
  };

  const markerPoint = tripType === "drop" ? airport : pickup;

  return (
    <div className="airport-form-container">
      <form onSubmit={handleSubmit}>
        {/* Trip Type */}
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">🛫 Trip Type</label>
          <select
            className="form-select"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
          >
            <option value="drop">Drop to Airport</option>
            <option value="pickup">Pick up from Airport</option>
          </select>
        </div>

        {/* Pickup */}
        <div className="mb-3 position-relative">
          <label className="form-label fw-semibold text-dark">
            {tripType === "drop" ? "🏠 From (Home)" : "✈️ To (Home)"}
          </label>
          <input
            className="form-control"
            placeholder="Enter pickup location"
            value={pickupInput}
            onChange={onPickupChange}
            autoComplete="off"
          />
          <small className="text-muted">Select from suggestions</small>
          <SuggestionList items={pickupSuggestions} onSelect={selectPickup} />
        </div>

        {/* Airport */}
        <div className="mb-3 position-relative">
          <label className="form-label fw-semibold text-dark">🛩️ Airport</label>
          <input
            className="form-control"
            placeholder="Enter airport name"
            value={airportInput}
            onChange={onAirportChange}
            autoComplete="off"
          />
          <small className="text-muted">Select from suggestions</small>
          <SuggestionList items={airportSuggestions} onSelect={selectAirport} />
        </div>

        {/* Date & Time */}
        <div className="row mt-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold text-dark">📅 Travel Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fw-semibold text-dark">⏰ Pickup Time</label>
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
            <div><strong>Distance:</strong> {fare.km} km</div>
            <div><strong>Estimated Fare:</strong> ₹{fare.amount}</div>
            <small className="text-muted">Rate: ₹{RATE_PER_KM}/km</small>
          </div>
        )}

        {/* Errors & Success */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="alert alert-danger mt-3">
            {Object.values(errors).map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mt-3 text-center">{successMsg}</div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary mt-3 w-100 fw-semibold"
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Airport Ride"}
        </button>
      </form>

      {/* Map */}
      <div className="mt-4 rounded overflow-hidden shadow-sm" style={{ height: 320 }}>
        <MapContainer
          center={markerPoint ? [markerPoint.lat, markerPoint.lng] : [20.5937, 78.9629]}
          zoom={markerPoint ? 12 : 5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markerPoint && (
            <Marker position={[markerPoint.lat, markerPoint.lng]}>
              <Popup>{markerPoint.address}</Popup>
            </Marker>
          )}
          <CenterOn point={markerPoint ? { lat: markerPoint.lat, lng: markerPoint.lng } : null} />
        </MapContainer>
      </div>

      <style>{`
        .airport-form-container {
          color: #222;
        }
        .form-label {
          font-size: 1rem;
        }
        input.form-control, select.form-select {
          border-radius: 10px;
          border: 1.5px solid #ccc;
          transition: all 0.2s ease;
        }
        input.form-control:focus, select.form-select:focus {
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

export default AirportForm;
