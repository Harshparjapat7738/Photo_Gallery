package com.photo.gallery.repository;

import com.photo.gallery.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends MongoRepository<User, String> {

    User findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserNameIgnoreCase(String userName);

    boolean existsByEmailIgnoreCaseAndUserIdNot(String email, String userId);

    boolean existsByUserNameIgnoreCaseAndUserIdNot(String userName, String userId);
}
