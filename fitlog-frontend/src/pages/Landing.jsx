import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Dumbbell, Utensils, LineChart, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navigation */}
      <header
        style={{
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          maxWidth: '1300px',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#032b1a',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Flame size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>FitLog.</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: '1100px', margin: '80px auto 60px', padding: '0 24px', textAlign: 'center' }}>
        <div
          className="badge badge-green"
          style={{ marginBottom: '20px', padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <Zap size={14} /> Full-Stack Fitness Engineering
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '24px'
          }}
        >
          Precision Tracking for{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Peak Athletic Form.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}
        >
          Log high-intensity workouts, balance daily calories in real-time, conquer weekly goals, and generate verified time-series analytics.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Start Tracking Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            Demo Sign In
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto 80px',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}
      >
        <div className="glass-card" style={{ padding: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            <Dumbbell size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Workout Architecture</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Track duration, calories burned, workout type, and notes. Filter by date ranges and search with debounce.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              color: 'var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            <Utensils size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Macro Nutrition</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Log meals with granular quantities, units, and calories. Instantly calculate daily energy surplus or deficit.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            <Target size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Goal Engine</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Set a weekly target of 1–14 workouts with live completion tallies, progress percentages, and streak tracking.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            <LineChart size={22} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Analytical Insights</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            Recharts-powered weekly timelines and idempotent summary generation with strict business rule validation.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          FitLog © 2026. Built with Spring Boot 4.1.1, Java 21, MySQL, and React.
        </p>
      </footer>
    </div>
  );
}
