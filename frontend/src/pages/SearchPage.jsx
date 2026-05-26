import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import useSearch from '../hooks/useSearch';

export default function SearchPage() {
  const navigate = useNavigate();
  const { loadMedicines, search, filterSuggestions, loading, autocomplete, setAutocomplete } = useSearch();
  const [value, setValue] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMedicines().then(() => setReady(true));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAutocomplete(filterSuggestions(value));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filterSuggestions, setAutocomplete, value]);

  const suggestions = useMemo(() => autocomplete, [autocomplete]);

  const handleSearch = async (searchValue = value) => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      return;
    }
    const payload = await search(trimmed);
    navigate(`/results?query=${encodeURIComponent(trimmed)}`, {
      state: { query: trimmed, results: payload?.results || [] },
    });
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <section className="grid gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-16">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/70">
            Search workspace
          </div>
          <h1 className="max-w-2xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl text-balance">
            Find the closest match without the guesswork.
          </h1>
          <p className="max-w-xl text-base leading-8 text-sand/72 text-balance">
            Autocomplete uses the full medicine list, keyboard navigation stays familiar, and the results page keeps the score and condition context visible.
          </p>
          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            {['Live autocomplete', '300 ms debounce', '6 result limit'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-sand/72">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-shell rounded-[2rem] p-2">
          <div className="rounded-[1.65rem] bg-[#11182a] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Search entry</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Type a medicine name.</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm font-semibold text-white">9,700+</div>
            </div>

            <div className="mt-6">
              <SearchBar
                value={value}
                onChange={setValue}
                onSearch={() => handleSearch(value)}
                suggestions={suggestions}
                onSuggestionSelect={(item) => {
                  setValue(item);
                  handleSearch(item);
                }}
                placeholder="Type a medicine name"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-sand/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Arrow keys</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Enter to search</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Bookmarks persist</span>
            </div>

            {!ready && <div className="mt-6 text-sm text-sand/60">Loading medicine index...</div>}
          </div>
        </div>
      </section>

      <section className="mt-4">
        {loading ? <Skeleton count={6} /> : <div className="text-sm text-sand/60">Your latest search will appear on the results page.</div>}
      </section>
    </div>
  );
}
