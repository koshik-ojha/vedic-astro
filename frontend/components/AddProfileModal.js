"use client";

import { useEffect, useState } from "react";
import { MdClose, MdPerson } from "react-icons/md";
import { DateInput, TimeInput } from "./DateInput";
import { LocationInput } from "./LocationInput";
import { apiFetch } from "../lib/api";
import { toast } from "react-toastify";

const ZODIAC = [
  { value: "aries", label: "Aries (मेष)" },
  { value: "taurus", label: "Taurus (वृषभ)" },
  { value: "gemini", label: "Gemini (मिथुन)" },
  { value: "cancer", label: "Cancer (कर्क)" },
  { value: "leo", label: "Leo (सिंह)" },
  { value: "virgo", label: "Virgo (कन्या)" },
  { value: "libra", label: "Libra (तुला)" },
  { value: "scorpio", label: "Scorpio (वृश्चिक)" },
  { value: "sagittarius", label: "Sagittarius (धनु)" },
  { value: "capricorn", label: "Capricorn (मकर)" },
  { value: "aquarius", label: "Aquarius (कुंभ)" },
  { value: "pisces", label: "Pisces (मीन)" },
];

const EMPTY_FORM = {
  profile_name: "",
  dob: "2000-01-01",
  tob: "12:00",
  place_name: "",
  lat: 28.6139,
  lon: 77.209,
  timezone: "Asia/Kolkata",
  ayanamsa: "lahiri",
  sun_sign: "",
};

export default function AddProfileModal({ isOpen, onClose, onProfileAdded, editProfile = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEditMode = !!editProfile;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Reset form when modal closes or populate with edit data
  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
    } else if (editProfile) {
      setForm({
        profile_name: editProfile.profile_name || "",
        dob: editProfile.dob || "2000-01-01",
        tob: editProfile.tob || "12:00",
        place_name: editProfile.place_name || "",
        lat: editProfile.lat || 28.6139,
        lon: editProfile.lon || 77.209,
        timezone: editProfile.timezone || "Asia/Kolkata",
        ayanamsa: editProfile.ayanamsa || "lahiri",
        sun_sign: editProfile.sun_sign || "",
      });
    }
  }, [isOpen, editProfile]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.profile_name.trim()) {
      toast.error("Profile name is required.");
      return;
    }
    if (!form.place_name.trim()) {
      toast.error("Place of birth is required.");
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        await apiFetch(`/user/profile/${editProfile.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast.success("Profile updated successfully!");
      } else {
        await apiFetch("/user/profile", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Profile saved successfully!");
      }
      handleClose();
      if (onProfileAdded) {
        await onProfileAdded();
      }
    } catch (e) {
      toast.error(e.message || `Failed to ${isEditMode ? 'update' : 'save'} profile`);
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={saving}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <MdClose size={24} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <MdPerson size={28} className="text-indigo-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {isEditMode ? "Edit Profile" : "Add New Profile"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Profile Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.profile_name}
              onChange={(e) => setForm({ ...form, profile_name: e.target.value })}
              placeholder="e.g. Me, Mom, Dad, Friend"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date of Birth <span className="text-red-400">*</span>
              </label>
              <DateInput value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Time of Birth
              </label>
              <TimeInput value={form.tob} onChange={(v) => setForm({ ...form, tob: v })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Sun Sign (Zodiac)
            </label>
            <select
              value={form.sun_sign}
              onChange={(e) => setForm({ ...form, sun_sign: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
            >
              <option value="">Select Sun Sign</option>
              {ZODIAC.map((sign) => (
                <option key={sign.value} value={sign.value}>
                  {sign.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Required for daily horoscope readings
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Place of Birth <span className="text-red-400">*</span>
            </label>
            <LocationInput
              value={form.place_name}
              onChange={(v) => setForm({ ...form, place_name: v })}
              onLocationSelect={(loc) =>
                setForm({ ...form, place_name: loc.place_name, lat: loc.lat, lon: loc.lon })
              }
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {saving ? (isEditMode ? "Updating…" : "Saving…") : (isEditMode ? "Update Profile" : "Save Profile")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
