package com.fitlog.entity;

import com.fitlog.enums.WorkoutType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "workouts",
    indexes = {
        @Index(name = "idx_workouts_user_date", columnList = "user_id, workout_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Workout {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "workout_type", nullable = false, length = 30)
  private WorkoutType workoutType;

  @Column(length = 255)
  private String notes;

  @Column(name = "duration_minutes", nullable = false)
  private Integer durationMinutes;

  @Column(name = "calories_burnt", nullable = false)
  private Integer caloriesBurnt;

  @Column(name = "workout_date", nullable = false)
  private LocalDate workoutDate;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}