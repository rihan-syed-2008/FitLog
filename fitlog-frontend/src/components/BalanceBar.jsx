import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { formatCalories } from '../utils/format';

export default function BalanceBar({ caloriesIn = 0, caloriesOut = 0, netCalories = 0, balance = 'BALANCED' }) {
  const total = (caloriesIn || 0) + (caloriesOut || 0);
  const inPercent = total > 0 ? Math.round((caloriesIn / total) * 100) : 50;
  const outPercent = total > 0 ? 100 - inPercent : 50;

  const isDeficit = balance === 'DEFICIT';
  const isSurplus = balance === 'SURPLUS';

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent-cyan)'
            }}
          >
            <Scale size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Energy Balance</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>Today's net intake vs expenditure</p>
          </div>
        </div>

        <span
          className={`badge ${
            isDeficit ? 'badge-green' : isSurplus ? 'badge-orange' : 'badge-cyan'
          }`}
          style={{ fontSize: '0.8rem', padding: '5px 12px' }}
        >
          {balance} ({netCalories > 0 ? `+${netCalories}` : netCalories} kcal)
        </span>
      </div>

      {/* Progress Split Bar */}
      <div
        style={{
          height: '14px',
          width: '100%',
          backgroundColor: '#0c1220',
          borderRadius: '999px',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            width: `${inPercent}%`,
            background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          title={`Intake: ${caloriesIn} kcal (${inPercent}%)`}
        />
        <div
          style={{
            width: `${outPercent}%`,
            background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          title={`Burned: ${caloriesOut} kcal (${outPercent}%)`}
        />
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#0c1220',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowDownLeft size={14} color="#f97316" /> CALORIES IN
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb923c', marginTop: '2px' }}>
              {formatCalories(caloriesIn)}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#0c1220',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight size={14} color="#10b981" /> CALORIES BURNED
            </span>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
              {formatCalories(caloriesOut)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
