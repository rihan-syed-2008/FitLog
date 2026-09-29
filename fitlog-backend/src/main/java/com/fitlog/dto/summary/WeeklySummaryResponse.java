package com.fitlog.dto.summary;

import com.fitlog.entity.WeeklySummary;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WeeklySummaryResponse(
    Long id,
    LocalDate weekStart,
    LocalDate weekEnd,
    Integer workoutsCompleted,
    Integer mealsLogged,
    Integer totalCaloriesIn,
    Integer totalCaloriesOut,
    Integer netCalories,
    Integer goalTarget,
    Boolean goalMet,
    LocalDateTime generatedAt
) {
  public static WeeklySummaryResponse fromEntity(WeeklySummary summary) {
    return new WeeklySummaryResponse(
        summary.getId(),
        summary.getWeekStart(),
        summary.getWeekEnd(),
        summary.getWorkoutsCompleted(),
        summary.getMealsLogged(),
        summary.getTotalCaloriesIn(),
        summary.getTotalCaloriesOut(),
        summary.getNetCalories(),
        summary.getGoalTarget(),
        summary.getGoalMet(),
        summary.getGeneratedAt()
    );
  }
}
