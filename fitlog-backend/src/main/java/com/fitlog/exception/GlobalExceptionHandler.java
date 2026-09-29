package com.fitlog.exception;

import com.fitlog.dto.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log =
      LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      ResourceNotFoundException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.NOT_FOUND,
        ex.getMessage(),
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(InvalidRequestException.class)
  public ResponseEntity<ErrorResponse> handleInvalidRequest(
      InvalidRequestException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.BAD_REQUEST,
        ex.getMessage(),
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(BusinessRuleException.class)
  public ResponseEntity<ErrorResponse> handleBusinessRule(
      BusinessRuleException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.UNPROCESSABLE_ENTITY,
        ex.getMessage(),
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ErrorResponse> handleDuplicate(
      DuplicateResourceException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.CONFLICT,
        ex.getMessage(),
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(
      MethodArgumentNotValidException ex,
      HttpServletRequest request) {

    Map<String, String> fieldErrors = new LinkedHashMap<>();

    ex.getBindingResult()
        .getFieldErrors()
        .forEach(error ->
            fieldErrors.put(
                error.getField(),
                error.getDefaultMessage()
            )
        );

    return buildResponse(
        HttpStatus.BAD_REQUEST,
        "Validation failed.",
        request.getRequestURI(),
        fieldErrors
    );
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleUnreadableMessage(
      HttpMessageNotReadableException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.BAD_REQUEST,
        "Invalid request body. Check the JSON values and enum values.",
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex,
      HttpServletRequest request) {

    String message = "Invalid value for parameter '" +
        ex.getName() + "'.";

    return buildResponse(
        HttpStatus.BAD_REQUEST,
        message,
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleBadCredentials(
      BadCredentialsException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.UNAUTHORIZED,
        "Invalid email or password.",
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
      AccessDeniedException ex,
      HttpServletRequest request) {

    return buildResponse(
        HttpStatus.FORBIDDEN,
        "You do not have permission to access this resource.",
        request.getRequestURI(),
        null
    );
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleUnexpected(
      Exception ex,
      HttpServletRequest request) {

    log.error("Unexpected error while processing {}",
        request.getRequestURI(), ex);

    return buildResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred.",
        request.getRequestURI(),
        null
    );
  }

  private ResponseEntity<ErrorResponse> buildResponse(
      HttpStatus status,
      String message,
      String path,
      Map<String, String> fieldErrors) {

    ErrorResponse response = new ErrorResponse(
        LocalDateTime.now(),
        status.value(),
        status.getReasonPhrase(),
        message,
        path,
        fieldErrors
    );

    return ResponseEntity.status(status).body(response);
  }
}