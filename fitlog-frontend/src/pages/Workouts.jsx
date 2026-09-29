import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Search, Calendar, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { workoutsApi } from '../api/workouts';
import { useDebounce } from '../hooks/useDebounce';
import SlideOver from '../components/ui/SlideOver';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import WorkoutForm from '../components/WorkoutForm';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ActivityIcon from '../components/icons/ActivityIcon';
import { formatDatePretty } from '../utils/dates';
import { formatCalories, formatDuration, formatWorkoutType } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

const WORKOUT_TYPE_OPTIONS = [
  { value: '',         label: 'All Types' },
  { value: 'RUNNING',  label: 'Running' },
  { value: 'WALKING',  label: 'Walking' },
  { value: 'CYCLING',  label: 'Cycling' },
  { value: 'SWIMMING', label: 'Swimming' },
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'YOGA',     label: 'Yoga' },
  { value: 'HIIT',     label: 'HIIT' },
  { value: 'OTHER',    label: 'Other' }
];

export default function Workouts() {
  const [workouts, setWorkouts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm]   = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [dateFilter, setDateFilter]   = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formLoading, setFormLoading]     = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workoutsApi.getWorkouts({
        page,
        size: 8,
        search: debouncedSearch || undefined,
        workoutType: typeFilter || undefined,
        date: dateFilter || undefined
      });
      setWorkouts(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkouts(); }, [page, debouncedSearch, typeFilter, dateFilter]);

  const openCreate = () => { setEditingWorkout(null); setSlideOverOpen(true); };
  const openEdit   = (w) => { setEditingWorkout(w);   setSlideOverOpen(true); };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingWorkout) {
        await workoutsApi.updateWorkout(editingWorkout.id, data);
        toast.success('Workout updated!');
      } else {
        await workoutsApi.createWorkout(data);
        toast.success('Workout logged!');
      }
      setSlideOverOpen(false);
      setEditingWorkout(null);
      await fetchWorkouts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const requestDelete = (id) => { setDeletingId(id); setConfirmOpen(true); };

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      await workoutsApi.deleteWorkout(deletingId);
      toast.success('Workout deleted.');
      await fetchWorkouts();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => { setSearchTerm(''); setTypeFilter(''); setDateFilter(''); setPage(0); };
  const hasFilters = searchTerm || typeFilter || dateFilter;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Training Log</div>
          <h1 className="page-title">Workouts</h1>
        </div>
        <Button variant="primary" onClick={openCreate} icon={Plus}>
          Log Workout
        </Button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="filter-search-wrap">
          <span className="filter-search-icon" aria-hidden="true">
            <Search size={15} />
          </span>
          <input
            type="text"
            className="filter-input"
            placeholder="Search notes…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            aria-label="Search workouts"
          />
        </div>

        {/* Type filter */}
        <select
          className="field-select"
          style={{ minWidth: 150 }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          aria-label="Filter by type"
        >
          {WORKOUT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Date filter */}
        <input
          type="date"
          className="field-input"
          style={{ minWidth: 150 }}
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
          aria-label="Filter by date"
        />

        {hasFilters && (
          <Button variant="ghost" className="btn-sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {error && <div className="error-banner" role="alert">{error}</div>}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12 }}>
          <Spinner size="lg" />
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>Loading workouts…</p>
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts found"
          description={hasFilters ? 'No sessions match your filters.' : "You haven't logged any workouts yet. Time to crush a session!"}
          actionText={!hasFilters ? 'Log Your First Workout' : undefined}
          onAction={openCreate}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {workouts.map((w) => (
            <div key={w.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Activity icon */}
              <div className="activity-icon activity-icon-track" style={{ width: 40, height: 40, flexShrink: 0 }} aria-hidden="true">
                <ActivityIcon type={w.workoutType} size={18} />
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span className="badge badge-track">{formatWorkoutType(w.workoutType)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                    <Calendar size={12} aria-hidden="true" /> {formatDatePretty(w.workoutDate)}
                  </span>
                </div>
                {w.notes ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.notes}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontStyle: 'italic', marginTop: 2 }}>No notes</p>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 20, flexShrink: 0, textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Duration</div>
                  <div className="num" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{formatDuration(w.durationMinutes)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Burned</div>
                  <div className="num" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--track)' }}>{formatCalories(w.caloriesBurnt)}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(w)}
                  className="btn btn-ghost btn-sm btn-icon"
                  aria-label={`Edit ${formatWorkoutType(w.workoutType)}`}
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => requestDelete(w.id)}
                  className="btn btn-danger btn-sm btn-icon"
                  aria-label={`Delete ${formatWorkoutType(w.workoutType)}`}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      {/* Slide-over form */}
      <SlideOver
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title={editingWorkout ? 'Edit Workout' : 'Log Workout'}
      >
        <WorkoutForm
          initialData={editingWorkout}
          onSubmit={handleSubmit}
          onCancel={() => setSlideOverOpen(false)}
          loading={formLoading}
        />
      </SlideOver>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete workout?"
        message="This will permanently remove the workout record. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </div>
  );
}
