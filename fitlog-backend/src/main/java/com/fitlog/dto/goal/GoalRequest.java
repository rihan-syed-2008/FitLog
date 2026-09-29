package com.fitlog.dto.goal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GoalRequest(
    @NotNull(message = "Weekly workout target is required")
    @Min(value = 1, message = "Weekly workout target must be between 1 and 14")
    @Max(value = 14, message = "Weekly workout target must be between 1 and 14")
    Integer weeklyWorkoutTarget
) {
}
