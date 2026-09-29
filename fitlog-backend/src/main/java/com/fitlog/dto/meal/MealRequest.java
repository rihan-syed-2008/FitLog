package com.fitlog.dto.meal;

import com.fitlog.enums.MealType;
import com.fitlog.enums.QuantityUnit;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record MealRequest(
    @NotBlank(message = "Food item is required")
    @Size(max = 150, message = "Food item must not exceed 150 characters")
    String foodItem,

    @NotNull(message = "Meal type is required")
    MealType mealType,

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    Double quantity,

    @NotNull(message = "Quantity unit is required")
    QuantityUnit quantityUnit,

    @NotNull(message = "Calories is required")
    @Min(value = 0, message = "Calories must be at least 0")
    @Max(value = 5000, message = "Calories cannot exceed 5000")
    Integer calories,

    @NotNull(message = "Meal date is required")
    @PastOrPresent(message = "Meal date cannot be in the future")
    LocalDate mealDate
) {
}
