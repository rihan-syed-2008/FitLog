package com.fitlog.service;

import com.fitlog.dto.workout.WorkoutRequest;
import com.fitlog.dto.workout.WorkoutResponse;
import com.fitlog.entity.User;
import com.fitlog.entity.Workout;
import com.fitlog.enums.WorkoutType;
import com.fitlog.exception.InvalidRequestException;
import com.fitlog.exception.ResourceNotFoundException;
import com.fitlog.repository.WorkoutRepository;
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
class WorkoutServiceTest {

  @Mock
  private WorkoutRepository workoutRepository;

  @Mock
  private CurrentUserService currentUserService;

  @InjectMocks
  private WorkoutService workoutService;

  private User mockUser;

  @BeforeEach
  void setUp() {
    mockUser = new User();
    mockUser.setId(1L);
    mockUser.setEmail("test@fitlog.com");
    mockUser.setFullName("Test User");
  }

  @Test
  @DisplayName("Should create workout successfully for authenticated user")
  void testCreateWorkoutSuccess() {
    when(currentUserService.getCurrentUser()).thenReturn(mockUser);

    WorkoutRequest request = new WorkoutRequest(
        WorkoutType.RUNNING,
        "Morning 5k",
        30,
        300,
        LocalDate.now()
    );

    Workout saved = new Workout();
    saved.setId(10L);
    saved.setUser(mockUser);
    saved.setWorkoutType(WorkoutType.RUNNING);
    saved.setNotes("Morning 5k");
    saved.setDurationMinutes(30);
    saved.setCaloriesBurnt(300);
    saved.setWorkoutDate(LocalDate.now());

    when(workoutRepository.save(any(Workout.class))).thenReturn(saved);

    WorkoutResponse response = workoutService.createWorkout(request);

    assertNotNull(response);
    assertEquals(10L, response.id());
    assertEquals(WorkoutType.RUNNING, response.workoutType());
    verify(workoutRepository, times(1)).save(any(Workout.class));
  }

  @Test
  @DisplayName("Should reject workout with future date")
  void testRejectFutureDate() {
    WorkoutRequest request = new WorkoutRequest(
        WorkoutType.RUNNING,
        "Future run",
        30,
        300,
        LocalDate.now().plusDays(2)
    );

    assertThrows(InvalidRequestException.class, () -> workoutService.createWorkout(request));
    verify(workoutRepository, never()).save(any());
  }

  @Test
  @DisplayName("Should reject workout with negative calories")
  void testRejectNegativeCalories() {
    WorkoutRequest request = new WorkoutRequest(
        WorkoutType.CYCLING,
        "Ride",
        45,
        -50,
        LocalDate.now()
    );

    assertThrows(InvalidRequestException.class, () -> workoutService.createWorkout(request));
  }

  @Test
  @DisplayName("Should throw ResourceNotFoundException (404) when accessing foreign user workout")
  void testOwnershipIsolationReturns404() {
    when(currentUserService.getCurrentUser()).thenReturn(mockUser);
    when(workoutRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> workoutService.getWorkoutById(999L));
  }
}
