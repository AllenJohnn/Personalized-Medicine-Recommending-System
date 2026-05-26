export default function BookmarkButton({ active, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${
        active
          ? 'border-white/10 bg-white text-ink'
          : 'border-white/10 bg-white/5 text-sand hover:bg-white/10 hover:text-white'
      } ${className}`}
    >
      <span aria-hidden="true">{active ? '♥' : '♡'}</span>
      {active ? 'Saved' : 'Save'}
    </button>
  );
}
