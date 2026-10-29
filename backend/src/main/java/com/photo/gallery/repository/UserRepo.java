package com.photo.gallery.repository;

import com.photo.gallery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepo extends JpaRepository<User, String> {

    User findByEmailIgnoreCase(String email);

    List<User> findByEmailIn(List<String> emails);
}
