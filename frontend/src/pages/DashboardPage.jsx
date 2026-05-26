import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BookmarkButton from '../components/BookmarkButton';
import Skeleton from '../components/Skeleton';
import useAuth from '../hooks/useAuth';
import { clearHistory, fetchBookmarks, fetchHistory, submitMedicineRequest } from '../api/user';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ medicine_name: '', details: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([fetchHistory(), fetchBookmarks()]).then(([historyPayload, bookmarkPayload]) => {
      setHistory(historyPayload?.data || []);
      setBookmarks(bookmarkPayload?.data || []);
      setLoading(false);
    });
  }, []);

  const handleSubmitRequest = async (event) => {
    event.preventDefault();
    const payload = await submitMedicineRequest(form);
    setMessage(payload?.message || 'Request submitted.');
    setForm({ medicine_name: '', details: '' });
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <section className="grid gap-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <article className="surface-shell rounded-[2rem] p-2">
          <div className="rounded-[1.65rem] bg-[#11182a] p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Account</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{user?.username}</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-sand/70">{user?.is_admin ? 'Admin access enabled.' : 'Standard user account.'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/bookmarks" className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand">
                Open bookmarks
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white transition duration-200 group-hover:translate-x-1">↗</span>
              </Link>
              {user?.is_admin && (
                <Link to="/admin" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-sand transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
                  Admin console
                </Link>
              )}
            </div>
          </div>
        </article>

        <article className="surface-card rounded-[2rem] p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Medicine request</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Submit a medicine for review.</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmitRequest}>
            <input
              value={form.medicine_name}
              onChange={(event) => setForm((current) => ({ ...current, medicine_name: event.target.value }))}
              placeholder="Medicine name"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-sand/35 focus:border-white/20 focus:bg-white/8"
            />
            <textarea
              value={form.details}
              onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
              placeholder="Why should it be added?"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-sand/35 focus:border-white/20 focus:bg-white/8"
            />
            <button type="submit" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand">
              Submit request
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-sand/65">{message}</p>}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-shell rounded-[2rem] p-2">
          <div className="rounded-[1.65rem] bg-[#11182a] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">History</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Recent searches</h2>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await clearHistory();
                  setHistory([]);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-sand transition duration-200 hover:bg-white/10 hover:text-white"
              >
                Clear history
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <Skeleton count={3} />
              ) : history.length ? (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/results?query=${encodeURIComponent(item.query)}`, { state: { query: item.query } })}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition duration-200 hover:bg-white/8"
                  >
                    <span>
                      <span className="block text-white">{item.query}</span>
                      <span className="text-sm text-sand/55">{item.result_count} results</span>
                    </span>
                    <span className="text-sm text-sand/50">{new Date(item.searched_at).toLocaleString()}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-sand/60">No searches yet.</p>
              )}
            </div>
          </div>
        </article>

        <article className="surface-card rounded-[2rem] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Bookmarks</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Saved medicines</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {loading ? (
              <Skeleton count={4} />
            ) : bookmarks.length ? (
              bookmarks.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{item.medicine_name}</p>
                  <p className="mt-1 text-sm text-sand/55">Saved {new Date(item.saved_at).toLocaleDateString()}</p>
                  <BookmarkButton active onClick={() => navigate(`/medicine/${encodeURIComponent(item.medicine_name)}`)} className="mt-4" />
                </div>
              ))
            ) : (
              <p className="text-sm text-sand/60">No bookmarks yet.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
