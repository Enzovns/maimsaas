"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Briefcase, CheckCircle, XCircle } from "lucide-react";

interface Application {
  status: string;
  createdAt: string;
  jobListing: { state: string | null };
}

export default function StatsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    );
  }

  // Daily trend — last 14 days
  const dailyMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap[d.toLocaleDateString("en-AU", { day: "numeric", month: "short" })] = 0;
  }
  applications.forEach((a) => {
    const label = new Date(a.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    if (label in dailyMap) dailyMap[label]++;
  });
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  // Status breakdown
  const statusCounts = { generated: 0, applied: 0, dismissed: 0 };
  applications.forEach((a) => {
    if (a.status in statusCounts) statusCounts[a.status as keyof typeof statusCounts]++;
  });
  const pieData = [
    { name: "New", value: statusCounts.generated, color: "#EAB308" },
    { name: "Applied", value: statusCounts.applied, color: "#22C55E" },
    { name: "Dismissed", value: statusCounts.dismissed, color: "#9CA3AF" },
  ].filter((d) => d.value > 0);

  // State breakdown
  const stateMap: Record<string, number> = {};
  applications.forEach((a) => {
    const s = a.jobListing.state || "Unknown";
    stateMap[s] = (stateMap[s] ?? 0) + 1;
  });
  const stateData = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([state, count]) => ({ state, count }));

  const total = applications.length;
  const applyRate = total > 0 ? Math.round((statusCounts.applied / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stats</h1>
        <p className="text-gray-500 text-sm mt-1">Your application activity over the last 30 days.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Briefcase, bg: "bg-yellow-100", color: "text-yellow-600", val: total, label: "Total matched" },
          { icon: CheckCircle, bg: "bg-green-100", color: "text-green-600", val: statusCounts.applied, label: "Applied" },
          { icon: XCircle, bg: "bg-gray-100", color: "text-gray-500", val: statusCounts.dismissed, label: "Dismissed" },
          { icon: TrendingUp, bg: "bg-blue-100", color: "text-blue-600", val: `${applyRate}%`, label: "Apply rate" },
        ].map(({ icon: Icon, bg, color, val, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-2`}>
              <Icon size={14} className={color} />
            </div>
            <p className="text-xl font-bold text-gray-900">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <TrendingUp className="text-gray-200 mx-auto mb-3" size={48} />
          <p className="font-semibold text-gray-700">No data yet</p>
          <p className="text-sm text-gray-400 mt-1">Charts will appear once you have job matches.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Daily trend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Daily matches (last 14 days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                <Area type="monotone" dataKey="count" stroke="#EAB308" strokeWidth={2} fill="url(#grad)" name="Matches" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status pie */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Status breakdown</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* State bar chart */}
            {stateData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Jobs by state</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stateData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: "#9CA3AF" }} width={40} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#EAB308" radius={[0, 4, 4, 0]} name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
