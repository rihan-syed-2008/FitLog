package com.fitlog.service;

import com.fitlog.dto.common.PageResponse;
import com.fitlog.dto.workout.WorkoutRequest;
import com.fitlog.dto.workout.WorkoutResponse;
import com.fitlog.entity.User;
import com.fitlog.entity.Workout;
import com.fitlog.enums.WorkoutType;
import com.fitlog.exception.InvalidRequestException;
import com.fitlog.exception.ResourceNotFoundException;
import com.fitlog.repository.WorkoutRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class WorkoutService {

  private final WorkoutRepository workoutRepository;
  private final CurrentUserService currentUserService;

  public WorkoutService(
      WorkoutRepository workoutRepository,
      CurrentUserService currentUserService) {
    this.workoutRepository = workoutRepository;
    this.currentUserService = currentUserService;
  }

  public WorkoutResponse createWorkout(WorkoutRequest request) {
    validateWorkoutRequest(request);

    User currentUser = currentUserService.getCurrentUser();

    Workout workout = new Workout();
    workout.setUser(currentUser);
    workout.setWorkoutType(request.workoutType());
    workout.setNotes(request.notes());
    workout.setDurationMinutes(request.durationMinutes());
    workout.setCaloriesBurnt(request.caloriesBurnt());
    workout.setWorkoutDate(request.workoutDate());

    Workout saved = workoutRepository.save(workout);
    return WorkoutResponse.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public WorkoutResponse getWorkoutById(Long id) {
    User currentUser = currentUserService.getCurrentUser();
    Workout workout = workoutRepository.findByIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));

    return WorkoutResponse.fromEntity(workout);
  }

  @Transactional(readOnly = true)
  public PageResponse<WorkoutResponse> getWorkouts(
      LocalDate date,
      LocalDate from,
      LocalDate to,
      WorkoutType workoutType,
      String search,
      int page,
      int size) {

    User currentUser = currentUserService.getCurrentUser();

    if (page < 0) {
      throw new InvalidRequestException("Page index must not be less than zero.");
    }
    if (size <= 0) {
      throw new InvalidRequestException("Page size must be greater than zero.");
    }
    if (size > 100) {
      size = 100;
    }

    String sanitizedSearch = (search != null && !search.trim().isEmpty())
        ? search.trim()
        : null;

    Pageable pageable = PageRequest.of(page, size);
    Page<Workout> workoutPage = workoutRepository.findWithFilters(
        currentUser.getId(),
        date,
        from,
        to,
        workoutType,
        sanitizedSearch,
        pageable
    );

    List<WorkoutResponse> content = workoutPage.getContent()
        .stream()
        .map(WorkoutResponse::fromEntity)
        .toList();

    return new PageResponse<>(
        content,
        workoutPage.getNumber(),
        workoutPage.getSize(),
        workoutPage.getTotalElements(),
        workoutPage.getTotalPages()
    );
  }

  public WorkoutResponse updateWorkout(Long id, WorkoutRequest request) {
    validateWorkoutRequest(request);

    User currentUser = currentUserService.getCurrentUser();
    Workout workout = workoutRepository.findByIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));

    workout.setWorkoutType(request.workoutType());
    workout.setNotes(request.notes());
    workout.setDurationMinutes(request.durationMinutes());
    workout.setCaloriesBurnt(request.caloriesBurnt());
    workout.setWorkoutDate(request.workoutDate());

    Workout updated = workoutRepository.save(workout);
    return WorkoutResponse.fromEntity(updated);
  }

  public void deleteWorkout(Long id) {
    User currentUser = currentUserService.getCurrentUser();
    Workout workout = workoutRepository.findByIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Workout not found with id: " + id));

    workoutRepository.delete(workout);
  }

  private void validateWorkoutRequest(WorkoutRequest request) {
    if (request.workoutDate() != null && request.workoutDate().isAfter(LocalDate.now())) {
      throw new InvalidRequestException("Workout date cannot be in the future.");
    }
    if (request.caloriesBurnt() != null && request.caloriesBurnt() < 0) {
      throw new InvalidRequestException("Calories burnt cannot be negative.");
    }
    if (request.durationMinutes() != null && (request.durationMinutes() < 1 || request.durationMinutes() > 1440)) {
      throw new InvalidRequestException("Duration must be between 1 and 1440 minutes.");
    }
  }
}
