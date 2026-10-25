package com.photo.gallery.repository;

import com.photo.gallery.model.Album;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlbumRepo extends MongoRepository<Album, String> {
    List<Album> findByUserId(String userId);
}
