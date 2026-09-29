package com.fitlog.dto.workout;

import com.fitlog.enums.WorkoutType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record WorkoutRequest(
    @NotNull(message = "Workout type is required")
    WorkoutType workoutType,

    @Size(max = 255, message = "Notes must not exceed 255 characters")
    String notes,

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be between 1 and 1440 minutes")
    @Max(value = 1440, message = "Duration must be between 1 and 1440 minutes")
    Integer durationMinutes,

    @NotNull(message = "Calories burnt is required")
    @Min(value = 0, message = "Calories burnt must be at least 0")
    Integer caloriesBurnt,

    @NotNull(message = "Workout date is required")
    @PastOrPresent(message = "Workout date cannot be in the future")
    LocalDate workoutDate
) {
}
