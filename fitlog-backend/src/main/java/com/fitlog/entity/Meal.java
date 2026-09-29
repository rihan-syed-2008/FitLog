package com.fitlog.entity;

import com.fitlog.enums.MealType;
import com.fitlog.enums.QuantityUnit;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "meals",
    indexes = {
        @Index(name = "idx_meals_user_date", columnList = "user_id, meal_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Meal {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "food_item", nullable = false, length = 150)
  private String foodItem;

  @Enumerated(EnumType.STRING)
  @Column(name = "meal_type", nullable = false, length = 20)
  private MealType mealType;

  @Column(nullable = false)
  private Double quantity;

  @Enumerated(EnumType.STRING)
  @Column(name = "quantity_unit", nullable = false, length = 20)
  private QuantityUnit quantityUnit;

  @Column(nullable = false)
  private Integer calories;

  @Column(name = "meal_date", nullable = false)
  private LocalDate mealDate;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}