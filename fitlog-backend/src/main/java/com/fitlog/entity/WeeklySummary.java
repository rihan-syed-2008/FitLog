package com.fitlog.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "weekly_summaries",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_weekly_summary_user_week",
            columnNames = {"user_id", "week_start"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class WeeklySummary {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "week_start", nullable = false)
  private LocalDate weekStart;

  @Column(name = "week_end", nullable = false)
  private LocalDate weekEnd;

  @Column(name = "workouts_completed", nullable = false)
  private Integer workoutsCompleted;

  @Column(name = "meals_logged", nullable = false)
  private Integer mealsLogged;

  @Column(name = "total_calories_in", nullable = false)
  private Integer totalCaloriesIn;

  @Column(name = "total_calories_out", nullable = false)
  private Integer totalCaloriesOut;

  @Column(name = "net_calories", nullable = false)
  private Integer netCalories;

  @Column(name = "goal_target", nullable = false)
  private Integer goalTarget;

  @Column(name = "goal_met", nullable = false)
  private Boolean goalMet;

  @Column(name = "generated_at", nullable = false)
  private LocalDateTime generatedAt;

  @PrePersist
  protected void onCreate() {
    generatedAt = LocalDateTime.now();
  }
}