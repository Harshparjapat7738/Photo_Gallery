package com.photo.gallery.controller;

import com.photo.gallery.model.User;
import com.photo.gallery.security.SessionAuth;
import com.photo.gallery.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private static final String UPLOAD_DIR = "src/main/resources/static/images";

    // User Login
    @PostMapping("/login")
    public ResponseEntity<User> login(
            @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpSession session) {
        User user = userService.authenticate(request.getEmail(), request.getPassword());
        servletRequest.changeSessionId();
        session.setAttribute(SessionAuth.USER_ID_ATTRIBUTE, user.getUserId());
        return ResponseEntity.ok(user);
    }

    // Create New User with optional profile picture
    @PostMapping
    public ResponseEntity<User> createUser(
            @RequestParam("name") String name,
            @RequestParam("userName") String userName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            HttpServletRequest servletRequest,
            HttpSession session) {

        User user = new User();
        user.setName(name);
        user.setUserName(userName);
        user.setEmail(email);
        user.setPassword(password);

        try {
            if (profilePicture != null && !profilePicture.isEmpty()) {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String originalFileName = profilePicture.getOriginalFilename();
                String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String savedFileName = UUID.randomUUID().toString() + fileExtension;

                Path filePath = Paths.get(UPLOAD_DIR, savedFileName);
                Files.write(filePath, profilePicture.getBytes());

                user.setProfilePicture("http://localhost:8091/images/" + savedFileName);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        User createdUser = userService.createUser(user);
        servletRequest.changeSessionId();
        session.setAttribute(SessionAuth.USER_ID_ATTRIBUTE, createdUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpSession session) {
        String userId = SessionAuth.requireUserId(session);
        User user = userService.getUserById(userId);
        if (user == null) {
            session.invalidate();
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get User by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Update User by id
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable String id,
            @RequestBody User user,
            HttpSession session) {
        requireOwnAccount(id, session);
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // Delete User by id
    @DeleteMapping("/{id}")
    public ResponseEntity<User> deleteUser(@PathVariable String id, HttpSession session) {
        requireOwnAccount(id, session);
        User deletedUser = userService.deleteUser(id);
        session.invalidate();
        return ResponseEntity.ok(deletedUser);
    }

    private void requireOwnAccount(String userId, HttpSession session) {
        if (!userId.equals(SessionAuth.requireUserId(session))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own account");
        }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
