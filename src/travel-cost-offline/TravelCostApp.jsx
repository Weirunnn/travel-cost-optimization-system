import React, { useState } from "react";
import { fetchDistanceMiles } from "./utils/distance";

const mileageRate = 0.7;

// --------------  本地 per-diem JSON --------------
let perDiemTable = null;
async function loadPerDiem() {
  if (!perDiemTable) {
    perDiemTable = await fetch("/perdiem2025.json").then(r => r.json());
  }
}
async function fetchPerDiemLocal(zip) {
  await loadPerDiem();
  const row = perDiemTable.find(r => String(r.Zip) === String(zip));
  if (!row) throw new Error("ZIP not found in per-diem table");

  const monthCol = new Intl.DateTimeFormat("en", { month: "short" })
    .format(new Date())
    .replace(".", "");

  return {
    meals: +row.Meals,
    lodging: +row[monthCol],
  };
}

// =================  组件  =================
export default function TravelCostApp() {
  const [form, setForm] = useState({
    originZip: "",
    destinationZip: "",
    overnight: "Yes",
    days: "1",
    nights: "0",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const calc = async e => {
    e.preventDefault();

    // ---------- 基础校验 ----------
    const zipRe = /^\d{5}$/;
    if (!zipRe.test(form.originZip) || !zipRe.test(form.destinationZip)) {
      alert("请确保两个 ZIP 都是 5 位数字");
      return;
    }
    if (+form.days < 1 || !Number.isInteger(+form.days)) {
      alert("Days 必须是正整数");
      return;
    }
    if (form.overnight === "Yes" && (+form.nights < 1 || !Number.isInteger(+form.nights))) {
      alert("Overnight 行程的 Nights 也需为正整数");
      return;
    }

    setLoading(true);
    try {
      const dist = await fetchDistanceMiles(form.originZip, form.destinationZip);
      const { meals, lodging } = await fetchPerDiemLocal(form.destinationZip);

      const mileage =
        form.overnight === "Yes"
          ? dist * mileageRate
          : dist * mileageRate * +form.days;
      const mealTotal = meals * +form.days;
      const hotelTotal = form.overnight === "Yes" ? lodging * +form.nights : 0;

      setResult({
        dist,
        mileage,
        mealTotal,
        hotelTotal,
        total: mileage + mealTotal + hotelTotal,
      });
    } catch (err) {
      alert(err.message || "Lookup error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <form onSubmit={calc} className="grid grid-cols-2 gap-4 text-sm">

        {/* Home ZIP */}
        <label className="flex flex-col col-span-2 sm:col-span-1">
          <span className="mb-1 font-medium">Home ZIP</span>
          <input
            name="originZip"
            type="text"          // 用 text + 自己校验
            inputMode="numeric"
            value={form.originZip}
            onChange={onChange}
            className="border rounded p-2"
          />
        </label>

        {/* Destination ZIP */}
        <label className="flex flex-col col-span-2 sm:col-span-1">
          <span className="mb-1 font-medium">Destination ZIP</span>
          <input
            name="destinationZip"
            type="text"
            inputMode="numeric"
            value={form.destinationZip}
            onChange={onChange}
            className="border rounded p-2"
          />
        </label>

        {/* Trip type */}
        <label className="flex flex-col">
          <span className="mb-1 font-medium">Trip Type</span>
          <select
            name="overnight"
            value={form.overnight}
            onChange={onChange}
            className="border rounded p-2"
          >
            <option value="Yes">Overnight</option>
            <option value="No">Day Trip</option>
          </select>
        </label>

        {/* Days */}
        <label className="flex flex-col">
          <span className="mb-1 font-medium">Days</span>
          <input
            name="days"
            type="text"
            inputMode="numeric"
            value={form.days}
            onChange={onChange}
            className="border rounded p-2"
          />
        </label>

        {/* Nights */}
        <label className="flex flex-col">
          <span className="mb-1 font-medium">Nights</span>
          <input
            name="nights"
            type="text"
            inputMode="numeric"
            value={form.nights}
            onChange={onChange}
            disabled={form.overnight === "No"}
            className="border rounded p-2 disabled:opacity-50"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded p-2 self-end col-span-2 sm:col-auto"
        >
          {loading ? "..." : "Calculate"}
        </button>
      </form>

      {result && (
        <div className="space-y-1 border-t pt-4 text-sm">
          <p>Distance: {result.dist.toFixed(1)} mi</p>
          <p>Mileage: ${result.mileage.toFixed(2)}</p>
          <p>Meals: ${result.mealTotal.toFixed(2)}</p>
          <p>Hotel: ${result.hotelTotal.toFixed(2)}</p>
          <p className="font-bold text-base">Total: ${result.total.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
