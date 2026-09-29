import React, { useState, useEffect } from 'react';
import Field from './ui/Field';
import Select from './ui/Select';
import Button from './ui/Button';
import { getTodayString } from '../utils/dates';

const WORKOUT_TYPES = [
  { value: 'RUNNING',  label: 'Running' },
  { value: 'WALKING',  label: 'Walking' },
  { value: 'CYCLING',  label: 'Cycling' },
  { value: 'SWIMMING', label: 'Swimming' },
  { value: 'STRENGTH', label: 'Strength Training' },
  { value: 'YOGA',     label: 'Yoga' },
  { value: 'HIIT',     label: 'HIIT' },
  { value: 'OTHER',    label: 'Other' }
];

export default function WorkoutForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    workoutType: 'RUNNING',
    notes: '',
    durationMinutes: 30,
    caloriesBurnt: 250,
    workoutDate: getTodayString()
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        workoutType:     initialData.workoutType    || 'RUNNING',
        notes:           initialData.notes          || '',
        durationMinutes: initialData.durationMinutes || 30,
        caloriesBurnt:   initialData.caloriesBurnt  ?? 250,
        workoutDate:     initialData.workoutDate     || getTodayString()
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.workoutType) errs.workoutType = 'Workout type is required';
    if (!formData.durationMinutes || formData.durationMinutes < 1 || formData.durationMinutes > 1440) {
      errs.durationMinutes = 'Duration must be 1–1440 minutes';
    }
    if (formData.caloriesBurnt === undefined || formData.caloriesBurnt === null || formData.caloriesBurnt < 0) {
      errs.caloriesBurnt = 'Calories burnt must be ≥ 0';
    }
    if (!formData.workoutDate) {
      errs.workoutDate = 'Workout date is required';
    } else if (new Date(formData.workoutDate) > new Date()) {
      errs.workoutDate = 'Workout date cannot be in the future';
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
      durationMinutes: Number(formData.durationMinutes),
      caloriesBurnt:   Number(formData.caloriesBurnt)
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
      <Select
        label="Workout Type"
        value={formData.workoutType}
        onChange={set('workoutType')}
        options={WORKOUT_TYPES}
        error={errors.workoutType}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field
          label="Duration (min)"
          type="number"
          min="1"
          max="1440"
          value={formData.durationMinutes}
          onChange={set('durationMinutes')}
          error={errors.durationMinutes}
          required
        />
        <Field
          label="Calories Burnt"
          type="number"
          min="0"
          value={formData.caloriesBurnt}
          onChange={set('caloriesBurnt')}
          error={errors.caloriesBurnt}
          required
        />
      </div>

      <Field
        label="Workout Date"
        type="date"
        max={getTodayString()}
        value={formData.workoutDate}
        onChange={set('workoutDate')}
        error={errors.workoutDate}
        required
      />

      <Field
        label="Notes"
        placeholder="e.g. 5×5 squats, outdoor trail run…"
        value={formData.notes}
        onChange={set('notes')}
        error={errors.notes}
        helperText="Max 255 chars"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
        <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Workout' : 'Save Workout'}
        </Button>
      </div>
    </form>
  );
}
