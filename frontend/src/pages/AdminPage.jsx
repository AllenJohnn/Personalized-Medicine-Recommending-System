import { useEffect, useState } from 'react';

import AdminTable from '../components/AdminTable';
import Skeleton from '../components/Skeleton';
import { fetchAdminRequests, fetchAdminStats, updateAdminRequest } from '../api/admin';

function StatCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-smoke">{label}</p>
      <div className="mt-3 text-4xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total_users: 0, total_searches: 0, pending_requests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminRequests(), fetchAdminStats()]).then(([requestsPayload, statsPayload]) => {
      setRequests(requestsPayload?.data || []);
      setStats(statsPayload?.data || stats);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (id, status) => {
    setRequests((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    await updateAdminRequest(id, status);
    const statsPayload = await fetchAdminStats();
    setStats(statsPayload?.data || stats);
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <section className="py-10 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/55">Admin</p>
        <h1 className="mt-2 max-w-3xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl text-balance">Moderate medicine requests with a clear queue.</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total users" value={stats.total_users} />
        <StatCard label="Total searches" value={stats.total_searches} />
        <StatCard label="Pending requests" value={stats.pending_requests} />
      </section>

      <section className="mt-8">
        {loading ? <Skeleton count={4} /> : <AdminTable items={requests} onUpdate={handleUpdate} />}
      </section>
    </div>
  );
}
