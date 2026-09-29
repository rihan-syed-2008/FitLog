import React from 'react';
import {
  Dumbbell,
  Footprints,
  Bike,
  Zap,
  Activity
} from 'lucide-react';
import RunningIcon from './RunningIcon';
import SwimmingIcon from './SwimmingIcon';
import YogaIcon from './YogaIcon';

/**
 * ActivityIcon — dispatches the correct icon for a WorkoutType enum value.
 * Covers: RUNNING, WALKING, CYCLING, SWIMMING, STRENGTH, YOGA, HIIT, OTHER
 */
export default function ActivityIcon({ type, size = 18, color = 'currentColor' }) {
  const props = { size, color };

  switch ((type || '').toUpperCase()) {
    case 'RUNNING':  return <RunningIcon {...props} />;
    case 'WALKING':  return <Footprints {...props} />;
    case 'CYCLING':  return <Bike {...props} />;
    case 'SWIMMING': return <SwimmingIcon {...props} />;
    case 'STRENGTH': return <Dumbbell {...props} />;
    case 'YOGA':     return <YogaIcon {...props} />;
    case 'HIIT':     return <Zap {...props} />;
    default:         return <Activity {...props} />;
  }
}
