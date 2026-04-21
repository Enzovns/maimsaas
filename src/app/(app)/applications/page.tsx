"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Search, Copy, Check, ExternalLink, Briefcase } from "lucide-react";

interface Application {
  id: string;
  coverLetter: string;
  cvSummary: string;
  status: string;
  createdAt: string;
  jobListing: {
    title: string;
    company: string;
    location: string;
    state: string | null;
    url: string;
  };
}

export default function ApplicationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<{ id: string; view: "cover" | "summary" } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setApplications(data.applications ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const q = search.toLowerCase();
  const filtered = applications.filter(
    (a) =>
      !q ||
      a.jobListing.title.toLowerCase().includes(q) ||
      a.jobListing.company.toLowerCase().includes(q) ||
      a.coverLetter.toLowerCase().includes(q)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Search and copy your AI-generated cover letters</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by job title, company, or keyword in cover letter…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          {applications.length === 0 ? (
            <>
              <Briefcase className="text-gray-200 mx-auto mb-3" size={48} />
              <p className="font-semibold text-gray-700">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Applications will appear after the first nightly matching run.</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">No results for &quot;{search}&quot;</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const job = app.jobListing;
            const isExpanded = expanded?.id === app.id;
            const view = expanded?.view;

            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-gray-500">{job.company} · {job.location}{job.state ? ` (${job.state})` : ""}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(app.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 p-1.5 flex-shrink-0">
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="flex gap-2 px-4 sm:px-5 pb-4">
                  <TabBtn label="Cover Letter" active={isExpanded && view === "cover"} onClick={() => setExpanded(isExpanded && view === "cover" ? null : { id: app.id, view: "cover" })} />
                  <TabBtn label="CV Summary" active={isExpanded && view === "summary"} onClick={() => setExpanded(isExpanded && view === "summary" ? null : { id: app.id, view: "summary" })} />
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {view === "cover" ? "Cover Letter" : "CV Summary"}
                      </p>
                      <CopyBtn text={view === "cover" ? app.coverLetter : app.cvSummary} copyKey={`${app.id}-${view}`} copiedKey={copiedKey} onCopy={copyText} />
                    </div>
                    <textarea
                      readOnly
                      value={view === "cover" ? app.coverLetter : app.cvSummary}
                      rows={view === "cover" ? 10 : 5}
                      className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    generated: "bg-yellow-100 text-yellow-700",
    applied: "bg-green-100 text-green-700",
    dismissed: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${active ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
      <FileText size={12} />
      {label}
    </button>
  );
}

function CopyBtn({ text, copyKey, copiedKey, onCopy }: { text: string; copyKey: string; copiedKey: string | null; onCopy: (t: string, k: string) => void }) {
  const copied = copiedKey === copyKey;
  return (
    <button onClick={() => onCopy(text, copyKey)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${copied ? "bg-green-50 border-green-200 text-green-700" : "border-gray-200 text-gray-600 hover:bg-white"}`}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
