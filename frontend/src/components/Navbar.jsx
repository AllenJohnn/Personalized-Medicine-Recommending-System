import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${isActive ? 'bg-white text-ink shadow-sm' : 'text-sand/70 hover:bg-white/5 hover:text-white'}`;

export default function Navbar() {
  const { user, logout, accessToken } = useAuth();
  const [hidden, setHidden] = useState(false);
  const previousScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setHidden(current > previousScrollY.current + 12 && current > 80);
      previousScrollY.current = current;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setHidden(false);
  }, [location.pathname]);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <nav className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8">
        <Link to="/" className="surface-shell flex items-center gap-3 rounded-full px-4 py-3 transition duration-200 hover:-translate-y-0.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-black text-white">M</span>
          <span className="text-lg font-semibold tracking-wide text-white">MedRec</span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 p-1 backdrop-blur-md md:flex">
          <NavLink to="/search" className={navClass}>
            Search
          </NavLink>
          <NavLink to="/conditions" className={navClass}>
            Conditions
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin" className={navClass}>
            Admin
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          {accessToken && user ? (
            <>
              <span className="hidden rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-sand/75 sm:inline-flex">
                {user.username}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-sand/80 transition duration-200 hover:border-white/20 hover:text-white">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
