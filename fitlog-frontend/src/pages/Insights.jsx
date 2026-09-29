import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  History
} from 'lucide-react';
import { summariesApi } from '../api/summaries';
import { goalsApi } from '../api/goals';
import TrendChart from '../components/TrendChart';
import WeeklySummaryList from '../components/WeeklySummaryList';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { getTodayString } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';

export default function Insights() {
  const [trendData, setTrendData] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [goal, setGoal] = useState(null);
  const [weeksCount, setWeeksCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState(getTodayString());
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const loadData = async () => {
    setLoading(true);
    try {
      const [trend, summaryList, currentGoal] = await Promise.all([
        summariesApi.getWeeklyTrend(weeksCount),
        summariesApi.getWeeklySummaries(),
        goalsApi.getCurrentGoal()
      ]);

      setTrendData(trend || []);
      setSummaries(summaryList || []);
      setGoal(currentGoal);
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [weeksCount]);

  const handleGenerateSummary = async () => {
    setGenLoading(true);
    setFeedback(null);
    try {
      const res = await summariesApi.generateWeeklySummary(selectedWeekDate);
      if (res.status === 201) {
        setFeedback({
          type: 'success',
          message: `Success! New weekly summary #${res.data.id} generated (${res.data.workoutsCompleted} workouts, ${res.data.mealsLogged} meals).`
        });
      } else {
        setFeedback({
          type: 'info',
          message: `Existing summary #${res.data.id} retrieved (already calculated for this week).`
        });
      }
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setGenLoading(false);
    }
  };

  if (loading && trendData.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '16px', color: 'var(--text-dim)' }}>Crunching your performance metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              ANALYTICS & METRICS
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Performance Insights
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Trend Range:</span>
          {[4, 8, 12, 26].map((w) => (
            <button
              key={w}
              onClick={() => setWeeksCount(w)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: weeksCount === w ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                backgroundColor: weeksCount === w ? 'rgba(6, 182, 212, 0.15)' : '#0c1220',
                color: weeksCount === w ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {w}w
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              feedback.type === 'success'
                ? 'rgba(16, 185, 129, 0.1)'
                : feedback.type === 'error'
                ? 'rgba(244, 63, 94, 0.1)'
                : 'rgba(6, 182, 212, 0.1)',
            border:
              feedback.type === 'success'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : feedback.type === 'error'
                ? '1px solid rgba(244, 63, 94, 0.3)'
                : '1px solid rgba(6, 182, 212, 0.3)',
            color:
              feedback.type === 'success'
                ? '#34d399'
                : feedback.type === 'error'
                ? '#fb7185'
                : '#38bdf8',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {feedback.type === 'success' && <CheckCircle2 size={18} />}
          {feedback.type === 'error' && <AlertCircle size={18} />}
          {feedback.type === 'info' && <RefreshCw size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Recharts Trend Chart Widget */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--accent-green)'
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Weekly Workout Frequency</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                Comparing completed sessions against target goal across {weeksCount} weeks
              </p>
            </div>
          </div>

          {goal && (
            <span className="badge badge-purple">
              Active Goal: {goal.weeklyWorkoutTarget} / week
            </span>
          )}
        </div>

        <TrendChart data={trendData} goalTarget={goal?.weeklyWorkoutTarget || 0} />
      </div>

      {/* Weekly Summary Generator Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="var(--accent-green)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Generate Official Weekly Summary</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Computes and seals a weekly report enforcing business rules (BR8, BR9, BR10).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="date"
              className="glass-input"
              style={{ width: 'auto' }}
              value={selectedWeekDate}
              onChange={(e) => setSelectedWeekDate(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={handleGenerateSummary}
              loading={genLoading}
              icon={RefreshCw}
            >
              Generate Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Historical Stored Summaries */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent-cyan)'
            }}
          >
            <History size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Historical Weekly Records</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
              Permanently archived weekly performance summaries
            </p>
          </div>
        </div>

        <WeeklySummaryList summaries={summaries} />
      </div>
    </div>
  );
}
