package com.fitlog.controller;

import com.fitlog.dto.common.PageResponse;
import com.fitlog.dto.meal.MealRequest;
import com.fitlog.dto.meal.MealResponse;
import com.fitlog.enums.MealType;
import com.fitlog.service.MealService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/meals")
public class MealController {

  private final MealService mealService;

  public MealController(MealService mealService) {
    this.mealService = mealService;
  }

  @PostMapping
  public ResponseEntity<MealResponse> createMeal(@Valid @RequestBody MealRequest request) {
    MealResponse response = mealService.createMeal(request);
    URI location = URI.create("/api/meals/" + response.id());
    return ResponseEntity.created(location).body(response);
  }

  @GetMapping
  public ResponseEntity<PageResponse<MealResponse>> getMeals(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(required = false) MealType mealType,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    PageResponse<MealResponse> response = mealService.getMeals(
        date, from, to, mealType, search, page, size
    );
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<MealResponse> getMealById(@PathVariable Long id) {
    MealResponse response = mealService.getMealById(id);
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  public ResponseEntity<MealResponse> updateMeal(
      @PathVariable Long id,
      @Valid @RequestBody MealRequest request) {

    MealResponse response = mealService.updateMeal(id, request);
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteMeal(@PathVariable Long id) {
    mealService.deleteMeal(id);
    return ResponseEntity.noContent().build();
  }
}
