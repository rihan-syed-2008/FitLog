package com.fitlog.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

  @Mock
  private WorkoutRepository workoutRepository;

  @Mock
  private MealRepository mealRepository;

  @Mock
  private GoalRepository goalRepository;

  @Mock
  private WeeklySummaryRepository weeklySummaryRepository;

  @Mock
  private CurrentUserService currentUserService;

  @InjectMocks
  private SummaryService summaryService;

  private User mockUser;

  @BeforeEach
  void setUp() {
    mockUser = new User();
    mockUser.setId(1L);
    mockUser.setEmail("test@fitlog.com");
  }

  @Test
  @DisplayName("BR10: Reject generating summary for future week")
  void testRejectFutureWeek() {
    LocalDate futureWeek = LocalDate.now().plusWeeks(2);

    assertThrows(InvalidRequestException.class, () ->
        summaryService.generateWeeklySummary(futureWeek)
    );
  }

  @Test
  @DisplayName("BR8: Throw 422 BusinessRuleException when week has zero workouts and zero meals")
  void testRejectEmptyWeek() {
    when(currentUserService.getCurrentUser()).thenReturn(mockUser);
    LocalDate pastDate = LocalDate.now().minusWeeks(1);
    LocalDate weekStart = WeekUtil.startOfWeek(pastDate);
    LocalDate weekEnd = WeekUtil.endOfWeek(pastDate);

    when(weeklySummaryRepository.findByUserIdAndWeekStart(1L, weekStart))
        .thenReturn(Optional.empty());
    when(workoutRepository.countByUserIdAndWorkoutDateBetween(1L, weekStart, weekEnd))
        .thenReturn(0L);
    when(mealRepository.countByUserIdAndMealDateBetween(1L, weekStart, weekEnd))
        .thenReturn(0L);

    assertThrows(BusinessRuleException.class, () ->
        summaryService.generateWeeklySummary(pastDate)
    );
  }

  @Test
  @DisplayName("BR9: Return existing summary when generated second time (idempotent / 200 OK)")
  void testReturnExistingSummary() {
    when(currentUserService.getCurrentUser()).thenReturn(mockUser);
    LocalDate pastDate = LocalDate.now().minusWeeks(1);
    LocalDate weekStart = WeekUtil.startOfWeek(pastDate);

    WeeklySummary existing = new WeeklySummary();
    existing.setId(42L);
    existing.setUser(mockUser);
    existing.setWeekStart(weekStart);
    existing.setWeekEnd(WeekUtil.endOfWeek(pastDate));
    existing.setWorkoutsCompleted(4);
    existing.setMealsLogged(12);
    existing.setTotalCaloriesIn(10000);
    existing.setTotalCaloriesOut(2000);
    existing.setNetCalories(8000);
    existing.setGoalTarget(3);
    existing.setGoalMet(true);

    when(weeklySummaryRepository.findByUserIdAndWeekStart(1L, weekStart))
        .thenReturn(Optional.of(existing));

    SummaryService.GenerationResult result = summaryService.generateWeeklySummary(pastDate);

    assertNotNull(result);
    assertFalse(result.created());
    assertEquals(42L, result.response().id());
    verify(weeklySummaryRepository, never()).save(any());
  }

  @Test
  @DisplayName("Generate new weekly summary successfully when data is present")
  void testGenerateNewWeeklySummarySuccess() {
    when(currentUserService.getCurrentUser()).thenReturn(mockUser);
    LocalDate pastDate = LocalDate.now().minusWeeks(1);
    LocalDate weekStart = WeekUtil.startOfWeek(pastDate);
    LocalDate weekEnd = WeekUtil.endOfWeek(pastDate);

    when(weeklySummaryRepository.findByUserIdAndWeekStart(1L, weekStart))
        .thenReturn(Optional.empty());
    when(workoutRepository.countByUserIdAndWorkoutDateBetween(1L, weekStart, weekEnd))
        .thenReturn(3L);
    when(mealRepository.countByUserIdAndMealDateBetween(1L, weekStart, weekEnd))
        .thenReturn(15L);
    when(mealRepository.sumCaloriesByUserIdAndDateBetween(1L, weekStart, weekEnd))
        .thenReturn(12000);
    when(workoutRepository.sumCaloriesBurntByUserIdAndDateBetween(1L, weekStart, weekEnd))
        .thenReturn(1500);

    Goal goal = new Goal();
    goal.setWeeklyWorkoutTarget(3);
    when(goalRepository.findByUserId(1L)).thenReturn(Optional.of(goal));

    WeeklySummary saved = new WeeklySummary();
    saved.setId(100L);
    saved.setUser(mockUser);
    saved.setWeekStart(weekStart);
    saved.setWeekEnd(weekEnd);
    saved.setWorkoutsCompleted(3);
    saved.setMealsLogged(15);
    saved.setTotalCaloriesIn(12000);
    saved.setTotalCaloriesOut(1500);
    saved.setNetCalories(10500);
    saved.setGoalTarget(3);
    saved.setGoalMet(true);

    when(weeklySummaryRepository.save(any(WeeklySummary.class))).thenReturn(saved);

    SummaryService.GenerationResult result = summaryService.generateWeeklySummary(pastDate);

    assertNotNull(result);
    assertTrue(result.created());
    assertEquals(100L, result.response().id());
    assertTrue(result.response().goalMet());
    verify(weeklySummaryRepository, times(1)).save(any(WeeklySummary.class));
  }
}
