export default function Modal({ open, onClose, title, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-[#11172d] p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-2xl text-sand/80 transition hover:text-white">
            ×
          </button>
        </div>
        <div className="mt-4 text-sm leading-6 text-sand/80">{children}</div>
      </div>
    </div>
  );
}
