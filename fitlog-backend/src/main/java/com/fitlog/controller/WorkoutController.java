package com.fitlog.controller;

import com.fitlog.dto.common.PageResponse;
import com.fitlog.dto.workout.WorkoutRequest;
import com.fitlog.dto.workout.WorkoutResponse;
import com.fitlog.enums.WorkoutType;
import com.fitlog.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

  private final WorkoutService workoutService;

  public WorkoutController(WorkoutService workoutService) {
    this.workoutService = workoutService;
  }

  @PostMapping
  public ResponseEntity<WorkoutResponse> createWorkout(@Valid @RequestBody WorkoutRequest request) {
    WorkoutResponse response = workoutService.createWorkout(request);
    URI location = URI.create("/api/workouts/" + response.id());
    return ResponseEntity.created(location).body(response);
  }

  @GetMapping
  public ResponseEntity<PageResponse<WorkoutResponse>> getWorkouts(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(required = false) WorkoutType workoutType,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    PageResponse<WorkoutResponse> response = workoutService.getWorkouts(
        date, from, to, workoutType, search, page, size
    );
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<WorkoutResponse> getWorkoutById(@PathVariable Long id) {
    WorkoutResponse response = workoutService.getWorkoutById(id);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<WorkoutResponse> updateWorkout(
      @PathVariable Long id,
      @Valid @RequestBody WorkoutRequest request) {

    WorkoutResponse response = workoutService.updateWorkout(id, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteWorkout(@PathVariable Long id) {
    workoutService.deleteWorkout(id);
    return ResponseEntity.noContent().build();
  }
}
