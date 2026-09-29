import React from 'react';
import { Calendar, CheckCircle2, XCircle, Dumbbell, Utensils, Flame } from 'lucide-react';
import { formatDatePretty } from '../utils/dates';
import { formatCalories } from '../utils/format';

export default function WeeklySummaryList({ summaries = [] }) {
  if (!summaries || summaries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)' }}>
        No weekly summaries generated yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {summaries.map((summary) => {
        const isGoalMet = summary.goalMet;
        const netDeficit = summary.netCalories < 0;

        return (
          <div
            key={summary.id}
            style={{
              padding: '18px 20px',
              backgroundColor: '#0c1220',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {formatDatePretty(summary.weekStart)} — {formatDatePretty(summary.weekEnd)}
                </span>
              </div>

              <div>
                {summary.goalTarget > 0 ? (
                  isGoalMet ? (
                    <span className="badge badge-green">
                      <CheckCircle2 size={13} /> Goal Met ({summary.workoutsCompleted}/{summary.goalTarget})
                    </span>
                  ) : (
                    <span className="badge badge-orange">
                      <XCircle size={13} /> Target Missed ({summary.workoutsCompleted}/{summary.goalTarget})
                    </span>
                  )
                ) : (
                  <span className="badge badge-cyan">
                    {summary.workoutsCompleted} Workouts
                  </span>
                )}
              </div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                  <Dumbbell size={13} color="var(--accent-green)" /> WORKOUTS
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#34d399', marginTop: '2px' }}>
                  {summary.workoutsCompleted} logged
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                  <Utensils size={13} color="var(--accent-orange)" /> MEALS
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fb923c', marginTop: '2px' }}>
                  {summary.mealsLogged} logged
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
                  <Flame size={13} color="var(--accent-cyan)" /> NET CALORIES
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: netDeficit ? '#34d399' : '#fb923c',
                    marginTop: '2px'
                  }}
                >
                  {summary.netCalories > 0 ? `+${summary.netCalories}` : summary.netCalories} kcal
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
