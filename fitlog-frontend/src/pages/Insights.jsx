import React, { useState, useEffect } from 'react';
import { TrendingUp, History, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { summariesApi } from '../api/summaries';
import { goalsApi } from '../api/goals';
import TrendChart from '../components/TrendChart';
import WeeklySummaryList from '../components/WeeklySummaryList';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { getTodayString } from '../utils/dates';
import { getErrorMessage } from '../utils/errors';

export default function Insights() {
  const [trendData, setTrendData]   = useState([]);
  const [summaries, setSummaries]   = useState([]);
  const [goal, setGoal]             = useState(null);
  const [weeksCount, setWeeksCount] = useState(8);
  const [loading, setLoading]       = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState(getTodayString());
  const [feedback, setFeedback]     = useState(null); // { type: 'success'|'info'|'error', message }

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

  useEffect(() => { loadData(); }, [weeksCount]);

  const handleGenerateSummary = async () => {
    setGenLoading(true);
    setFeedback(null);
    try {
      const res = await summariesApi.generateWeeklySummary(selectedWeekDate);
      if (res.status === 201) {
        setFeedback({
          type: 'success',
          message: `Summary #${res.data.id} created — ${res.data.workoutsCompleted} workouts, ${res.data.mealsLogged} meals.`
        });
        toast.success('Weekly summary generated!');
      } else {
        setFeedback({
          type: 'info',
          message: `Existing summary #${res.data.id} retrieved (already calculated for this week).`
        });
      }
      await loadData();
    } catch (err) {
      const msg = getErrorMessage(err);
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setGenLoading(false);
    }
  };

  if (loading && trendData.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Spinner size="lg" />
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>Crunching your metrics…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Analytics & Metrics</div>
          <h1 className="page-title">Insights</h1>
        </div>

        {/* Week range selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 500 }}>Range:</span>
          {[4, 8, 12, 26].map((w) => (
            <button
              key={w}
              onClick={() => setWeeksCount(w)}
              className={`week-pill${weeksCount === w ? ' active' : ''}`}
              aria-pressed={weeksCount === w}
            >
              {w}w
            </button>
          ))}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={
            feedback.type === 'success' ? 'feedback-success'
            : feedback.type === 'info'  ? 'feedback-info'
            : 'error-banner'
          }
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.type === 'success' && <CheckCircle2 size={16} aria-hidden="true" />}
          {feedback.type === 'error'   && <AlertCircle  size={16} aria-hidden="true" />}
          {feedback.type === 'info'    && <Info         size={16} aria-hidden="true" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Trend chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="activity-icon activity-icon-track" aria-hidden="true">
              <TrendingUp size={17} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>
                Weekly Workout Frequency
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--ink-soft)' }}>
                Completed vs target over {weeksCount} weeks
              </p>
            </div>
          </div>
          {goal && (
            <span className="badge badge-ochre">
              Goal: {goal.weeklyWorkoutTarget} / week
            </span>
          )}
        </div>
        <TrendChart data={trendData} goalTarget={goal?.weeklyWorkoutTarget || 0} />
      </div>

      {/* Generate summary */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              Generate Weekly Summary
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
              Seals a weekly report enforcing business rules (BR8, BR9, BR10).
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="date"
              className="field-input"
              style={{ width: 'auto' }}
              value={selectedWeekDate}
              onChange={(e) => setSelectedWeekDate(e.target.value)}
              aria-label="Select week date for summary"
            />
            <Button variant="primary" onClick={handleGenerateSummary} loading={genLoading} icon={RefreshCw}>
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Historical summaries */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div className="activity-icon activity-icon-track" aria-hidden="true">
            <History size={17} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>
              Historical Weekly Records
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--ink-soft)' }}>
              Permanently archived performance summaries
            </p>
          </div>
        </div>
        <WeeklySummaryList summaries={summaries} />
      </div>
    </div>
  );
}
