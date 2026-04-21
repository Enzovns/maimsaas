"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Plus, Trash2, AlertCircle } from "lucide-react";

interface SavedSearch {
  id: string;
  name: string;
  roles: string[];
  states: string[];
  roster: string | null;
  experience: string | null;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchSearches = useCallback(async () => {
    try {
      const res = await fetch("/api/user/saved-searches");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSearches(data.searches ?? []);
    } catch {
      setError("Failed to load saved searches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchSearches();
  }, [status, fetchSearches]);

  async function saveCurrentPreferences() {
    if (!name.trim()) { setError("Please enter a name for this search"); return; }
    setSaving(true);
    setError("");
    try {
      const prefRes = await fetch("/api/dashboard");
      if (!prefRes.ok) throw new Error("Failed to load preferences");
      const prefData = await prefRes.json();
      const res = await fetch("/api/user/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          roles: prefData.user.preferredRoles,
          states: prefData.user.preferredStates,
          roster: prefData.user.preferredRoster,
          experience: prefData.user.experienceLevel,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setName("");
      setShowForm(false);
      fetchSearches();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save search");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSearch(id: string) {
    if (!confirm("Delete this saved search?")) return;
    try {
      const res = await fetch(`/api/user/saved-searches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setSearches((s) => s.filter((x) => x.id !== id));
    } catch {
      setError("Failed to delete search");
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-gray-500 text-sm mt-1">Snapshots of your preference sets.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          Save current
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-4">
          <AlertCircle size={16} /><span className="text-sm">{error}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Name this search (e.g. WA Underground FIFO)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveCurrentPreferences()}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={saveCurrentPreferences}
            disabled={saving}
            className="text-sm bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      {searches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Bookmark className="text-gray-200 mx-auto mb-3" size={48} />
          <p className="font-semibold text-gray-700">No saved searches</p>
          <p className="text-sm text-gray-400 mt-1">
            Click &quot;Save current&quot; to snapshot your current preferences.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.roles.slice(0, 3).map((r) => (
                    <span key={r} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{r}</span>
                  ))}
                  {s.roles.length > 3 && <span className="text-xs text-gray-400">+{s.roles.length - 3} more</span>}
                  {s.states.map((st) => (
                    <span key={st} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{st}</span>
                  ))}
                  {s.roster && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s.roster}</span>}
                  {s.experience && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{s.experience}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{new Date(s.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <button onClick={() => deleteSearch(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
