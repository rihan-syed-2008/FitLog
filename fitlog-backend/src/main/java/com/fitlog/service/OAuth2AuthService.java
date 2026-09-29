package com.fitlog.service;

import com.fitlog.entity.User;
import com.fitlog.enums.Role;
import com.fitlog.repository.UserRepository;
import com.fitlog.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OAuth2AuthService {

  private static final Logger log = LoggerFactory.getLogger(OAuth2AuthService.class);

  private final UserRepository userRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;

  public OAuth2AuthService(
      UserRepository userRepository,
      JwtService jwtService,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Processes a Google OAuth2 user authentication:
   * Case B: Google subject already exists -> Authenticate existing user.
   * Case C: Email exists (password user) -> Link Google identity safely (retain password), authenticate user.
   * Case A: New user -> Create FitLog user, role USER, generate token.
   *
   * @param sub   Google subject ID (unique identifier)
   * @param email User email from Google
   * @param name  User full name from Google profile
   * @return Generated FitLog JWT token
   */
  public String processGoogleUser(String sub, String email, String name) {
    if (email == null || email.isBlank()) {
      throw new IllegalArgumentException("Email from Google provider cannot be empty.");
    }
    if (sub == null || sub.isBlank()) {
      throw new IllegalArgumentException("Subject identifier from Google provider cannot be empty.");
    }

    String normalizedEmail = email.trim().toLowerCase();

    // Case B: Existing Google-linked user by sub
    Optional<User> userBySub = userRepository.findByProviderAndProviderId("GOOGLE", sub);
    if (userBySub.isPresent()) {
      User user = userBySub.get();
      log.info("Authenticated existing Google user: {}", normalizedEmail);
      return generateJwtForUser(user);
    }

    // Case C: Existing account with the same email (e.g. registered with password)
    Optional<User> userByEmail = userRepository.findByEmail(normalizedEmail);
    if (userByEmail.isPresent()) {
      User user = userByEmail.get();
      user.setProviderId(sub);
      user.setProvider("GOOGLE");
      // Retain existing passwordHash so password login continues working!
      User updatedUser = userRepository.save(user);
      log.info("Linked Google identity to existing account for email: {}", normalizedEmail);
      return generateJwtForUser(updatedUser);
    }

    // Case A: New Google user
    User newUser = new User();
    String displayName = (name != null && !name.isBlank()) ? name.trim() : "Google Athlete";
    newUser.setFullName(displayName);
    newUser.setEmail(normalizedEmail);
    newUser.setProvider("GOOGLE");
    newUser.setProviderId(sub);
    newUser.setRole(Role.USER);
    // Secure unusable random password hash satisfies DB constraints and prevents unauthenticated password logins
    newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));

    User savedUser = userRepository.save(newUser);
    log.info("Created new Google-authenticated user: {}", normalizedEmail);
    return generateJwtForUser(savedUser);
  }

  private String generateJwtForUser(User user) {
    return jwtService.generateToken(
        user.getId(),
        user.getEmail(),
        user.getRole().name()
    );
  }
}
