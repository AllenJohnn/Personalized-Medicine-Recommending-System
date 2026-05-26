export default function Skeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="surface-shell animate-pulse rounded-[2rem] p-2">
          <div className="rounded-[1.65rem] bg-[#11182a] p-5">
            <div className="h-4 w-24 rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-3/4 rounded-2xl bg-white/10" />
            <div className="mt-4 h-3 w-full rounded-full bg-white/10" />
            <div className="mt-3 h-3 w-5/6 rounded-full bg-white/10" />
            <div className="mt-6 h-10 w-full rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
