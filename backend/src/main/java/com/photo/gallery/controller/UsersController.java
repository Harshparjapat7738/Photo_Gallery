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

    private static final List<String> DEMO_USER_EMAILS = List.of(
            "avery.stone@demo.example",
            "jordan.lee@demo.example",
            "morgan.patel@demo.example",
            "riley.chen@demo.example",
            "taylor.brooks@demo.example"
    );

    private final UserRepo userRepo;

    /** Returns the five demo users shown in the gallery. */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepo.findByEmailIn(DEMO_USER_EMAILS));
    }
}
