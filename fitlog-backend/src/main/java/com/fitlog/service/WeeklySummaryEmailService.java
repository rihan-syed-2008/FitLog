package com.fitlog.service;

import com.fitlog.dto.summary.WeeklySummaryResponse;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class WeeklySummaryEmailService {

  private static final Logger log = LoggerFactory.getLogger(WeeklySummaryEmailService.class);
  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

  private final JavaMailSender mailSender;
  private final String mailFrom;

  public WeeklySummaryEmailService(
      JavaMailSender mailSender,
      @Value("${app.mail.from:noreply@fitlog.com}") String mailFrom) {
    this.mailSender = mailSender;
    this.mailFrom = mailFrom;
  }

  /**
   * Composes and delivers the weekly summary email to the user.
   * If delivery fails (e.g. SMTP unavailable), the failure is logged and gracefully suppressed
   * so that the saved weekly summary is never rolled back or lost.
   *
   * @param recipientEmail destination email
   * @param recipientName  user full name
   * @param summary        weekly summary metrics
   */
  public void sendWeeklySummaryEmail(String recipientEmail, String recipientName, WeeklySummaryResponse summary) {
    if (recipientEmail == null || recipientEmail.isBlank()) {
      log.warn("Cannot send weekly summary email: recipient email is missing.");
      return;
    }

    String startStr = summary.weekStart() != null ? summary.weekStart().format(DATE_FORMATTER) : "N/A";
    String endStr = summary.weekEnd() != null ? summary.weekEnd().format(DATE_FORMATTER) : "N/A";
    String dateRange = startStr + " – " + endStr;
    String subject = "Your FitLog Weekly Summary — " + dateRange;

    String htmlContent = buildHtmlContent(recipientName, dateRange, summary);
    String textContent = buildTextContent(recipientName, dateRange, summary);

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(mailFrom);
      helper.setTo(recipientEmail);
      helper.setSubject(subject);
      helper.setText(textContent, htmlContent);

      mailSender.send(message);
      log.info("Weekly summary email sent to user {}", recipientEmail);
    } catch (Exception ex) {
      log.error("Weekly summary email failed for user {}: {}", recipientEmail, ex.getMessage());
      // Deliberately do not rethrow: email delivery failure must NEVER abort summary creation.
    }
  }

  private String buildHtmlContent(String recipientName, String dateRange, WeeklySummaryResponse s) {
    int target = s.goalTarget() != null ? s.goalTarget() : 0;
    int completed = s.workoutsCompleted() != null ? s.workoutsCompleted() : 0;
    boolean goalMet = Boolean.TRUE.equals(s.goalMet());
    String goalStatus = target > 0 ? (goalMet ? "Goal Met!" : "In Progress") : "No Goal Set";
    String goalProgress = target > 0 ? (completed + " / " + target) : String.valueOf(completed);

    int calIn = s.totalCaloriesIn() != null ? s.totalCaloriesIn() : 0;
    int calOut = s.totalCaloriesOut() != null ? s.totalCaloriesOut() : 0;
    int net = s.netCalories() != null ? s.netCalories() : 0;
    String netFormatted = (net > 0 ? "+" : "") + String.format("%,d", net) + " kcal";

    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c1220; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f293d; border-radius: 12px; padding: 32px; }
            .header { border-bottom: 1px solid #1f293d; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { color: #10b981; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
            .title { font-size: 24px; font-weight: 700; color: #ffffff; margin: 8px 0 4px; }
            .subtitle { font-size: 14px; color: #94a3b8; }
            .grid { display: table; width: 100%%; margin-bottom: 20px; }
            .row { display: table-row; }
            .cell { display: table-cell; padding: 10px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
            .label { color: #94a3b8; }
            .val { text-align: right; font-weight: 600; color: #f1f5f9; font-variant-numeric: tabular-nums; }
            .val-track { color: #34d399; }
            .val-ochre { color: #fb923c; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
            .badge-success { background: rgba(16,185,129,0.15); color: #34d399; }
            .badge-neutral { background: rgba(148,163,184,0.15); color: #94a3b8; }
            .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #1f293d; text-align: center; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">FitLog</div>
              <div class="title">Weekly Summary</div>
              <div class="subtitle">Week of %s &bull; %s</div>
            </div>
            <div class="grid">
              <div class="row">
                <div class="cell label">Workouts Completed</div>
                <div class="cell val val-track">%d</div>
              </div>
              <div class="row">
                <div class="cell label">Weekly Target</div>
                <div class="cell val">%s</div>
              </div>
              <div class="row">
                <div class="cell label">Goal Progress</div>
                <div class="cell val">%s</div>
              </div>
              <div class="row">
                <div class="cell label">Goal Status</div>
                <div class="cell val"><span class="badge %s">%s</span></div>
              </div>
              <div class="row">
                <div class="cell label">Meals Logged</div>
                <div class="cell val val-ochre">%d</div>
              </div>
              <div class="row">
                <div class="cell label">Calories Consumed</div>
                <div class="cell val val-ochre">%,d kcal</div>
              </div>
              <div class="row">
                <div class="cell label">Calories Burned</div>
                <div class="cell val val-track">%,d kcal</div>
              </div>
              <div class="row">
                <div class="cell label">Net Energy Balance</div>
                <div class="cell val">%s</div>
              </div>
            </div>
            <div class="footer">
              FitLog &mdash; The Training Log &bull; Keep pushing your limits!
            </div>
          </div>
        </body>
        </html>
        """.formatted(
        dateRange,
        recipientName != null ? recipientName : "Athlete",
        completed,
        target > 0 ? target + " workouts" : "None",
        goalProgress,
        goalMet ? "badge-success" : "badge-neutral",
        goalStatus,
        s.mealsLogged() != null ? s.mealsLogged() : 0,
        calIn,
        calOut,
        netFormatted
    );
  }

  private String buildTextContent(String recipientName, String dateRange, WeeklySummaryResponse s) {
    int target = s.goalTarget() != null ? s.goalTarget() : 0;
    int completed = s.workoutsCompleted() != null ? s.workoutsCompleted() : 0;
    boolean goalMet = Boolean.TRUE.equals(s.goalMet());
    String goalStatus = target > 0 ? (goalMet ? "Goal Met!" : "In Progress") : "No Goal Set";
    String goalProgress = target > 0 ? (completed + " / " + target) : String.valueOf(completed);

    int calIn = s.totalCaloriesIn() != null ? s.totalCaloriesIn() : 0;
    int calOut = s.totalCaloriesOut() != null ? s.totalCaloriesOut() : 0;
    int net = s.netCalories() != null ? s.netCalories() : 0;

    return """
        FitLog — Weekly Summary
        ====================================================
        Hello %s,
        
        Here is your performance summary for the week: %s
        
        • Workouts Completed: %d
        • Weekly Target: %s
        • Goal Progress: %s
        • Goal Status: %s
        • Meals Logged: %d
        • Calories Consumed: %,d kcal
        • Calories Burned: %,d kcal
        • Net Energy Balance: %s%,d kcal
        
        Keep up the great work!
        FitLog — The Training Log
        """.formatted(
        recipientName != null ? recipientName : "Athlete",
        dateRange,
        completed,
        target > 0 ? target + " workouts" : "None",
        goalProgress,
        goalStatus,
        s.mealsLogged() != null ? s.mealsLogged() : 0,
        calIn,
        calOut,
        net > 0 ? "+" : "",
        net
    );
  }
}
