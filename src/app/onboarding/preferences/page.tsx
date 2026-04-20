"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { AlertCircle } from "lucide-react";

const ROLE_OPTIONS = [
  "Underground Miner",
  "Open Cut Operator",
  "Drill & Blast",
  "Processing Operator",
  "Maintenance",
  "Engineering",
  "Management",
  "HSEC",
  "Geologist",
  "Surveyor",
  "Trades",
];

const STATE_OPTIONS = ["WA", "QLD", "NSW", "VIC", "SA", "NT", "TAS", "ACT"];

const ROSTER_OPTIONS = [
  { value: "FIFO", label: "FIFO", desc: "Fly-In Fly-Out" },
  { value: "DIDO", label: "DIDO", desc: "Drive-In Drive-Out" },
  { value: "RESIDENTIAL", label: "Residential", desc: "Based on-site" },
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

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [roster, setRoster] = useState("");
  const [experience, setExperience] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  function toggleState(state: string) {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredRoles: selectedRoles,
          preferredStates: selectedStates,
          preferredRoster: roster || null,
          experienceLevel: experience || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/onboarding/upload");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16">
      <OnboardingSteps current={2} />

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Your job preferences
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Tell us what you&apos;re looking for so we can match the right jobs to you.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-5">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8 space-y-6">
        {/* Job Roles */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Preferred roles{" "}
            <span className="text-gray-400 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedRoles.includes(role)
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Preferred states{" "}
            <span className="text-gray-400 font-normal">(leave blank for all)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STATE_OPTIONS.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => toggleState(state)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedStates.includes(state)
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Roster */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Roster preference
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROSTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRoster(opt.value)}
                className={`flex flex-col items-center py-2.5 px-3 rounded-xl border-2 transition-all text-center ${
                  roster === opt.value
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                <span className="text-xs text-gray-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Experience level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperience(opt.value)}
                className={`flex flex-col items-center py-2.5 px-3 rounded-xl border-2 transition-all text-center ${
                  experience === opt.value
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
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
        className="w-full mt-5 sm:mt-6 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-colors min-h-[52px]"
      >
        {saving ? "Saving..." : "Save Preferences & Continue"}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        You can update these anytime from your dashboard.
      </p>
    </div>
  );
}
