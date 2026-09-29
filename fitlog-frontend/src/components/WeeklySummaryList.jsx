import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatDatePretty } from '../utils/dates';
import { formatCalories } from '../utils/format';

export default function WeeklySummaryList({ summaries = [] }) {
  if (!summaries || summaries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
        No weekly summaries generated yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {summaries.map((summary) => {
        const isGoalMet = summary.goalMet;
        const netNegative = summary.netCalories < 0;

        return (
          <div key={summary.id} className="card card-sm">
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)' }}>
                {formatDatePretty(summary.weekStart)} — {formatDatePretty(summary.weekEnd)}
              </span>

              {summary.goalTarget > 0 ? (
                isGoalMet ? (
                  <span className="badge badge-track">
                    <CheckCircle2 size={11} aria-hidden="true" />
                    Goal Met ({summary.workoutsCompleted}/{summary.goalTarget})
                  </span>
                ) : (
                  <span className="badge badge-ochre">
                    <XCircle size={11} aria-hidden="true" />
                    Target Missed ({summary.workoutsCompleted}/{summary.goalTarget})
                  </span>
                )
              ) : (
                <span className="badge badge-neutral">
                  {summary.workoutsCompleted} Workouts
                </span>
              )}
            </div>

            {/* Metrics ledger */}
            <div className="ledger-row">
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 500 }}>Workouts</span>
              <span className="num" style={{ fontWeight: 700, color: 'var(--track)' }}>
                {summary.workoutsCompleted} logged
              </span>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 500 }}>Meals</span>
              <span className="num" style={{ fontWeight: 700, color: 'var(--ochre)' }}>
                {summary.mealsLogged} logged
              </span>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 500 }}>Net Calories</span>
              <span className="num" style={{ fontWeight: 700, color: netNegative ? 'var(--track)' : 'var(--ochre)' }}>
                {summary.netCalories > 0 ? `+${summary.netCalories}` : summary.netCalories} kcal
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
