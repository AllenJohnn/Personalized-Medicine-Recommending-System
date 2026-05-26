import { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  onFocus,
  placeholder = 'Search a medicine name',
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const visibleSuggestions = useMemo(() => suggestions.slice(0, 10), [suggestions]);

  const handleKeyDown = (event) => {
    if (!visibleSuggestions.length) {
      if (event.key === 'Enter') {
        onSearch?.();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((index) => (index + 1) % visibleSuggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => (index <= 0 ? visibleSuggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && visibleSuggestions[highlightedIndex]) {
        onSuggestionSelect?.(visibleSuggestions[highlightedIndex]);
        setOpen(false);
      } else {
        onSearch?.();
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="flex items-center gap-3 rounded-[1.6rem] border border-white/10 bg-white/6 p-3 shadow-soft backdrop-blur-sm focus-within:border-moss/40">
        <span className="pl-2 text-sm font-semibold uppercase tracking-[0.3em] text-sand/55">Rx</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onFocus={() => {
            setOpen(true);
            onFocus?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 pr-3 text-base text-white outline-none placeholder:text-sand/35"
        />
        <button
          type="button"
          onClick={() => onSearch?.()}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand"
        >
          Search
        </button>
      </div>

      {open && visibleSuggestions.length > 0 && (
        <div className="absolute z-30 mt-3 w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f1628] shadow-soft">
          {visibleSuggestions.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`block w-full px-5 py-3 text-left text-sm transition ${
                highlightedIndex === index ? 'bg-white/10 text-white' : 'text-sand/70 hover:bg-white/5 hover:text-white'
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => {
                onSuggestionSelect?.(item);
                setOpen(false);
                inputRef.current?.focus();
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
