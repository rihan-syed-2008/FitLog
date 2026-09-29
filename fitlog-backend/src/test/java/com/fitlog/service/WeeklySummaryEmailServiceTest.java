package com.fitlog.service;

import com.fitlog.dto.summary.WeeklySummaryResponse;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeeklySummaryEmailServiceTest {

  @Mock
  private JavaMailSender mailSender;

  private WeeklySummaryEmailService emailService;

  private final String fromEmail = "noreply@fitlog.com";
  private final String recipientEmail = "user@example.com";
  private final String recipientName = "Rihan Athlete";

  private WeeklySummaryResponse sampleSummary;

  @BeforeEach
  void setUp() {
    emailService = new WeeklySummaryEmailService(mailSender, fromEmail);

    sampleSummary = new WeeklySummaryResponse(
        1L,
        LocalDate.of(2026, 9, 21),
        LocalDate.of(2026, 9, 27),
        4,
        14,
        8420,
        2140,
        6280,
        5,
        false,
        LocalDateTime.now()
    );

    MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
    lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
  }

  @Test
  @DisplayName("Send weekly summary email successfully through JavaMailSender")
  void testSendWeeklySummaryEmail_Success() {
    assertDoesNotThrow(() ->
        emailService.sendWeeklySummaryEmail(recipientEmail, recipientName, sampleSummary)
    );

    verify(mailSender, times(1)).createMimeMessage();
    verify(mailSender, times(1)).send(any(MimeMessage.class));
  }

  @Test
  @DisplayName("SMTP Exception is caught and suppressed gracefully so summary generation is not affected")
  void testSendWeeklySummaryEmail_MailExceptionSuppressed() {
    doThrow(new MailSendException("SMTP server connection refused"))
        .when(mailSender).send(any(MimeMessage.class));

    // Must not throw exception
    assertDoesNotThrow(() ->
        emailService.sendWeeklySummaryEmail(recipientEmail, recipientName, sampleSummary)
    );

    verify(mailSender, times(1)).send(any(MimeMessage.class));
  }

  @Test
  @DisplayName("Does not attempt sending when recipient email is empty or null")
  void testSendWeeklySummaryEmail_MissingRecipient() {
    emailService.sendWeeklySummaryEmail(null, recipientName, sampleSummary);
    emailService.sendWeeklySummaryEmail("   ", recipientName, sampleSummary);

    verify(mailSender, never()).createMimeMessage();
    verify(mailSender, never()).send(any(MimeMessage.class));
  }
}
