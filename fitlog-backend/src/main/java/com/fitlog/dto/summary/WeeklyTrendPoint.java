package com.fitlog.dto.summary;

import java.time.LocalDate;

public record WeeklyTrendPoint(
    LocalDate weekStart,
    LocalDate weekEnd,
    Integer workoutsCompleted,
    Integer goalTarget,
    Integer totalCaloriesIn,
    Integer totalCaloriesOut
) {
  public WeeklyTrendPoint(LocalDate weekStart, LocalDate weekEnd, Integer workoutsCompleted, Integer goalTarget) {
    this(weekStart, weekEnd, workoutsCompleted, goalTarget, 0, 0);
  }
}
