export default function AdminTable({ items = [], onUpdate }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/6 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.24em] text-smoke">
            <tr>
              <th className="px-5 py-4">Medicine</th>
              <th className="px-5 py-4">Requested by</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((item) => (
              <tr key={item.id} className="text-sand/85">
                <td className="px-5 py-4 text-white">{item.medicine_name}</td>
                <td className="px-5 py-4">{item.username}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      item.status === 'approved'
                        ? 'bg-moss/15 text-moss'
                        : item.status === 'rejected'
                          ? 'bg-coral/15 text-coral'
                          : 'bg-white/10 text-sand'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-smoke">{new Date(item.created_at).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdate?.(item.id, 'approved')}
                      className="rounded-full bg-moss px-3 py-2 text-xs font-semibold text-ink transition hover:-translate-y-0.5"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate?.(item.id, 'rejected')}
                      className="rounded-full bg-coral px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
