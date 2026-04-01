"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MdAdd, MdDelete, MdEdit, MdWbSunny, MdCalendarMonth, MdLocationOn, MdPerson } from "react-icons/md";
import { apiFetch } from "../../../lib/api";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/ConfirmModal";
import AddProfileModal from "../../../components/AddProfileModal";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, profileId: null, profileName: "" });

  async function loadProfiles() {
    setLoadingList(true);
    try {
      const d = await apiFetch("/user/profiles");
      setProfiles(d.profiles || []);
    } catch {
      setProfiles([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { loadProfiles(); }, []);

  function openAddModal() {
    setEditProfile(null);
    setShowModal(true);
  }

  function openEditModal(profile) {
    setEditProfile(profile);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditProfile(null);
  }

  function openDeleteModal(id, name) {
    setDeleteModal({ isOpen: true, profileId: id, profileName: name });
  }

  async function handleDelete() {
    const { profileId } = deleteModal;
    try {
      await apiFetch(`/user/profile/${profileId}`, { method: "DELETE" });
      setProfiles((p) => p.filter((x) => x.id !== profileId));
      toast.success("Profile deleted successfully");
    } catch (e) {
      toast.error(e.message || "Failed to delete profile");
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8 gap-3">
        <div className="min-w-0">
          <h1 className="mobile-header text-gray-800">Saved Profiles</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage birth profiles for personalised readings
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-medium transition-all text-sm shrink-0 touch-target shadow-md"
        >
          <MdAdd size={19} />
          <span className="hidden sm:inline">Add Profile</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Profile list */}
      {loadingList ? (
        <div className="flex justify-center py-16">
          <div className="w-9 h-9 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card text-center py-12 sm:py-16">
          <MdPerson size={48} className="text-gray-300 mx-auto mb-4 sm:w-14 sm:h-14" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No profiles yet</h3>
          <p className="text-gray-500 mb-6 text-sm px-4">
            Add a birth profile to get personalised astrological readings
          </p>
          <button
            onClick={openAddModal}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 active:scale-95 transition-all touch-target"
          >
            Add Your First Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={() => openEditModal(profile)}
              onDelete={() => openDeleteModal(profile.id, profile.profile_name)}
            />
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, profileId: null, profileName: "" })}
        onConfirm={handleDelete}
        title="Delete Profile?"
        message={`Are you sure you want to delete "${deleteModal.profileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Add Profile Modal */}
      <AddProfileModal
        isOpen={showModal}
        onClose={closeModal}
        onProfileAdded={loadProfiles}
        editProfile={editProfile}
      />
    </div>
  );
}

function ProfileCard({ profile, onEdit, onDelete }) {
  return (
    <div className="card hover:shadow-xl transition-all duration-200 active:scale-[0.98]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-sm">
          {profile.profile_name?.[0]?.toUpperCase() || "P"}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-gray-300 hover:text-indigo-600 active:scale-90 transition-all p-2 rounded-lg hover:bg-indigo-50 touch-target"
            title="Edit profile"
          >
            <MdEdit size={19} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-500 active:scale-90 transition-all p-2 rounded-lg hover:bg-red-50 touch-target"
            title="Delete profile"
          >
            <MdDelete size={19} />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 text-lg mb-3 truncate">{profile.profile_name}</h3>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MdCalendarMonth size={15} className="text-indigo-400 shrink-0" />
          <span className="truncate">{profile.dob}</span>
          {profile.tob && <span className="text-gray-400">· {profile.tob}</span>}
        </div>
        {profile.place_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MdLocationOn size={15} className="text-indigo-400 shrink-0" />
            <span className="truncate">{profile.place_name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/daily?profile_id=${profile.id}`}>
          <button className="w-full py-2.5 sm:py-2 text-xs bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 touch-target">
            <MdWbSunny size={14} />
            Daily
          </button>
        </Link>
        <Link href={`/monthly?profile_id=${profile.id}`}>
          <button className="w-full py-2.5 sm:py-2 text-xs bg-violet-50 hover:bg-violet-100 active:bg-violet-200 text-violet-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 touch-target">
            <MdCalendarMonth size={14} />
            Monthly
          </button>
        </Link>
      </div>
    </div>
  );
}
