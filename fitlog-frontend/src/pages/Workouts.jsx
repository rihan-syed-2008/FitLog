import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Flame,
  Trash2,
  Edit2
} from 'lucide-react';
import { workoutsApi } from '../api/workouts';
import { useDebounce } from '../hooks/useDebounce';
import SlideOver from '../components/ui/SlideOver';
import WorkoutForm from '../components/WorkoutForm';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatDatePretty } from '../utils/dates';
import { formatCalories, formatDuration, formatWorkoutType } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Drawer form states
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 8,
        search: debouncedSearch || undefined,
        workoutType: typeFilter || undefined,
        date: dateFilter || undefined
      };
      const res = await workoutsApi.getWorkouts(params);
      setWorkouts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [page, debouncedSearch, typeFilter, dateFilter]);

  const handleOpenCreate = () => {
    setEditingWorkout(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (workout) => {
    setEditingWorkout(workout);
    setIsSlideOverOpen(true);
  };

  const handleSubmitForm = async (data) => {
    setFormLoading(true);
    try {
      if (editingWorkout) {
        await workoutsApi.updateWorkout(editingWorkout.id, data);
      } else {
        await workoutsApi.createWorkout(data);
      }
      setIsSlideOverOpen(false);
      setEditingWorkout(null);
      await fetchWorkouts();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    try {
      await workoutsApi.deleteWorkout(id);
      await fetchWorkouts();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>
              TRAINING LOG
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Workouts
          </h1>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} icon={Plus}>
          Log Workout
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search workout notes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="glass-input"
            style={{ cursor: 'pointer', backgroundColor: '#0c1220' }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Workout Types</option>
            <option value="RUNNING">Running</option>
            <option value="WALKING">Walking</option>
            <option value="CYCLING">Cycling</option>
            <option value="SWIMMING">Swimming</option>
            <option value="STRENGTH">Strength</option>
            <option value="YOGA">Yoga</option>
            <option value="HIIT">HIIT</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ minWidth: '160px' }}>
          <input
            type="date"
            className="glass-input"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>

        {(searchTerm || typeFilter || dateFilter) && (
          <Button
            variant="ghost"
            style={{ fontSize: '0.825rem' }}
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setDateFilter('');
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185'
          }}
        >
          {error}
        </div>
      )}

      {/* Workout Grid / List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Loading workouts...</p>
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts found"
          description={
            searchTerm || typeFilter || dateFilter
              ? 'No sessions match your search filters.'
              : 'You haven’t logged any workouts yet. Time to crush a session!'
          }
          actionText={!searchTerm && !typeFilter && !dateFilter ? 'Log Your First Workout' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {workouts.map((w) => (
            <div
              key={w.id}
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-green">
                    {formatWorkoutType(w.workoutType)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {formatDatePretty(w.workoutDate)}
                  </span>
                </div>

                {w.notes ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '6px', lineHeight: 1.5 }}>
                    {w.notes}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '6px' }}>
                    No notes recorded
                  </p>
                )}
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '10px 14px',
                    backgroundColor: '#0c1220',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {formatDuration(w.durationMinutes)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={15} color="var(--accent-green)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
                      {formatCalories(w.caloriesBurnt)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(w)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      borderRadius: '6px',
                      color: '#fb7185',
                      cursor: 'pointer',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Form Drawer */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingWorkout ? 'Edit Workout' : 'Log New Workout'}
      >
        <WorkoutForm
          initialData={editingWorkout}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsSlideOverOpen(false)}
          loading={formLoading}
        />
      </SlideOver>
    </div>
  );
}
