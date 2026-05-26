import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import BookmarkButton from '../components/BookmarkButton';
import Skeleton from '../components/Skeleton';
import { fetchMedicineDetail } from '../api/medicines';
import { fetchBookmarks, removeBookmark, saveBookmark } from '../api/user';
import useAuth from '../hooks/useAuth';

export default function MedicineDetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMedicineDetail(name)
      .then((payload) => setMedicine(payload?.data || null))
      .finally(() => setLoading(false));
  }, [name]);

  useEffect(() => {
    if (!accessToken || !medicine?.name) {
      return;
    }
    fetchBookmarks().then((payload) => {
      const saved = (payload?.data || []).map((item) => item.medicine_name);
      setBookmarked(saved.includes(medicine.name));
    });
  }, [accessToken, medicine]);

  const handleBookmark = async () => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (!medicine?.name) return;
    if (bookmarked) {
      await removeBookmark(medicine.name);
      setBookmarked(false);
    } else {
      await saveBookmark(medicine.name);
      setBookmarked(true);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8"><Skeleton count={2} /></div>;
  }

  if (!medicine) {
    return <div className="mx-auto max-w-[1320px] px-4 py-20 text-sand/60">Medicine not found.</div>;
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-2 text-sm text-sand/55">
        <Link to="/search" className="transition hover:text-white">Search</Link>
        <span>/</span>
        <Link to="/results" className="transition hover:text-white">Results</Link>
        <span>/</span>
        <span className="text-white">{medicine.name}</span>
      </nav>

      <section className="surface-shell mt-6 rounded-[2rem] p-2">
        <div className="rounded-[1.65rem] bg-[#11182a] p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Medicine detail</p>
            <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl text-balance">{medicine.name}</h1>
            <p className="mt-3 text-sm font-semibold text-moss">{medicine.reason}</p>
          </div>
          <BookmarkButton active={bookmarked} onClick={handleBookmark} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Description</p>
            <p className="mt-3 text-sm leading-7 text-sand/78">{medicine.description}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Side effects</p>
            <p className="mt-3 text-sm leading-7 text-sand/78">{medicine.side_effects}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`/results?query=${encodeURIComponent(medicine.name)}`, { state: { query: medicine.name } })}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand"
          >
            Find alternatives
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white transition duration-200 group-hover:translate-x-1">↗</span>
          </button>
          <Link to="/search" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 font-semibold text-sand transition duration-200 hover:bg-white/10 hover:text-white">
            Search again
          </Link>
        </div>
      </div>
      </section>
    </div>
  );
}
