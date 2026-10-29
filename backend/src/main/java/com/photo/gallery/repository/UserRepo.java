package com.photo.gallery.repository;

import com.photo.gallery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepo extends JpaRepository<User, String> {

    User findByEmailIgnoreCase(String email);

    List<User> findByEmailEndingWithIgnoreCase(String emailSuffix);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserNameIgnoreCase(String userName);

    boolean existsByEmailIgnoreCaseAndUserIdNot(String email, String userId);

    boolean existsByUserNameIgnoreCaseAndUserIdNot(String userName, String userId);
}
