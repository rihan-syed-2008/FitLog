package com.fitlog.dto.auth;

import com.fitlog.enums.Role;

public record UserResponse(
    Long id,
    String fullName,
    String email,
    Role role
) {
}