package com.fitlog.controller;

import com.fitlog.dto.summary.DailySummaryResponse;
import com.fitlog.dto.summary.WeeklySummaryResponse;
import com.fitlog.dto.summary.WeeklyTrendPoint;
import com.fitlog.service.SummaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/summaries")
public class SummaryController {

  private final SummaryService summaryService;

  public SummaryController(SummaryService summaryService) {
    this.summaryService = summaryService;
  }

  @GetMapping("/daily")
  public ResponseEntity<DailySummaryResponse> getDailySummary(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    DailySummaryResponse response = summaryService.getDailySummary(date);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/weekly-trend")
  public ResponseEntity<List<WeeklyTrendPoint>> getWeeklyTrend(
      @RequestParam(defaultValue = "8") int weeks) {
    List<WeeklyTrendPoint> trend = summaryService.getWeeklyTrend(weeks);
    return ResponseEntity.ok(trend);
  }

  @PostMapping("/weekly")
  public ResponseEntity<WeeklySummaryResponse> generateWeeklySummary(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekOf) {
    SummaryService.GenerationResult result = summaryService.generateWeeklySummary(weekOf);
    if (result.created()) {
      return ResponseEntity.status(HttpStatus.CREATED).body(result.response());
    } else {
      return ResponseEntity.ok(result.response());
    }
  }

  @GetMapping("/weekly")
  public ResponseEntity<List<WeeklySummaryResponse>> getWeeklySummaries() {
    List<WeeklySummaryResponse> summaries = summaryService.getWeeklySummaries();
    return ResponseEntity.ok(summaries);
  }
}
