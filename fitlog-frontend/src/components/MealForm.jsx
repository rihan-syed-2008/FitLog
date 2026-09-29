import React, { useState, useEffect } from 'react';
import Field from './ui/Field';
import Select from './ui/Select';
import Button from './ui/Button';
import { getTodayString } from '../utils/dates';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH',     label: 'Lunch' },
  { value: 'DINNER',    label: 'Dinner' },
  { value: 'SNACK',     label: 'Snack' }
];

const QUANTITY_UNITS = [
  { value: 'SERVING', label: 'Serving' },
  { value: 'GRAM',    label: 'Grams (g)' },
  { value: 'ML',      label: 'Millilitres (ml)' },
  { value: 'CUP',     label: 'Cups' },
  { value: 'PIECE',   label: 'Pieces' }
];

export default function MealForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    foodItem:     '',
    mealType:     'BREAKFAST',
    quantity:     1,
    quantityUnit: 'SERVING',
    calories:     350,
    mealDate:     getTodayString()
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        foodItem:     initialData.foodItem     || '',
        mealType:     initialData.mealType     || 'BREAKFAST',
        quantity:     initialData.quantity     ?? 1,
        quantityUnit: initialData.quantityUnit || 'SERVING',
        calories:     initialData.calories     ?? 350,
        mealDate:     initialData.mealDate     || getTodayString()
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.foodItem?.trim())              errs.foodItem = 'Food item is required';
    else if (formData.foodItem.length > 150)     errs.foodItem = 'Max 150 characters';
    if (!formData.mealType)                      errs.mealType = 'Meal type is required';
    if (!formData.quantity || Number(formData.quantity) <= 0) errs.quantity = 'Quantity must be > 0';
    if (!formData.quantityUnit)                  errs.quantityUnit = 'Unit is required';
    if (formData.calories === undefined || formData.calories === null
        || formData.calories < 0 || formData.calories > 5000) {
      errs.calories = 'Calories must be 0–5000';
    }
    if (!formData.mealDate) {
      errs.mealDate = 'Meal date is required';
    } else if (new Date(formData.mealDate) > new Date()) {
      errs.mealDate = 'Meal date cannot be in the future';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }));

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
      <Field
        label="Food Item"
        placeholder="e.g. Greek Yogurt with Honey, Grilled Chicken"
        value={formData.foodItem}
        onChange={set('foodItem')}
        error={errors.foodItem}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Select
          label="Meal Type"
          value={formData.mealType}
          onChange={set('mealType')}
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
          onChange={set('calories')}
          error={errors.calories}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field
          label="Quantity"
          type="number"
          step="0.1"
          min="0.1"
          value={formData.quantity}
          onChange={set('quantity')}
          error={errors.quantity}
          required
        />
        <Select
          label="Unit"
          value={formData.quantityUnit}
          onChange={set('quantityUnit')}
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
        onChange={set('mealDate')}
        error={errors.mealDate}
        required
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Meal' : 'Save Meal'}
        </Button>
      </div>
    </form>
  );
}
