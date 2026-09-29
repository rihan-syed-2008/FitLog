package com.fitlog.repository;

import com.fitlog.entity.Meal;
import com.fitlog.enums.MealType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {

  Optional<Meal> findByIdAndUserId(Long id, Long userId);

  List<Meal> findByUserIdAndMealDate(Long userId, LocalDate mealDate);

  List<Meal> findByUserIdAndMealDateBetween(
      Long userId,
      LocalDate startDate,
      LocalDate endDate
  );

  long countByUserIdAndMealDate(Long userId, LocalDate mealDate);

  long countByUserIdAndMealDateBetween(
      Long userId,
      LocalDate startDate,
      LocalDate endDate
  );

  @Query("SELECT COALESCE(SUM(m.calories), 0) FROM Meal m WHERE m.user.id = :userId AND m.mealDate = :date")
  Integer sumCaloriesByUserIdAndDate(
      @Param("userId") Long userId,
      @Param("date") LocalDate date
  );

  @Query("SELECT COALESCE(SUM(m.calories), 0) FROM Meal m WHERE m.user.id = :userId AND m.mealDate BETWEEN :startDate AND :endDate")
  Integer sumCaloriesByUserIdAndDateBetween(
      @Param("userId") Long userId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate
  );

  @Query("""
      SELECT m FROM Meal m
      WHERE m.user.id = :userId
        AND (:date IS NULL OR m.mealDate = :date)
        AND (:from IS NULL OR m.mealDate >= :from)
        AND (:to IS NULL OR m.mealDate <= :to)
        AND (:mealType IS NULL OR m.mealType = :mealType)
        AND (:search IS NULL OR LOWER(COALESCE(m.foodItem, '')) LIKE LOWER(CONCAT('%', :search, '%')))
      ORDER BY m.mealDate DESC, m.id DESC
  """)
  Page<Meal> findWithFilters(
      @Param("userId") Long userId,
      @Param("date") LocalDate date,
      @Param("from") LocalDate from,
      @Param("to") LocalDate to,
      @Param("mealType") MealType mealType,
      @Param("search") String search,
      Pageable pageable
  );
}