import React, { useState, useEffect } from 'react';
import Field from './ui/Field';
import Select from './ui/Select';
import Button from './ui/Button';
import { getTodayString } from '../utils/dates';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' }
];

const QUANTITY_UNITS = [
  { value: 'SERVING', label: 'Serving' },
  { value: 'GRAM', label: 'Grams (g)' },
  { value: 'ML', label: 'Milliliters (ml)' },
  { value: 'CUP', label: 'Cups' },
  { value: 'PIECE', label: 'Pieces' }
];

export default function MealForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    foodItem: '',
    mealType: 'BREAKFAST',
    quantity: 1,
    quantityUnit: 'SERVING',
    calories: 350,
    mealDate: getTodayString()
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        foodItem: initialData.foodItem || '',
        mealType: initialData.mealType || 'BREAKFAST',
        quantity: initialData.quantity ?? 1,
        quantityUnit: initialData.quantityUnit || 'SERVING',
        calories: initialData.calories ?? 350,
        mealDate: initialData.mealDate || getTodayString()
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.foodItem || !formData.foodItem.trim()) {
      errs.foodItem = 'Food item is required';
    } else if (formData.foodItem.length > 150) {
      errs.foodItem = 'Food item must not exceed 150 characters';
    }
    if (!formData.mealType) errs.mealType = 'Meal type is required';
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      errs.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.quantityUnit) errs.quantityUnit = 'Unit is required';
    if (formData.calories === undefined || formData.calories === null || formData.calories < 0 || formData.calories > 5000) {
      errs.calories = 'Calories must be between 0 and 5000';
    }
    if (!formData.mealDate) {
      errs.mealDate = 'Meal date is required';
    } else if (new Date(formData.mealDate) > new Date()) {
      errs.mealDate = 'Meal date cannot be in the future';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      calories: Number(formData.calories)
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <Field
        label="Food Item"
        placeholder="e.g. Greek Yogurt with Honey, Grilled Chicken Breast"
        value={formData.foodItem}
        onChange={(e) => setFormData({ ...formData, foodItem: e.target.value })}
        error={errors.foodItem}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Select
          label="Meal Type"
          value={formData.mealType}
          onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
          options={MEAL_TYPES}
          error={errors.mealType}
          required
        />

        <Field
          label="Calories"
          type="number"
          min="0"
          max="5000"
          value={formData.calories}
          onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
          error={errors.calories}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Field
          label="Quantity"
          type="number"
          step="0.1"
          min="0.1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          error={errors.quantity}
          required
        />

        <Select
          label="Unit"
          value={formData.quantityUnit}
          onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
          options={QUANTITY_UNITS}
          error={errors.quantityUnit}
          required
        />
      </div>

      <Field
        label="Meal Date"
        type="date"
        max={getTodayString()}
        value={formData.mealDate}
        onChange={(e) => setFormData({ ...formData, mealDate: e.target.value })}
        error={errors.mealDate}
        required
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Meal' : 'Save Meal'}
        </Button>
      </div>
    </form>
  );
}
