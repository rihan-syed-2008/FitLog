package com.fitlog.dto.auth;

import com.fitlog.enums.Role;

public record AuthResponse(
    String token,
    Long userId,
    String fullName,
    String email,
    Role role
) {
}