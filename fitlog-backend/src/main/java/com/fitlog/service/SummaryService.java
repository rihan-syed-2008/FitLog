package com.fitlog.service;

import com.fitlog.dto.summary.DailySummaryResponse;
import com.fitlog.dto.summary.WeeklySummaryResponse;
import com.fitlog.dto.summary.WeeklyTrendPoint;
import com.fitlog.entity.Goal;
import com.fitlog.entity.User;
import com.fitlog.entity.WeeklySummary;
import com.fitlog.exception.BusinessRuleException;
import com.fitlog.exception.InvalidRequestException;
import com.fitlog.repository.GoalRepository;
import com.fitlog.repository.MealRepository;
import com.fitlog.repository.WeeklySummaryRepository;
import com.fitlog.repository.WorkoutRepository;
import com.fitlog.util.WeekUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SummaryService {

  public record GenerationResult(WeeklySummaryResponse response, boolean created) {}

  private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SummaryService.class);

  private final WorkoutRepository workoutRepository;
  private final MealRepository mealRepository;
  private final GoalRepository goalRepository;
  private final WeeklySummaryRepository weeklySummaryRepository;
  private final CurrentUserService currentUserService;
  private final WeeklySummaryEmailService weeklySummaryEmailService;

  public SummaryService(
      WorkoutRepository workoutRepository,
      MealRepository mealRepository,
      GoalRepository goalRepository,
      WeeklySummaryRepository weeklySummaryRepository,
      CurrentUserService currentUserService,
      WeeklySummaryEmailService weeklySummaryEmailService) {
    this.workoutRepository = workoutRepository;
    this.mealRepository = mealRepository;
    this.goalRepository = goalRepository;
    this.weeklySummaryRepository = weeklySummaryRepository;
    this.currentUserService = currentUserService;
    this.weeklySummaryEmailService = weeklySummaryEmailService;
  }

  @Transactional(readOnly = true)
  public DailySummaryResponse getDailySummary(LocalDate date) {
    LocalDate targetDate = (date != null) ? date : LocalDate.now();
    User user = currentUserService.getCurrentUser();

    int caloriesIn = mealRepository.sumCaloriesByUserIdAndDate(user.getId(), targetDate);
    int caloriesOut = workoutRepository.sumCaloriesBurntByUserIdAndDate(user.getId(), targetDate);
    int netCalories = caloriesIn - caloriesOut;

    int workoutCount = (int) workoutRepository.countByUserIdAndWorkoutDate(user.getId(), targetDate);
    int mealCount = (int) mealRepository.countByUserIdAndMealDate(user.getId(), targetDate);

    String balance;
    if (netCalories > 0) {
      balance = "SURPLUS";
    } else if (netCalories < 0) {
      balance = "DEFICIT";
    } else {
      balance = "BALANCED";
    }

    return new DailySummaryResponse(
        targetDate,
        caloriesIn,
        caloriesOut,
        netCalories,
        workoutCount,
        mealCount,
        balance
    );
  }

  @Transactional(readOnly = true)
  public List<WeeklyTrendPoint> getWeeklyTrend(int weeks) {
    if (weeks < 1 || weeks > 26) {
      throw new InvalidRequestException("Weeks must be between 1 and 26.");
    }

    User user = currentUserService.getCurrentUser();
    Optional<Goal> goalOpt = goalRepository.findByUserId(user.getId());
    int goalTarget = goalOpt.map(Goal::getWeeklyWorkoutTarget).orElse(0);

    List<WeeklyTrendPoint> trend = new ArrayList<>();
    LocalDate now = LocalDate.now();

    for (int i = weeks - 1; i >= 0; i--) {
      LocalDate refDate = now.minusWeeks(i);
      LocalDate weekStart = WeekUtil.startOfWeek(refDate);
      LocalDate weekEnd = WeekUtil.endOfWeek(refDate);

      int workoutsCompleted = (int) workoutRepository.countByUserIdAndWorkoutDateBetween(
          user.getId(), weekStart, weekEnd
      );
      int calIn = mealRepository.sumCaloriesByUserIdAndDateBetween(
          user.getId(), weekStart, weekEnd
      );
      int calOut = workoutRepository.sumCaloriesBurntByUserIdAndDateBetween(
          user.getId(), weekStart, weekEnd
      );

      trend.add(new WeeklyTrendPoint(
          weekStart,
          weekEnd,
          workoutsCompleted,
          goalTarget,
          calIn,
          calOut
      ));
    }

    return trend;
  }

  public GenerationResult generateWeeklySummary(LocalDate weekOf) {
    LocalDate targetDate = (weekOf != null) ? weekOf : LocalDate.now();
    LocalDate weekStart = WeekUtil.startOfWeek(targetDate);
    LocalDate weekEnd = WeekUtil.endOfWeek(targetDate);

    LocalDate currentWeekStart = WeekUtil.startOfWeek(LocalDate.now());
    if (weekStart.isAfter(currentWeekStart)) {
      throw new InvalidRequestException("Cannot generate weekly summary for a future week.");
    }

    User user = currentUserService.getCurrentUser();

    Optional<WeeklySummary> existingOpt = weeklySummaryRepository.findByUserIdAndWeekStart(
        user.getId(), weekStart
    );
    if (existingOpt.isPresent()) {
      log.info("Existing weekly summary retrieved for user {}", user.getEmail());
      return new GenerationResult(WeeklySummaryResponse.fromEntity(existingOpt.get()), false);
    }

    long workoutCount = workoutRepository.countByUserIdAndWorkoutDateBetween(
        user.getId(), weekStart, weekEnd
    );
    long mealCount = mealRepository.countByUserIdAndMealDateBetween(
        user.getId(), weekStart, weekEnd
    );

    if (workoutCount == 0 && mealCount == 0) {
      throw new BusinessRuleException(
          "Cannot generate weekly summary: No workouts or meals logged for this week."
      );
    }

    int totalCaloriesIn = mealRepository.sumCaloriesByUserIdAndDateBetween(
        user.getId(), weekStart, weekEnd
    );
    int totalCaloriesOut = workoutRepository.sumCaloriesBurntByUserIdAndDateBetween(
        user.getId(), weekStart, weekEnd
    );
    int netCalories = totalCaloriesIn - totalCaloriesOut;

    Optional<Goal> goalOpt = goalRepository.findByUserId(user.getId());
    int goalTarget = goalOpt.map(Goal::getWeeklyWorkoutTarget).orElse(0);
    boolean goalMet = goalTarget > 0 && workoutCount >= goalTarget;

    WeeklySummary summary = new WeeklySummary();
    summary.setUser(user);
    summary.setWeekStart(weekStart);
    summary.setWeekEnd(weekEnd);
    summary.setWorkoutsCompleted((int) workoutCount);
    summary.setMealsLogged((int) mealCount);
    summary.setTotalCaloriesIn(totalCaloriesIn);
    summary.setTotalCaloriesOut(totalCaloriesOut);
    summary.setNetCalories(netCalories);
    summary.setGoalTarget(goalTarget);
    summary.setGoalMet(goalMet);

    WeeklySummary saved = weeklySummaryRepository.save(summary);
    WeeklySummaryResponse response = WeeklySummaryResponse.fromEntity(saved);

    log.info("Weekly summary generated for user {}", user.getEmail());

    // Trigger email delivery ONLY for newly generated summary
    try {
      weeklySummaryEmailService.sendWeeklySummaryEmail(
          user.getEmail(),
          user.getFullName(),
          response
      );
    } catch (Exception ex) {
      log.error("Failed to send weekly summary email for user {}: {}", user.getEmail(), ex.getMessage());
    }

    return new GenerationResult(response, true);
  }

  @Transactional(readOnly = true)
  public List<WeeklySummaryResponse> getWeeklySummaries() {
    User user = currentUserService.getCurrentUser();
    return weeklySummaryRepository.findByUserIdOrderByWeekStartDesc(user.getId())
        .stream()
        .map(WeeklySummaryResponse::fromEntity)
        .toList();
  }
}
