package com.fitlog.dto.goal;

import com.fitlog.entity.Goal;

import java.time.LocalDateTime;

public record GoalResponse(
    Long id,
    Integer weeklyWorkoutTarget,
    LocalDateTime updatedAt
) {
  public static GoalResponse fromEntity(Goal goal) {
    return new GoalResponse(
        goal.getId(),
        goal.getWeeklyWorkoutTarget(),
        goal.getUpdatedAt()
    );
  }
}
