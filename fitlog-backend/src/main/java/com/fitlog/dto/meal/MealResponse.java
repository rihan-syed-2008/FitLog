package com.fitlog.dto.meal;

import com.fitlog.entity.Meal;
import com.fitlog.enums.MealType;
import com.fitlog.enums.QuantityUnit;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MealResponse(
    Long id,
    String foodItem,
    MealType mealType,
    Double quantity,
    QuantityUnit quantityUnit,
    Integer calories,
    LocalDate mealDate,
    LocalDateTime createdAt
) {
  public static MealResponse fromEntity(Meal meal) {
    return new MealResponse(
        meal.getId(),
        meal.getFoodItem(),
        meal.getMealType(),
        meal.getQuantity(),
        meal.getQuantityUnit(),
        meal.getCalories(),
        meal.getMealDate(),
        meal.getCreatedAt()
    );
  }
}
