export default function ConditionTag({ label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
        active ? 'border-white/10 bg-white text-ink' : 'border-white/10 bg-white/5 text-sand hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
