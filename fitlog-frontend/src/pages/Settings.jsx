import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Target, User, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { goalsApi } from '../api/goals';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { getErrorMessage } from '../utils/errors';

export default function Settings() {
  const { user, logout } = useAuth();
  const [weeklyTarget, setWeeklyTarget] = useState(4);
  const [loading, setLoading] = useState(true);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalFeedback, setGoalFeedback] = useState(null);

  useEffect(() => {
    async function fetchGoal() {
      try {
        const current = await goalsApi.getCurrentGoal();
        if (current && current.weeklyWorkoutTarget) {
          setWeeklyTarget(current.weeklyWorkoutTarget);
        }
      } catch (err) {
        // Goal might not exist yet
      } finally {
        setLoading(false);
      }
    }
    fetchGoal();
  }, []);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setGoalFeedback(null);

    const val = Number(weeklyTarget);
    if (!val || val < 1 || val > 14) {
      setGoalFeedback({
        type: 'error',
        message: 'Goal must be between 1 and 14 workouts per week.'
      });
      return;
    }

    setSavingGoal(true);
    try {
      await goalsApi.upsertGoal(val);
      setGoalFeedback({
        type: 'success',
        message: `Weekly goal updated to ${val} workout${val > 1 ? 's' : ''} per week!`
      });
    } catch (err) {
      setGoalFeedback({
        type: 'error',
        message: getErrorMessage(err)
      });
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '16px', color: 'var(--text-dim)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase' }}>
            PREFERENCES & ACCOUNT
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
      </div>

      {/* Goal Configuration Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--accent-purple)'
            }}
          >
            <Target size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Weekly Workout Target</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
              Configure how many workouts you aim to complete each week (1–14).
            </p>
          </div>
        </div>

        {goalFeedback && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '18px',
              backgroundColor: goalFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: goalFeedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
              color: goalFeedback.type === 'success' ? '#34d399' : '#fb7185',
              fontSize: '0.875rem'
            }}
          >
            {goalFeedback.message}
          </div>
        )}

        <form onSubmit={handleSaveGoal} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Field
              label="Workouts per week"
              type="number"
              min="1"
              max="14"
              value={weeklyTarget}
              onChange={(e) => setWeeklyTarget(e.target.value)}
              helperText="Allowed range: 1 to 14"
              required
            />
          </div>
          <Button type="submit" variant="primary" loading={savingGoal}>
            Save Target
          </Button>
        </form>
      </div>

      {/* User Profile Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)'
            }}
          >
            <User size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Profile Information</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
              Your account identity stored in the FitLog database
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: '#0c1220', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>FULL NAME</span>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {user?.fullName || 'N/A'}
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#0c1220', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>EMAIL ADDRESS</span>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {user?.email || 'N/A'}
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#0c1220', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>SYSTEM ROLE</span>
            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-green">{user?.role || 'USER'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Sign Out of FitLog</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Clears your active JWT session from this browser.</p>
        </div>
        <Button variant="danger" onClick={logout} icon={LogOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
