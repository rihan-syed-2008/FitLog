package com.fitlog.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WeekUtilTest {

  @Test
  @DisplayName("Should correctly find Monday as start of week")
  void testStartOfWeek() {
    // 2026-09-30 is a Wednesday
    LocalDate wednesday = LocalDate.of(2026, 9, 30);
    LocalDate monday = WeekUtil.startOfWeek(wednesday);

    assertEquals(DayOfWeek.MONDAY, monday.getDayOfWeek());
    assertEquals(LocalDate.of(2026, 9, 28), monday);

    // 2026-09-28 is Monday itself
    assertEquals(LocalDate.of(2026, 9, 28), WeekUtil.startOfWeek(LocalDate.of(2026, 9, 28)));

    // 2026-10-04 is Sunday
    assertEquals(LocalDate.of(2026, 9, 28), WeekUtil.startOfWeek(LocalDate.of(2026, 10, 4)));
  }

  @Test
  @DisplayName("Should correctly find Sunday as end of week")
  void testEndOfWeek() {
    LocalDate wednesday = LocalDate.of(2026, 9, 30);
    LocalDate sunday = WeekUtil.endOfWeek(wednesday);

    assertEquals(DayOfWeek.SUNDAY, sunday.getDayOfWeek());
    assertEquals(LocalDate.of(2026, 10, 4), sunday);
  }
}
