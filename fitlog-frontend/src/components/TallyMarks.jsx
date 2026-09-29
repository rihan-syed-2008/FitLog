import React from 'react';

/**
 * TallyMarks — renders n filled tally marks and (total-n) empty ones.
 *
 * Tally groups of 5: first 4 are vertical strokes, the 5th is a diagonal strike.
 * Uses CSS classes `.tally-group`, `.tally-group.fifth`, `.tally-mark`, `.tally-mark-empty`.
 */
export default function TallyMarks({ filled = 0, total = 0 }) {
  if (total <= 0) return null;

  const marks = Array.from({ length: total }, (_, i) => i < filled);

  // Group into chunks of 5
  const groups = [];
  for (let i = 0; i < marks.length; i += 5) {
    groups.push(marks.slice(i, i + 5));
  }

  return (
    <div className="tally-row" role="img" aria-label={`${filled} of ${total} completed`}>
      {groups.map((group, gi) => (
        <div
          key={gi}
          className={`tally-group${group.length === 5 ? ' fifth' : ''}`}
          aria-hidden="true"
        >
          {group.map((isFilled, mi) => (
            <span
              key={mi}
              className={isFilled ? 'tally-mark' : 'tally-mark-empty'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
