package com.fitlog.controller;

import com.fitlog.dto.goal.GoalProgressResponse;
import com.fitlog.dto.goal.GoalRequest;
import com.fitlog.dto.goal.GoalResponse;
import com.fitlog.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

  private final GoalService goalService;

  public GoalController(GoalService goalService) {
    this.goalService = goalService;
  }

  @GetMapping("/current")
  public ResponseEntity<GoalResponse> getCurrentGoal() {
    GoalResponse response = goalService.getCurrentGoal();
    return ResponseEntity.ok(response);
  }

  @PutMapping
  public ResponseEntity<GoalResponse> upsertGoal(@Valid @RequestBody GoalRequest request) {
    GoalResponse response = goalService.upsertGoal(request);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/progress")
  public ResponseEntity<GoalProgressResponse> getGoalProgress() {
    GoalProgressResponse response = goalService.getGoalProgress();
    return ResponseEntity.ok(response);
  }
}
