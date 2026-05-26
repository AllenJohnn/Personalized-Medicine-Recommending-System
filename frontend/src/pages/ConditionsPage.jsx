import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ConditionTag from '../components/ConditionTag';
import MedicineCard from '../components/MedicineCard';
import Skeleton from '../components/Skeleton';
import { fetchConditionMedicines, fetchConditions } from '../api/medicines';

export default function ConditionsPage() {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConditions().then((payload) => {
      setConditions(payload?.data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selected) {
      setMedicines([]);
      return;
    }
    setLoading(true);
    fetchConditionMedicines(selected)
      .then((payload) => setMedicines(payload?.data || []))
      .finally(() => setLoading(false));
  }, [selected]);

  const filteredConditions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return conditions;
    }
    return conditions.filter((item) => item.toLowerCase().includes(term));
  }, [conditions, query]);

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <section className="py-10 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/55">Browse by condition</p>
        <h1 className="mt-2 max-w-3xl font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl text-balance">Filter medicines by what they treat.</h1>
        <div className="mt-6 max-w-xl rounded-[1.5rem] border border-white/10 bg-white/6 p-4 shadow-soft">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conditions"
            className="w-full bg-transparent px-2 py-2 text-white outline-none placeholder:text-sand/35"
          />
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {filteredConditions.map((condition) => (
          <ConditionTag key={condition} label={condition} active={selected === condition} onClick={() => setSelected(condition)} />
        ))}
      </section>

      <section className="mt-10">
        {loading ? (
          <Skeleton count={4} />
        ) : selected ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-sand/55">Selected condition</p>
                <h2 className="text-2xl font-semibold text-white">{selected}</h2>
              </div>
              <button type="button" onClick={() => setSelected('')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-sand transition duration-200 hover:bg-white/10 hover:text-white">
                Clear
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {medicines.map((medicine) => (
                <MedicineCard
                  key={medicine.name}
                  medicine={medicine}
                  onOpenDetail={() => navigate(`/medicine/${encodeURIComponent(medicine.name)}`)}
                  onToggleBookmark={() => navigate('/login')}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="surface-card rounded-[1.75rem] p-8 text-sand/60">
            Pick a condition pill to reveal matching medicines.
          </div>
        )}
      </section>
    </div>
  );
}
