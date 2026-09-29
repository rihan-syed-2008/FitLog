package com.fitlog.service;

import com.fitlog.dto.goal.GoalProgressResponse;
import com.fitlog.dto.goal.GoalRequest;
import com.fitlog.dto.goal.GoalResponse;
import com.fitlog.entity.Goal;
import com.fitlog.entity.User;
import com.fitlog.exception.InvalidRequestException;
import com.fitlog.exception.ResourceNotFoundException;
import com.fitlog.repository.GoalRepository;
import com.fitlog.repository.WorkoutRepository;
import com.fitlog.util.WeekUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
public class GoalService {

  private final GoalRepository goalRepository;
  private final WorkoutRepository workoutRepository;
  private final CurrentUserService currentUserService;

  public GoalService(
      GoalRepository goalRepository,
      WorkoutRepository workoutRepository,
      CurrentUserService currentUserService) {
    this.goalRepository = goalRepository;
    this.workoutRepository = workoutRepository;
    this.currentUserService = currentUserService;
  }

  @Transactional(readOnly = true)
  public GoalResponse getCurrentGoal() {
    User user = currentUserService.getCurrentUser();
    Goal goal = goalRepository.findByUserId(user.getId())
        .orElseThrow(() -> new ResourceNotFoundException("No active goal set for user."));

    return GoalResponse.fromEntity(goal);
  }

  public GoalResponse upsertGoal(GoalRequest request) {
    if (request.weeklyWorkoutTarget() == null || request.weeklyWorkoutTarget() < 1 || request.weeklyWorkoutTarget() > 14) {
      throw new InvalidRequestException("Weekly workout target must be between 1 and 14.");
    }

    User user = currentUserService.getCurrentUser();
    Goal goal = goalRepository.findByUserId(user.getId())
        .orElseGet(() -> {
          Goal newGoal = new Goal();
          newGoal.setUser(user);
          return newGoal;
        });

    goal.setWeeklyWorkoutTarget(request.weeklyWorkoutTarget());
    Goal saved = goalRepository.save(goal);
    return GoalResponse.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public GoalProgressResponse getGoalProgress() {
    User user = currentUserService.getCurrentUser();
    Optional<Goal> goalOpt = goalRepository.findByUserId(user.getId());

    int target = goalOpt.map(Goal::getWeeklyWorkoutTarget).orElse(0);
    LocalDate now = LocalDate.now();
    LocalDate startOfWeek = WeekUtil.startOfWeek(now);
    LocalDate endOfWeek = WeekUtil.endOfWeek(now);

    int completed = (int) workoutRepository.countByUserIdAndWorkoutDateBetween(user.getId(), startOfWeek, endOfWeek);
    int remaining = Math.max(0, target - completed);
    double percent = target > 0
        ? Math.min(100.0, Math.round(((double) completed / target) * 1000.0) / 10.0)
        : 0.0;

    return new GoalProgressResponse(target, completed, remaining, percent);
  }
}
