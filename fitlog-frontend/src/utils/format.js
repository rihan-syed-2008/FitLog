export function formatCalories(cal) {
  if (cal === undefined || cal === null) return '0 kcal';
  return `${Number(cal).toLocaleString()} kcal`;
}

export function formatDuration(mins) {
  if (!mins) return '0m';
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (hours > 0) {
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  }
  return `${remaining}m`;
}

export function formatWorkoutType(type) {
  if (!type) return '';
  return type.charAt(0) + type.slice(1).toLowerCase();
}
