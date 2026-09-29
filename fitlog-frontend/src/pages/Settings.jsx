import React, { useState, useEffect } from 'react';
import { Target, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { goalsApi } from '../api/goals';
import Field from '../components/ui/Field';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { getErrorMessage } from '../utils/errors';

export default function Settings() {
  const { user, logout } = useAuth();
  const [weeklyTarget, setWeeklyTarget] = useState(4);
  const [loading, setLoading]           = useState(true);
  const [savingGoal, setSavingGoal]     = useState(false);

  useEffect(() => {
    async function fetchGoal() {
      try {
        const current = await goalsApi.getCurrentGoal();
        if (current?.weeklyWorkoutTarget) {
          setWeeklyTarget(current.weeklyWorkoutTarget);
        }
      } catch {
        // No goal yet — ignore
      } finally {
        setLoading(false);
      }
    }
    fetchGoal();
  }, []);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const val = Number(weeklyTarget);
    if (!val || val < 1 || val > 14) {
      toast.error('Weekly goal must be between 1 and 14 workouts.');
      return;
    }
    setSavingGoal(true);
    try {
      await goalsApi.upsertGoal(val);
      toast.success(`Weekly goal set to ${val} workout${val > 1 ? 's' : ''} per week.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Spinner size="lg" />
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 720 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <div className="page-eyebrow">Preferences & Account</div>
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Weekly goal card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="activity-icon activity-icon-track" aria-hidden="true">
            <Target size={17} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>
              Weekly Workout Target
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
              How many workouts do you aim to complete each week? (1–14)
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGoal} style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <Field
              label="Workouts per week"
              type="number"
              min="1"
              max="14"
              value={weeklyTarget}
              onChange={(e) => setWeeklyTarget(e.target.value)}
              helperText="Range 1–14"
              required
            />
          </div>
          <Button type="submit" variant="primary" loading={savingGoal}>
            Save Target
          </Button>
        </form>
      </div>

      {/* Profile card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="activity-icon activity-icon-ochre" aria-hidden="true">
            <User size={17} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>
              Profile
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
              Your account identity stored in the FitLog database.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div className="stat-tile">
            <div className="stat-tile-label">Full Name</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--ink)', marginTop: 4 }}>
              {user?.fullName || 'N/A'}
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Email</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', marginTop: 4, wordBreak: 'break-all' }}>
              {user?.email || 'N/A'}
            </div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label">Role</div>
            <div style={{ marginTop: 6 }}>
              <span className="badge badge-track">{user?.role || 'USER'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink)' }}>
            Sign Out
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: 2 }}>
            Clears your active JWT session from this browser.
          </p>
        </div>
        <Button variant="danger" onClick={logout} icon={LogOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
