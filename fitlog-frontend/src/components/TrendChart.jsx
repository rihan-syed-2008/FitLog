import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { formatDatePretty } from '../utils/dates';

export default function TrendChart({ data = [], goalTarget = 0 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
        No trend data available.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    ...item,
    formattedWeek: formatDatePretty(item.weekStart),
    goal: item.goalTarget || goalTarget || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: '#0c1220',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
            Week of {point.formattedWeek}
          </p>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
            Workouts Completed: {point.workoutsCompleted}
          </p>
          {point.goal > 0 && (
            <p style={{ fontSize: '0.85rem', color: '#a78bfa' }}>
              Target: {point.goal} workouts
            </p>
          )}
          {point.totalCaloriesIn > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#fb923c', marginTop: '4px' }}>
              Intake: {point.totalCaloriesIn} kcal
            </p>
          )}
          {point.totalCaloriesOut > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
              Burned: {point.totalCaloriesOut} kcal
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
          <XAxis
            dataKey="formattedWeek"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            allowDecimals={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{value}</span>}
          />
          {goalTarget > 0 && (
            <ReferenceLine
              y={goalTarget}
              stroke="#8b5cf6"
              strokeDasharray="4 4"
              label={{ value: 'Target', fill: '#a78bfa', fontSize: 12, position: 'right' }}
            />
          )}
          <Bar
            dataKey="workoutsCompleted"
            name="Workouts Completed"
            fill="url(#workoutBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />
          <Line
            type="monotone"
            dataKey="goal"
            name="Weekly Goal"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6' }}
          />
          <defs>
            <linearGradient id="workoutBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
