import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import TallyMarks from './TallyMarks';

export default function TallyWeek({ target = 0, completed = 0, remaining = 0, percent = 0 }) {
  const isGoalSet = target > 0;
  const isGoalMet = isGoalSet && completed >= target;

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div className="page-eyebrow" style={{ marginBottom: 2 }}>Weekly Target</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>Workouts logged this week</div>
        </div>
        {isGoalMet && (
          <span className="badge badge-track" style={{ gap: 5 }}>
            <CheckCircle2 size={12} aria-hidden="true" /> Goal met!
          </span>
        )}
      </div>

      {isGoalSet ? (
        <>
          {/* Count */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span className="num" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--track)', lineHeight: 1 }}>
              {completed}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--ink-soft)', fontWeight: 500 }}>
              / {target} workouts
            </span>
            <span className="num" style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 600, color: isGoalMet ? 'var(--track)' : 'var(--ink-soft)' }}>
              {percent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-track" style={{ marginBottom: 16 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </div>

          {/* Tally marks */}
          <TallyMarks filled={completed} total={target} />

          <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginTop: 14 }}>
            {remaining > 0
              ? `${remaining} workout${remaining > 1 ? 's' : ''} left this week.`
              : 'Target achieved — keep the momentum!'}
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-soft)', marginBottom: 14 }}>
            No weekly goal set yet.
          </p>
          <Link to="/settings" className="btn btn-secondary btn-sm">
            Set Weekly Goal
          </Link>
        </div>
      )}
    </div>
  );
}
