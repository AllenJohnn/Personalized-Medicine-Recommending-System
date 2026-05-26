import { useMemo, useState } from 'react';

import { fetchAllMedicines, searchMedicines } from '../api/medicines';
import useSearchStore from '../store/searchStore';

export default function useSearch() {
  const store = useSearchStore();
  const [allMedicines, setAllMedicines] = useState([]);

  const loadMedicines = async () => {
    const payload = await fetchAllMedicines();
    const items = payload?.data || [];
    setAllMedicines(items);
    store.setAutocomplete(items.slice(0, 12));
    return items;
  };

  const search = async (medicineName) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const payload = await searchMedicines({ medicine_name: medicineName });
      const results = payload?.data?.results || [];
      store.setResults(results);
      store.setQuery(medicineName);
      return payload?.data || { results: [] };
    } catch (error) {
      const message = error?.response?.data?.message || 'Search failed.';
      store.setError(message);
      store.setResults([]);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const filterSuggestions = useMemo(() => {
    return (value) => {
      const query = value.trim().toLowerCase();
      if (!query) {
        return allMedicines.slice(0, 12);
      }
      return allMedicines.filter((medicine) => medicine.toLowerCase().includes(query)).slice(0, 12);
    };
  }, [allMedicines]);

  return {
    ...store,
    allMedicines,
    loadMedicines,
    search,
    filterSuggestions,
  };
}
