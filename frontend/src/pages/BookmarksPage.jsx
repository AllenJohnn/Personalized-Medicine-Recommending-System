import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MedicineCard from '../components/MedicineCard';
import Skeleton from '../components/Skeleton';
import { fetchBookmarks, removeBookmark } from '../api/user';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks().then((payload) => {
      setBookmarks(payload?.data || []);
      setLoading(false);
    });
  }, []);

  const handleRemove = async (name) => {
    await removeBookmark(name);
    setBookmarks((current) => current.filter((item) => item.medicine_name !== name));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <section className="py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-smoke">Bookmarks</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-white">Medicines you saved.</h1>
      </section>
      {loading ? (
        <Skeleton count={6} />
      ) : bookmarks.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bookmarks.map((item) => (
            <MedicineCard
              key={item.id}
              medicine={{ name: item.medicine_name, reason: 'Saved', description: 'Open the detail view to inspect the full record.', side_effects: 'See detail page for side effects.' }}
              bookmarked
              onToggleBookmark={() => handleRemove(item.medicine_name)}
              onOpenDetail={() => navigate(`/medicine/${encodeURIComponent(item.medicine_name)}`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-8 text-smoke shadow-soft">No bookmarks saved yet.</div>
      )}
    </div>
  );
}
