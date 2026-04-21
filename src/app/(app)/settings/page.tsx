"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Globe, AlertCircle, CheckCircle, Save } from "lucide-react";

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/user/settings");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setEmailNotifications(data.emailNotifications ?? true);
      setLanguage(data.language ?? "en");
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchSettings();
  }, [status, fetchSettings]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Settings saved!");
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your notification and language preferences.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-4">
          <AlertCircle size={16} /><span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 mb-4">
          <CheckCircle size={16} /><span className="text-sm">{success}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Daily digest email</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Receive an email each morning with your new job matches (8am AWST).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${emailNotifications ? "bg-yellow-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${emailNotifications ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-gray-500" />
            <h2 className="font-semibold text-gray-900">Language</h2>
          </div>
          <div className="flex gap-3">
            {[{ value: "en", label: "English" }, { value: "fr", label: "Français" }].map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => setLanguage(lang.value)}
                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${language === lang.value ? "border-yellow-400 bg-yellow-50 text-yellow-800" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Language affects the interface. Cover letters are always written in the job&apos;s language.
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-5 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
      >
        <Save size={16} />
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
