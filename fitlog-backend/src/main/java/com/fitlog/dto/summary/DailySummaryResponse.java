package com.fitlog.dto.summary;

import java.time.LocalDate;

public record DailySummaryResponse(
    LocalDate date,
    Integer caloriesIn,
    Integer caloriesOut,
    Integer netCalories,
    Integer workoutCount,
    Integer mealCount,
    String balance
) {
}
