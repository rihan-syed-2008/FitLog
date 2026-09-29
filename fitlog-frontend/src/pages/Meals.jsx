import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Search,
  Calendar,
  Flame,
  Trash2,
  Edit2,
  PieChart
} from 'lucide-react';
import { mealsApi } from '../api/meals';
import { useDebounce } from '../hooks/useDebounce';
import SlideOver from '../components/ui/SlideOver';
import MealForm from '../components/MealForm';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatDatePretty } from '../utils/dates';
import { formatCalories } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export default function Meals() {
  const [meals, setMeals] = useState([]);
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
  const [editingMeal, setEditingMeal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchMeals = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 8,
        search: debouncedSearch || undefined,
        mealType: typeFilter || undefined,
        date: dateFilter || undefined
      };
      const res = await mealsApi.getMeals(params);
      setMeals(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [page, debouncedSearch, typeFilter, dateFilter]);

  const handleOpenCreate = () => {
    setEditingMeal(null);
    setIsSlideOverOpen(true);
  };

  const handleOpenEdit = (meal) => {
    setEditingMeal(meal);
    setIsSlideOverOpen(true);
  };

  const handleSubmitForm = async (data) => {
    setFormLoading(true);
    try {
      if (editingMeal) {
        await mealsApi.updateMeal(editingMeal.id, data);
      } else {
        await mealsApi.createMeal(data);
      }
      setIsSlideOverOpen(false);
      setEditingMeal(null);
      await fetchMeals();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;
    try {
      await mealsApi.deleteMeal(id);
      await fetchMeals();
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
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: 700, textTransform: 'uppercase' }}>
              NUTRITION & MACROS
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Meals
          </h1>
        </div>

        <Button variant="primary" onClick={handleOpenCreate} icon={Plus}>
          Log Meal
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
        {/* Search with 300ms Debounce */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Search food item (e.g. Oatmeal, Chicken)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>

        {/* Meal Type Filter */}
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
            <option value="">All Meal Types</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
            <option value="SNACK">Snack</option>
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

      {/* Meal Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Loading meals...</p>
        </div>
      ) : meals.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No meals found"
          description={
            searchTerm || typeFilter || dateFilter
              ? 'No meals match your search criteria.'
              : 'You haven’t logged any meals yet. Keep your nutrition on point!'
          }
          actionText={!searchTerm && !typeFilter && !dateFilter ? 'Log Your First Meal' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {meals.map((m) => (
            <div
              key={m.id}
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
                  <span className="badge badge-orange">
                    {m.mealType}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {formatDatePretty(m.mealDate)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                  {m.foodItem}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Portion: {m.quantity} {m.quantityUnit?.toLowerCase()}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#0c1220',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '12px'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Energy Content</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={15} color="var(--accent-orange)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fb923c' }}>
                      {formatCalories(m.calories)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(m)}
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
                    onClick={() => handleDelete(m.id)}
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
        title={editingMeal ? 'Edit Meal' : 'Log New Meal'}
      >
        <MealForm
          initialData={editingMeal}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsSlideOverOpen(false)}
          loading={formLoading}
        />
      </SlideOver>
    </div>
  );
}
