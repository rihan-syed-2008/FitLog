package com.fitlog.dto.workout;

import com.fitlog.entity.Workout;
import com.fitlog.enums.WorkoutType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WorkoutResponse(
    Long id,
    WorkoutType workoutType,
    String notes,
    Integer durationMinutes,
    Integer caloriesBurnt,
    LocalDate workoutDate,
    LocalDateTime createdAt
) {
  public static WorkoutResponse fromEntity(Workout workout) {
    return new WorkoutResponse(
        workout.getId(),
        workout.getWorkoutType(),
        workout.getNotes(),
        workout.getDurationMinutes(),
        workout.getCaloriesBurnt(),
        workout.getWorkoutDate(),
        workout.getCreatedAt()
    );
  }
}
