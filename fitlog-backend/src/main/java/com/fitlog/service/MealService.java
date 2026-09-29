package com.fitlog.service;

import com.fitlog.dto.common.PageResponse;
import com.fitlog.dto.meal.MealRequest;
import com.fitlog.dto.meal.MealResponse;
import com.fitlog.entity.Meal;
import com.fitlog.entity.User;
import com.fitlog.enums.MealType;
import com.fitlog.exception.InvalidRequestException;
import com.fitlog.exception.ResourceNotFoundException;
import com.fitlog.repository.MealRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MealService {

  private final MealRepository mealRepository;
  private final CurrentUserService currentUserService;

  public MealService(
      MealRepository mealRepository,
      CurrentUserService currentUserService) {
    this.mealRepository = mealRepository;
    this.currentUserService = currentUserService;
  }

  public MealResponse createMeal(MealRequest request) {
    validateMealRequest(request);

    User currentUser = currentUserService.getCurrentUser();

    Meal meal = new Meal();
    meal.setUser(currentUser);
    meal.setFoodItem(request.foodItem());
    meal.setMealType(request.mealType());
    meal.setQuantity(request.quantity());
    meal.setQuantityUnit(request.quantityUnit());
    meal.setCalories(request.calories());
    meal.setMealDate(request.mealDate());

    Meal saved = mealRepository.save(meal);
    return MealResponse.fromEntity(saved);
  }

  @Transactional(readOnly = true)
  public MealResponse getMealById(Long id) {
    User currentUser = currentUserService.getCurrentUser();
    Meal meal = mealRepository.findByIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Meal not found with id: " + id));

    return MealResponse.fromEntity(meal);
  }

  @Transactional(readOnly = true)
  public PageResponse<MealResponse> getMeals(
      LocalDate date,
      LocalDate from,
      LocalDate to,
      MealType mealType,
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
    Page<Meal> mealPage = mealRepository.findWithFilters(
        currentUser.getId(),
        date,
        from,
        to,
        mealType,
        sanitizedSearch,
        pageable
    );

    List<MealResponse> content = mealPage.getContent()
        .stream()
        .map(MealResponse::fromEntity)
        .toList();

    return new PageResponse<>(
        content,
        mealPage.getNumber(),
        mealPage.getSize(),
        mealPage.getTotalElements(),
        mealPage.getTotalPages()
    );
  }

  public MealResponse updateMeal(Long id, MealRequest request) {
    validateMealRequest(request);

    User currentUser = currentUserService.getCurrentUser();
    Meal meal = mealRepository.findByIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Meal not found with id: " + id));

    meal.setFoodItem(request.foodItem());
    meal.setMealType(request.mealType());
    meal.setQuantity(request.quantity());
    meal.setQuantityUnit(request.quantityUnit());
    meal.setCalories(request.calories());
    meal.setMealDate(request.mealDate());

    Meal updated = mealRepository.save(meal);
    return MealResponse.fromEntity(updated);
  }

  public void deleteMeal(Long id) {
    User currentUser = currentUserService.getCurrentUser();
    Meal meal = mealRepository.findByIdAndUserId(id, currentUser.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Meal not found with id: " + id));

    mealRepository.delete(meal);
  }

  private void validateMealRequest(MealRequest request) {
    if (request.mealDate() != null && request.mealDate().isAfter(LocalDate.now())) {
      throw new InvalidRequestException("Meal date cannot be in the future.");
    }
    if (request.quantity() != null && request.quantity() <= 0) {
      throw new InvalidRequestException("Quantity must be greater than 0.");
    }
    if (request.calories() != null && (request.calories() < 0 || request.calories() > 5000)) {
      throw new InvalidRequestException("Calories must be between 0 and 5000.");
    }
  }
}
