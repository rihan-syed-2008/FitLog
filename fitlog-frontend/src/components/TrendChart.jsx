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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div
      style={{
        background: 'var(--paper-raised)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(27,37,33,0.12)',
        fontFamily: 'var(--font-ui)',
        fontSize: '0.85rem',
        minWidth: 160
      }}
    >
      <p style={{ color: 'var(--ink-soft)', marginBottom: 6 }}>
        Week of {point.formattedWeek}
      </p>
      <p style={{ fontWeight: 700, color: 'var(--track)' }}>
        Workouts: {point.workoutsCompleted}
      </p>
      {point.goal > 0 && (
        <p style={{ color: 'var(--ochre)', marginTop: 2 }}>
          Target: {point.goal}
        </p>
      )}
      {point.totalCaloriesIn > 0 && (
        <p style={{ color: 'var(--ochre)', marginTop: 2 }}>
          Intake: {point.totalCaloriesIn} kcal
        </p>
      )}
      {point.totalCaloriesOut > 0 && (
        <p style={{ color: 'var(--track)', marginTop: 2 }}>
          Burned: {point.totalCaloriesOut} kcal
        </p>
      )}
    </div>
  );
};

export default function TrendChart({ data = [], goalTarget = 0 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-soft)' }}>
        No trend data available yet.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    formattedWeek: formatDatePretty(item.weekStart),
    goal: item.goalTarget || goalTarget || 0
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 16, right: 16, bottom: 16, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="formattedWeek"
            stroke="var(--rule)"
            tick={{ fill: 'var(--ink-soft)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--rule)"
            tick={{ fill: 'var(--ink-soft)', fontSize: 11, fontFamily: 'var(--font-ui)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 8 }}
            formatter={(value) => (
              <span style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', fontFamily: 'var(--font-ui)' }}>
                {value}
              </span>
            )}
          />
          {goalTarget > 0 && (
            <ReferenceLine
              y={goalTarget}
              stroke="var(--ochre)"
              strokeDasharray="5 4"
              label={{
                value: 'Goal',
                fill: 'var(--ochre)',
                fontSize: 11,
                fontFamily: 'var(--font-ui)',
                position: 'right'
              }}
            />
          )}
          <Bar
            dataKey="workoutsCompleted"
            name="Workouts"
            fill="var(--track)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            opacity={0.85}
          />
          <Line
            type="monotone"
            dataKey="goal"
            name="Target"
            stroke="var(--ochre)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--ochre)', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
