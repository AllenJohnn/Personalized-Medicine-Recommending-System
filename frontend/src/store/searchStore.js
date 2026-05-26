import { create } from 'zustand';

const useSearchStore = create((set) => ({
  query: '',
  results: [],
  autocomplete: [],
  loading: false,
  error: null,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setAutocomplete: (autocomplete) => set({ autocomplete }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetSearch: () => set({ query: '', results: [], loading: false, error: null }),
}));

export default useSearchStore;
