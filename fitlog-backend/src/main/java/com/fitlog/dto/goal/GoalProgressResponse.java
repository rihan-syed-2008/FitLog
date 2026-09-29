package com.fitlog.dto.goal;

public record GoalProgressResponse(
    Integer target,
    Integer completed,
    Integer remaining,
    Double percent
) {
}
