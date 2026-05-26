export default function Toast({ message, visible }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-white/10 bg-[#11172d] px-4 py-3 text-sm text-white shadow-soft transition duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
