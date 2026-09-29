package com.fitlog.service;

import com.fitlog.dto.auth.UserResponse;
import com.fitlog.entity.User;
import com.fitlog.exception.ResourceNotFoundException;
import com.fitlog.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminService {

  private final UserRepository userRepository;

  public AdminService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<UserResponse> getAllUsers() {
    return userRepository.findAll()
        .stream()
        .map(u -> new UserResponse(
            u.getId(),
            u.getFullName(),
            u.getEmail(),
            u.getRole()
        ))
        .toList();
  }

  public void deleteUser(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

    userRepository.delete(user);
  }
}
