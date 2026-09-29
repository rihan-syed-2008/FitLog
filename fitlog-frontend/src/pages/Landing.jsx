import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, LineChart, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      {/* Nav */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'var(--track)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
            aria-hidden="true"
          >
            <Dumbbell size={18} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--ink)'
            }}
          >
            FitLog
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Open Dashboard <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-tag" aria-hidden="true">
          <Dumbbell size={13} /> Training Log
        </div>

        <h1 className="landing-hero-title">
          Precision tracking for{' '}
          <span className="accent">peak athletic form.</span>
        </h1>

        <p className="landing-hero-desc">
          Log high-intensity workouts, balance daily calories in real-time, conquer weekly goals, and generate verified time-series analytics.
        </p>

        <div className="landing-cta">
          <Link to="/register" className="btn btn-primary" style={{ padding: '11px 24px', fontSize: '0.95rem' }}>
            Start Free <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '11px 24px', fontSize: '0.95rem' }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="landing-features" aria-label="Features">
        <div className="feature-card">
          <div className="feature-icon feature-icon-track" aria-hidden="true">
            <Dumbbell size={20} />
          </div>
          <h3 className="feature-title">Workout Architecture</h3>
          <p className="feature-desc">
            Track duration, calories burned, workout type, and notes. Filter by date ranges and search with 300 ms debounce.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon feature-icon-ochre" aria-hidden="true">
            <UtensilsCrossed size={20} />
          </div>
          <h3 className="feature-title">Macro Nutrition</h3>
          <p className="feature-desc">
            Log meals with granular quantities, units, and calories. Instantly calculate your daily energy surplus or deficit.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon feature-icon-neutral" aria-hidden="true">
            <Target size={20} />
          </div>
          <h3 className="feature-title">Goal Engine</h3>
          <p className="feature-desc">
            Set a weekly target of 1–14 workouts with live tally marks, completion percentages, and streak tracking.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon feature-icon-track" aria-hidden="true">
            <LineChart size={20} />
          </div>
          <h3 className="feature-title">Analytical Insights</h3>
          <p className="feature-desc">
            Recharts-powered weekly timelines and idempotent summary generation with strict business rule validation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>FitLog &copy; 2026 &mdash; Built with Spring Boot 4.1.1, Java 21, MySQL &amp; React.</p>
      </footer>
    </div>
  );
}
