import { useState } from "react";
import { fetchPerDiemLocal } from "./utils/distance";

export default function TravelCostApp() {
  const [destZip, setDestZip] = useState("");
  const [tripType, setTripType] = useState("Day Trip");
  const [days, setDays] = useState(1);
  const [nights, setNights] = useState(0);
  const [miles, setMiles] = useState("");
  const [toll, setToll] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    try {
      setError("");
      const mileageRate = 0.7;
      const oneWayMiles = parseFloat(miles);
      const tollCost = parseFloat(toll) || 0;

      const currentMonth = new Date().toLocaleString("en-US", { month: "short" });

      if (!destZip || !oneWayMiles || isNaN(oneWayMiles)) {
        throw new Error("Please enter a valid postal code and mileage");
      }

      const perDiem = await fetchPerDiemLocal(destZip, currentMonth);

      if (!perDiem) {
        throw new Error(`No data found for ZIP ${destZip} in ${currentMonth}`);
      }

      const { lodging, meals } = perDiem;

      let total = 0;
      let details = {};

      if (tripType === "Day Trip") {
        total =
          days * (2 * oneWayMiles * mileageRate + 2 * tollCost) +
          days * meals;
        details = {
          mileagePerDay: (2 * oneWayMiles * mileageRate).toFixed(2),
          tollPerDay: (2 * tollCost).toFixed(2),
          mealsPerDay: meals.toFixed(2),
        };
      } else {
        total =
          2 * oneWayMiles * mileageRate +
          2 * tollCost +
          nights * lodging +
          days * meals;
        details = {
          mileageTotal: (2 * oneWayMiles * mileageRate).toFixed(2),
          tollTotal: (2 * tollCost).toFixed(2),
          lodgingTotal: (nights * lodging).toFixed(2),
          mealsTotal: (days * meals).toFixed(2),
        };
      }

      setResult({ total: total.toFixed(2), details });
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
  <div
    style={{
      padding: "2rem",
      fontFamily: "sans-serif",
      maxWidth: "500px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
    <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Total Estimate Calculator</h1>

    <label>Destination ZIP</label>
    <input
      value={destZip}
      onChange={(e) => setDestZip(e.target.value)}
      style={{ padding: "0.5rem" }}
    />

    <label>Trip Type</label>
    <select
      value={tripType}
      onChange={(e) => setTripType(e.target.value)}
      style={{ padding: "0.5rem" }}
    >
      <option>Day Trip</option>
      <option>Overnight</option>
    </select>

    <label>One-Way Mileage</label>
    <input
      type="number"
      value={miles}
      onChange={(e) => setMiles(e.target.value)}
      style={{ padding: "0.5rem" }}
    />

    <label>One-Way Toll</label>
    <input
      type="number"
      value={toll}
      onChange={(e) => setToll(e.target.value)}
      style={{ padding: "0.5rem" }}
    />

    <label>Number of Days</label>
    <input
      type="number"
      value={days}
      onChange={(e) => setDays(Number(e.target.value))}
      style={{ padding: "0.5rem" }}
    />

    {tripType === "Overnight" && (
      <>
        <label>Number of Nights</label>
        <input
          type="number"
          value={nights}
          onChange={(e) => setNights(Number(e.target.value))}
          style={{ padding: "0.5rem" }}
        />
      </>
    )}

    <button
      onClick={handleCalculate}
      style={{
        padding: "0.75rem",
        backgroundColor: "#222",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      Calculate
    </button>

    {error && <p style={{ color: "red" }}>Error: {error}</p>}

    {result && (
      <div style={{ marginTop: "1rem" }}>
        <h3>Total Cost: ${result.total}</h3>
        <ul>
          {Object.entries(result.details).map(([k, v]) => (
            <li key={k}>
              {k}: ${v}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);}
