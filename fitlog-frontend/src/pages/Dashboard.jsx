import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell, UtensilsCrossed, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { summariesApi } from '../api/summaries';
import { goalsApi } from '../api/goals';
import { workoutsApi } from '../api/workouts';
import { mealsApi } from '../api/meals';
import BalanceBar from '../components/BalanceBar';
import TallyWeek from '../components/TallyWeek';
import SlideOver from '../components/ui/SlideOver';
import WorkoutForm from '../components/WorkoutForm';
import MealForm from '../components/MealForm';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ActivityIcon from '../components/icons/ActivityIcon';
import { getTodayString, formatDatePretty } from '../utils/dates';
import { formatCalories, formatDuration, formatWorkoutType } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export default function Dashboard() {
  const { user } = useAuth();
  const [daily, setDaily]           = useState(null);
  const [progress, setProgress]     = useState(null);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [mealOpen, setMealOpen]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const today = getTodayString();

  const loadData = async () => {
    try {
      setError('');
      const [dailyData, progressData, workoutsData, mealsData] = await Promise.all([
        summariesApi.getDailySummary(today),
        goalsApi.getProgress(),
        workoutsApi.getWorkouts({ date: today, size: 5 }),
        mealsApi.getMeals({ date: today, size: 5 })
      ]);
      setDaily(dailyData);
      setProgress(progressData);
      setTodayWorkouts(workoutsData.content || []);
      setTodayMeals(mealsData.content || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddWorkout = async (data) => {
    setActionLoading(true);
    try {
      await workoutsApi.createWorkout(data);
      setWorkoutOpen(false);
      toast.success('Workout logged!');
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMeal = async (data) => {
    setActionLoading(true);
    try {
      await mealsApi.createMeal(data);
      setMealOpen(false);
      toast.success('Meal logged!');
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Spinner size="lg" />
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Today's Overview · {formatDatePretty(today)}</div>
          <h1 className="page-title">
            Good day, {user?.fullName?.split(' ')[0] || 'Athlete'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => setMealOpen(true)} icon={Plus}>
            Log Meal
          </Button>
          <Button variant="primary" onClick={() => setWorkoutOpen(true)} icon={Plus}>
            Log Workout
          </Button>
        </div>
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}

      {/* Widgets row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <BalanceBar
          caloriesIn={daily?.caloriesIn || 0}
          caloriesOut={daily?.caloriesOut || 0}
          netCalories={daily?.netCalories || 0}
          balance={daily?.balance || 'BALANCED'}
        />
        <TallyWeek
          target={progress?.target || 0}
          completed={progress?.completed || 0}
          remaining={progress?.remaining || 0}
          percent={progress?.percent || 0}
        />
      </div>

      {/* Today's activity tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Workouts */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dumbbell size={16} color="var(--track)" aria-hidden="true" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>
                Today's Workouts
              </h3>
            </div>
            <Link
              to="/workouts"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--track)', textDecoration: 'none', fontWeight: 600 }}
            >
              View all <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {todayWorkouts.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
              No workouts logged yet — ready to sweat?
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayWorkouts.map((w) => (
                <div key={w.id} className="activity-row">
                  <div className="activity-icon activity-icon-track" aria-hidden="true">
                    <ActivityIcon type={w.workoutType} size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>
                      {formatWorkoutType(w.workoutType)}
                    </p>
                    {w.notes && (
                      <p style={{ fontSize: '0.775rem', color: 'var(--ink-soft)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="num" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--track)' }}>
                      {formatCalories(w.caloriesBurnt)}
                    </p>
                    <p className="num" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                      {formatDuration(w.durationMinutes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meals */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UtensilsCrossed size={16} color="var(--ochre)" aria-hidden="true" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink)' }}>
                Today's Nutrition
              </h3>
            </div>
            <Link
              to="/meals"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--ochre)', textDecoration: 'none', fontWeight: 600 }}
            >
              View all <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {todayMeals.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
              No meals logged yet — fuel your body!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayMeals.map((m) => (
                <div key={m.id} className="activity-row">
                  <div className="activity-icon activity-icon-ochre" aria-hidden="true">
                    <UtensilsCrossed size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.foodItem}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--ink-soft)', marginTop: 1 }}>
                      {m.quantity} {m.quantityUnit?.toLowerCase()} · {m.mealType?.toLowerCase()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="num" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ochre)' }}>
                      {formatCalories(m.calories)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-overs */}
      <SlideOver isOpen={workoutOpen} onClose={() => setWorkoutOpen(false)} title="Log Workout">
        <WorkoutForm onSubmit={handleAddWorkout} onCancel={() => setWorkoutOpen(false)} loading={actionLoading} />
      </SlideOver>
      <SlideOver isOpen={mealOpen} onClose={() => setMealOpen(false)} title="Log Meal">
        <MealForm onSubmit={handleAddMeal} onCancel={() => setMealOpen(false)} loading={actionLoading} />
      </SlideOver>
    </div>
  );
}
