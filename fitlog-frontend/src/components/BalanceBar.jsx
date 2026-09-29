import React from 'react';
import { formatCalories } from '../utils/format';

export default function BalanceBar({
  caloriesIn = 0,
  caloriesOut = 0,
  netCalories = 0,
  balance = 'BALANCED'
}) {
  const total = (caloriesIn || 0) + (caloriesOut || 0);
  const inPercent  = total > 0 ? Math.round((caloriesIn  / total) * 100) : 50;
  const outPercent = total > 0 ? 100 - inPercent : 50;

  const isDeficit = balance === 'DEFICIT';
  const isSurplus = balance === 'SURPLUS';

  const netLabel = netCalories > 0 ? `+${netCalories}` : String(netCalories);

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div className="page-eyebrow" style={{ marginBottom: 2 }}>Energy Balance</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>Today's intake vs expenditure</div>
        </div>
        <span
          className={`badge ${isDeficit ? 'badge-track' : isSurplus ? 'badge-ochre' : 'badge-neutral'}`}
        >
          {balance} {netLabel} kcal
        </span>
      </div>

      {/* Split bar */}
      <div className="balance-track" style={{ marginBottom: 18 }}>
        <div
          className="balance-track-ochre"
          style={{ width: `${inPercent}%` }}
          title={`Intake: ${caloriesIn} kcal (${inPercent}%)`}
        />
        <div
          className="balance-track-green"
          style={{ width: `${outPercent}%` }}
          title={`Burned: ${caloriesOut} kcal (${outPercent}%)`}
        />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="stat-tile stat-tile-ochre">
          <div className="stat-tile-label">Calories In</div>
          <div className="stat-tile-value num">{formatCalories(caloriesIn)}</div>
        </div>
        <div className="stat-tile stat-tile-track">
          <div className="stat-tile-label">Calories Burned</div>
          <div className="stat-tile-value num">{formatCalories(caloriesOut)}</div>
        </div>
      </div>
    </div>
  );
}
