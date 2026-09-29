package com.fitlog.controller;

import com.fitlog.dto.auth.UserResponse;
import com.fitlog.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("/users")
  public ResponseEntity<List<UserResponse>> getAllUsers() {
    List<UserResponse> users = adminService.getAllUsers();
    return ResponseEntity.ok(users);
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    adminService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
