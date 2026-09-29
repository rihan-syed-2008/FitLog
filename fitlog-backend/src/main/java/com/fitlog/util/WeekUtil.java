package com.fitlog.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

public final class WeekUtil {

  private WeekUtil() {
  }

  public static LocalDate startOfWeek(LocalDate date) {
    return date.with(
        TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)
    );
  }

  public static LocalDate endOfWeek(LocalDate date) {
    return startOfWeek(date).plusDays(6);
  }
}