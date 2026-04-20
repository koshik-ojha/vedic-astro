"use client";

import { useEffect, useState } from "react";
import { MdClose, MdLocationOn, MdCalendarToday } from "react-icons/md";
import { DateInput } from "./DateInput";
import { LocationInput } from "./LocationInput";

export default function PanchangModal({ isOpen, onClose, onSubmit, loading }) {
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [date, setDate] = useState(defaultDate);
  const [locationText, setLocationText] = useState("");
  const [location, setLocation] = useState({ lat: "", lon: "", timezone: "Asia/Kolkata", city: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setDate(defaultDate);
      setError("");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape" && isOpen && !loading) onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, loading, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) { setError("Please select a date"); return; }
    if (!location.lat || !location.lon) { setError("Please select a location"); return; }
    setError("");
    onSubmit({ date, lat: location.lat, lon: location.lon, timezone: location.timezone, city: location.city });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <button
          onClick={() => !loading && onClose()}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <MdClose size={24} />
        </button>

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🕉️</span>
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-1">Vedic Panchang</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Select date and location to calculate</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <MdCalendarToday className="inline mr-1 text-purple-500" /> Date
            </label>
            <DateInput value={date} onChange={(v) => { setDate(v); setError(""); }} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <MdLocationOn className="inline mr-1 text-purple-500" /> Location
            </label>
            <LocationInput
              value={locationText}
              onChange={setLocationText}
              onLocationSelect={(loc) => {
                setLocation({ lat: loc.lat, lon: loc.lon, timezone: "Asia/Kolkata", city: loc.place_name });
                setError("");
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-all text-sm"
            >
              {loading ? "Calculating…" : "Calculate Panchang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
