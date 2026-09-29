import React, { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Dumbbell,
  Utensils,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { getTodayString, formatDatePretty } from '../utils/dates';
import { formatCalories, formatDuration, formatWorkoutType } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export default function Dashboard() {
  const { user } = useAuth();
  const [daily, setDaily] = useState(null);
  const [progress, setProgress] = useState(null);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals / Slideovers
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const today = getTodayString();

  const loadDashboardData = async () => {
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddWorkout = async (data) => {
    setActionLoading(true);
    try {
      await workoutsApi.createWorkout(data);
      setWorkoutModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMeal = async (data) => {
    setActionLoading(true);
    try {
      await mealsApi.createMeal(data);
      setMealModalOpen(false);
      await loadDashboardData();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '16px', color: 'var(--text-dim)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Top Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TODAY'S OVERVIEW
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              {formatDatePretty(today)}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Hey, {user?.fullName || 'Athlete'} 👋
          </h1>
        </div>

        {/* Quick Add Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setMealModalOpen(true)} icon={Plus}>
            Log Meal
          </Button>
          <Button variant="primary" onClick={() => setWorkoutModalOpen(true)} icon={Plus}>
            Log Workout
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.9rem'
          }}
        >
          {error}
        </div>
      )}

      {/* Top Two Main Widgets: Calorie Balance + Weekly Goal Tally */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
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

      {/* Today's Activity Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Today's Workouts */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dumbbell size={18} color="var(--accent-green)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Today's Workouts</h3>
            </div>
            <Link to="/workouts" style={{ fontSize: '0.8rem', color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>
              View all <ArrowRight size={12} style={{ display: 'inline' }} />
            </Link>
          </div>

          {todayWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              No workouts logged today yet. Ready to sweat?
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayWorkouts.map((w) => (
                <div
                  key={w.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#0c1220',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {formatWorkoutType(w.workoutType)}
                    </p>
                    {w.notes && (
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {w.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#34d399' }}>
                      {formatCalories(w.caloriesBurnt)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {formatDuration(w.durationMinutes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Meals */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={18} color="var(--accent-orange)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Today's Nutrition</h3>
            </div>
            <Link to="/meals" style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600 }}>
              View all <ArrowRight size={12} style={{ display: 'inline' }} />
            </Link>
          </div>

          {todayMeals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              No meals logged today yet. Fuel your body!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayMeals.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: '#0c1220',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {m.foodItem}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {m.quantity} {m.quantityUnit?.toLowerCase()} • {m.mealType?.toLowerCase()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fb923c' }}>
                      {formatCalories(m.calories)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SlideOvers for Quick Add */}
      <SlideOver
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
        title="Log New Workout"
      >
        <WorkoutForm
          onSubmit={handleAddWorkout}
          onCancel={() => setWorkoutModalOpen(false)}
          loading={actionLoading}
        />
      </SlideOver>

      <SlideOver
        isOpen={mealModalOpen}
        onClose={() => setMealModalOpen(false)}
        title="Log New Meal"
      >
        <MealForm
          onSubmit={handleAddMeal}
          onCancel={() => setMealModalOpen(false)}
          loading={actionLoading}
        />
      </SlideOver>
    </div>
  );
}
