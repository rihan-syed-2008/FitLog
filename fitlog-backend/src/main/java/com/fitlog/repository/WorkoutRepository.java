package com.fitlog.repository;

import com.fitlog.entity.Workout;
import com.fitlog.enums.WorkoutType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

  Optional<Workout> findByIdAndUserId(Long id, Long userId);

  List<Workout> findByUserIdAndWorkoutDate(Long userId, LocalDate workoutDate);

  List<Workout> findByUserIdAndWorkoutDateBetween(
      Long userId,
      LocalDate startDate,
      LocalDate endDate
  );

  long countByUserIdAndWorkoutDate(Long userId, LocalDate workoutDate);

  long countByUserIdAndWorkoutDateBetween(
      Long userId,
      LocalDate startDate,
      LocalDate endDate
  );

  @Query("SELECT COALESCE(SUM(w.caloriesBurnt), 0) FROM Workout w WHERE w.user.id = :userId AND w.workoutDate = :date")
  Integer sumCaloriesBurntByUserIdAndDate(
      @Param("userId") Long userId,
      @Param("date") LocalDate date
  );

  @Query("SELECT COALESCE(SUM(w.caloriesBurnt), 0) FROM Workout w WHERE w.user.id = :userId AND w.workoutDate BETWEEN :startDate AND :endDate")
  Integer sumCaloriesBurntByUserIdAndDateBetween(
      @Param("userId") Long userId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate
  );

  @Query("""
      SELECT w FROM Workout w
      WHERE w.user.id = :userId
        AND (:date IS NULL OR w.workoutDate = :date)
        AND (:from IS NULL OR w.workoutDate >= :from)
        AND (:to IS NULL OR w.workoutDate <= :to)
        AND (:workoutType IS NULL OR w.workoutType = :workoutType)
        AND (:search IS NULL OR LOWER(COALESCE(w.notes, '')) LIKE LOWER(CONCAT('%', :search, '%')))
      ORDER BY w.workoutDate DESC, w.id DESC
  """)
  Page<Workout> findWithFilters(
      @Param("userId") Long userId,
      @Param("date") LocalDate date,
      @Param("from") LocalDate from,
      @Param("to") LocalDate to,
      @Param("workoutType") WorkoutType workoutType,
      @Param("search") String search,
      Pageable pageable
  );
}