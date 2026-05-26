import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { staggerCards } from '../animations/gsap';
import BookmarkButton from '../components/BookmarkButton';
import MedicineCard from '../components/MedicineCard';
import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import { fetchBookmarks, removeBookmark, saveBookmark } from '../api/user';
import { searchMedicines } from '../api/medicines';
import useAuth from '../hooks/useAuth';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accessToken } = useAuth();
  const resultsRef = useRef(null);
  const [query, setQuery] = useState(location.state?.query || searchParams.get('query') || '');
  const [results, setResults] = useState(location.state?.results || []);
  const [loading, setLoading] = useState(!location.state?.results?.length);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    staggerCards(resultsRef.current);
  }, [results]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    fetchBookmarks().then((payload) => {
      setBookmarks((payload?.data || []).map((item) => item.medicine_name));
    });
  }, [accessToken]);

  useEffect(() => {
    if (location.state?.results?.length) {
      setResults(location.state.results);
      setLoading(false);
      return;
    }

    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    searchMedicines({ medicine_name: query })
      .then((payload) => setResults(payload?.data?.results || []))
      .finally(() => setLoading(false));
  }, [location.state, query]);

  const hasResults = useMemo(() => results.length > 0, [results]);

  const handleBookmark = async (medicineName) => {
    if (!accessToken) {
      navigate('/login');
      return;
    }

    if (bookmarks.includes(medicineName)) {
      await removeBookmark(medicineName);
      setBookmarks((current) => current.filter((item) => item !== medicineName));
    } else {
      await saveBookmark(medicineName);
      setBookmarks((current) => [...current, medicineName]);
    }
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <section className="grid gap-6 py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:py-16">
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/55">Results</p>
          <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl text-balance">{query || 'Medicine alternatives'}</h1>
          <p className="max-w-2xl text-base leading-8 text-sand/72 text-balance">Showing up to six alternatives ranked by cosine similarity, with match scores and side effects kept in view.</p>
        </div>
        <Link to="/search" className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand">
          Search again
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white transition duration-200 group-hover:translate-x-1">↗</span>
        </Link>
      </section>

      <div className="surface-shell rounded-[2rem] p-2">
        <div className="rounded-[1.65rem] bg-[#11182a] p-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={async () => {
              if (!query.trim()) {
                return;
              }
              setLoading(true);
              const payload = await searchMedicines({ medicine_name: query });
              setResults(payload?.data?.results || []);
              setLoading(false);
            }}
            onSuggestionSelect={(value) => setQuery(value)}
            suggestions={[]}
            placeholder="Search again"
          />
        </div>
      </div>

      <section ref={resultsRef} className="space-y-4">
        {loading ? (
          <Skeleton count={6} />
        ) : hasResults ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((medicine) => (
              <MedicineCard
                key={medicine.name}
                medicine={medicine}
                bookmarked={bookmarks.includes(medicine.name)}
                onToggleBookmark={() => handleBookmark(medicine.name)}
                onOpenDetail={() => navigate(`/medicine/${encodeURIComponent(medicine.name)}`)}
              />
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-[1.75rem] p-8 text-sand/70">
            No results found. Try a different medicine name.
          </div>
        )}
      </section>
    </div>
  );
}
