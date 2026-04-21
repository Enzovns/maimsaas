"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  XCircle,
  Check,
  Copy,
  ExternalLink,
  Zap,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  state: string | null;
  salary: string | null;
  url: string;
  source: string;
  postedDate: string | null;
}

interface Application {
  id: string;
  coverLetter: string;
  cvSummary: string;
  status: string;
  createdAt: string;
  jobListing: JobListing;
}

type TabFilter = "generated" | "applied" | "dismissed";
type ExpandView = "cover" | "summary";

export default function JobsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [tab, setTab] = useState<TabFilter>("generated");
  const [stateFilter, setStateFilter] = useState("");
  const [expanded, setExpanded] = useState<{ id: string; view: ExpandView } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, jobsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/jobs"),
      ]);
      if (!dashRes.ok || !jobsRes.ok) throw new Error("Failed");
      const [dash, jobs] = await Promise.all([dashRes.json(), jobsRes.json()]);
      setIsPro(dash.user.subscriptionTier === "pro");
      setApplications(jobs.applications ?? []);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  async function updateStatus(appId: string, newStatus: string) {
    setUpdatingIds((s) => new Set(s).add(appId));
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      if (newStatus === "applied") setSuccess("Marked as applied!");
    } catch {
      setError("Failed to update status");
    } finally {
      setUpdatingIds((s) => { const n = new Set(s); n.delete(appId); return n; });
    }
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError("Copy failed — select and copy manually");
    }
  }

  function toggleExpand(id: string, view: ExpandView) {
    setExpanded((prev) => prev?.id === id && prev.view === view ? null : { id, view });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const stateSet = new Set(applications.map((a) => a.jobListing.state).filter(Boolean));
  const states = Array.from(stateSet).sort() as string[];

  const filtered = applications
    .filter((a) => a.status === tab)
    .filter((a) => !stateFilter || a.jobListing.state === stateFilter);

  const counts = {
    generated: applications.filter((a) => a.status === "generated").length,
    applied: applications.filter((a) => a.status === "applied").length,
    dismissed: applications.filter((a) => a.status === "dismissed").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Matches</h1>
        <p className="text-gray-500 text-sm mt-1">{applications.length} matched jobs in the last 30 days</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-4">
          <AlertCircle size={16} />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={() => setError("")}><XCircle size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 mb-4">
          <CheckCircle size={16} />
          <span className="text-sm flex-1">{success}</span>
          <button onClick={() => setSuccess("")}><XCircle size={14} /></button>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Briefcase className="text-gray-200 mx-auto mb-3" size={48} />
          <p className="font-semibold text-gray-700 mb-1">No job matches yet</p>
          <p className="text-sm text-gray-400">Your first matches will appear after the nightly run (10pm UTC).</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(["generated", "applied", "dismissed"] as TabFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "generated" ? "New" : t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                  <span className={`text-xs ${tab === t ? "text-yellow-600" : "text-gray-400"}`}>{counts[t]}</span>
                </button>
              ))}
            </div>
            {states.length > 0 && (
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">All states</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="text-gray-400 text-sm">No {tab === "generated" ? "new" : tab} jobs{stateFilter ? ` in ${stateFilter}` : ""}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((app) => {
                const job = app.jobListing;
                const isExpanded = expanded?.id === app.id;
                const coverKey = `${app.id}-cover`;
                const summaryKey = `${app.id}-summary`;
                const isUpdating = updatingIds.has(app.id);

                return (
                  <div key={app.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900">{job.title}</h3>
                            {isPro && tab === "generated" && (
                              <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                <Zap size={10} />Auto-Apply
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{job.company}</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {job.location}
                              {job.state && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-medium ml-1">{job.state}</span>
                              )}
                            </span>
                            {job.salary && (
                              <span className="flex items-center gap-1 text-green-700">
                                <DollarSign size={12} />
                                {job.salary}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-600 border border-gray-200 hover:border-yellow-300 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 min-h-[36px]"
                        >
                          <ExternalLink size={12} />
                          <span className="hidden sm:inline">View job</span>
                        </a>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <ExpandBtn label="Cover Letter" icon={FileText} active={isExpanded && expanded?.view === "cover"} onClick={() => toggleExpand(app.id, "cover")} />
                        <ExpandBtn label="CV Summary" icon={FileText} active={isExpanded && expanded?.view === "summary"} onClick={() => toggleExpand(app.id, "summary")} />
                        {tab === "generated" && (
                          <>
                            <button onClick={() => updateStatus(app.id, "applied")} disabled={isUpdating} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 min-h-[36px]">
                              <Check size={13} />Mark Applied
                            </button>
                            <button onClick={() => updateStatus(app.id, "dismissed")} disabled={isUpdating} className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[36px]">
                              <XCircle size={13} /><span className="hidden sm:inline">Dismiss</span>
                            </button>
                          </>
                        )}
                        {isPro && tab === "generated" && (
                          <button disabled className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-yellow-500 text-white opacity-60 cursor-not-allowed min-h-[36px] ml-auto">
                            <Zap size={13} />Auto-Apply
                            <span className="text-xs bg-yellow-400 px-1.5 rounded-full">Soon</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && expanded?.view === "cover" && (
                      <ExpandedText label="Cover Letter" text={app.coverLetter} copyKey={coverKey} copiedKey={copiedKey} onCopy={copyText} />
                    )}
                    {isExpanded && expanded?.view === "summary" && (
                      <ExpandedText label="CV Summary" text={app.cvSummary} copyKey={summaryKey} copiedKey={copiedKey} onCopy={copyText} rows={6} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExpandBtn({ label, icon: Icon, active, onClick }: { label: string; icon: React.ComponentType<any>; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors min-h-[36px] ${active ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
      <Icon size={13} />
      {label}
      {active ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  );
}

function ExpandedText({ label, text, copyKey, copiedKey, onCopy, rows = 10 }: { label: string; text: string; copyKey: string; copiedKey: string | null; onCopy: (t: string, k: string) => void; rows?: number }) {
  return (
    <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <button onClick={() => onCopy(text, copyKey)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors min-h-[32px] ${copiedKey === copyKey ? "bg-green-50 border-green-200 text-green-700" : "border-gray-200 text-gray-600 hover:bg-white"}`}>
          {copiedKey === copyKey ? <Check size={12} /> : <Copy size={12} />}
          {copiedKey === copyKey ? "Copied!" : "Copy"}
        </button>
      </div>
      <textarea readOnly value={text} className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" rows={rows} />
    </div>
  );
}
