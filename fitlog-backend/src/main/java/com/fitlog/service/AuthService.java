package com.fitlog.service;

import com.fitlog.dto.auth.AuthResponse;
import com.fitlog.dto.auth.LoginRequest;
import com.fitlog.dto.auth.RegisterRequest;
import com.fitlog.dto.auth.UserResponse;
import com.fitlog.entity.User;
import com.fitlog.enums.Role;
import com.fitlog.exception.DuplicateResourceException;
import com.fitlog.repository.UserRepository;
import com.fitlog.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final CurrentUserService currentUserService;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtService jwtService,
      CurrentUserService currentUserService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.currentUserService = currentUserService;
  }

  public UserResponse getCurrentUser() {
    User user = currentUserService.getCurrentUser();
    return new UserResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole()
    );
  }

  public UserResponse register(RegisterRequest request) {

    if (userRepository.existsByEmail(request.email())) {
      throw new DuplicateResourceException(
          "User with this email already exists."
      );
    }

    User user = new User();

    user.setFullName(request.fullName());
    user.setEmail(request.email());
    user.setPasswordHash(
        passwordEncoder.encode(request.password())
    );
    user.setRole(Role.USER);

    User savedUser = userRepository.save(user);

    return new UserResponse(
        savedUser.getId(),
        savedUser.getFullName(),
        savedUser.getEmail(),
        savedUser.getRole()
    );
  }

  public AuthResponse login(LoginRequest request) {

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.email(),
            request.password()
        )
    );

    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() ->
            new IllegalStateException("User not found")
        );

    String token = jwtService.generateToken(
        user.getId(),
        user.getEmail(),
        user.getRole().name()
    );

    return new AuthResponse(
        token,
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole()
    );
  }
}