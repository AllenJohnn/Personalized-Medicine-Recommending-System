import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { revealWords, staggerCards } from '../animations/gsap';

function HeroHeadline() {
  const words = ['Clearer', 'medicine', 'matches', 'for', 'real-world', 'care.'];
  return (
    <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-8xl text-balance">
      {words.map((word) => (
        <span key={word} data-word className="mr-4 inline-block">
          {word}
        </span>
      ))}
    </h1>
  );
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    revealWords(heroRef.current);
    staggerCards(featuresRef.current);
  }, []);

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 sm:px-6 lg:px-8">
      <section className="grid min-h-[100dvh] items-center gap-12 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-sand/70">
            Personalized medicine search, with live scores and saved history
          </div>
          <div ref={heroRef}>
            <HeroHeadline />
          </div>
          <p className="max-w-2xl text-lg leading-8 text-sand/74 text-balance">
            Search across thousands of medicines, compare alternatives with match scores, save what matters, and move through auth, history, and request flows without the UI getting in the way.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-sand">
              Get started
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm text-white transition duration-200 group-hover:translate-x-1">↗</span>
            </Link>
            <Link to="/search" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-sand transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">
              Browse medicines
            </Link>
          </div>
          <div className="grid max-w-2xl grid-cols-3 gap-3 pt-2 text-sm text-sand/70">
            {[
              ['9,700+', 'medicine names'],
              ['TF-IDF', 'ranked alternatives'],
              ['JWT', 'protected flows'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-semibold text-white">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-sand/55">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-shell rounded-[2.25rem] p-2 lg:translate-y-3">
          <div className="rounded-[2rem] bg-[#11182a] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Live snapshot</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">A search result that reads like a product, not a demo.</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm font-semibold text-white tabular-nums">97.4%</div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-sand/55">Searching for</div>
                <div className="mt-2 text-lg font-medium text-white">Acn...</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-sand/55">Condition</div>
                <div className="mt-2 text-lg font-medium text-white">Acne</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sand/72">
                Bookmark, compare, request, and review without leaving the app shell.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div ref={featuresRef} className="grid gap-4 lg:grid-cols-12">
          <article data-animate-card className="surface-shell rounded-[2rem] p-2 lg:col-span-7 lg:row-span-2">
            <div className="rounded-[1.65rem] bg-[#11182a] p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Search engine</p>
              <h3 className="mt-3 max-w-md text-3xl font-semibold text-white text-balance">Ranked alternatives with a score that explains itself.</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-sand/70">
                TF-IDF similarity is cached at startup, search results include match score percentages, and partial name matching still returns useful alternatives when users are imprecise.
              </p>
            </div>
          </article>
          <article data-animate-card className="surface-card rounded-[2rem] p-6 lg:col-span-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Security</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">JWT, rate limits, and clean server responses.</h3>
            <p className="mt-3 text-sm leading-7 text-sand/70">Authentication, requests, and admin actions stay behind token checks and server-side validation.</p>
          </article>
          <article data-animate-card className="surface-card rounded-[2rem] p-6 lg:col-span-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sand/55">Workflow</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">History, bookmarks, and requests live in one account.</h3>
            <p className="mt-3 text-sm leading-7 text-sand/70">The interface keeps state together so users do not have to rediscover their own activity.</p>
          </article>
        </div>
      </section>

      <footer className="mt-6 border-t border-white/10 pt-6 text-sm text-sand/55">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>Personalized Medicine Recommender</span>
          <div className="flex gap-4">
            <Link to="/login" className="transition hover:text-white">Login</Link>
            <Link to="/register" className="transition hover:text-white">Register</Link>
            <Link to="/conditions" className="transition hover:text-white">Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
