package com.fitlog.service;

import com.fitlog.entity.User;
import com.fitlog.enums.Role;
import com.fitlog.repository.UserRepository;
import com.fitlog.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private JwtService jwtService;

  @Mock
  private PasswordEncoder passwordEncoder;

  @InjectMocks
  private OAuth2AuthService oAuth2AuthService;

  private final String googleSub = "google-sub-123456789";
  private final String email = "athlete@fitlog.com";
  private final String name = "Alex Athlete";

  @BeforeEach
  void setUp() {
    lenient().when(jwtService.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");
    lenient().when(passwordEncoder.encode(any())).thenReturn("bcrypt-random-hash");
  }

  @Test
  @DisplayName("Case A: New Google user is created, assigned Role.USER, and issued FitLog JWT")
  void testProcessGoogleUser_NewUser() {
    when(userRepository.findByProviderAndProviderId("GOOGLE", googleSub))
        .thenReturn(Optional.empty());
    when(userRepository.findByEmail(email))
        .thenReturn(Optional.empty());

    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
      User u = invocation.getArgument(0);
      u.setId(99L);
      return u;
    });

    String token = oAuth2AuthService.processGoogleUser(googleSub, email, name);

    assertEquals("mock-jwt-token", token);
    verify(userRepository, times(1)).save(argThat(u ->
        u.getEmail().equals(email) &&
        u.getFullName().equals(name) &&
        "GOOGLE".equals(u.getProvider()) &&
        googleSub.equals(u.getProviderId()) &&
        u.getRole() == Role.USER &&
        u.getPasswordHash() != null
    ));
    verify(jwtService, times(1)).generateToken(eq(99L), eq(email), eq("USER"));
  }

  @Test
  @DisplayName("Case B: Existing Google-linked user is found by subject ID and issued JWT without creating duplicate")
  void testProcessGoogleUser_ExistingGoogleUser() {
    User existingUser = new User();
    existingUser.setId(10L);
    existingUser.setEmail(email);
    existingUser.setFullName(name);
    existingUser.setProvider("GOOGLE");
    existingUser.setProviderId(googleSub);
    existingUser.setRole(Role.USER);

    when(userRepository.findByProviderAndProviderId("GOOGLE", googleSub))
        .thenReturn(Optional.of(existingUser));

    String token = oAuth2AuthService.processGoogleUser(googleSub, email, name);

    assertEquals("mock-jwt-token", token);
    // Must NOT create duplicate user
    verify(userRepository, never()).save(any());
    verify(jwtService, times(1)).generateToken(eq(10L), eq(email), eq("USER"));
  }

  @Test
  @DisplayName("Case C: Existing password user is linked to Google identity, preserving passwordHash and issuing JWT")
  void testProcessGoogleUser_LinkExistingPasswordUser() {
    User existingPasswordUser = new User();
    existingPasswordUser.setId(25L);
    existingPasswordUser.setEmail(email);
    existingPasswordUser.setFullName("Original Name");
    existingPasswordUser.setPasswordHash("$2a$10$originalPasswordHashValue");
    existingPasswordUser.setProvider("LOCAL");
    existingPasswordUser.setRole(Role.USER);

    when(userRepository.findByProviderAndProviderId("GOOGLE", googleSub))
        .thenReturn(Optional.empty());
    when(userRepository.findByEmail(email))
        .thenReturn(Optional.of(existingPasswordUser));
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    String token = oAuth2AuthService.processGoogleUser(googleSub, email, name);

    assertEquals("mock-jwt-token", token);
    verify(userRepository, times(1)).save(argThat(u ->
        u.getId().equals(25L) &&
        u.getEmail().equals(email) &&
        googleSub.equals(u.getProviderId()) &&
        // Password hash MUST be preserved so existing password login continues to work
        "$2a$10$originalPasswordHashValue".equals(u.getPasswordHash())
    ));
    verify(jwtService, times(1)).generateToken(eq(25L), eq(email), eq("USER"));
  }

  @Test
  @DisplayName("Validation: Throws IllegalArgumentException when email or subject is null/empty")
  void testProcessGoogleUser_InvalidInputs() {
    assertThrows(IllegalArgumentException.class, () ->
        oAuth2AuthService.processGoogleUser(googleSub, "", name)
    );
    assertThrows(IllegalArgumentException.class, () ->
        oAuth2AuthService.processGoogleUser(null, email, name)
    );
  }
}
