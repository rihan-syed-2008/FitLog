import React from 'react';
import { Target, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TallyWeek({ target = 0, completed = 0, remaining = 0, percent = 0 }) {
  const isGoalSet = target > 0;
  const isGoalMet = isGoalSet && completed >= target;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--accent-purple)'
            }}
          >
            <Target size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Weekly Target</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>Workouts logged this week</p>
          </div>
        </div>

        {isGoalMet && (
          <span className="badge badge-green">
            <Trophy size={13} /> GOAL CRUSHED!
          </span>
        )}
      </div>

      {isGoalSet ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                {completed}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                / {target} workouts
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isGoalMet ? '#34d399' : 'var(--accent-purple)' }}>
              {percent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '10px',
              width: '100%',
              backgroundColor: '#0c1220',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '16px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, percent)}%`,
                background: isGoalMet
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #7c3aed, #a855f7)',
                borderRadius: '999px',
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>

          {/* Visual dots */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Array.from({ length: target }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: '28px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: i < completed ? 'rgba(16, 185, 129, 0.2)' : '#0c1220',
                  border: i < completed ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: i < completed ? '#34d399' : 'var(--text-dim)',
                  transition: 'all 0.2s ease'
                }}
              >
                {i < completed ? <Flame size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>}
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '14px' }}>
            {remaining > 0
              ? `${remaining} workout${remaining > 1 ? 's' : ''} left to hit your weekly goal.`
              : `Target achieved! Keep pushing your limits.`}
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
            No weekly workout goal set yet.
          </p>
          <Link to="/settings" className="btn btn-secondary" style={{ fontSize: '0.825rem' }}>
            Set Weekly Goal
          </Link>
        </div>
      )}
    </div>
  );
}
