import BookmarkButton from './BookmarkButton';

export default function MedicineCard({ medicine, bookmarked = false, onToggleBookmark, onOpenDetail, expanded = false }) {
  return (
    <article data-animate-card className="surface-shell rounded-[2rem] p-2 transition duration-200 hover:-translate-y-0.5">
      <div className="rounded-[1.65rem] bg-[#11182a] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">{medicine.reason}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{medicine.name}</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm font-semibold text-white tabular-nums">
            {medicine.match_score ?? '—'}%
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-sand/70">{medicine.description}</p>
        <p className="mt-3 text-sm text-sand/60">
          Side effects: <span className="text-white/90">{medicine.side_effects}</span>
        </p>

        {expanded && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-sand/72">
            <p className="font-semibold text-white">Full preview</p>
            <p className="mt-2">{medicine.description}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenDetail}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand"
          >
            Open detail
          </button>
          <BookmarkButton active={bookmarked} onClick={onToggleBookmark} />
        </div>
      </div>
    </article>
  );
}
