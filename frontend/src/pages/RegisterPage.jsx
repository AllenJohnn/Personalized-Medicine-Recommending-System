import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { register, accessToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (accessToken) {
      navigate('/search');
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' });
  }, [cardRef]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = await register(form);
      if (payload?.success) {
        navigate('/search');
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not register.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1320px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
      <div className="space-y-6">
        <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/70">
          Create access
        </div>
        <h1 className="max-w-xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl text-balance">
          Create an account.
        </h1>
        <p className="max-w-lg text-base leading-8 text-sand/72 text-balance">Save bookmarks, track searches, and submit medicine requests securely from the same profile.</p>
      </div>

      <div ref={cardRef} className="surface-shell rounded-[2rem] p-2">
        <div className="rounded-[1.65rem] bg-[#11182a] p-8 sm:p-10">
          <h2 className="text-3xl font-semibold text-white">Register</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-sand/70">Keep your history and bookmarks tied to one profile.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-sand/78">
              Username
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-sand/35 focus:border-white/20 focus:bg-white/8"
              />
            </label>
            <label className="block text-sm font-medium text-sand/78">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-sand/35 focus:border-white/20 focus:bg-white/8"
              />
            </label>
            <label className="block text-sm font-medium text-sand/78">
              Confirm password
              <input
                type="password"
                value={form.confirm_password}
                onChange={(event) => setForm((current) => ({ ...current, confirm_password: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition duration-200 placeholder:text-sand/35 focus:border-white/20 focus:bg-white/8"
              />
            </label>
            {error && <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#ffb7a3]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-4 py-3 font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Register'}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white transition duration-200 group-hover:translate-x-1">↗</span>
            </button>
          </form>

          <p className="mt-6 text-sm text-sand/60">
            Already have an account? <Link to="/login" className="text-white underline decoration-white/30 underline-offset-4">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
