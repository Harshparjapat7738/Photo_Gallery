package com.photo.gallery.controller;

import com.photo.gallery.model.User;
import com.photo.gallery.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/users")
@RequiredArgsConstructor
public class UsersController {

    private final UserRepo userRepo;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findByEmailEndingWithIgnoreCase("@demo.example"));
    }
}
