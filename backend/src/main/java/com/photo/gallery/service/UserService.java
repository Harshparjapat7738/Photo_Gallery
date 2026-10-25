package com.photo.gallery.service;

import com.photo.gallery.model.User;
import com.photo.gallery.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private final UserRepo userRepo;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // User Create - password saved in hashed format
    public User createUser(User user) {
        user.setName(user.getName().trim());
        user.setEmail(normalize(user.getEmail()));
        user.setUserName(user.getUserName().trim());
        ensureUniqueAccount(user, null);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        LinkedHashMap<String, User> uniqueUsers = new LinkedHashMap<>();
        for (User user : userRepo.findAll()) {
            String email = normalize(user.getEmail());
            String identity = email.isEmpty() ? "user:" + user.getUserId() : "email:" + email;
            uniqueUsers.putIfAbsent(identity, user);
        }
        return List.copyOf(uniqueUsers.values());
    }

    // Authenticate user by email and password
    public User authenticate(String email, String rawPassword) {
        User user = userRepo.findByEmailIgnoreCase(normalize(email));
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return user;
    }

    // Get User by id
    public User getUserById(String id) {
        return userRepo.findById(id).orElse(null);
    }

    // Update user by ID
    public User updateUser(String userId, User updatedUser) {
        User existingUser = userRepo.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with ID: " + userId)
                );

        String normalizedEmail = normalize(updatedUser.getEmail());
        String normalizedUserName = updatedUser.getUserName().trim();
        ensureUniqueAccount(updatedUser, userId);
        existingUser.setName(updatedUser.getName());
        existingUser.setUserName(normalizedUserName);
        existingUser.setEmail(normalizedEmail);

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepo.save(existingUser);
    }

    // Delete User
    public User deleteUser(String userId) {
        User user = userRepo.findById(userId).orElseThrow(()->
              new RuntimeException("User not found with ID: " + userId)
        );
        userRepo.delete(user);
        return user;
    }

    private void ensureUniqueAccount(User user, String currentUserId) {
        String email = normalize(user.getEmail());
        String userName = user.getUserName().trim();

        boolean emailExists = currentUserId == null
                ? userRepo.existsByEmailIgnoreCase(email)
                : userRepo.existsByEmailIgnoreCaseAndUserIdNot(email, currentUserId);
        if (emailExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        boolean userNameExists = currentUserId == null
                ? userRepo.existsByUserNameIgnoreCase(userName)
                : userRepo.existsByUserNameIgnoreCaseAndUserIdNot(userName, currentUserId);
        if (userNameExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This username is already taken");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
