import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Search, Calendar, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { mealsApi } from '../api/meals';
import { useDebounce } from '../hooks/useDebounce';
import SlideOver from '../components/ui/SlideOver';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import MealForm from '../components/MealForm';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatDatePretty } from '../utils/dates';
import { formatCalories } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

const MEAL_TYPE_OPTIONS = [
  { value: '',          label: 'All Types' },
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH',     label: 'Lunch' },
  { value: 'DINNER',    label: 'Dinner' },
  { value: 'SNACK',     label: 'Snack' }
];

const MEAL_TYPE_LABEL = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack' };

export default function Meals() {
  const [meals, setMeals]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingMeal, setEditingMeal]     = useState(null);
  const [formLoading, setFormLoading]     = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await mealsApi.getMeals({
        page,
        size: 8,
        search: debouncedSearch || undefined,
        mealType: typeFilter || undefined,
        date: dateFilter || undefined
      });
      setMeals(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeals(); }, [page, debouncedSearch, typeFilter, dateFilter]);

  const openCreate = () => { setEditingMeal(null); setSlideOverOpen(true); };
  const openEdit   = (m) => { setEditingMeal(m);   setSlideOverOpen(true); };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingMeal) {
        await mealsApi.updateMeal(editingMeal.id, data);
        toast.success('Meal updated!');
      } else {
        await mealsApi.createMeal(data);
        toast.success('Meal logged!');
      }
      setSlideOverOpen(false);
      setEditingMeal(null);
      await fetchMeals();
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
      await mealsApi.deleteMeal(deletingId);
      toast.success('Meal deleted.');
      await fetchMeals();
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
          <div className="page-eyebrow">Nutrition & Macros</div>
          <h1 className="page-title">Meals</h1>
        </div>
        <Button variant="primary" onClick={openCreate} icon={Plus}>
          Log Meal
        </Button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-search-wrap">
          <span className="filter-search-icon" aria-hidden="true">
            <Search size={15} />
          </span>
          <input
            type="text"
            className="filter-input"
            placeholder="Search food items…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            aria-label="Search meals"
          />
        </div>

        <select
          className="field-select"
          style={{ minWidth: 150 }}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          aria-label="Filter by meal type"
        >
          {MEAL_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

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
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem' }}>Loading meals…</p>
        </div>
      ) : meals.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No meals found"
          description={hasFilters ? 'No meals match your filters.' : "You haven't logged any meals yet. Keep your nutrition on point!"}
          actionText={!hasFilters ? 'Log Your First Meal' : undefined}
          onAction={openCreate}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meals.map((m) => (
            <div key={m.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Meal icon */}
              <div className="activity-icon activity-icon-ochre" style={{ width: 40, height: 40, flexShrink: 0 }} aria-hidden="true">
                <UtensilsCrossed size={17} />
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span className="badge badge-ochre">
                    {MEAL_TYPE_LABEL[m.mealType] || m.mealType}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                    <Calendar size={12} aria-hidden="true" /> {formatDatePretty(m.mealDate)}
                  </span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.foodItem}
                </p>
                <p style={{ fontSize: '0.775rem', color: 'var(--ink-soft)', marginTop: 1 }}>
                  {m.quantity} {m.quantityUnit?.toLowerCase()}
                </p>
              </div>

              {/* Calories */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Energy</div>
                <div className="num" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ochre)' }}>
                  {formatCalories(m.calories)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(m)}
                  className="btn btn-ghost btn-sm btn-icon"
                  aria-label={`Edit ${m.foodItem}`}
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => requestDelete(m.id)}
                  className="btn btn-danger btn-sm btn-icon"
                  aria-label={`Delete ${m.foodItem}`}
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
        title={editingMeal ? 'Edit Meal' : 'Log Meal'}
      >
        <MealForm
          initialData={editingMeal}
          onSubmit={handleSubmit}
          onCancel={() => setSlideOverOpen(false)}
          loading={formLoading}
        />
      </SlideOver>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete meal?"
        message="This will permanently remove this meal record. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </div>
  );
}
