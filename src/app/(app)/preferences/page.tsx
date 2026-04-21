"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Save } from "lucide-react";

const ROLE_OPTIONS = [
  "Underground Miner", "Open Cut Operator", "Drill & Blast", "Processing Operator",
  "Maintenance", "Engineering", "Management", "HSEC", "Geologist", "Surveyor", "Trades",
];
const STATE_OPTIONS = ["WA", "QLD", "NSW", "VIC", "SA", "NT", "TAS", "ACT"];
const ROSTER_OPTIONS = [
  { value: "FIFO", label: "FIFO", desc: "Fly-In Fly-Out" },
  { value: "DIDO", label: "DIDO", desc: "Drive-In Drive-Out" },
  { value: "RESIDENTIAL", label: "Residential", desc: "On-site" },
  { value: "", label: "Any", desc: "No preference" },
];
const EXPERIENCE_OPTIONS = [
  { value: "ENTRY", label: "Entry", desc: "0–2 years" },
  { value: "MID", label: "Mid", desc: "2–5 years" },
  { value: "SENIOR", label: "Senior", desc: "5+ years" },
  { value: "", label: "Any", desc: "No preference" },
];

export default function PreferencesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [roles, setRoles] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [roster, setRoster] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRoles(data.user.preferredRoles ?? []);
      setStates(data.user.preferredStates ?? []);
      setRoster(data.user.preferredRoster ?? "");
      setExperience(data.user.experienceLevel ?? "");
    } catch {
      setError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchPrefs();
  }, [status, fetchPrefs]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredRoles: roles,
          preferredStates: states,
          preferredRoster: roster || null,
          experienceLevel: experience || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Preferences saved!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Preferences</h1>
        <p className="text-gray-500 text-sm mt-1">Update your preferences to improve daily job matching.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 mb-4">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-6">
        {/* Roles */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Preferred roles <span className="text-gray-400 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoles((p) => p.includes(role) ? p.filter((r) => r !== role) : [...p, role])}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${roles.includes(role) ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Preferred states <span className="text-gray-400 font-normal">(leave blank for all Australia)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STATE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStates((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${states.includes(s) ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Roster */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Roster preference</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROSTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoster(opt.value)}
                className={`flex flex-col items-center py-2.5 px-3 rounded-xl border-2 transition-all text-center ${roster === opt.value ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Experience level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperience(opt.value)}
                className={`flex flex-col items-center py-2.5 px-3 rounded-xl border-2 transition-all text-center ${experience === opt.value ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
      >
        <Save size={16} />
        {saving ? "Saving…" : "Save Preferences"}
      </button>
    </div>
  );
}
