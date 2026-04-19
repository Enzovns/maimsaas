"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  email: string;
  state: string;
  isActive: boolean;
}

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Company>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", email: "", state: "" });


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchCompanies();
    }
  }, [status, router]);

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/admin/companies");
      if (res.status === 401) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch {
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!newForm.name || !newForm.email || !newForm.state) {
      setError("All fields are required");
      return;
    }
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setNewForm({ name: "", email: "", state: "" });
    setShowAdd(false);
    fetchCompanies();
  }

  async function handleUpdate(company: Company) {
    const res = await fetch("/api/admin/companies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: company.id, ...editForm }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    setEditingId(null);
    fetchCompanies();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this company?")) return;
    await fetch(`/api/admin/companies?id=${id}`, { method: "DELETE" });
    fetchCompanies();
  }

  async function handleToggleActive(company: Company) {
    await fetch("/api/admin/companies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...company, isActive: !company.isActive }),
    });
    fetchCompanies();
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const activeCount = companies.filter((c) => c.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">MineApply</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
              Admin
            </span>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mining Companies</h1>
            <p className="text-gray-600 text-sm mt-1">
              {activeCount} active · {companies.length} total
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Company</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-6">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <div className="bg-white rounded-2xl border border-yellow-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Company</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="Company name"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                placeholder="HR email"
                type="email"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <select
                value={newForm.state}
                onChange={(e) => setNewForm({ ...newForm, state: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select state</option>
                {["WA", "QLD", "NSW", "VIC", "SA", "NT", "TAS", "ACT"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors min-h-[44px]"
              >
                <Check size={14} />
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewForm({ name: "", email: "", state: "" });
                }}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 px-4 py-2 rounded-xl text-sm transition-colors min-h-[44px]"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Companies table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 sm:px-6 py-3 sm:py-4">
                  Company
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 sm:px-6 py-3 sm:py-4">
                  HR Email
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 sm:px-4 py-3 sm:py-4">
                  State
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 sm:px-4 py-3 sm:py-4">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4" />
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-gray-50 last:border-0">
                  {editingId === company.id ? (
                    <>
                      <td className="px-3 sm:px-6 py-3">
                        <input
                          value={editForm.name || company.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-base w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3">
                        <input
                          value={editForm.email || company.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-base w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <select
                          value={editForm.state || company.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          {["WA", "QLD", "NSW", "VIC", "SA", "NT", "TAS", "ACT"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 sm:px-4 py-3" />
                      <td className="px-3 sm:px-6 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleUpdate({
                                ...company,
                                ...editForm,
                              } as Company)
                            }
                            className="text-green-600 hover:text-green-700 p-2 -m-1"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-400 hover:text-gray-600 p-2 -m-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {company.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">
                        {company.email}
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {company.state}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <button
                          onClick={() => handleToggleActive(company)}
                          className={`text-xs px-2 py-1 rounded-full font-medium min-h-[32px] ${
                            company.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {company.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(company.id);
                              setEditForm({
                                name: company.name,
                                email: company.email,
                                state: company.state,
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600 p-2 -m-1"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="text-gray-400 hover:text-red-500 p-2 -m-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {companies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="text-gray-300 mx-auto mb-3" size={40} />
              <p className="text-gray-500 text-sm">No companies yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
